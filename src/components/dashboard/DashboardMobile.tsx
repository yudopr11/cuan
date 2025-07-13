import { useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  FinancialSummary,
  AccountSummary,
  Transaction,
  CategoryDistribution,
  TransactionTrends
} from '../../services/api';
import { ArrowDownIcon, ArrowUpIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import TransactionChart from './TransactionChart';
import CategoryChart from './CategoryChart';
import { BuildingLibraryIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { DashboardMobileSkeleton } from '../common/SkeletonLoader';

interface DashboardMobileProps {
  isInitialLoading: boolean;
  isRefreshing: boolean;
  financialSummary: FinancialSummary | null;
  accountSummary: AccountSummary | null;
  recentTransactions: Transaction[];
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  categoryData: CategoryDistribution | null;
  trends: TransactionTrends | null;
  categoryType: 'income' | 'expense';
  errors: {
    financial: boolean;
    accounts: boolean;
    transactions: boolean;
    categories: boolean;
    trends: boolean;
  };
  handlePeriodChange: (newPeriod: 'day' | 'week' | 'month' | 'year' | 'all') => void;
  handleCategoryTypeChange: (type: 'income' | 'expense') => void;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
}

export default function DashboardMobile({
  isInitialLoading,
  isRefreshing,
  financialSummary,
  accountSummary,
  recentTransactions,
  period,
  categoryData,
  trends,
  categoryType,
  errors,
  handlePeriodChange,
  handleCategoryTypeChange,
  formatDate,
  formatCurrency
}: DashboardMobileProps) {
  const [activeStatsTab, setActiveStatsTab] = useState<'categories' | 'trends'>('trends');

  // Component to show loading overlay for refreshing data
  const LoadingOverlay = () => (
    isRefreshing ? (
      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10 rounded-xl backdrop-blur-sm">
        <div className="px-6 py-4 bg-gray-800/90 rounded-xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#30BDF2]"></div>
            <p className="text-sm text-gray-200">Updating...</p>
          </div>
        </div>
      </div>
    ) : null
  );

  if (isInitialLoading) {
    return <DashboardMobileSkeleton />;
  }

  return (
    <div className="space-y-5 px-1 pb-16">
      {/* Period Selector - iOS/Android style segmented control */}
      <div className="px-2 py-3">
        <div className="flex w-full bg-slate-800/80 rounded-full p-1.5 shadow-lg">
          <button
            onClick={() => handlePeriodChange('day')}
            className={`flex-1 text-center py-2.5 text-sm font-medium rounded-full transition-all ${
              period === 'day' ? 'bg-[#30BDF2] text-white shadow-md' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            Day
          </button>
          <button
            onClick={() => handlePeriodChange('week')}
            className={`flex-1 text-center py-2.5 text-sm font-medium rounded-full transition-all ${
              period === 'week' ? 'bg-[#30BDF2] text-white shadow-md' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            Week
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`flex-1 text-center py-2.5 text-sm font-medium rounded-full transition-all ${
              period === 'month' ? 'bg-[#30BDF2] text-white shadow-md' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            Month
          </button>
          <button
            onClick={() => handlePeriodChange('year')}
            className={`flex-1 text-center py-2.5 text-sm font-medium rounded-full transition-all ${
              period === 'year' ? 'bg-[#30BDF2] text-white shadow-md' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            Year
          </button>
          <button
            onClick={() => handlePeriodChange('all')}
            className={`flex-1 text-center py-2.5 text-sm font-medium rounded-full transition-all ${
              period === 'all' ? 'bg-[#30BDF2] text-white shadow-md' : 'text-gray-300'
            }`}
            disabled={isRefreshing}
          >
            All
          </button>
        </div>
      </div>

      {/* Financial Summary - Cards with native-like styling */}
      <div className="grid grid-cols-2 gap-3 px-2">
        <div className="relative card-dark flex flex-col p-4 rounded-xl shadow-lg bg-gradient-to-br from-gray-800 to-gray-900">
          <LoadingOverlay />
          <p className="text-xs text-gray-300 mb-1.5 font-medium">Income</p>
          <p className={`font-bold text-green-400 ${
            financialSummary && financialSummary.totals.income.toString().length > 8 
              ? 'text-base' 
              : financialSummary && financialSummary.totals.income.toString().length > 6 
                ? 'text-lg' 
                : 'text-xl'
          }`}>
            {financialSummary ? formatCurrency(financialSummary.totals.income) : '$0.00'}
          </p>
        </div>
        <div className="relative card-dark flex flex-col p-4 rounded-xl shadow-lg bg-gradient-to-br from-gray-800 to-gray-900">
          <LoadingOverlay />
          <p className="text-xs text-gray-300 mb-1.5 font-medium">Expenses</p>
          <p className={`font-bold text-red-400 ${
            financialSummary && financialSummary.totals.expense.toString().length > 8 
              ? 'text-base' 
              : financialSummary && financialSummary.totals.expense.toString().length > 6 
                ? 'text-lg' 
                : 'text-xl'
          }`}>
            {financialSummary ? formatCurrency(financialSummary.totals.expense) : '$0.00'}
          </p>
        </div>
        <div className="relative card-dark flex flex-col p-4 rounded-xl shadow-lg bg-gradient-to-br from-gray-800 to-gray-900">
          <LoadingOverlay />
          <p className="text-xs text-gray-300 mb-1.5 font-medium">Transfers</p>
          <p className={`font-bold text-blue-400 ${
            financialSummary && financialSummary.totals.transfer.toString().length > 8 
              ? 'text-base' 
              : financialSummary && financialSummary.totals.transfer.toString().length > 6 
                ? 'text-lg' 
                : 'text-xl'
          }`}>
            {financialSummary ? formatCurrency(financialSummary.totals.transfer) : '$0.00'}
          </p>
        </div>
        <div className="relative card-dark flex flex-col p-4 rounded-xl shadow-lg bg-gradient-to-br from-gray-800 to-gray-900">
          <LoadingOverlay />
          <p className="text-xs text-gray-300 mb-1.5 font-medium">Net</p>
          <p className={`font-bold ${
            financialSummary && Math.abs(financialSummary.totals.net).toString().length > 8 
              ? 'text-base' 
              : financialSummary && Math.abs(financialSummary.totals.net).toString().length > 6 
                ? 'text-lg' 
                : 'text-xl'
          } ${financialSummary && financialSummary.totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {financialSummary ? formatCurrency(financialSummary.totals.net) : '$0.00'}
          </p>
        </div>
      </div>

      {/* Statistics Tabs - iOS/Android style tabs */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex border-b border-gray-700/50 mb-4">
          <button
            className={`flex-1 px-4 py-3.5 font-medium text-sm ${
              activeStatsTab === 'trends'
                ? 'border-b-2 border-[#30BDF2] text-[#30BDF2] bg-gray-800/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveStatsTab('trends')}
          >
            Trends
          </button>
          <button
            className={`flex-1 px-4 py-3.5 font-medium text-sm ${
              activeStatsTab === 'categories'
                ? 'border-b-2 border-[#30BDF2] text-[#30BDF2] bg-gray-800/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveStatsTab('categories')}
          >
            Categories
          </button>
        </div>

        <div className="px-3 pb-4">
          {/* Trends Content */}
          {activeStatsTab === 'trends' && (
            <div className="relative">
              <LoadingOverlay />
              <TransactionChart trends={trends || { period: { start_date: '', end_date: '', period_type: period, group_by: 'day' }, trends: [] }} period={period} />
            </div>
          )}

          {/* Categories Content */}
          {activeStatsTab === 'categories' && categoryData && (
            <div className="relative">
              <LoadingOverlay />
              <div className="flex justify-between items-center mb-4">
                {/* iOS/Android style toggle */}
                <div className="flex rounded-full overflow-hidden border border-gray-700 p-0.5 shadow-md">
                  <button
                    onClick={() => handleCategoryTypeChange('expense')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      categoryType === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'bg-transparent text-gray-300'
                    }`}
                  >
                    Expenses
                  </button>
                  <button
                    onClick={() => handleCategoryTypeChange('income')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      categoryType === 'income' ? 'bg-green-500 text-white shadow-sm' : 'bg-transparent text-gray-300'
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
                <div className="h-64 w-full flex items-center justify-center bg-gray-800/30 rounded-xl">
                  <p className="text-gray-400">No data available for this period</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Transactions - iOS/Android style list */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
          <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-[#30BDF2] text-sm font-medium hover:text-[#28a8d8]">
            View All
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-gray-700/50">
            {recentTransactions.map((transaction, index, arr) => (
              <div 
                key={transaction.id} 
                className={`py-3.5 px-4 flex items-center justify-between active:bg-gray-700/20 transition-colors ${index === arr.length - 1 ? 'border-b-0' : ''}`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    transaction.transaction_type === 'income' ? 'bg-green-500/10 text-green-400' :
                    transaction.transaction_type === 'expense' ? 'bg-red-500/10 text-red-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {transaction.transaction_type === 'income' ? (
                      <ArrowDownIcon className="h-5 w-5" />
                    ) : transaction.transaction_type === 'expense' ? (
                      <ArrowUpIcon className="h-5 w-5" />
                    ) : (
                      <ArrowsRightLeftIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3.5">
                    <div className="text-base font-medium text-white">{transaction.description}</div>
                    <div className="text-xs text-gray-400">
                      {formatDate(transaction.transaction_date)} · {transaction.transaction_type === 'transfer' ? 'Transfer' : (transaction.category?.name || 'Uncategorized')}
                    </div>
                  </div>
                </div>
                <div className={`text-base font-medium ${
                  transaction.transaction_type === 'income' ? 'text-green-400' :
                  transaction.transaction_type === 'expense' ? 'text-red-400' :
                  'text-blue-400'
                }`}>
                  {transaction.transaction_type === 'income' ? '+' : transaction.transaction_type === 'expense' ? '-' : ''}
                  {formatCurrency(transaction.amount)}
                  {transaction.transaction_type === 'transfer' && transaction.transfer_fee && transaction.transfer_fee > 0 && (
                    <div className="text-xs text-yellow-400 text-right">
                      Fee: {formatCurrency(transaction.transfer_fee)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-300">
            No recent transactions
          </div>
        )}
      </div>
      
      {/* Account Summary - iOS/Android style cards */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
          <h2 className="text-base font-semibold text-white">Active Accounts</h2>
          <Link to="/accounts" className="text-[#30BDF2] text-sm font-medium">View All</Link>
        </div>
        {!errors.accounts ? (
          <>
            <div className="divide-y divide-gray-700/50">
              {accountSummary && accountSummary.accounts.length > 0 ? (
                accountSummary.accounts.slice(0, 3).map((account) => (
                  <div 
                    key={account.id} 
                    className="flex justify-between items-center p-4 active:bg-gray-700/20 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 mr-3">
                        <span className="text-xl" role="img" aria-label={account.type}>
                          {account.type === 'bank_account' ? <BuildingLibraryIcon className="h-6 w-6 text-blue-300" /> : 
                           account.type === 'credit_card' ? <CreditCardIcon className="h-6 w-6 text-blue-300" /> : <BanknotesIcon className="h-6 w-6 text-blue-300" />}
                        </span>
                      </div>
                      <div>
                        <p className="text-base font-medium text-white">{account.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{account.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-white">{formatCurrency(account.balance)}</p>
                      {account.type === 'credit_card' && account.payable_balance !== undefined && (
                        <p className="text-xs text-gray-400">
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
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-white">Total Balance:</p>
                <p className="text-base font-bold text-[#30BDF2]">{accountSummary ? formatCurrency(accountSummary.total_balance) : '$0.00'}</p>
              </div>
              {accountSummary && accountSummary.accounts.some(account => account.type === 'credit_card' && account.payable_balance !== undefined) && (
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm font-medium text-white">Credit Card Payable:</p>
                  <p className="text-base font-bold text-red-400">
                    {formatCurrency(
                      accountSummary.accounts
                        .filter(account => account.type === 'credit_card' && account.payable_balance !== undefined)
                        .reduce((sum, account) => sum + (Number(account.payable_balance) || 0), 0)
                    )}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <p className="text-gray-300">Could not load account data</p>
            <button 
              className="mt-3 px-4 py-2 text-sm text-white bg-[#30BDF2] rounded-full shadow-md active:bg-[#28a8d8] transition-colors"
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