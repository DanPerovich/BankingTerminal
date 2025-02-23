import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Display } from "@/components/atm/Display";
import { Keypad } from "@/components/atm/Keypad";
import { ConfigPanel } from "@/components/atm/ConfigPanel";
import { AccountSelector } from "@/components/atm/AccountSelector";
import { Confetti } from "@/components/atm/Confetti";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Account {
  id: string;
  label: string;
}

export default function ATM() {
  const [amount, setAmount] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([
    { id: "008", label: "Main Account" }
  ]);
  const [selectedAccount, setSelectedAccount] = useState<Account>(accounts[0]);
  const [errorOverride, setErrorOverride] = useState<string | undefined>();
  const [showError, setShowError] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { authToken } = useAuth();

  api.setAuthToken(authToken);

  const { data: balance, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['balance', selectedAccount.id, authToken],
    queryFn: () => api.getBalance(selectedAccount.id),
    enabled: !!authToken && !!selectedAccount.id,
    retry: false
  });

  // Refetch balance when account or auth token changes
  useEffect(() => {
    refetch();
  }, [selectedAccount.id, authToken, refetch]);

  const mutation = useMutation({
    mutationFn: (type: 'credit' | 'debit') => {
      const numericAmount = parseFloat(amount);
      const transaction = type === 'credit'
        ? { credit: numericAmount }
        : { debit: numericAmount };
      return api.performTransaction(selectedAccount.id, transaction);
    },
    onSuccess: () => {
      refetch();
      setAmount("");
      setErrorOverride(undefined);
      setShowError(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  });

  const handleNumberPress = (num: number) => {
    if (amount.length < 10) {
      setAmount(prev => prev + num);
      setErrorOverride(undefined);
      setShowError(false);
    }
  };

  const handleDecimalPoint = () => {
    if (!amount.includes('.') && amount.length < 9) {
      setAmount(prev => prev + '.');
      setErrorOverride(undefined);
      setShowError(false);
    }
  };

  const handleClear = () => {
    setAmount("");
    setErrorOverride(undefined);
    setShowError(false);
  };

  const handleAccountAdd = (newAccount: Account) => {
    setAccounts(prev => [...prev, newAccount]);
    setSelectedAccount(newAccount);
    setErrorOverride(undefined);
    setShowError(true);
  };

  const errorMessage = errorOverride ?? (queryError instanceof Error ? queryError.message : mutation.error instanceof Error ? mutation.error.message : undefined);

  const isAccountNotInitialized = errorMessage?.includes("Account not initialized");

  const displayMessage = amount ? `Amount: $${amount}` : "Enter amount";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Confetti isVisible={showConfetti} />
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="/assets/668516ff2492ff79aa390de3_wiremock-cloud-logo-1200px.png" 
              alt="WireMock Cloud Logo"
              className="h-8 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-800">ATM Interface</h1>
          </div>
          <ConfigPanel
            onConfigChange={refetch}
            initiallyOpen={true}
          />
        </div>

        <Card className="border-2">
          <CardContent className="p-6 space-y-4">
            <div className="mb-4">
              <AccountSelector
                accounts={accounts}
                selectedAccount={selectedAccount}
                onAccountSelect={setSelectedAccount}
                onAccountAdd={handleAccountAdd}
              />
            </div>

            <Display
              accountId={selectedAccount.id}
              balance={balance?.balance}
              message={displayMessage}
              isLoading={isLoading || mutation.isPending}
              error={showError ? errorMessage : undefined}
            />

            <Keypad
              onNumberPress={handleNumberPress}
              onClear={handleClear}
              onDecimalPoint={handleDecimalPoint}
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