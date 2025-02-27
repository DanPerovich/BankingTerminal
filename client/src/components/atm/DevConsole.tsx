import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Code } from "lucide-react";
import { api, ApiRequestLog, ApiResponseLog } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DevConsoleProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function DevConsole({ isVisible, onToggle }: DevConsoleProps) {
  const [request, setRequest] = useState<ApiRequestLog | null>(null);
  const [response, setResponse] = useState<ApiResponseLog | null>(null);

  // Poll for changes in API logs
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setRequest(api.lastRequest);
      setResponse(api.lastResponse);
    }, 500);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  // Format JSON for display
  const formatJson = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  // Format timestamp
  const formatTime = (date?: Date): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Button 
        variant="outline" 
        size="sm" 
        className="absolute top-0 right-4 transform -translate-y-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        onClick={onToggle}
      >
        <Code className="h-4 w-4 mr-1" />
        Dev Console {isVisible ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </Button>
      
      {isVisible && (
        <Card className="border-t-2 rounded-t-md p-3 bg-gray-100 dark:bg-gray-800 max-h-[300px] overflow-auto">
          <Tabs defaultValue="request">
            <TabsList className="mb-2">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            
            <TabsContent value="request" className="mt-0">
              {request ? (
                <div className="text-sm font-mono whitespace-pre-wrap">
                  <div className="mb-2 text-blue-600 dark:text-blue-400">{request.method} {request.url} <span className="text-gray-500 text-xs">{formatTime(request.timestamp)}</span></div>
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Headers:</div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md text-xs overflow-auto">
                      {formatJson(request.headers)}
                    </pre>
                  </div>
                  {request.body && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Body:</div>
                      <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md text-xs overflow-auto">
                        {formatJson(request.body)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 italic">No request logged yet</div>
              )}
            </TabsContent>
            
            <TabsContent value="response" className="mt-0">
              {response ? (
                <div className="text-sm font-mono whitespace-pre-wrap">
                  <div className={`mb-2 ${response.status >= 200 && response.status < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    Status: {response.status} {response.statusText} <span className="text-gray-500 text-xs">{formatTime(response.timestamp)}</span>
                  </div>
                  {response.error && (
                    <div className="mb-2 text-red-600 dark:text-red-400">
                      Error: {response.error}
                    </div>
                  )}
                  {response.body && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Body:</div>
                      <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md text-xs overflow-auto">
                        {formatJson(response.body)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 italic">No response logged yet</div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
