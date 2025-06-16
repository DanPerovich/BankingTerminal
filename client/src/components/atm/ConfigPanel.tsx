import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, ShieldAlert, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { api } from "@/services/api";

interface ConfigPanelProps {
  initiallyOpen?: boolean;
  onConfigChange?: () => void;
}

export function ConfigPanel({ initiallyOpen = false, onConfigChange }: ConfigPanelProps) {
  const { authToken, setAuthToken } = useAuth();
  const [tempToken, setTempToken] = useState(authToken);
  const [tempBaseUrl, setTempBaseUrl] = useState('statefuldoublecontext.wiremockapi.cloud');
  const [protocol, setProtocol] = useState<'http' | 'https'>('https');
  const [hostname, setHostname] = useState('statefuldoublecontext.wiremockapi.cloud');
  const [open, setOpen] = useState(initiallyOpen);
  const [urlError, setUrlError] = useState<string>('');
  const [isLocalHost, setIsLocalHost] = useState(false);

  useEffect(() => {
    setTempToken(authToken);
    // Check if running on localhost/development environment
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname.includes('.local') ||
                  window.location.port !== '';
    setIsLocalHost(isDev);
    
    // Parse current API base URL to set initial values
    const currentProtocol = api.getCurrentProtocol();
    const currentHostname = api.getCurrentHostname();
    if (currentHostname) {
      setProtocol(currentProtocol);
      setHostname(currentHostname);
      setTempBaseUrl(currentHostname);
    }
    
    // Force HTTPS when not in local development
    if (!isDev && protocol === 'http') {
      setProtocol('https');
    }
  }, [authToken]);

  const validateAndUpdateUrl = (newHostname: string, newProtocol: 'http' | 'https') => {
    const fullUrl = `${newProtocol}://${newHostname}`;
    
    if (!api.isValidUrl(fullUrl)) {
      setUrlError('Please enter a valid hostname or URL');
      return false;
    }
    
    setUrlError('');
    return true;
  };

  const handleHostnameChange = (value: string) => {
    setHostname(value);
    setTempBaseUrl(value);
    validateAndUpdateUrl(value, protocol);
  };

  const handleProtocolChange = (newProtocol: 'http' | 'https') => {
    setProtocol(newProtocol);
    validateAndUpdateUrl(hostname, newProtocol);
  };

  const handleSave = () => {
    const fullUrl = `${protocol}://${hostname}`;
    console.log('Saving configuration:', { protocol, hostname, fullUrl });
    
    if (!validateAndUpdateUrl(hostname, protocol)) {
      return;
    }

    setAuthToken(tempToken);
    // Pass the full URL with protocol to ensure HTTP/HTTPS is preserved
    api.setBaseUrl(fullUrl);
    console.log('API base URL set to:', api.baseUrl);
    setOpen(false);
    onConfigChange?.();
  };

  const isValidConfig = !urlError && hostname.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ATM Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Current API Status */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {protocol === 'https' ? (
                <Shield className="h-4 w-4 text-green-600" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-orange-600" />
              )}
              <Badge variant={protocol === 'https' ? 'default' : 'secondary'}>
                {protocol.toUpperCase()}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {protocol}://{hostname || 'not configured'}
            </span>
          </div>

          {/* Protocol Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Protocol</label>
            {isLocalHost ? (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="protocol"
                    value="https"
                    checked={protocol === 'https'}
                    onChange={(e) => handleProtocolChange(e.target.value as 'https')}
                    className="text-green-600"
                  />
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">HTTPS (Secure)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="protocol"
                    value="http"
                    checked={protocol === 'http'}
                    onChange={(e) => handleProtocolChange(e.target.value as 'http')}
                    className="text-orange-600"
                  />
                  <ShieldAlert className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">HTTP (Development)</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">HTTPS (Secure) - Production Mode</span>
              </div>
            )}
            {protocol === 'http' && isLocalHost && (
              <div className="space-y-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Development Mode</span>
                </div>
                <div className="text-xs text-orange-700 space-y-1">
                  <p>• HTTP connections are not encrypted</p>
                  <p>• Only available for local development</p>
                  <p>• Start with HTTP_MODE=true or use ./start-http.sh</p>
                </div>
              </div>
            )}
          </div>

          {/* Hostname/Domain Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">API Hostname</label>
            <div className="relative">
              <Input
                value={hostname}
                onChange={(e) => handleHostnameChange(e.target.value)}
                placeholder="example.com or api.example.com"
                className={`${urlError ? 'border-red-500' : ''}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {hostname && !urlError ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : urlError ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            </div>
            {urlError && (
              <p className="text-xs text-red-500">{urlError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter hostname without protocol (e.g., api.example.com)
            </p>
          </div>

          {/* Authorization Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Authorization Token</label>
            <Input
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              placeholder="Enter auth token (optional)"
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty if no authentication required
            </p>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={!isValidConfig}
            className="w-full"
          >
            {isValidConfig ? 'Save Configuration' : 'Please fix errors above'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}