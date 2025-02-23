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
  const [accountId, setAccountId] = useState("123"); // Demo account
  const { authToken } = useAuth();
  
  api.setAuthToken(authToken);

  const { data: balance, isLoading, error, refetch } = useQuery({
    queryKey: ['balance', accountId],
    queryFn: () => api.getBalance(accountId),
    enabled: !!authToken
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
    }
  });

  const handleNumberPress = (num: number) => {
    if (amount.length < 10) {
      setAmount(prev => prev + num);
    }
  };

  const handleClear = () => setAmount("");

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">ATM Interface</h1>
          <ConfigPanel />
        </div>

        <Card className="border-2">
          <CardContent className="p-6 space-y-4">
            <Display
              balance={balance?.balance}
              message={amount ? `Amount: $${amount}` : "Enter amount"}
              isLoading={isLoading || mutation.isPending}
              error={error?.message || mutation.error?.message}
            />

            <Keypad
              onNumberPress={handleNumberPress}
              onClear={handleClear}
              onEnter={() => {}}
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
                disabled={!amount || mutation.isPending}
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
