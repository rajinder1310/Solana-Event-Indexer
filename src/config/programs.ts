
export interface ProgramDefinition {
  id: string;
  name: string;
  description?: string;
  startSlot?: number;
  realtime: boolean;
  historical: boolean;
}

export const programs: ProgramDefinition[] = [
  // {
  //   id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  //   name: 'token-program',
  //   description: 'Solana Token Program',
  //   startSlot: 0,
  //   realtime: true,
  //   historical: true
  // },
  // {
  //   id: 'So11111111111111111111111111111111111111111',
  //   name: 'wrapped-sol',
  //   description: 'Wrapped SOL Mint',
  //   startSlot: 0, // Will auto-resume from DB or start fresh
  //   realtime: true,
  //   historical: true
  // },
  {
    id: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // User provided contract
    name: 'user-contract',
    description: 'User Provided Contract',
    startSlot: 0,
    realtime: true,
    historical: true
  }
];
