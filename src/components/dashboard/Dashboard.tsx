import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  getFinancialSummary,
  getAccountSummary,
  getAllTransactions,
  getCategoryDistribution,
  getTransactionTrends
} from '../../services/api';
import type {
  FinancialSummary,
  AccountSummary,
  Transaction,
  CategoryDistribution,
  TransactionTrends
} from '../../services/api';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import usePageTitle from '../../hooks/usePageTitle';
import { ArrowDownIcon, ArrowUpIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import TransactionChart from './TransactionChart';
import CategoryChart from './CategoryChart';

interface DashboardProps {
  isMobile: boolean;
}

export default function Dashboard({ isMobile }: DashboardProps) {
  usePageTitle('Dashboard');

  // Base Dashboard State
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  // Statistics State
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');
  const [categoryData, setCategoryData] = useState<CategoryDistribution | null>(null);
  const [trends, setTrends] = useState<TransactionTrends | null>(null);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [activeStatsTab, setActiveStatsTab] = useState<'categories' | 'trends'>('trends');
  
  // Error tracking
  const [errors, setErrors] = useState<{
    financial: boolean;
    accounts: boolean;
    transactions: boolean;
    categories: boolean;
    trends: boolean;
  }>({
    financial: false,
    accounts: false,
    transactions: false,
    categories: false,
    trends: false
  });

  // Use the currency formatter hook
  const { formatCurrency } = useCurrencyFormatter();

  // Initial data fetch and period changes
  useEffect(() => {
    const fetchData = async () => {
      await fetchInitialDashboardData();
      await fetchPeriodRelatedData();
      await fetchCategoryData();
      setIsInitialLoading(false);
    };
    fetchData();
  }, []);

  // Refresh data when period changes
  useEffect(() => {
    if (!isInitialLoading) {
      fetchPeriodRelatedData();
      fetchCategoryData();
    }
  }, [period]);

  // Refresh category data when type changes
  useEffect(() => {
    if (!isInitialLoading && categoryType) {
      fetchCategoryData();
    }
  }, [categoryType]);

  const fetchCategoryData = async () => {
    try {
      const categoryDistributionData = await getCategoryDistribution({ 
        transaction_type: categoryType,
        period
      });
      setCategoryData(categoryDistributionData);
      setErrors(prev => ({ ...prev, categories: false }));
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      setErrors(prev => ({ ...prev, categories: true }));
      toast.error('Failed to load category distribution data');
    }
  };

  // Fetch data that should only be loaded once at initialization
  const fetchInitialDashboardData = async () => {
    let hasErrors = false;
    
    // Fetch account summary with transactions included
    try {
      const accounts = await getAccountSummary({
        include_transactions: false
      });
      setAccountSummary(accounts);
      setErrors(prev => ({ ...prev, accounts: false }));
    } catch (error) {
      console.error('Error fetching account summary:', error);
      setErrors(prev => ({ ...prev, accounts: true }));
      hasErrors = true;
    }

    // Fetch recent transactions with period filter
    try {
      const transactions = await getAllTransactions({ 
        limit: 5, 
        skip: 0,
        date_filter_type: period === 'all' ? undefined : period
      });
      setRecentTransactions(transactions.data);
      setErrors(prev => ({ ...prev, transactions: false }));
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      setErrors(prev => ({ ...prev, transactions: true }));
      hasErrors = true;
    }
    
    // Show general error toast if any of the requests failed
    if (hasErrors) {
      toast.error('Some dashboard data could not be loaded. Please try refreshing the page.');
    }
  };

  // Fetch data that should update when the period changes
  const fetchPeriodRelatedData = async () => {
    setIsRefreshing(true);
    let hasErrors = false;
    
    // Fetch financial summary for selected period
    try {
      const summary = await getFinancialSummary({ period });
      setFinancialSummary(summary);
      setErrors(prev => ({ ...prev, financial: false }));
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      setErrors(prev => ({ ...prev, financial: true }));
      hasErrors = true;
    }
    
    // Fetch transaction trends with appropriate grouping
    try {
      const groupBy = period === 'day' ? 'day' : 
                     period === 'week' || period === 'month' ? 'day' : 
                     period === 'year' ? 'month' : 'month';
      
      const trendsData = await getTransactionTrends({ 
        period,
        group_by: groupBy
      });
      
      setTrends(trendsData);
      setErrors(prev => ({ ...prev, trends: false }));
    } catch (error) {
      console.error('Error fetching transaction trends:', error);
      setErrors(prev => ({ ...prev, trends: true }));
      hasErrors = true;
    }

    setIsRefreshing(false);
    
    // Show general error toast if any of the requests failed
    if (hasErrors) {
      toast.error('Some dashboard data could not be loaded. Please try refreshing the page.');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month' | 'year' | 'all') => {
    setPeriod(newPeriod);
  };

  // Handle category type change
  const handleCategoryTypeChange = (type: 'income' | 'expense') => {
    setCategoryType(type);
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Component to show loading overlay for refreshing data
  const LoadingOverlay = () => (
    isRefreshing ? (
      <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    ) : null
  );

  // Mobile layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Period Selector */}
        <div className="w-full">
          <div className="flex w-full bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => handlePeriodChange('day')}
              className={`flex-1 text-center py-2 text-sm rounded-md ${
                period === 'day' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
              }`}
              disabled={isRefreshing}
            >
              Day
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`flex-1 text-center py-2 text-sm rounded-md ${
                period === 'week' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
              }`}
              disabled={isRefreshing}
            >
              Week
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`flex-1 text-center py-2 text-sm rounded-md ${
                period === 'month' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
              }`}
              disabled={isRefreshing}
            >
              Month
            </button>
            <button
              onClick={() => handlePeriodChange('year')}
              className={`flex-1 text-center py-2 text-sm rounded-md ${
                period === 'year' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
              }`}
              disabled={isRefreshing}
            >
              Year
            </button>
            <button
              onClick={() => handlePeriodChange('all')}
              className={`flex-1 text-center py-2 text-sm rounded-md ${
                period === 'all' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
              }`}
              disabled={isRefreshing}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative card-dark flex flex-col">
            <LoadingOverlay />
            <p className="text-xs text-gray-300 mb-1">Income</p>
            <p className="text-lg font-bold text-green-400">
              {financialSummary ? formatCurrency(financialSummary.totals.income) : '$0.00'}
            </p>
          </div>
          <div className="relative card-dark flex flex-col">
            <LoadingOverlay />
            <p className="text-xs text-gray-300 mb-1">Expenses</p>
            <p className="text-lg font-bold text-red-400">
              {financialSummary ? formatCurrency(financialSummary.totals.expense) : '$0.00'}
            </p>
          </div>
          <div className="relative card-dark flex flex-col">
            <LoadingOverlay />
            <p className="text-xs text-gray-300 mb-1">Transfers</p>
            <p className="text-lg font-bold text-blue-400">
              {financialSummary ? formatCurrency(financialSummary.totals.transfer) : '$0.00'}
            </p>
          </div>
          <div className="relative card-dark flex flex-col">
            <LoadingOverlay />
            <p className="text-xs text-gray-300 mb-1">Net</p>
            <p className={`text-lg font-bold ${financialSummary && financialSummary.totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {financialSummary ? formatCurrency(financialSummary.totals.net) : '$0.00'}
            </p>
          </div>
        </div>

        {/* Statistics Tabs */}
        <div className="card-dark">
          <div className="flex border-b border-gray-700 mb-4">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeStatsTab === 'trends'
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveStatsTab('trends')}
            >
              Trends
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeStatsTab === 'categories'
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveStatsTab('categories')}
            >
              Categories
            </button>
          </div>

          {/* Trends Content */}
          {activeStatsTab === 'trends' && (
            <div>
              <TransactionChart trends={trends || { period: { start_date: '', end_date: '', period_type: period, group_by: 'day' }, trends: [] }} period={period} />
            </div>
          )}

          {/* Categories Content */}
          {activeStatsTab === 'categories' && categoryData && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex rounded-md overflow-hidden border border-gray-700">
                  <button
                    onClick={() => handleCategoryTypeChange('expense')}
                    className={`px-3 py-1 text-sm ${
                      categoryType === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-800 text-gray-300'
                    }`}
                  >
                    Expenses
                  </button>
                  <button
                    onClick={() => handleCategoryTypeChange('income')}
                    className={`px-3 py-1 text-sm ${
                      categoryType === 'income' ? 'bg-green-500 text-white' : 'bg-slate-800 text-gray-300'
                    }`}
                  >
                    Income
                  </button>
                </div>
                <div className="text-sm font-medium text-gray-200">
                  {formatCurrency(categoryData.total)}
                </div>
              </div>
              
              {categoryData.categories.length > 0 ? (
                <div>
                  <CategoryChart categoryData={categoryData} type={categoryType} />
                </div>
              ) : (
                <div className="h-64 sm:h-72 md:h-80 w-full flex items-center justify-center">
                  <p className="text-gray-400">No data available for this period</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Recent Transactions */}
        <div className="card-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-semibold text-white">Recent Transactions</h2>
            <Link to="/transactions" className="text-xs md:text-sm text-[#30BDF2] hover:text-[#28a8d8]">View All</Link>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {recentTransactions.map((transaction, index, arr) => (
                <div key={transaction.transaction_id} className={`py-2 md:py-3 flex items-center justify-between ${index === arr.length - 1 ? 'border-b-0' : ''}`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                      transaction.transaction_type === 'income' ? 'bg-green-950 text-green-400' :
                      transaction.transaction_type === 'expense' ? 'bg-red-950 text-red-400' :
                      'bg-blue-950 text-blue-400'
                    }`}>
                      {transaction.transaction_type === 'income' ? (
                        <ArrowDownIcon className="h-4 w-4 md:h-5 md:w-5" />
                      ) : transaction.transaction_type === 'expense' ? (
                        <ArrowUpIcon className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <ArrowsRightLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </div>
                    <div className="ml-3 md:ml-4">
                      <div className="text-sm md:text-base font-medium text-white">{transaction.description}</div>
                      <div className="text-xs md:text-sm text-gray-200">
                        {formatDate(transaction.transaction_date)} · {transaction.category?.name || 'Uncategorized'}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm md:text-base font-medium ${
                    transaction.transaction_type === 'income' ? 'text-green-400' :
                    transaction.transaction_type === 'expense' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {transaction.transaction_type === 'income' ? '+' : transaction.transaction_type === 'expense' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                    {transaction.transaction_type === 'transfer' && transaction.transfer_fee && transaction.transfer_fee > 0 && (
                      <div className="text-xs text-gray-400">Fee: {formatCurrency(transaction.transfer_fee)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 md:py-8 text-center text-gray-300">
              No recent transactions
            </div>
          )}
        </div>
        
        {/* Account Summary */}
        <div className="card-dark">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base md:text-lg font-semibold text-white">Active Accounts</h2>
            <Link to="/accounts" className="text-xs md:text-sm text-[#30BDF2]">View All</Link>
          </div>
          {!errors.accounts ? (
            <>
              <div className="space-y-3">
                {accountSummary && accountSummary.accounts.length > 0 ? (
                  accountSummary.accounts.slice(0, 3).map((account, index, arr) => (
                    <div key={account.account_id} className={`flex justify-between items-center p-2 ${index !== arr.length - 1 ? 'border-b border-gray-700' : ''}`}>
                      <div>
                        <p className="text-sm md:text-base font-medium text-white">{account.name}</p>
                        <p className="text-xs text-gray-200 capitalize">{account.type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm md:text-base font-bold text-white">{formatCurrency(account.balance)}</p>
                        {account.type === 'credit_card' && account.payable_balance !== undefined && (
                          <p className="text-xs text-gray-200">
                            Payable: {formatCurrency(account.payable_balance)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-300 text-center py-4">No accounts found</p>
                )}
              </div>
              <div className="mt-3 pt-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm md:text-base font-medium text-white">Total Balance:</p>
                  <p className="text-sm md:text-base font-bold text-[#30BDF2]">{accountSummary ? formatCurrency(accountSummary.total_balance) : '$0.00'}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-300">Could not load account data</p>
              <button 
                className="mt-2 text-xs md:text-sm text-gray-200 hover:text-white"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => handlePeriodChange('day')}
            className={`py-2 px-4 rounded-md ${
              period === 'day' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            Day
          </button>
          <button
            onClick={() => handlePeriodChange('week')}
            className={`py-2 px-4 rounded-md ${
              period === 'week' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            Week
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`py-2 px-4 rounded-md ${
              period === 'month' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            Month
          </button>
          <button
            onClick={() => handlePeriodChange('year')}
            className={`py-2 px-4 rounded-md ${
              period === 'year' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            Year
          </button>
          <button
            onClick={() => handlePeriodChange('all')}
            className={`py-2 px-4 rounded-md ${
              period === 'all' ? 'bg-[#30BDF2] text-white' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Row 1: Financial Summary */}
      <div className="grid grid-cols-4 gap-6">
        <div className="relative card-dark">
          <LoadingOverlay />
          <p className="text-xs sm:text-sm lg:text-base text-gray-200 mb-1">Income</p>
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-400">
            {financialSummary ? formatCurrency(financialSummary.totals.income) : '$0.00'}
          </p>
          <p className="text-xs lg:text-sm text-gray-200 mt-2">
            {period === 'all' ? 'All Time' : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
          </p>
        </div>
        <div className="relative card-dark">
          <LoadingOverlay />
          <p className="text-xs sm:text-sm lg:text-base text-gray-200 mb-1">Expenses</p>
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-red-400">
            {financialSummary ? formatCurrency(financialSummary.totals.expense) : '$0.00'}
          </p>
          <p className="text-xs lg:text-sm text-gray-200 mt-2">
            {period === 'all' ? 'All Time' : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
          </p>
        </div>
        <div className="relative card-dark">
          <LoadingOverlay />
          <p className="text-xs sm:text-sm lg:text-base text-gray-200 mb-1">Transfers</p>
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-400">
            {financialSummary ? formatCurrency(financialSummary.totals.transfer) : '$0.00'}
          </p>
          <p className="text-xs lg:text-sm text-gray-200 mt-2">
            {period === 'all' ? 'All Time' : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
          </p>
        </div>
        <div className="relative card-dark">
          <LoadingOverlay />
          <p className="text-xs sm:text-sm lg:text-base text-gray-200 mb-1">Net</p>
          <p className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold ${financialSummary && financialSummary.totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {financialSummary ? formatCurrency(financialSummary.totals.net) : '$0.00'}
          </p>
          <p className="text-xs lg:text-sm text-gray-200 mt-2">
            {period === 'all' ? 'All Time' : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
          </p>
        </div>
      </div>
      
      {/* Row 2: Transaction Trends and Category Distribution */}
      <div className="grid grid-cols-12 gap-6">
        {/* Transaction Trends */}
        <div className="relative card-dark col-span-7">
          <LoadingOverlay />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Transaction Trends</h2>
          </div>
          
          <div>
            <TransactionChart trends={trends || { period: { start_date: '', end_date: '', period_type: period, group_by: 'day' }, trends: [] }} period={period} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="relative card-dark col-span-5">
          <LoadingOverlay />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Categories</h2>
            
            <div className="flex rounded-md overflow-hidden border border-gray-700">
              <button
                onClick={() => handleCategoryTypeChange('expense')}
                className={`px-3 py-1 text-sm ${
                  categoryType === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-800 text-gray-300'
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => handleCategoryTypeChange('income')}
                className={`px-3 py-1 text-sm ${
                  categoryType === 'income' ? 'bg-green-500 text-white' : 'bg-slate-800 text-gray-300'
                }`}
              >
                Income
              </button>
            </div>
          </div>
          
          {categoryData && (
            <>
              <div className="text-right mb-4">
                <div className="text-sm lg:text-base xl:text-lg font-medium text-gray-200">
                  {formatCurrency(categoryData.total)}
                </div>
              </div>
              
              {categoryData.categories.length > 0 ? (
                <div>
                  <CategoryChart categoryData={categoryData} type={categoryType} />
                </div>
              ) : (
                <div className="h-64 sm:h-72 md:h-80 w-full flex items-center justify-center">
                  <p className="text-gray-400">No data available for this period</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Row 3: Accounts and Recent Transactions */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Recent Transactions</h2>
            <Link to="/transactions" className="text-xs sm:text-sm lg:text-base text-[#30BDF2] hover:text-[#28a8d8]">View All</Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {recentTransactions.map((transaction) => (
                <div key={transaction.transaction_id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 sm:w-9 lg:w-10 h-8 sm:h-9 lg:h-10 rounded-full flex items-center justify-center ${
                      transaction.transaction_type === 'income' ? 'bg-green-950 text-green-400' :
                      transaction.transaction_type === 'expense' ? 'bg-red-950 text-red-400' :
                      'bg-blue-950 text-blue-400'
                    }`}>
                      {transaction.transaction_type === 'income' ? (
                        <ArrowDownIcon className="h-4 sm:h-4 lg:h-5 w-4 sm:w-4 lg:w-5" />
                      ) : transaction.transaction_type === 'expense' ? (
                        <ArrowUpIcon className="h-4 sm:h-4 lg:h-5 w-4 sm:w-4 lg:w-5" />
                      ) : (
                        <ArrowsRightLeftIcon className="h-4 sm:h-4 lg:h-5 w-4 sm:w-4 lg:w-5" />
                      )}
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <div className="text-sm lg:text-base xl:text-lg font-medium text-white">{transaction.description}</div>
                      <div className="text-xs lg:text-sm text-gray-200">
                        {formatDate(transaction.transaction_date)} · {transaction.category?.name || 'Uncategorized'}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm lg:text-base xl:text-lg font-medium ${
                    transaction.transaction_type === 'income' ? 'text-green-400' :
                    transaction.transaction_type === 'expense' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {transaction.transaction_type === 'income' ? '+' : transaction.transaction_type === 'expense' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                    {transaction.transaction_type === 'transfer' && transaction.transfer_fee && transaction.transfer_fee > 0 && (
                      <div className="text-xs text-gray-400">Fee: {formatCurrency(transaction.transfer_fee)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm lg:text-base text-gray-300">
              No recent transactions
            </div>
          )}
        </div>

        {/* Account Summary */}
        <div className="card-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Active Accounts</h2>
            <Link to="/accounts" className="text-xs sm:text-sm lg:text-base text-[#30BDF2]">View All</Link>
          </div>
          
          {!errors.accounts ? (
            <>
              <div className="space-y-3">
                {accountSummary && accountSummary.accounts.length > 0 ? (
                  accountSummary.accounts.slice(0, 4).map((account) => (
                    <div key={account.account_id} className="flex justify-between items-center p-2 border-b border-gray-700">
                      <div>
                        <p className="text-sm lg:text-base xl:text-lg font-medium text-white">{account.name}</p>
                        <p className="text-xs lg:text-sm text-gray-200 capitalize">{account.type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm lg:text-base xl:text-lg font-bold text-white">{formatCurrency(account.balance)}</p>
                        {account.type === 'credit_card' && account.payable_balance !== undefined && (
                          <p className="text-xs lg:text-sm text-gray-200">
                            Payable: {formatCurrency(account.payable_balance)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm lg:text-base text-gray-300 py-4">No accounts found</p>
                )}
              </div>
              <div className="mt-3 pt-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm lg:text-base xl:text-lg font-medium text-white">Total Balance:</p>
                  <p className="text-sm lg:text-base xl:text-lg font-bold text-[#30BDF2]">{accountSummary ? formatCurrency(accountSummary.total_balance) : '$0.00'}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm lg:text-base text-gray-300">Could not load account data</p>
              <button 
                className="mt-2 text-xs sm:text-sm lg:text-base text-gray-200 hover:text-white"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 