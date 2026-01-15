
import mongoose, { Schema, Document } from 'mongoose';

/**
 * MongoDB document interface for Solana transactions
 */
export interface ITransaction extends Document {
  /** Solana program ID that was involved in this transaction */
  programId: string;

  /** Unique transaction signature */
  signature: string;

  /** Slot number when transaction was processed */
  slot: number;

  /** Unix timestamp of the block */
  blockTime: number | null;

  /** Transaction instructions data */
  instructions: any[];

  /** Transaction logs */
  logs: string[] | null;

  /** When this record was created in our database */
  createdAt: Date;
}

/**
 * Mongoose schema for Solana transactions
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

// Compound unique index to prevent duplicate transactions
TransactionSchema.index({ programId: 1, signature: 1 }, { unique: true });

// Compound index for efficient "last indexed slot" queries
TransactionSchema.index({ programId: 1, slot: -1 });

export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
