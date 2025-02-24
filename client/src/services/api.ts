import { AccountBalance, Transaction } from '@shared/schema';

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  token: '',
  baseUrl: 'https://statefuldoublecontext.wiremockapi.cloud',

  setAuthToken(token: string) {
    this.token = token;
  },

  setBaseUrl(url: string) {
    this.baseUrl = url.startsWith('http') ? url : `https://${url}`;
  },

  async getBalance(accountId: string): Promise<AccountBalance> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
        headers: this.token ? { 'Authorization': this.token } : {}
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          if (errorText.trim().startsWith('{')) {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error === "Account not initialized.") {
              throw new ApiError("Account not initialized.");
            }
            throw new ApiError(errorJson.error);
          }
          if (errorText.includes("Account not initialized")) {
            throw new ApiError("Account not initialized.");
          }
          throw new ApiError(errorText || response.statusText);
        } catch (e) {
          if (e instanceof ApiError) {
            throw e;
          }
          throw new ApiError(errorText || response.statusText);
        }
      }

      const data = await response.json();

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
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': this.token } : {})
      },
      body: JSON.stringify(transaction)
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        if (errorText.trim().startsWith('{')) {
          const errorJson = JSON.parse(errorText);
          throw new ApiError(errorJson.error || errorText);
        }
        throw new ApiError(errorText || response.statusText);
      } catch (e) {
        if (e instanceof ApiError) {
          throw e;
        }
        throw new ApiError(errorText || response.statusText);
      }
    }
  }
};