import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Account {
  id: string;
  label: string;
}

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccount: Account;
  onAccountSelect: (account: Account) => void;
  onAccountAdd: (account: Account) => void;
}

export function AccountSelector({
  accounts,
  selectedAccount,
  onAccountSelect,
  onAccountAdd,
}: AccountSelectorProps) {
  const [newAccountId, setNewAccountId] = useState("");
  const [newAccountLabel, setNewAccountLabel] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddAccount = () => {
    if (newAccountId && newAccountLabel) {
      onAccountAdd({ id: newAccountId, label: newAccountLabel });
      setNewAccountId("");
      setNewAccountLabel("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            {selectedAccount.label}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              onClick={() => onAccountSelect(account)}
            >
              {account.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Account ID</label>
              <Input
                value={newAccountId}
                onChange={(e) => setNewAccountId(e.target.value)}
                placeholder="Enter account ID"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Account Label</label>
              <Input
                value={newAccountLabel}
                onChange={(e) => setNewAccountLabel(e.target.value)}
                placeholder="Enter account label (e.g. Savings)"
                className="mt-1"
              />
            </div>
            <Button onClick={handleAddAccount}>Add Account</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
