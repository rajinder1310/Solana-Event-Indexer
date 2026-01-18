/**
 * @file Base Indexer
 * Abstract base class that defines the common structure and behavior for all indexers.
 */

import { ProgramDefinition } from '../../config/programs';
import { TransactionRepository } from '../../db/repositories/transaction.repository';
import { logger } from '../../utils/logger';

/**
 * Abstract base class for all indexer implementations (Realtime and Historical).
 * Provides common properties for program configuration, repository access, and lifecycle management.
 */
export abstract class BaseIndexer {
  /** Flag to track if the indexer is currently running */
  protected isRunning: boolean = false;
  /** Repository for database operations */
  protected repository: TransactionRepository;

  /**
   * Base constructor for indexers.
   * @param program Configuration for the specific program being indexed.
   */
  constructor(protected program: ProgramDefinition) {
    this.repository = new TransactionRepository();
  }

  /**
   * Abstract method to start the indexing process.
   * Must be implemented by concrete classes.
   */
  abstract start(): Promise<void>;

  /**
   * Stop the indexer.
   * Sets the running flag to false, which should signal loops to terminate.
   */
  stop(): void {
    this.isRunning = false;
    logger.info(`[${this.program.name}] Stopping indexer...`);
  }
}
