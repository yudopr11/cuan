import React, { useState, useEffect } from 'react';
import type { Transaction, TransactionCreate, Account, Category } from '../../services/api';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import useTimezone from '../../hooks/useTimezone';
import { TransactionsDesktopSkeleton } from '../common/SkeletonLoader';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TransactionsDesktopProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  isFilterLoading: boolean;
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedTransaction: Transaction | null;
  transactionToDelete: Transaction | null;
  formData: TransactionCreate;
  filters: {
    account_name: string;
    category_name: string;
    transaction_type: string;
    start_date: string;
    end_date: string;
    date_filter_type: 'day' | 'week' | 'month' | 'year' | 'custom';
  };
  activeFilters: {
    account_name: string;
    category_name: string;
    transaction_type: string;
    start_date: string;
    end_date: string;
    date_filter_type: 'day' | 'week' | 'month' | 'year' | 'custom';
  };
  hasMore: boolean;
  skip: number;
  limit: number;
  totalCount: number;
  dateFilterPresets: { value: string; label: string }[];

  // Methods
  handleOpenModal: (transaction?: Transaction) => void;
  handleCloseModal: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleOpenDeleteModal: (transaction: Transaction) => void;
  handleCloseDeleteModal: () => void;
  handleDeleteTransaction: () => void;
  handleFilterChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  handleDateFilterChange?: (value: 'day' | 'week' | 'month' | 'year' | 'custom') => void;
  handleClearFilters: () => void;
  applyFilters: () => void;
  hasFilterChanges: () => boolean;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  formatAmount: (value: string) => string;
  getUniqueCategories: (categories: Category[], transactionType?: string | null) => Category[];
  handlePageChange: (page: number) => void;
}

interface SelectInputProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  children: React.ReactNode;
}

const SelectInput: React.FC<SelectInputProps> = ({ id, name, value, onChange, className = '', children }) => {
  return (
    <div className="relative">
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
      </div>
    </div>
  );
};

