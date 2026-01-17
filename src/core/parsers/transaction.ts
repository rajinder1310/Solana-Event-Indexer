
import { ParsedTransactionWithMeta } from '@solana/web3.js';
import { flatten } from 'lodash';

export interface ParsedTransactionData {
  signature: string;
  slot: number;
  blockTime: number | null;
  instructions: any[];
  logs: string[] | null;
}

export class TransactionParser {
  /**
   * Parse a raw Solana transaction into a normalized format
   */
  static parse(
    signature: string,
    tx: ParsedTransactionWithMeta,
    targetProgramId: string
  ): ParsedTransactionData {
    return {
      signature,
      slot: tx.slot,
      blockTime: tx.blockTime || null,
      instructions: this.extractInstructions(tx, targetProgramId),
      logs: tx.meta?.logMessages || null
    };
  }

  /**
   * Extract instructions relevant to the target program
   */
  private static extractInstructions(tx: ParsedTransactionWithMeta, targetProgramId: string): any[] {
    const instructions: any[] = [];

    // Top-level instructions
    if (tx.transaction.message.instructions) {
      tx.transaction.message.instructions.forEach((ix: any) => {
        if (ix.programId.toString() === targetProgramId) {
          instructions.push({
            programId: ix.programId.toString(),
            data: 'data' in ix ? ix.data : null,
            parsed: 'parsed' in ix ? ix.parsed : null,
            inner: false
          });
        }
      });
    }

    // Inner instructions (CPI calls)
    if (tx.meta?.innerInstructions) {
      tx.meta.innerInstructions.forEach((innerBlock) => {
        innerBlock.instructions.forEach((ix: any) => {
          if (ix.programId.toString() === targetProgramId) {
            instructions.push({
              programId: ix.programId.toString(),
              data: 'data' in ix ? ix.data : null,
              parsed: 'parsed' in ix ? ix.parsed : null,
              inner: true
            });
          }
        });
      });
    }

    return instructions;
  }
}
