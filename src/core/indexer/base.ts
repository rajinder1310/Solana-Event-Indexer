
import { ProgramDefinition } from '../../config/programs';
import { TransactionRepository } from '../../db/repositories/transaction.repository';
import { logger } from '../../utils/logger';

export abstract class BaseIndexer {
  protected isRunning: boolean = false;
  protected repository: TransactionRepository;

  constructor(protected program: ProgramDefinition) {
    this.repository = new TransactionRepository();
  }

  abstract start(): Promise<void>;

  stop(): void {
    this.isRunning = false;
    logger.info(`[${this.program.name}] Stopping indexer...`);
  }
}