const TransactionsDesktop: React.FC<TransactionsDesktopProps> = ({
  transactions,
  accounts,
  categories,
  isFilterLoading,
  isModalOpen,
  isDeleteModalOpen,
  selectedTransaction,
  transactionToDelete,
  formData,
  filters,
  activeFilters,
  hasMore,
  skip,
  limit,
  totalCount,
  dateFilterPresets,
  handleOpenModal,
  handleCloseModal,
  handleInputChange,
  handleSubmit,
  handleOpenDeleteModal,
  handleCloseDeleteModal,
  handleDeleteTransaction,
  handleFilterChange,
  handleClearFilters,
  applyFilters,
  hasFilterChanges,
  formatAmount,
  getUniqueCategories,
  handlePageChange
}) => {
  const { formatCurrency } = useCurrencyFormatter();
  const { formatDate } = useTimezone();
  const [isTableLoading, setIsTableLoading] = useState(false);

  useEffect(() => {
    setIsTableLoading(false);
  }, [transactions]);

  if (isFilterLoading && !isTableLoading) {
    return <TransactionsDesktopSkeleton />;
  }

  const handleTablePageChange = (page: number) => {
    setIsTableLoading(true);
    handlePageChange(page);
  };

  const TableLoadingIndicator = () => (
    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
      <div className="px-6 py-4 bg-gray-800/90 rounded-xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#30BDF2]"></div>
          <p className="text-sm text-gray-200">Updating...</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleOpenModal()}
            className="text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
              boxShadow: '0 4px 12px rgba(48,189,242,0.25)'
            }}
          >
            + Add Transaction
          </button>
        </div>

        {/* Filter Section */}
        <div className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, #0f1623 0%, #0d1520 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}
        >
          {hasFilterChanges() && (
            <div className="px-3 py-2 rounded-xl mb-4"
              style={{ background: 'rgba(48,189,242,0.08)', border: '1px solid rgba(48,189,242,0.15)' }}
            >
              <p className="text-xs text-[#30BDF2]">
                You have unapplied filter changes. Click Apply to update results.
              </p>
            </div>
          )}

          {/* Active Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.date_filter_type && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}
              >
                {dateFilterPresets.find(p => p.value === activeFilters.date_filter_type)?.label || activeFilters.date_filter_type}
              </span>
            )}
            {activeFilters.transaction_type && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                style={
                  activeFilters.transaction_type === 'income'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#34d399' }
                    : activeFilters.transaction_type === 'expense'
                      ? { background: 'rgba(239,68,68,0.1)', color: '#f87171' }
                      : { background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }
                }
              >
                {activeFilters.transaction_type === 'income' ? 'Income' :
                 activeFilters.transaction_type === 'expense' ? 'Expense' : 'Transfer'}
              </span>
            )}
            {activeFilters.account_name && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(48,189,242,0.1)', color: '#30BDF2' }}
              >
                {activeFilters.account_name}
              </span>
            )}
            {activeFilters.category_name && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(48,189,242,0.1)', color: '#30BDF2' }}
              >
                {activeFilters.category_name}
              </span>
            )}
            {(activeFilters.account_name || activeFilters.category_name || activeFilters.transaction_type || activeFilters.date_filter_type !== 'month') && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Date Range</label>
              <SelectInput name="date_filter_type" value={filters.date_filter_type} onChange={handleFilterChange}>
                {dateFilterPresets.map(preset => (
                  <option key={preset.value} value={preset.value}>{preset.label}</option>
                ))}
              </SelectInput>
            </div>

            {filters.date_filter_type === 'custom' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="w-full h-10 px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className="w-full h-10 px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2]"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Type</label>
              <SelectInput name="transaction_type" value={filters.transaction_type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </SelectInput>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Account</label>
              <SelectInput name="account_name" value={filters.account_name} onChange={handleFilterChange}>
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.name}>{account.name}</option>
                ))}
              </SelectInput>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Category</label>
              <SelectInput name="category_name" value={filters.category_name} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {getUniqueCategories(categories, filters.transaction_type || null).map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </SelectInput>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                disabled={!hasFilterChanges()}
                className="flex-1 h-10 rounded-lg text-sm font-medium transition-all"
                style={hasFilterChanges() ? {
                  background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(48,189,242,0.25)'
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  color: '#6b7280',
                  cursor: 'not-allowed'
                }}
              >
                Apply
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 h-10 rounded-lg text-sm font-medium text-gray-400 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="rounded-2xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #0f1623 0%, #0d1520 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}
        >
          <div className="overflow-x-auto relative">
            {isTableLoading && <TableLoadingIndicator />}
            <table className="min-w-full">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #1a2236 0%, #1e293b 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Transfer Fee</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction, idx) => (
                    <tr key={transaction.id}
                      style={{ borderBottom: idx < transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-100">{transaction.description}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={
                            transaction.transaction_type === 'income'
                              ? { background: 'rgba(16,185,129,0.1)', color: '#34d399' }
                              : transaction.transaction_type === 'expense'
                                ? { background: 'rgba(239,68,68,0.1)', color: '#f87171' }
                                : { background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }
                          }
                        >
                          {transaction.transaction_type === 'income' ? 'Income' :
                           transaction.transaction_type === 'expense' ? 'Expense' : 'Transfer'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.account?.name || 'Unknown account'}
                        {transaction.transaction_type === 'transfer' && transaction.destination_account && (
                          <span className="text-gray-500"> → {transaction.destination_account.name}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">
                        {transaction.transaction_type === 'transfer'
                          ? <span className="text-gray-700">—</span>
                          : (transaction.category?.name || <span className="text-gray-600">Uncategorized</span>)
                        }
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-semibold ${
                          transaction.transaction_type === 'income' ? 'text-emerald-400' :
                          transaction.transaction_type === 'expense' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                        {transaction.transaction_type === 'transfer' && transaction.transfer_fee !== undefined && transaction.transfer_fee > 0
                          ? formatCurrency(transaction.transfer_fee)
                          : <span className="text-gray-700">—</span>}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button title="Edit" onClick={() => handleOpenModal(transaction)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(99,102,241,0.08)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.18)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                          >
                            <PencilSquareIcon className="h-4 w-4 text-indigo-400" />
                          </button>
                          <button title="Delete" onClick={() => handleOpenDeleteModal(transaction)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(239,68,68,0.08)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                          >
                            <TrashIcon className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalCount > limit && (() => {
            const currentPage = Math.floor(skip / limit) + 1;
            const totalPages = Math.ceil(totalCount / limit);

            const getPageNumbers = (): (number | '...')[] => {
              if (totalPages <= 7) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
              }
              const pages: (number | '...')[] = [];
              pages.push(1);
              if (currentPage > 3) pages.push('...');
              for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
              }
              if (currentPage < totalPages - 2) pages.push('...');
              pages.push(totalPages);
              return pages;
            };

            return (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800/60"
                style={{ background: 'rgba(22,30,46,0.8)' }}
              >
                <p className="text-xs text-gray-500">
                  Showing <span className="font-semibold text-gray-300">{skip + 1}</span>–<span className="font-semibold text-gray-300">{Math.min(skip + limit, totalCount)}</span> of <span className="font-semibold text-gray-300">{totalCount}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTablePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all"
                    style={currentPage === 1
                      ? { background: 'rgba(255,255,255,0.03)', color: '#4b5563', cursor: 'not-allowed' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#d1d5db' }
                    }
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>

                  {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-500 text-sm">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handleTablePageChange(page as number)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all"
                        style={currentPage === page
                          ? {
                              background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
                              color: 'white',
                              boxShadow: '0 2px 8px rgba(48,189,242,0.35)'
                            }
                          : { background: 'rgba(255,255,255,0.06)', color: '#d1d5db' }
                        }
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handleTablePageChange(currentPage + 1)}
                    disabled={!hasMore}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all"
                    style={!hasMore
                      ? { background: 'rgba(255,255,255,0.03)', color: '#4b5563', cursor: 'not-allowed' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#d1d5db' }
                    }
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modals for desktop - moved outside of the space-y-5 container */}
      {/* Transaction Form Modal - Desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dark w-full max-w-md p-6 animate-slideUp">
            <h2 className="text-xl font-bold mb-4 text-gray-200">
              {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-300">
                  Transaction Type
                </label>
                <SelectInput
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleInputChange}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </SelectInput>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Amount</label>
                <input
                  type="text"
                  name="amount"
                  value={formatAmount(formData.amount.toString())}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="account_id" className="block text-sm font-medium text-gray-300">Account</label>
                <SelectInput name="account_id" value={formData.account_id} onChange={handleInputChange}>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </SelectInput>
              </div>

              {formData.transaction_type !== 'transfer' && (
                <div className="space-y-1">
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-300">Category</label>
                  <SelectInput
                    name="category_id"
                    value={formData.category_id?.toString() || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Category --</option>
                    {categories
                      .filter(cat => cat.type === formData.transaction_type)
                      .map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                  </SelectInput>
                </div>
              )}

              {formData.transaction_type === 'transfer' && (
                <>
                  <div className="space-y-1">
                    <label htmlFor="destination_account_id" className="block text-sm font-medium text-gray-300">
                      Destination Account
                    </label>
                    <SelectInput
                      name="destination_account_id"
                      value={formData.destination_account_id?.toString() || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Select Destination Account --</option>
                      {accounts
                        .filter(acc => acc.id !== formData.account_id)
                        .map(account => (
                          <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                    </SelectInput>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Transfer Fee (Optional)</label>
                    <input
                      type="text"
                      name="transfer_fee"
                      value={formatAmount((formData.transfer_fee || 0).toString())}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                    />
                    <p className="text-xs text-gray-400 mt-1">If any fee charged for this transfer</p>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold text-gray-300 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
                    boxShadow: '0 4px 12px rgba(48,189,242,0.3)'
                  }}
                >
                  {selectedTransaction ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Desktop */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dark w-full max-w-sm p-6 animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                <TrashIcon className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Transaction</h2>
            </div>
            <p className="mb-6 text-gray-300 text-sm">
              Are you sure you want to delete{' '}
              <span className="font-medium text-white">"{transactionToDelete?.description}"</span>?
              This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-300 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTransaction}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionsDesktop;
