
import { config } from '../config';
import { RealtimeIndexer } from '../core/indexer/realtime';
import { HistoricalIndexer } from '../core/indexer/historical';
import { logger } from '../utils/logger';
import { BaseIndexer } from '../core/indexer/base';

export class IndexerService {
  private indexers: BaseIndexer[] = [];

  constructor() { }

  async start() {
    logger.info('🚀 Starting Indexer Service...');

    // Initialize indexers for each program
    for (const program of config.programs) {
      if (program.realtime) {
        const realtimeIndexer = new RealtimeIndexer(program);
        this.indexers.push(realtimeIndexer);
        // Start without awaiting to run in parallel
        realtimeIndexer.start().catch(err => {
          logger.error(`[${program.name}] Realtime indexer failed to start: ${err}`);
        });
      }

      if (program.historical) {
        const historicalIndexer = new HistoricalIndexer(program);
        this.indexers.push(historicalIndexer);
        historicalIndexer.start().catch(err => {
          logger.error(`[${program.name}] Historical indexer failed to start: ${err}`);
        });
      }
    }

    logger.info(`✅ Initialized ${this.indexers.length} indexers for ${config.programs.length} programs`);
  }

  stop() {
    logger.info('🛑 Stopping all indexers...');
    this.indexers.forEach(indexer => indexer.stop());
  }
}
