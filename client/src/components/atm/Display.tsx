import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DisplayProps {
  accountId: string;
  balance?: number;
  message: string;
  isLoading: boolean;
  error?: string;
}

export function Display({ accountId, balance, message, isLoading, error }: DisplayProps) {
  return (
    <Card className="p-6 bg-gray-800 text-white min-h-[200px] flex flex-col justify-between">
      <div className="text-2xl font-bold mb-4">
        {isLoading ? (
          <Skeleton className="h-8 w-3/4 bg-gray-700" />
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div>
            <div className="text-sm text-gray-400 mb-2">Account ID: {accountId}</div>
            {balance !== undefined && (
              <div className="mb-2">Balance: ${balance.toFixed(2)}</div>
            )}
            <div className="text-green-400">{message}</div>
          </div>
        )}
      </div>
      <div className="text-sm text-gray-400">
        Please use keypad to enter amount
      </div>
    </Card>
  );
}