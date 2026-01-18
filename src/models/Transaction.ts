
/**
 * @file Transaction model definition for Solana Event Indexer.
 * This file defines the Mongoose schema and TypeScript interface used to store
 * transaction data extracted from the Solana blockchain.
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * MongoDB document interface for Solana transactions.
 * Extends Mongoose's Document to include transaction fields.
 */
export interface ITransaction extends Document {
  /** Solana program ID that was involved in this transaction */
  programId: string;

  /** Unique transaction signature (hash) */
  signature: string;

  /** Slot number when transaction was processed */
  slot: number;

  /** Unix timestamp of the block (null if unavailable) */
  blockTime: number | null;

  /** Transaction instructions data (raw) */
  instructions: any[];

  /** Transaction logs emitted by the runtime (null if none) */
  logs: string[] | null;

  /** Timestamp when this record was created in our database */
  createdAt: Date;
}

/**
 * Mongoose schema for Solana transactions.
 * Defines field types, required constraints, and indexes for efficient queries.
 */
const TransactionSchema: Schema = new Schema({
  programId: { type: String, required: true, index: true },
  signature: { type: String, required: true },
  slot: { type: Number, required: true },
  blockTime: { type: Number, required: false },
  instructions: { type: Schema.Types.Mixed, required: true },
  logs: { type: [String], required: false },
  createdAt: { type: Date, default: Date.now }
});

// Unique compound index to prevent duplicate transaction entries
TransactionSchema.index({ programId: 1, signature: 1 }, { unique: true });

// Index to support fast retrieval of the latest indexed slot per program
TransactionSchema.index({ programId: 1, slot: -1 });

/**
 * Export the Mongoose model for use throughout the application.
 */
export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
