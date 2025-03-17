import axiosInstance from './axiosConfig';
import axios, { AxiosError } from 'axios';

// Types
// Account Types
export interface Account {
  account_id: number;
  uuid: string;
  name: string;
  type: string;
  description?: string;
  limit?: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  balance?: number;
  payable_balance?: number;
}

export interface AccountCreate {
  name: string;
  type: string;
  description?: string;
  limit?: number;
}

export interface AccountBalance {
  account_id: number;
  balance: number;
  total_income: number;
  total_expenses: number;
  total_transfers_in: number;
  total_transfers_out: number;
  total_transfer_fees: number;
  account: Account;
}

// Category Types
export interface Category {
  category_id: number;
  uuid: string;
  name: string;
  type: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  type: string;
}

// Transaction Types
export interface Transaction {
  transaction_id: number;
  uuid: string;
  amount: number;
  description: string;
  transaction_date: string;
  transaction_type: string;
  transfer_fee?: number;
  account_id: number;
  category_id?: number;
  destination_account_id?: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  account?: {
    account_id: number;
    name: string;
    type: string;
  };
  category?: {
    category_id: number;
    name: string;
    type: string;
  };
  destination_account?: {
    account_id: number;
    name: string;
    type: string;
  };
}

export interface TransactionCreate {
  amount: number;
  description: string;
  transaction_date: string;
  transaction_type: string;
  account_id: number;
  category_id?: number;
  destination_account_id?: number;
  transfer_fee?: number;
}

export interface TransactionListResponse {
  data: Transaction[];
  total_count: number;
  has_more: boolean;
  limit: number;
  skip: number;
  message: string;
}

// Statistics Types
export interface FinancialSummary {
  period: {
    start_date: string;
    end_date: string;
    period_type: string;
  };
  totals: {
    income: number;
    expense: number;
    transfer: number;
    net: number;
  };
}

export interface CategoryDistribution {
  period: {
    start_date: string;
    end_date: string;
    period_type: string;
  };
  transaction_type: string;
  total: number;
  categories: {
    name: string;
    uuid: string;
    total: number;
    percentage: number;
  }[];
}

export interface TransactionTrends {
  period: {
    start_date: string;
    end_date: string;
    period_type: string;
    group_by: string;
  };
  trends: {
    date: string;
    income: number;
    expense: number;
    transfer: number;
    net: number;
  }[];
}

export interface AccountSummary {
  total_balance: number;
  available_credit: number;
  credit_utilization: number;
  by_account_type: {
    bank_account: number;
    credit_card: number;
    other: number;
  };
  accounts: {
    account_id: number;
    uuid: string;
    name: string;
    type: string;
    balance: number;
    payable_balance?: number;
    limit?: number;
    utilization_percentage?: number;
  }[];
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

// Generic delete response type
export interface DeleteResponse {
  message: string;
  deleted_item: {
    id: number;
    uuid: string;
    [key: string]: any;
  };
}

// Error handler helper
const handleApiError = (error: unknown): never => {
  let errorMsg = 'An unexpected error occurred';
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Check if it's a validation error (422) with detail array
    if (axiosError.response?.status === 422 && Array.isArray(axiosError.response?.data?.detail)) {
      // Format validation errors in a readable way
      const validationErrors = axiosError.response.data.detail;
      errorMsg = validationErrors.map((err: any) => {
        if (err.loc && err.msg) {
          const field = err.loc[err.loc.length - 1];
          return `${field}: ${err.msg}`;
        }
        return JSON.stringify(err);
      }).join(', ');
    } else {
      // Standard error message format
      errorMsg = axiosError.response?.data?.detail || 
                 axiosError.response?.data?.message || 
                 axiosError.message || 
                 'API request failed';
    }
  } else if (error instanceof Error) {
    errorMsg = error.message;
  }
  
  throw new Error(errorMsg);
};

