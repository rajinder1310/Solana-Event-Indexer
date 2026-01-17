
import { connectDatabase, closeDatabase } from './db/connection';
import { IndexerService } from './services/indexer.service';
import { logger } from './utils/logger';

async function main() {
  try {
    // 1. Initialize Database
    await connectDatabase();

    // 2. Start Indexer Service
    const indexerService = new IndexerService();
    await indexerService.start();

    // 3. Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\nReceived ${signal}. Shutting down...`);
      indexerService.stop();
      await closeDatabase();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    logger.error(`Application failed to start: ${error}`);
    process.exit(1);
  }
}

main();
