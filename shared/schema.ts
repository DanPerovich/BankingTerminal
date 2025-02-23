import { z } from "zod";

export const accountBalanceSchema = z.object({
  accountId: z.number(),
  balance: z.number()
});

export const transactionSchema = z.object({
  debit: z.number().optional(),
  credit: z.number().optional()
});

export type AccountBalance = z.infer<typeof accountBalanceSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
