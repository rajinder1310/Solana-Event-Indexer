
import { Connection, PublicKey, ConfirmedSignatureInfo } from '@solana/web3.js';
import { BaseIndexer } from './base';
import { ProgramDefinition } from '../../config/programs';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { TransactionParser } from '../parsers/transaction';
import { withRetry, sleep } from '../../utils/retry';

export class HistoricalIndexer extends BaseIndexer {
  private connection: Connection;
  private programId: PublicKey;
  private currentSlot: number;

  constructor(program: ProgramDefinition) {
    super(program);
    this.programId = new PublicKey(program.id);
    this.connection = new Connection(config.rpcUrl, config.commitment);
    this.currentSlot = program.startSlot || 0;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // Auto-resume
    const lastSlot = await this.repository.getLastIndexedSlot(this.program.id);
    if (lastSlot && lastSlot > this.currentSlot) {
      this.currentSlot = lastSlot;
      logger.info(`[${this.program.name}] 🔄 Resuming historical backfill from slot ${this.currentSlot}`);
    } else {
      logger.info(`[${this.program.name}] 📜 Starting fresh backfill from slot ${this.currentSlot}`);
    }

    this.loop();
  }

  private async loop() {
    let beforeSignature: string | undefined = undefined;
    let batchSize = config.batchSize;

    while (this.isRunning) {
      try {
        const signatures = await withRetry(async () => {
          return await this.connection.getSignaturesForAddress(
            this.programId,
            { limit: batchSize, before: beforeSignature },
            config.commitment
          );
        });

        if (signatures.length === 0) {
          logger.info(`[${this.program.name}] 🏁 No more historical signatures found. Backfill complete? Waiting...`);
          await sleep(config.pollInterval * 5);
          beforeSignature = undefined; // Reset to check for new
          continue;
        }

        logger.info(`[${this.program.name}] 📥 Fetched ${signatures.length} historical signatures`);

        // Filter out already indexed
        const sigStrings = signatures.map(s => s.signature);
        const newSignatures = await this.repository.filterExistingSignatures(this.program.id, sigStrings);

        if (newSignatures.length > 0) {
          await this.processBatch(newSignatures);
        } else {
          logger.debug(`[${this.program.name}] All ${signatures.length} signatures already indexed.`);
        }

        // Pagination: prepare for next batch (moved backwards in time usually, but depends on requirement)
        // NOTE: getSignaturesForAddress goes backwards by default (newest first).
        // For distinct backfill (gap filling), approach might differ.
        // Assuming simplistic approach: walking backwards via 'before'.

        beforeSignature = signatures[signatures.length - 1].signature;

        // Adaptive batching
        if (batchSize < config.maxBatchSize) batchSize = Math.min(batchSize * 2, config.maxBatchSize);

        await sleep(config.pollInterval);

      } catch (error: any) {
        logger.error(`[${this.program.name}] Backfill loop error: ${error.message}`);
        if (batchSize > config.minBatchSize) batchSize = Math.floor(batchSize / 2);
        await sleep(5000);
      }
    }
  }

  private async processBatch(signatures: string[]) {
    logger.info(`[${this.program.name}] ⚙️ Processing batch of ${signatures.length} transactions...`);

    // Recursive function to handle batch processing with fallback for 413 errors
    const fetchAndSave = async (sigs: string[]) => {
      if (sigs.length === 0) return;

      try {
        const txs = await withRetry(async () => {
          return await this.connection.getParsedTransactions(sigs, {
            maxSupportedTransactionVersion: 0,
            commitment: config.commitment
          });
        }, {
          // Custom retry logic: Don't retry 413, let the catch block handle splitting
          retryableErrors: ['429', '500', '502', '503', '504', 'timeout']
        });

        const parsedTxs = [];
        for (let i = 0; i < txs.length; i++) {
          const tx = txs[i];
          if (!tx) continue;

          try {
            const data = TransactionParser.parse(sigs[i], tx, this.program.id);
            parsedTxs.push({
              ...data,
              programId: this.program.id,
              source: 'backfill'
            });
          } catch (err) {
            logger.warn(`Failed to parse tx ${sigs[i]}: ${err}`);
          }
        }

        if (parsedTxs.length > 0) {
          // @ts-ignore
          await this.repository.saveBatch(parsedTxs);
          logger.info(`[${this.program.name}] 💾 Saved ${parsedTxs.length} historical transactions`);
        }

      } catch (error: any) {
        // Handle 413 Payload Too Large by splitting the batch
        if (error?.message?.includes('413') || error?.toString().includes('Payload Too Large')) {
          if (sigs.length <= 1) {
            logger.error(`[${this.program.name}] ❌ Skipping tx ${sigs[0]} due to 413 even with single item.`);
            return;
          }

          logger.warn(`[${this.program.name}] ⚠️ 413 Payload Too Large with ${sigs.length} items. Splitting batch...`);
          const mid = Math.ceil(sigs.length / 2);
          const left = sigs.slice(0, mid);
          const right = sigs.slice(mid);

          await fetchAndSave(left);
          await fetchAndSave(right);
          return;
        }
        throw error;
      }
    };

    await fetchAndSave(signatures);
  }
}
