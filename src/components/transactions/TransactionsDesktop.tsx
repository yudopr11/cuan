import React from 'react';
import type { Transaction, TransactionCreate, Account, Category } from '../../services/api';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import { TransactionsDesktopSkeleton } from '../common/SkeletonLoader';

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
  handlePageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  formatAmount: (value: string) => string;
  getUniqueCategories: (categories: Category[], transactionType?: string | null) => Category[];
}

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
  handleNextPage,
  handlePrevPage,
  handlePageSizeChange,
  formatAmount,
  getUniqueCategories
}) => {
  // Use the currency formatter hook
  const { formatCurrency } = useCurrencyFormatter();

  // Show skeleton loader while filtering
  if (isFilterLoading) {
    return <TransactionsDesktopSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          {/* <h1 className="text-3xl font-bold text-gray-900">Transactions</h1> */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#30BDF2] text-white px-4 py-2 rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Add Transaction
          </button>
        </div>
        
        {/* Filter Section - Desktop */}
        <div className="bg-gray-900 shadow-md rounded-lg mb-6 p-4 border border-gray-800">
          {hasFilterChanges() && (
            <div className="px-3 py-2 bg-blue-900 bg-opacity-30 border border-blue-800 rounded-md mb-4">
              <p className="text-xs text-blue-300">
                You have unapplied filter changes. Click Apply to update results.
              </p>
            </div>
          )}
          
          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.date_filter_type && (
              <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                {dateFilterPresets.find(preset => preset.value === activeFilters.date_filter_type)?.label || activeFilters.date_filter_type}
              </span>
            )}
            {activeFilters.transaction_type && (
              <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                {activeFilters.transaction_type === 'income' ? 'Income' : 
                 activeFilters.transaction_type === 'expense' ? 'Expense' : 'Transfer'}
              </span>
            )}
            {activeFilters.account_name && (
              <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                Account: {activeFilters.account_name}
              </span>
            )}
            {activeFilters.category_name && (
              <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                Category: {activeFilters.category_name}
              </span>
            )}
            {(activeFilters.account_name || activeFilters.category_name || activeFilters.transaction_type || activeFilters.date_filter_type !== 'month') && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Date Range
              </label>
              <select
                name="date_filter_type"
                value={filters.date_filter_type}
                onChange={handleFilterChange}
                className={`w-full h-10 px-4 py-2 pr-8 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900 appearance-none bg-no-repeat bg-right ${
                  filters.date_filter_type === 'custom' ? 'bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900'
                  : 'bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900'
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                {dateFilterPresets.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            
            {filters.date_filter_type === 'custom' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="w-full h-10 px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className="w-full h-10 px-4 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Transaction Type
              </label>
              <select
                name="transaction_type"
                value={filters.transaction_type}
                onChange={handleFilterChange}
                className="w-full h-10 px-4 py-2 pr-8 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900 appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Account
              </label>
              <select
                name="account_name"
                value={filters.account_name}
                onChange={handleFilterChange}
                className="w-full h-10 px-4 py-2 pr-8 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900 appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.account_id} value={account.name}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category_name"
                value={filters.category_name}
                onChange={handleFilterChange}
                className="w-full h-10 px-4 py-2 pr-8 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900 appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">All Categories</option>
                {getUniqueCategories(categories, filters.transaction_type)
                  .map(category => (
                    <option key={category.category_id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                }
              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className={`flex-1 ${hasFilterChanges() ? 'bg-[#30BDF2] hover:bg-[#28a8d8]' : 'bg-gray-700 cursor-not-allowed'} text-white px-4 py-2 h-10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800`}
                disabled={!hasFilterChanges()}
              >
                Apply
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 border border-gray-700 px-4 py-2 h-10 rounded-md text-sm text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        
        {/* Transaction Table - Desktop */}
        <div className="bg-gray-900 shadow-md rounded-lg overflow-hidden mb-6 border border-gray-800 relative">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Transfer Fee</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {transactions.length > 0 ? (
                  transactions.map(transaction => (
                    <tr key={transaction.transaction_id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {transaction.account?.name || 'Unknown account'}
                        {transaction.transaction_type === 'transfer' && transaction.destination_account && (
                          <span> → {transaction.destination_account.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {transaction.category?.name || 'Uncategorized'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                        transaction.transaction_type === 'income' ? 'text-green-400' : 
                        transaction.transaction_type === 'expense' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {transaction.transaction_type === 'transfer' && transaction.transfer_fee !== undefined && transaction.transfer_fee > 0 
                          ? formatCurrency(transaction.transfer_fee) 
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(transaction)}
                          className="text-indigo-400 hover:text-indigo-300 mr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(transaction)}
                          className="text-red-400 hover:text-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-300">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination - Desktop */}
        {transactions.length > 0 && (
          <div className="bg-gray-900 shadow-md rounded-lg p-4 flex justify-between items-center border border-gray-800">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Show</span>
              <select
                value={limit}
                onChange={handlePageSizeChange}
                className="min-w-[80px] h-10 px-4 py-2 pr-9 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] text-sm appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-300">entries</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-300 mr-4">
                Showing {skip + 1} to {Math.min(skip + transactions.length, totalCount)} of {totalCount} entries
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={skip === 0}
                  className={`px-4 py-2 rounded-md font-medium ${
                    skip === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#30BDF2] text-white hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className={`px-4 py-2 rounded-md font-medium ${
                    !hasMore ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#30BDF2] text-white hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals for desktop - moved outside of the space-y-6 container */}
      {/* Transaction Form Modal - Desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-dark w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-200">
              {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Type
                </label>
                <select
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formatAmount(formData.amount.toString())}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Account
                </label>
                <select
                  name="account_id"
                  value={formData.account_id}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.transaction_type !== 'transfer' && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="">Select Category (Optional)</option>
                    {getUniqueCategories(categories, formData.transaction_type)
                      .map(category => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}
              
              {formData.transaction_type === 'transfer' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">
                      To Account
                    </label>
                    <select
                      name="destination_account_id"
                      value={formData.destination_account_id || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                      required={formData.transaction_type === 'transfer'}
                    >
                      <option value="">Select Destination Account</option>
                      {accounts
                        .filter(account => account.account_id !== formData.account_id)
                        .map(account => (
                          <option key={account.account_id} value={account.account_id}>
                            {account.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">
                      Transfer Fee (Optional)
                    </label>
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
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#30BDF2] text-white rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-dark w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-white mb-4">Delete Transaction</h2>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete this transaction: 
              <span className="font-medium text-white"> {transactionToDelete?.description}</span>?
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTransaction}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
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