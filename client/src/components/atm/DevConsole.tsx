import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Code, ChevronLeft, ChevronRight } from "lucide-react";
import { api, ApiRequestLog, ApiResponseLog } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DevConsoleProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function DevConsole({ isVisible, onToggle }: DevConsoleProps) {
  const [requestHistory, setRequestHistory] = useState<ApiRequestLog[]>([]);
  const [responseHistory, setResponseHistory] = useState<ApiResponseLog[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Current request and response based on history index
  const currentRequest = requestHistory[historyIndex];
  const currentResponse = responseHistory[historyIndex];

  // Poll for changes in API logs
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setRequestHistory([...api.requestHistory]);
      setResponseHistory([...api.responseHistory]);
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Reset index when history changes
  useEffect(() => {
    setHistoryIndex(0);
  }, [requestHistory.length, responseHistory.length]);

  // Navigation handlers
  const goToPrevious = () => {
    if (historyIndex < Math.max(requestHistory.length, responseHistory.length) - 1) {
      setHistoryIndex(historyIndex + 1); // Higher index = older record
    }
  };

  const goToNext = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1); // Lower index = newer record
    }
  };

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

  // Calculate history position text
  const getHistoryPosition = () => {
    const totalItems = Math.max(requestHistory.length, responseHistory.length);
    if (totalItems === 0) return "";
    return `${historyIndex + 1} of ${totalItems}`;
  }

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
          <div className="flex justify-between items-center mb-2">
            <Tabs defaultValue="request" className="w-full">
              <div className="flex justify-between items-center mb-2">
                <TabsList>
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>

                {Math.max(requestHistory.length, responseHistory.length) > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={historyIndex >= Math.max(requestHistory.length, responseHistory.length) - 1}
                      onClick={goToPrevious}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </Button>

                    <span className="text-xs text-gray-500 dark:text-gray-400">{getHistoryPosition()}</span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyIndex <= 0}
                      onClick={goToNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                )}
              </div>

              <TabsContent value="request" className="mt-0">
                {currentRequest ? (
                  <div className="text-sm font-mono whitespace-pre-wrap">
                    <div className="mb-2 text-blue-600 dark:text-blue-400">
                      {currentRequest.method} {currentRequest.url} 
                      <span className="text-gray-500 text-xs ml-2">{formatTime(currentRequest.timestamp)}</span>
                    </div>
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Headers:</div>
                      <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md text-xs overflow-auto">
                        {formatJson(currentRequest.headers)}
                      </pre>
                    </div>
                    {currentRequest.body && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Body:</div>
                        <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md text-xs overflow-auto">
                          {formatJson(currentRequest.body)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No request logged yet</div>
                )}
              </TabsContent>

              <TabsContent value="response" className="mt-0">
                {currentResponse ? (
                  <div className="text-sm font-mono whitespace-pre-wrap">
                    <div className={`mb-2 ${currentResponse.status >= 200 && currentResponse.status < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Status: {currentResponse.status} {currentResponse.statusText} 
                      <span className="text-gray-500 text-xs ml-2">{formatTime(currentResponse.timestamp)}</span>
                    </div>
                    {currentResponse.error && (
                      <div className="mb-2 text-red-600 dark:text-red-400">
                        Error: {currentResponse.error}
                      </div>
                    )}
                    {currentResponse.body && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Body:</div>
                        <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md text-xs overflow-auto">
                          {formatJson(currentResponse.body)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No response logged yet</div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      )}
    </div>
  );
}