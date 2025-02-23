import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Display } from "@/components/atm/Display";
import { Keypad } from "@/components/atm/Keypad";
import { ConfigPanel } from "@/components/atm/ConfigPanel";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ATM() {
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("123"); // Default account
  const [errorOverride, setErrorOverride] = useState<string | undefined>();
  const { authToken } = useAuth();

  api.setAuthToken(authToken);

  const { data: balance, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['balance', accountId],
    queryFn: () => api.getBalance(accountId),
    enabled: !!authToken && !!accountId,
    retry: false
  });

  const mutation = useMutation({
    mutationFn: (type: 'credit' | 'debit') => {
      const transaction = type === 'credit' 
        ? { credit: Number(amount) }
        : { debit: Number(amount) };
      return api.performTransaction(accountId, transaction);
    },
    onSuccess: () => {
      refetch();
      setAmount("");
      setErrorOverride(undefined);
    }
  });

  const handleNumberPress = (num: number) => {
    if (amount.length < 10) {
      setAmount(prev => prev + num);
      setErrorOverride(undefined); // Clear error when typing
    }
  };

  const handleClear = () => {
    setAmount("");
    setErrorOverride(undefined); // Clear error when clearing
  };

  const handleAccountIdChange = (newAccountId: string) => {
    setAccountId(newAccountId);
    setErrorOverride(undefined);
    setTimeout(() => refetch(), 0);
  };

  // Extract error message from either query or mutation error
  const errorMessage = errorOverride ?? (queryError instanceof Error ? queryError.message : mutation.error instanceof Error ? mutation.error.message : undefined);

  // Check if account is not initialized
  const isAccountNotInitialized = errorMessage?.includes("Account not initialized");

  // Determine the display message
  const displayMessage = amount ? `Amount: $${amount}` : "Enter amount";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">ATM Interface</h1>
          <ConfigPanel 
            accountId={accountId}
            onAccountIdChange={handleAccountIdChange}
          />
        </div>

        <Card className="border-2">
          <CardContent className="p-6 space-y-4">
            <Display
              accountId={accountId}
              balance={balance?.balance}
              message={displayMessage}
              isLoading={isLoading || mutation.isPending}
              error={amount ? undefined : errorMessage} // Only show error if no amount is entered
            />

            <Keypad
              onNumberPress={handleNumberPress}
              onClear={handleClear}
            />

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => mutation.mutate('credit')}
                disabled={!amount || mutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                Credit
              </Button>
              <Button
                onClick={() => mutation.mutate('debit')}
                disabled={!amount || mutation.isPending || isAccountNotInitialized}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Debit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}