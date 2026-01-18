/**
 * @file Indexer Service
 * Orchestrates the creation and management of individual indexers (Realtime and Historical)
 * for each configured program.
 */

import { config } from '../config';
import { RealtimeIndexer } from '../core/indexer/realtime';
import { HistoricalIndexer } from '../core/indexer/historical';
import { logger } from '../utils/logger';
import { BaseIndexer } from '../core/indexer/base';

/**
 * Service class responsible for managing the lifecycle of all indexer instances.
 * It reads the global configuration, instantiates the appropriate indexers,
 * and handles their startup and shutdown.
 */
export class IndexerService {
  /** Registry of all active indexer instances */
  private indexers: BaseIndexer[] = [];

  constructor() { }

  /**
   * Initialize and start all configured indexers.
   * Iterates through `config.programs` and creates Realtime and/or Historical indexers
   * based on the configuration flags.
   */
  async start() {
    logger.info('🚀 Starting Indexer Service...');

    // Initialize indexers for each program
    for (const program of config.programs) {
      // Start Realtime Indexer if enabled
      if (program.realtime) {
        const realtimeIndexer = new RealtimeIndexer(program);
        this.indexers.push(realtimeIndexer);
        // Start without awaiting to run in parallel
        realtimeIndexer.start().catch(err => {
          logger.error(`[${program.name}] Realtime indexer failed to start: ${err}`);
        });
      }

      // Start Historical Indexer if enabled
      if (program.historical) {
        const historicalIndexer = new HistoricalIndexer(program);
        this.indexers.push(historicalIndexer);
        // Start without awaiting to run in parallel
        historicalIndexer.start().catch(err => {
          logger.error(`[${program.name}] Historical indexer failed to start: ${err}`);
        });
      }
    }

    logger.info(`✅ Initialized ${this.indexers.length} indexers for ${config.programs.length} programs`);
  }

  /**
   * Gracefully stop all running indexers.
   * Should be called on application shutdown.
   */
  stop() {
    logger.info('🛑 Stopping all indexers...');
    this.indexers.forEach(indexer => indexer.stop());
  }
}
