import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

interface ConfigPanelProps {
  initiallyOpen?: boolean;
  onConfigChange?: () => void;
}

export function ConfigPanel({ initiallyOpen = false, onConfigChange }: ConfigPanelProps) {
  const { authToken, setAuthToken } = useAuth();
  const [tempToken, setTempToken] = useState(authToken);
  const [open, setOpen] = useState(initiallyOpen);

  useEffect(() => {
    setTempToken(authToken);
  }, [authToken]);

  const handleSave = () => {
    setAuthToken(tempToken);
    setOpen(false);
    onConfigChange?.();
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