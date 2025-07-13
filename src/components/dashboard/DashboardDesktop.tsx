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
import { DashboardDesktopSkeleton } from '../common/SkeletonLoader';

interface DashboardDesktopProps {
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

export default function DashboardDesktop({
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
}: DashboardDesktopProps) {
  // Component to show loading overlay for refreshing data
  const LoadingOverlay = () => (
    isRefreshing ? (
      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
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
    return <DashboardDesktopSkeleton />;
  }

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
                <div className="h-64 sm:h-72 md:h-80 w-full flex items-center justify-center bg-gray-800/30 rounded-xl">
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
                <div key={transaction.id} className="py-3 flex items-center justify-between">
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
                        {formatDate(transaction.transaction_date)} · {transaction.transaction_type === 'transfer' ? 'Transfer' : (transaction.category?.name || 'Uncategorized')}
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
                      <div className="text-xs text-yellow-400 text-right">
                        Fee: {formatCurrency(transaction.transfer_fee)}
                      </div>
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
                    <div key={account.id} className="flex justify-between items-center p-2 border-b border-gray-700">
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
                {accountSummary && accountSummary.accounts.some(account => account.type === 'credit_card' && account.payable_balance !== undefined) && (
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm lg:text-base xl:text-lg font-medium text-white">Credit Card Payable:</p>
                    <p className="text-sm lg:text-base xl:text-lg font-bold text-red-400">
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