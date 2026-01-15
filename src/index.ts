
import { config } from './config';
import { IndexerService } from './services/indexer';
import mongoose from 'mongoose';

// Initialize the IndexerService with the global configuration
const indexer = new IndexerService(config);

/**
 * Main entry point for the Solana Event Indexer
 *
 * This service connects to MongoDB and starts indexing configured Solana programs
 */
async function main() {
  console.log('🚀 Starting Solana Event Indexer...');

  try {
    // 1. Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // 2. Log configured programs
    console.log(`\n📋 Configured programs to index: ${config.programs.length}`);
    config.programs.forEach((program, index) => {
      console.log(`   ${index + 1}. ${program.name} (${program.programId})`);
    });

    // 3. Start the Indexer Service (runs all program indexers)
    await indexer.start();

    // Graceful shutdown handlers
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
      indexer.stop();
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
      indexer.stop();
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start indexer:', error);
    process.exit(1);
  }
}

// Execute main function and catch any startup errors
main().catch(console.error);
