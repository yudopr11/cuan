import { useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  FinancialSummary,
  AccountSummary,
  Transaction,
  CategoryDistribution,
  TransactionTrends
} from '../../services/api';
import { ArrowDownIcon, ArrowUpIcon, ArrowsRightLeftIcon, BuildingLibraryIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import TransactionChart from './TransactionChart';
import CategoryChart from './CategoryChart';
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

  const LoadingOverlay = () => (
    isRefreshing ? (
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl"
          style={{ background: 'rgba(13,21,40,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-[#30BDF2]/30 border-t-[#30BDF2] animate-spin" />
          <p className="text-sm text-gray-200">Updating...</p>
        </div>
      </div>
    ) : null
  );

  if (isInitialLoading) return <DashboardMobileSkeleton />;

  const periods: Array<{ value: typeof period; label: string }> = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-4 pb-20">

      {/* Period Selector */}
      <div className="px-2 pt-1">
        <div className="flex rounded-2xl p-1 gap-0.5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
          }}
        >
          {periods.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handlePeriodChange(value)}
              disabled={isRefreshing}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${
                period === value ? 'text-white' : 'text-gray-500'
              }`}
              style={period === value ? {
                background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
                boxShadow: '0 2px 8px rgba(48,189,242,0.35)'
              } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5 px-2">
        {/* Income */}
        <div className="relative rounded-2xl p-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a2a1e 0%, #0d1f16 100%)',
            border: '1px solid rgba(16,185,129,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
          }}
        >
          <LoadingOverlay />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)' }}
            >
              <ArrowDownIcon className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="text-xs font-medium text-emerald-700">Income</p>
          </div>
          <p className="text-lg font-bold text-emerald-400 leading-tight break-all">
            {financialSummary ? formatCurrency(financialSummary.totals.income) : '—'}
          </p>
        </div>

        {/* Expenses */}
        <div className="relative rounded-2xl p-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #2a0e0e 0%, #1f0d0d 100%)',
            border: '1px solid rgba(239,68,68,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
          }}
        >
          <LoadingOverlay />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)' }}
            >
              <ArrowUpIcon className="h-3.5 w-3.5 text-red-400" />
            </div>
            <p className="text-xs font-medium text-red-900">Expenses</p>
          </div>
          <p className="text-lg font-bold text-red-400 leading-tight break-all">
            {financialSummary ? formatCurrency(financialSummary.totals.expense) : '—'}
          </p>
        </div>

        {/* Transfers */}
        <div className="relative rounded-2xl p-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0e1a2a 0%, #0d1520 100%)',
            border: '1px solid rgba(59,130,246,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
          }}
        >
          <LoadingOverlay />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)' }}
            >
              <ArrowsRightLeftIcon className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <p className="text-xs font-medium text-blue-900">Transfers</p>
          </div>
          <p className="text-lg font-bold text-blue-400 leading-tight break-all">
            {financialSummary ? formatCurrency(financialSummary.totals.transfer) : '—'}
          </p>
        </div>

        {/* Net */}
        {(() => {
          const isPositive = !financialSummary || financialSummary.totals.net >= 0;
          return (
            <div className="relative rounded-2xl p-4 overflow-hidden"
              style={{
                background: isPositive
                  ? 'linear-gradient(135deg, #0a2a1e 0%, #0d1f16 100%)'
                  : 'linear-gradient(135deg, #2a0e0e 0%, #1f0d0d 100%)',
                border: `1px solid ${isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
              }}
            >
              <LoadingOverlay />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}
                >
                  {isPositive
                    ? <ArrowDownIcon className="h-3.5 w-3.5 text-emerald-400" />
                    : <ArrowUpIcon className="h-3.5 w-3.5 text-red-400" />
                  }
                </div>
                <p className={`text-xs font-medium ${isPositive ? 'text-emerald-700' : 'text-red-900'}`}>Net</p>
              </div>
              <p className={`text-lg font-bold leading-tight break-all ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {financialSummary ? formatCurrency(financialSummary.totals.net) : '—'}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Charts Card */}
      <div className="mx-2 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #161e2e 0%, #111827 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}
      >
        {/* Tab Bar */}
        <div className="flex"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {(['trends', 'categories'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveStatsTab(tab)}
              className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-all duration-150 ${
                activeStatsTab === tab
                  ? 'text-[#30BDF2]'
                  : 'text-gray-500'
              }`}
              style={activeStatsTab === tab ? {
                borderBottom: '2px solid #30BDF2',
              } : { borderBottom: '2px solid transparent' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeStatsTab === 'trends' && (
            <div className="relative">
              <LoadingOverlay />
              <TransactionChart
                trends={trends || { period: { start_date: '', end_date: '', period_type: period, group_by: 'day' }, trends: [] }}
                period={period}
              />
            </div>
          )}

          {activeStatsTab === 'categories' && categoryData && (
            <div className="relative">
              <LoadingOverlay />
              <div className="flex justify-between items-center mb-4">
                <div className="flex rounded-xl overflow-hidden p-0.5 gap-0.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {(['expense', 'income'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => handleCategoryTypeChange(type)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                        categoryType === type ? 'text-white' : 'text-gray-400'
                      }`}
                      style={categoryType === type ? {
                        background: type === 'expense'
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                          : 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: `0 1px 6px ${type === 'expense' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
                      } : {}}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-300">{formatCurrency(categoryData.total)}</span>
              </div>

              {categoryData.categories.length > 0 ? (
                <CategoryChart categoryData={categoryData} type={categoryType} />
              ) : (
                <div className="h-48 flex items-center justify-center rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <p className="text-gray-500 text-sm">No data for this period</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mx-2 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #161e2e 0%, #111827 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}
      >
        <div className="flex justify-between items-center px-4 py-3.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-[#30BDF2] font-medium">View All →</Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-gray-800/50">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.transaction_type === 'income' ? 'bg-emerald-500/10' :
                    tx.transaction_type === 'expense' ? 'bg-red-500/10' :
                    'bg-blue-500/10'
                  }`}>
                    {tx.transaction_type === 'income'
                      ? <ArrowDownIcon className="h-4 w-4 text-emerald-400" />
                      : tx.transaction_type === 'expense'
                        ? <ArrowUpIcon className="h-4 w-4 text-red-400" />
                        : <ArrowsRightLeftIcon className="h-4 w-4 text-blue-400" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-tight">{tx.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(tx.transaction_date)} · {tx.transaction_type === 'transfer' ? 'Transfer' : (tx.category?.name || 'Uncategorized')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    tx.transaction_type === 'income' ? 'text-emerald-400' :
                    tx.transaction_type === 'expense' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {tx.transaction_type === 'income' ? '+' : tx.transaction_type === 'expense' ? '-' : ''}
                    {formatCurrency(tx.amount)}
                  </p>
                  {tx.transaction_type === 'transfer' && tx.transfer_fee && tx.transfer_fee > 0 && (
                    <p className="text-xs text-yellow-500">Fee: {formatCurrency(tx.transfer_fee)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">No recent transactions</div>
        )}
      </div>

      {/* Account Summary */}
      <div className="mx-2 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #161e2e 0%, #111827 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}
      >
        <div className="flex justify-between items-center px-4 py-3.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-semibold text-white">Active Accounts</h2>
          <Link to="/accounts" className="text-xs text-[#30BDF2] font-medium">View All →</Link>
        </div>

        {!errors.accounts ? (
          <>
            <div className="divide-y divide-gray-800/50">
              {accountSummary?.accounts.length ? (
                accountSummary.accounts.slice(0, 3).map((account) => (
                  <div key={account.id} className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(48,189,242,0.08)', border: '1px solid rgba(48,189,242,0.12)' }}
                      >
                        {account.type === 'bank_account'
                          ? <BuildingLibraryIcon className="h-4 w-4 text-[#30BDF2]" />
                          : account.type === 'credit_card'
                            ? <CreditCardIcon className="h-4 w-4 text-[#30BDF2]" />
                            : <BanknotesIcon className="h-4 w-4 text-[#30BDF2]" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white leading-tight">{account.name}</p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{account.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(account.balance)}</p>
                      {account.type === 'credit_card' && account.payable_balance !== undefined && (
                        <p className="text-xs text-gray-500">Payable: {formatCurrency(account.payable_balance)}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-5">No accounts found</p>
              )}
            </div>

            <div className="px-4 py-3.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}
            >
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 font-medium">Total Balance</p>
                <p className="text-sm font-bold text-[#30BDF2]">
                  {accountSummary ? formatCurrency(accountSummary.total_balance) : '—'}
                </p>
              </div>
              {accountSummary?.accounts.some(a => a.type === 'credit_card' && a.payable_balance !== undefined) && (
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-400 font-medium">CC Payable</p>
                  <p className="text-sm font-bold text-red-400">
                    {formatCurrency(
                      accountSummary.accounts
                        .filter(a => a.type === 'credit_card' && a.payable_balance !== undefined)
                        .reduce((sum, a) => sum + (Number(a.payable_balance) || 0), 0)
                    )}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-5 text-center">
            <p className="text-sm text-gray-400">Could not load account data</p>
            <button
              className="mt-3 text-xs text-[#30BDF2] font-medium"
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
