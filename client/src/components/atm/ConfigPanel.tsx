import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface ConfigPanelProps {
  accountId: string;
  onAccountIdChange: (id: string) => void;
}

export function ConfigPanel({ accountId, onAccountIdChange }: ConfigPanelProps) {
  const { authToken, setAuthToken } = useAuth();
  const [tempToken, setTempToken] = useState(authToken);
  const [tempAccountId, setTempAccountId] = useState(accountId);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    setAuthToken(tempToken);
    onAccountIdChange(tempAccountId);
    setOpen(false); // Close the dialog after saving
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ATM Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Account ID</label>
            <Input
              value={tempAccountId}
              onChange={(e) => setTempAccountId(e.target.value)}
              placeholder="Enter account ID"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Authorization Header</label>
            <Input
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              placeholder="Enter auth token"
              className="mt-1"
            />
          </div>
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}