// Account API Functions
export const getAllAccounts = async (accountType?: string): Promise<Account[]> => {
  try {
    const params: Record<string, any> = {};
    if (accountType) params.account_type = accountType;
    
    const response = await axiosInstance.get('/personal-transactions/accounts', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createAccount = async (accountData: AccountCreate): Promise<{ data: Account, message: string }> => {
  try {
    const response = await axiosInstance.post('/personal-transactions/accounts', accountData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateAccount = async (accountId: number, accountData: AccountCreate): Promise<{ data: Account, message: string }> => {
  try {
    const response = await axiosInstance.put(`/personal-transactions/accounts/${accountId}`, accountData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteAccount = async (accountId: number): Promise<DeleteResponse> => {
  try {
    const response = await axiosInstance.delete(`/personal-transactions/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getAccountBalance = async (accountId: number): Promise<{ data: AccountBalance, message: string }> => {
  try {
    const response = await axiosInstance.get(`/personal-transactions/accounts/${accountId}/balance`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Category API Functions
export const getAllCategories = async (categoryType?: string): Promise<Category[]> => {
  try {
    const params: Record<string, any> = {};
    if (categoryType) params.category_type = categoryType;
    
    const response = await axiosInstance.get('/personal-transactions/categories', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createCategory = async (categoryData: CategoryCreate): Promise<{ data: Category, message: string }> => {
  try {
    const response = await axiosInstance.post('/personal-transactions/categories', categoryData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateCategory = async (categoryId: number, categoryData: CategoryCreate): Promise<{ data: Category, message: string }> => {
  try {
    const response = await axiosInstance.put(`/personal-transactions/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteCategory = async (categoryId: number): Promise<DeleteResponse> => {
  try {
    const response = await axiosInstance.delete(`/personal-transactions/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Transaction API Functions
export const getAllTransactions = async (
  params: {
    account_name?: string;
    category_name?: string;
    transaction_type?: string;
    start_date?: string;
    end_date?: string;
    date_filter_type?: 'day' | 'week' | 'month' | 'year' | 'all';
    limit?: number;
    skip?: number;
  } = {}
): Promise<TransactionListResponse> => {
  try {
    const response = await axiosInstance.get('/personal-transactions/transactions', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createTransaction = async (transactionData: TransactionCreate): Promise<{ data: Transaction, message: string }> => {
  try {
    const response = await axiosInstance.post('/personal-transactions/transactions', transactionData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateTransaction = async (transactionId: number, transactionData: TransactionCreate): Promise<{ data: Transaction, message: string }> => {
  try {
    const response = await axiosInstance.put(`/personal-transactions/transactions/${transactionId}`, transactionData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteTransaction = async (transactionId: number): Promise<DeleteResponse> => {
  try {
    const response = await axiosInstance.delete(`/personal-transactions/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Statistics API Functions
export const getFinancialSummary = async (
  params: {
    start_date?: string;
    end_date?: string;
    period?: 'day' | 'week' | 'month' | 'year' | 'all';
  } = {}
): Promise<FinancialSummary> => {
  try {
    const response = await axiosInstance.get('/personal-transactions/statistics/summary', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getCategoryDistribution = async (
  params: {
    transaction_type?: 'income' | 'expense';
    start_date?: string;
    end_date?: string;
    period?: 'day' | 'week' | 'month' | 'year' | 'all';
  } = {}
): Promise<CategoryDistribution> => {
  try {
    const response = await axiosInstance.get('/personal-transactions/statistics/by-category', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getTransactionTrends = async (
  params: {
    start_date?: string;
    end_date?: string;
    period?: 'day' | 'week' | 'month' | 'year' | 'all';
    group_by?: 'day' | 'week' | 'month' | 'year';
    transaction_types?: string[];
  } = {}
): Promise<TransactionTrends> => {
  try {
    const response = await axiosInstance.get('/personal-transactions/statistics/trends', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getAccountSummary = async (
  params: {
    include_transactions?: boolean;
    account_type?: string;
  } = {}
): Promise<AccountSummary> => {
  try {
    // Add default parameters if needed
    const requestParams = {
      ...params,
      // Include any default parameters here if needed
    };
    
    const response = await axiosInstance.get('/personal-transactions/statistics/account-summary', { 
      params: requestParams
    });
    return response.data;
  } catch (error) {
    // Enhanced error handling with more specific error message
    console.error('Account summary API error:', error);
    throw handleApiError(error);
  }
};
