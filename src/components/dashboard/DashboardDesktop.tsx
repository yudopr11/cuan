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

  if (isInitialLoading) return <DashboardDesktopSkeleton />;

  const periodLabel = period === 'all' ? 'All Time' : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`;
  const periods: Array<{ value: typeof period; label: string }> = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <div className="flex rounded-xl p-1 gap-0.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {periods.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handlePeriodChange(value)}
              disabled={isRefreshing}
              className={`py-1.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
                period === value
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              style={period === value ? {
                background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
                boxShadow: '0 2px 8px rgba(48,189,242,0.3)'
              } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Financial Summary */}
      <div className="grid grid-cols-4 gap-4">
        {/* Income */}
        <div className="relative stat-card-income">
          <LoadingOverlay />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)' }}
            >
              <ArrowDownIcon className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Income</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400 leading-tight">
            {financialSummary ? formatCurrency(financialSummary.totals.income) : '—'}
          </p>
          <p className="text-xs text-emerald-700 mt-2">{periodLabel}</p>
        </div>

        {/* Expenses */}
        <div className="relative stat-card-expense">
          <LoadingOverlay />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)' }}
            >
              <ArrowUpIcon className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Expenses</p>
          </div>
          <p className="text-2xl font-bold text-red-400 leading-tight">
            {financialSummary ? formatCurrency(financialSummary.totals.expense) : '—'}
          </p>
          <p className="text-xs text-red-900 mt-2">{periodLabel}</p>
        </div>

        {/* Transfers */}
        <div className="relative stat-card-transfer">
          <LoadingOverlay />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)' }}
            >
              <ArrowsRightLeftIcon className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transfers</p>
          </div>
          <p className="text-2xl font-bold text-blue-400 leading-tight">
            {financialSummary ? formatCurrency(financialSummary.totals.transfer) : '—'}
          </p>
          <p className="text-xs text-blue-900 mt-2">{periodLabel}</p>
        </div>

        {/* Net */}
        {(() => {
          const isPositive = !financialSummary || financialSummary.totals.net >= 0;
          return (
            <div className={`relative ${isPositive ? 'stat-card-net-positive' : 'stat-card-net-negative'}`}>
              <LoadingOverlay />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}
                >
                  {isPositive
                    ? <ArrowDownIcon className="h-4 w-4 text-emerald-400" />
                    : <ArrowUpIcon className="h-4 w-4 text-red-400" />
                  }
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net</p>
              </div>
              <p className={`text-2xl font-bold leading-tight ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {financialSummary ? formatCurrency(financialSummary.totals.net) : '—'}
              </p>
              <p className={`text-xs mt-2 ${isPositive ? 'text-emerald-700' : 'text-red-900'}`}>{periodLabel}</p>
            </div>
          );
        })()}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-12 gap-5">
        {/* Transaction Trends */}
        <div className="relative card-dark col-span-7">
          <LoadingOverlay />
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold text-white">Transaction Trends</h2>
          </div>
          <TransactionChart
            trends={trends || { period: { start_date: '', end_date: '', period_type: period, group_by: 'day' }, trends: [] }}
            period={period}
          />
        </div>

        {/* Category Distribution */}
        <div className="relative card-dark col-span-5">
          <LoadingOverlay />
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold text-white">By Category</h2>
            <div className="flex rounded-xl overflow-hidden p-0.5 gap-0.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <button
                onClick={() => handleCategoryTypeChange('expense')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  categoryType === 'expense' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                style={categoryType === 'expense' ? {
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 1px 6px rgba(239,68,68,0.3)'
                } : {}}
              >
                Expense
              </button>
              <button
                onClick={() => handleCategoryTypeChange('income')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  categoryType === 'income' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                style={categoryType === 'income' ? {
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 1px 6px rgba(16,185,129,0.3)'
                } : {}}
              >
                Income
              </button>
            </div>
          </div>

          {categoryData && (
            <>
              <div className="text-right mb-3">
                <span className="text-sm font-medium text-gray-300">{formatCurrency(categoryData.total)}</span>
              </div>
              {categoryData.categories.length > 0 ? (
                <CategoryChart categoryData={categoryData} type={categoryType} />
              ) : (
                <div className="h-64 flex items-center justify-center rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <p className="text-gray-500 text-sm">No data for this period</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Row 3: Recent Transactions & Accounts */}
      <div className="grid grid-cols-2 gap-5">
        {/* Recent Transactions */}
        <div className="card-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
            <Link to="/transactions" className="text-xs text-[#30BDF2] hover:text-[#83e0ff] font-medium transition-colors">
              View All →
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-1">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors"
                  style={{ ':hover': { background: 'rgba(255,255,255,0.03)' } } as React.CSSProperties}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
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
        <div className="card-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-white">Active Accounts</h2>
            <Link to="/accounts" className="text-xs text-[#30BDF2] hover:text-[#83e0ff] font-medium transition-colors">
              View All →
            </Link>
          </div>

          {!errors.accounts ? (
            <>
              <div className="space-y-2">
                {accountSummary && accountSummary.accounts.length > 0 ? (
                  accountSummary.accounts.slice(0, 4).map((account) => (
                    <div key={account.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
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
                  <p className="text-center text-sm text-gray-500 py-4">No accounts found</p>
                )}
              </div>

              <div className="mt-4 pt-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">Total Balance</p>
                  <p className="text-base font-bold text-[#30BDF2]">
                    {accountSummary ? formatCurrency(accountSummary.total_balance) : '—'}
                  </p>
                </div>
                {accountSummary?.accounts.some(a => a.type === 'credit_card' && a.payable_balance !== undefined) && (
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">CC Payable</p>
                    <p className="text-base font-bold text-red-400">
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
            <div className="py-4 text-center">
              <p className="text-sm text-gray-400">Could not load account data</p>
              <button
                className="mt-2 text-xs text-[#30BDF2] hover:text-[#83e0ff] transition-colors"
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
