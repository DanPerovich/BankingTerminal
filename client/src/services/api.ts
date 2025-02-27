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
    this.baseUrl = url.startsWith('http') ? url : `https://${url}`;
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

      const response = await fetch(url, {
        headers
      });

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
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message);
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

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(transaction)
    });

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
  }
};