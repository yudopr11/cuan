import React, { useState, useEffect } from 'react';
import type { Transaction, TransactionCreate, Account, Category } from '../../services/api';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import { TransactionsDesktopSkeleton } from '../common/SkeletonLoader';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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

// Custom Select Input component with consistent styling
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
  // Use the currency formatter hook
  const { formatCurrency } = useCurrencyFormatter();
  // Table-specific loading state
  const [isTableLoading, setIsTableLoading] = useState(false);

  useEffect(() => {
    // When transactions change, table is done loading
    setIsTableLoading(false);
  }, [transactions]);

  // Show skeleton loader while filtering the entire component
  if (isFilterLoading && !isTableLoading) {
    return <TransactionsDesktopSkeleton />;
  }

  const handleTablePageChange = (page: number) => {
    setIsTableLoading(true);
    handlePageChange(page);
  };

  // Table loading indicator component
  const TableLoadingIndicator = () => (
    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
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
        <div className="card-dark ">
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
            <div className="space-y-1 w-full">
              <label htmlFor="date_filter_type" className="block text-sm font-medium text-gray-300">
                Date Range
              </label>
              <SelectInput
                name="date_filter_type"
                value={filters.date_filter_type}
                onChange={handleFilterChange}
              >
                {dateFilterPresets.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </SelectInput>
            </div>
            
            {filters.date_filter_type === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">
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
            
            <div className="space-y-1 w-full">
              <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-300">
                Type
              </label>
              <SelectInput
                name="transaction_type"
                value={filters.transaction_type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </SelectInput>
            </div>
            
            <div className="space-y-1 w-full">
              <label htmlFor="account_name" className="block text-sm font-medium text-gray-300">
                Account
              </label>
              <SelectInput
                name="account_name"
                value={filters.account_name}
                onChange={handleFilterChange}
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.name}>
                    {account.name}
                  </option>
                ))}
              </SelectInput>
            </div>
            
            <div className="space-y-1 w-full">
              <label htmlFor="category_name" className="block text-sm font-medium text-gray-300">
                Category
              </label>
              <SelectInput
                name="category_name"
                value={filters.category_name}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {getUniqueCategories(categories, filters.transaction_type || null).map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </SelectInput>
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
          <div className="overflow-x-auto relative">
            {isTableLoading && <TableLoadingIndicator />}
            <table className="table-dark min-w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
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
                    <tr key={transaction.id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {transaction.transaction_type === 'income' ? 'Income' : 
                         transaction.transaction_type === 'expense' ? 'Expense' : 'Transfer'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {transaction.account?.name || 'Unknown account'}
                        {transaction.transaction_type === 'transfer' && transaction.destination_account && (
                          <span> → {transaction.destination_account.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {transaction.transaction_type === 'transfer' ? 'Transfer' : (transaction.category?.name || 'Uncategorized')}
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
          
          {/* Pagination Controls */}
          {totalCount > limit && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center">
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium">{skip + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(skip + limit, totalCount)}
                  </span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTablePageChange(Math.floor(skip / limit))}
                  disabled={skip === 0}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    skip === 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.ceil(totalCount / limit) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handleTablePageChange(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        skip / limit + 1 === page
                          ? 'bg-[#30BDF2] text-white'
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleTablePageChange(Math.floor(skip / limit) + 2)}
                  disabled={!hasMore}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    !hasMore
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
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
                <label className="block text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formatAmount(formData.amount.toString())}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
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
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="account_id" className="block text-sm font-medium text-gray-300">
                  Account
                </label>
                <SelectInput
                  name="account_id"
                  value={formData.account_id}
                  onChange={handleInputChange}
                >
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </SelectInput>
              </div>
              
              {formData.transaction_type !== 'transfer' && (
                <div className="space-y-1">
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-300">
                    Category
                  </label>
                  <SelectInput
                    name="category_id"
                    value={formData.category_id?.toString() || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Category --</option>
                    {categories
                      .filter(cat => cat.type === formData.transaction_type)
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
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
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                    </SelectInput>
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