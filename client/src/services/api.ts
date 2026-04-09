import { AccountBalance, Transaction } from '@shared/schema';

// Define types for request and response tracking
export interface ApiRequestLog {
  method: string;
  url: string;
  body?: any;
  headers: Record<string, string>;
  timestamp: Date;
}

export interface ApiResponseLog {
  status: number;
  statusText: string;
  body?: any;
  timestamp: Date;
  error?: string;
}

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  token: '',
  baseUrl: 'https://statefuldoublecontext.wiremockapi.cloud',
  // Change to arrays to store history
  requestHistory: [] as ApiRequestLog[],
  responseHistory: [] as ApiResponseLog[],

  // Getters for the most recent logs
  get lastRequest(): ApiRequestLog | null {
    return this.requestHistory.length > 0 ? this.requestHistory[0] : null;
  },

  get lastResponse(): ApiResponseLog | null {
    return this.responseHistory.length > 0 ? this.responseHistory[0] : null;
  },

  // Helper to add a request to history
  addRequestToHistory(request: ApiRequestLog) {
    this.requestHistory.unshift(request); // Add to front of array
    if (this.requestHistory.length > 10) {
      this.requestHistory.pop(); // Remove oldest if we have more than 10
    }
  },

  // Helper to add a response to history
  addResponseToHistory(response: ApiResponseLog) {
    this.responseHistory.unshift(response); // Add to front of array
    if (this.responseHistory.length > 10) {
      this.responseHistory.pop(); // Remove oldest if we have more than 10
    }
  },

  setAuthToken(token: string) {
    this.token = token;
  },

  setBaseUrl(url: string) {
    // Validate and normalize the URL
    const trimmedUrl = url.trim();
    console.log('Setting base URL:', trimmedUrl);
    
    // If it already has a protocol, use it as-is
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      this.baseUrl = trimmedUrl;
      console.log('URL has protocol, using as-is:', this.baseUrl);
      return;
    }
    
    // If no protocol specified, default to https
    this.baseUrl = `https://${trimmedUrl}`;
    console.log('No protocol specified, defaulting to HTTPS:', this.baseUrl);
  },

  // Helper method to validate URL format
  isValidUrl(url: string): boolean {
    try {
      const trimmedUrl = url.trim();
      
      // Check if it's a valid URL with http or https protocol
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        new URL(trimmedUrl);
        return true;
      }
      
      // Check if it's a valid hostname/domain that we can add protocol to
      if (trimmedUrl && !trimmedUrl.includes('://')) {
        new URL(`https://${trimmedUrl}`);
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  },

  // Helper method to get protocol from current base URL
  getCurrentProtocol(): 'http' | 'https' {
    return this.baseUrl.startsWith('https://') ? 'https' : 'http';
  },

  // Helper method to get hostname from current base URL
  getCurrentHostname(): string {
    try {
      const url = new URL(this.baseUrl);
      return url.hostname;
    } catch {
      return '';
    }
  },

  async getBalance(accountId: string): Promise<AccountBalance> {
    try {
      const url = `${this.baseUrl}/accounts/${accountId}`;
      const headers: Record<string, string> = {};

      // Only add Authorization header if token exists
      if (this.token) {
        headers['Authorization'] = this.token;
      }

      // Log the request
      const requestLog: ApiRequestLog = {
        method: 'GET',
        url,
        headers,
        timestamp: new Date()
      };
      this.addRequestToHistory(requestLog);

      console.log('Making GET request to:', url);
      const response = await fetch(url, {
        headers
      });
      console.log('Response received:', response.status, response.statusText);

      // Start logging the response
      let responseLog: ApiResponseLog = {
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date()
      };

      if (!response.ok) {
        const errorText = await response.text();
        try {
          if (errorText.trim().startsWith('{')) {
            const errorJson = JSON.parse(errorText);
            responseLog.body = errorJson;

            if (errorJson.error === "Account not initialized.") {
              responseLog.error = "Account not initialized.";
              this.addResponseToHistory(responseLog);
              throw new ApiError("Account not initialized.");
            }
            responseLog.error = errorJson.error;
            this.addResponseToHistory(responseLog);
            throw new ApiError(errorJson.error);
          }
          if (errorText.includes("Account not initialized")) {
            responseLog.error = "Account not initialized.";
            responseLog.body = errorText;
            this.addResponseToHistory(responseLog);
            throw new ApiError("Account not initialized.");
          }
          responseLog.error = errorText || response.statusText;
          responseLog.body = errorText;
          this.addResponseToHistory(responseLog);
          throw new ApiError(errorText || response.statusText);
        } catch (e) {
          if (e instanceof ApiError) {
            throw e;
          }
          responseLog.error = errorText || response.statusText;
          this.addResponseToHistory(responseLog);
          throw new ApiError(errorText || response.statusText);
        }
      }

      const data = await response.json();
      responseLog.body = data;
      this.addResponseToHistory(responseLog);

      // Handle both direct response and nested response structure
      const balanceData = data.respnose || data;
      const balance = typeof balanceData.balance === 'number' 
        ? balanceData.balance 
        : parseInt(balanceData.balance);

      if (isNaN(balance)) {
        throw new ApiError("Invalid balance value received from server");
      }

      return {
        accountId: parseInt(accountId),
        balance
      };
    } catch (error: any) {
      console.error('API request failed:', error);
      
      // Check for mixed content security errors
      if (error.message.includes('Failed to fetch') && this.baseUrl.startsWith('http://')) {
        const mixedContentError = 'HTTP requests blocked by browser security. The browser prevents HTTP requests when the page is loaded over HTTPS. Either use HTTPS for the API endpoint or access the app via HTTP.';
        console.error('Mixed content error detected:', mixedContentError);
        throw new ApiError(mixedContentError);
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network request failed');
    }
  },

  async performTransaction(accountId: string, transaction: Transaction): Promise<void> {
    const url = `${this.baseUrl}/accounts/${accountId}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Only add Authorization header if token exists
    if (this.token) {
      headers['Authorization'] = this.token;
    }

    // Log the request
    const requestLog: ApiRequestLog = {
      method: 'POST',
      url,
      body: transaction,
      headers,
      timestamp: new Date()
    };
    this.addRequestToHistory(requestLog);

    console.log('Making POST request to:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(transaction)
    });
    console.log('Response received:', response.status, response.statusText);

    // Start logging the response
    let responseLog: ApiResponseLog = {
      status: response.status,
      statusText: response.statusText,
      timestamp: new Date()
    };

    if (!response.ok) {
      const errorText = await response.text();
      try {
        if (errorText && errorText.trim().startsWith('{')) {
          const errorJson = JSON.parse(errorText);
          responseLog.body = errorJson;
          responseLog.error = errorJson.error || errorText;
          this.addResponseToHistory(responseLog);
          throw new ApiError(errorJson.error || errorText);
        }
        responseLog.body = errorText;
        responseLog.error = errorText || response.statusText;
        this.addResponseToHistory(responseLog);
        throw new ApiError(errorText || response.statusText);
      } catch (e) {
        if (e instanceof ApiError) {
          throw e;
        }
        responseLog.error = errorText || response.statusText;
        this.addResponseToHistory(responseLog);
        throw new ApiError(errorText || response.statusText);
      }
    } else {
      // Get response body if it exists
      try {
        const text = await response.text();
        if (text) {
          try {
            responseLog.body = JSON.parse(text);
          } catch {
            responseLog.body = text;
          }
        }
      } catch {
        // Silent fail if we can't read the body
      }
    }

    this.addResponseToHistory(responseLog);
  },

  // Add error handling wrapper for mixed content issues
  async handleMixedContentError(error: any): Promise<never> {
    console.error('API request failed:', error);
    
    // Check for mixed content security errors
    if (error.message.includes('Failed to fetch') && this.baseUrl.startsWith('http://')) {
      const mixedContentError = 'HTTP requests blocked by browser security. The browser prevents HTTP requests when the page is loaded over HTTPS. Either use HTTPS for the API endpoint or access the app via HTTP.';
      console.error('Mixed content error detected:', mixedContentError);
      throw new ApiError(mixedContentError);
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network request failed');
  }
};

// Auto-configure from ?host= query string parameter so the demo helper
// can link directly to the BankingTerminal with the provisioned mock API
// pre-populated (e.g. http://localhost:5001/?host=abc12.wiremockapi.cloud).
const _hostParam = new URLSearchParams(window.location.search).get('host');
if (_hostParam) {
  api.setBaseUrl(_hostParam);
}