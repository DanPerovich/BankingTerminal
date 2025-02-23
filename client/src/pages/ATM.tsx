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
  const [showError, setShowError] = useState(true); // New state to control error visibility
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
      setShowError(true); // Reset error visibility on successful transaction
    }
  });

  const handleNumberPress = (num: number) => {
    if (amount.length < 10) {
      setAmount(prev => prev + num);
      setErrorOverride(undefined);
      setShowError(false); // Hide error when typing
    }
  };

  const handleClear = () => {
    setAmount("");
    setErrorOverride(undefined);
    setShowError(false); // Hide error when clearing
  };

  const handleAccountIdChange = (newAccountId: string) => {
    setAccountId(newAccountId);
    setErrorOverride(undefined);
    setShowError(true); // Show any potential errors when changing accounts
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
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">ATM Interface</h1>
            <img 
              src="/assets/668516ff2492ff79aa390de3_wiremock-cloud-logo-1200px.png" 
              alt="WireMock Cloud Logo"
              className="h-8 object-contain"
            />
          </div>
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
              error={showError ? errorMessage : undefined} // Only show error if showError is true
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