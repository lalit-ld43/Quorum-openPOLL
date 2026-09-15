import { z } from 'zod';

/**
 * All environment variables the app depends on are validated here, once, at import time.
 * Fail fast with a readable error rather than letting an undefined value leak into the
 * Midnight SDK later on.
 */
const environmentSchema = z.object({
  NEXT_PUBLIC_NETWORK_ID: z.enum(['undeployed', 'devnet', 'testnet', 'preview', 'preprod', 'mainnet']),
  NEXT_PUBLIC_LOGGING_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  NEXT_PUBLIC_CONTRACT_ADDRESS: z.string().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

const parseEnvironment = (): Environment => {
  const result = environmentSchema.safeParse({
    NEXT_PUBLIC_NETWORK_ID: process.env.NEXT_PUBLIC_NETWORK_ID,
    NEXT_PUBLIC_LOGGING_LEVEL: process.env.NEXT_PUBLIC_LOGGING_LEVEL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  });

  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${result.error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n')}\n\nDid you copy .env.example to .env.local?`,
    );
  }

  return result.data;
};

export const env = parseEnvironment();
export const NEXT_PUBLIC_CONTRACT_ADDRESS = env.NEXT_PUBLIC_CONTRACT_ADDRESS;
