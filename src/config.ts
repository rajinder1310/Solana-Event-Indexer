
import dotenv from 'dotenv';
import { IndexerConfig } from './types';

// Load environment variables from .env file
dotenv.config();

/**
 * Global configuration for the Solana Event Indexer
 */
export const config: IndexerConfig = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/solana_indexer',

  programs: [
    {
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Solana Token Program
      name: 'solana-token-program',
      rpcUrl: process.env.RPC_URL || 'https://api.devnet.solana.com',
      startSlot: 0, // Start from a recent slot for testing
      maxSignaturesPerRequest: 100 // Start with small batches for testing
    },
    // Add more programs here as needed
    // {
    //   programId: 'YOUR_PROGRAM_ID',
    //   name: 'your-program-name',
    //   rpcUrl: 'https://api.mainnet-beta.solana.com',
    //   startSlot: 150000000,
    //   maxSignaturesPerRequest: 1000
    // }
  ]
};
