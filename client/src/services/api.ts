import axios from 'axios';
import { AccountBalance, Transaction } from '@shared/schema';

const BASE_URL = 'https://reststatefulmocking.wiremockapi.cloud';

export const api = {
  setAuthToken(token: string) {
    axios.defaults.headers.common['Authorization'] = token;
  },

  async getBalance(accountId: string): Promise<AccountBalance> {
    const response = await axios.get(`${BASE_URL}/accounts/${accountId}`);
    // Extract balance from the response according to the OpenAPI spec
    return {
      accountId: Number(accountId),
      balance: response.data.balance
    };
  },

  async performTransaction(accountId: string, transaction: Transaction): Promise<void> {
    await axios.post(`${BASE_URL}/accounts/${accountId}`, transaction);
  }
};