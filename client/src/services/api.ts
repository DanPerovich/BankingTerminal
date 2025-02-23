import axios from 'axios';
import { AccountBalance, Transaction } from '@shared/schema';

const BASE_URL = 'https://statefuldoublecontext.wiremockapi.cloud';

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  setAuthToken(token: string) {
    axios.defaults.headers.common['Authorization'] = token;
  },

  async getBalance(accountId: string): Promise<AccountBalance> {
    try {
      const response = await axios.get(`${BASE_URL}/accounts/${accountId}`);
      console.log('Raw API Response:', response.data); // Debug log

      // Ensure we have a valid balance value
      const rawBalance = response.data.balance;
      const balance = typeof rawBalance === 'number' ? rawBalance : Number(rawBalance);

      if (typeof rawBalance === 'undefined' || rawBalance === null) {
        throw new ApiError("Balance not found in response");
      }

      if (isNaN(balance)) {
        throw new ApiError(`Invalid balance value: ${rawBalance}`);
      }

      return {
        accountId: parseInt(accountId),
        balance: balance
      };
    } catch (error: any) {
      console.log('API Error:', error.response?.data); // Debug log
      if (error.response?.status === 404 && 
          error.response?.data?.error === "Account not initialized.") {
        throw new ApiError("Account not initialized.");
      }
      throw new ApiError(error.response?.data?.error || error.message);
    }
  },

  async performTransaction(accountId: string, transaction: Transaction): Promise<void> {
    await axios.post(`${BASE_URL}/accounts/${accountId}`, transaction);
  }
};