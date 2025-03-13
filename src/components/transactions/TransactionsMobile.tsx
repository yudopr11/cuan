import React, { useState } from 'react';
import type { Transaction, TransactionCreate, Account, Category } from '../../services/api';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import { 
  ActionSheetModal, 
  BottomSheetModal, 
  DeleteConfirmationModal, 
  FormModal 
} from '../layout';
import { TransactionsMobileSkeleton } from '../common/SkeletonLoader';

interface TransactionsMobileProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  isFilterLoading: boolean;
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isFilterModalOpen: boolean;
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
  handleDateFilterChange: (value: 'day' | 'week' | 'month' | 'year' | 'custom') => void;
  handleClearFilters: () => void;
  applyFilters: () => void;
  hasFilterChanges: () => boolean;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  formatAmount: (value: string) => string;
  setIsFilterModalOpen: (isOpen: boolean) => void;
  getUniqueCategories: (categories: Category[], transactionType?: string | null) => Category[];
}

const TransactionsMobile: React.FC<TransactionsMobileProps> = ({
  transactions,
  accounts,
  categories,
  isFilterLoading,
  isModalOpen,
  isDeleteModalOpen,
  isFilterModalOpen,
  selectedTransaction,
  transactionToDelete,
  formData,
  filters,
  activeFilters,
  hasMore,
  skip,
  dateFilterPresets,
  handleOpenModal,
  handleCloseModal,
  handleInputChange,
  handleSubmit,
  handleOpenDeleteModal,
  handleCloseDeleteModal,
  handleDeleteTransaction,
  handleFilterChange,
  handleDateFilterChange,
  handleClearFilters,
  applyFilters,
  hasFilterChanges,
  handleNextPage,
  handlePrevPage,
  formatAmount,
  setIsFilterModalOpen,
  getUniqueCategories
}) => {
  // Use the currency formatter hook
  const { formatCurrency } = useCurrencyFormatter();
  
  // States for action sheet
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [transactionForAction, setTransactionForAction] = useState<Transaction | null>(null);

  // Show skeleton loader while filtering
  if (isFilterLoading) {
    return <TransactionsMobileSkeleton />;
  }

  // Handle transaction click to open the action menu
  const handleTransactionClick = (transaction: Transaction) => {
    setTransactionForAction(transaction);
    setIsActionMenuOpen(true);
  };

  // Close action menu
  const handleCloseActionMenu = () => {
    setIsActionMenuOpen(false);
    setTransactionForAction(null);
  };

  // Handle edit from action menu
  const handleEditClick = () => {
    if (transactionForAction) {
      handleOpenModal(transactionForAction);
      handleCloseActionMenu();
    }
  };
  
  // Handle delete from action menu
  const handleDeleteClick = () => {
    if (transactionForAction) {
      handleOpenDeleteModal(transactionForAction);
      handleCloseActionMenu();
    }
  };

  // Handler for filter bar click
  const handleFilterBarClick = (e: React.MouseEvent) => {
    // Make sure we're not clicking on the clear button
    if (!(e.target as HTMLElement).closest('button[data-action="clear"]')) {
      setIsFilterModalOpen(true);
    }
  };

  // Function to render transaction type icon with consistent styling
  const renderTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return (
          <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'expense':
        return (
          <div className="w-10 h-10 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'transfer':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Create actions for the action sheet modal
  const actionItems = transactionForAction ? [
    {
      id: 'edit',
      label: 'Edit Transaction',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#30BDF2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: handleEditClick,
    },
    {
      id: 'delete',
      label: 'Delete Transaction',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: handleDeleteClick,
      textColor: 'text-red-500',
    },
  ] : [];

  return (
    <>
      <div className="space-y-5 px-1 pb-16">
        

        {/* Filter Bar */}
        <div className="px-2">
          <div 
            className="card-dark flex justify-between items-center rounded-xl p-3 shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 active:bg-gray-750 transition-colors"
            onClick={handleFilterBarClick}
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-xs font-medium">Filters:</span>
              <div className="flex flex-wrap gap-1">
                {activeFilters.transaction_type && (
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                    {activeFilters.transaction_type === 'income' ? 'Income' : 
                    activeFilters.transaction_type === 'expense' ? 'Expense' : 'Transfer'}
                  </span>
                )}
                {activeFilters.account_name && (
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                    {activeFilters.account_name}
                  </span>
                )}
                {activeFilters.category_name && (
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                    {activeFilters.category_name}
                  </span>
                )}
                {(activeFilters.account_name || activeFilters.category_name || activeFilters.transaction_type || activeFilters.date_filter_type !== 'month') && (
                  <button
                    data-action="clear"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent filter modal from opening
                      handleClearFilters();
                    }}
                    className="inline-flex items-center px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full hover:bg-gray-600 active:bg-gray-500 focus:outline-none"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className={`ml-2 p-1.5 ${hasFilterChanges() ? 'text-[#30BDF2]' : 'text-gray-300'} rounded relative`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {hasFilterChanges() && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#30BDF2]"></span>
              )}
            </div>
          </div>
        </div>
        
        {/* Transactions List with Native-like Card Styling */}
        <div className="relative px-2">
          {transactions.length === 0 ? (
            <div className="card-dark flex flex-col items-center justify-center p-8 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-400 text-center">No transactions found for the selected filters</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-[#30BDF2] text-white rounded-full text-sm font-medium hover:bg-[#28a8d8] focus:outline-none"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.transaction_id}
                  className="card-dark flex items-center p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg active:bg-gray-750 transition-colors"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  {renderTransactionTypeIcon(transaction.transaction_type)}
                  
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-white truncate max-w-[170px]">
                        {transaction.description}
                      </p>
                      <p className={`font-semibold ${
                        transaction.transaction_type === 'income' 
                          ? 'text-green-400' 
                          : transaction.transaction_type === 'expense' 
                            ? 'text-red-400' 
                            : 'text-blue-400'
                      }`}>
                        {transaction.transaction_type === 'expense' ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    
                    <div className="flex justify-between mt-1">
                      <div className="flex items-center space-x-1">
                        <p className="text-xs text-gray-400">
                          {transaction.account?.name || 'Unknown account'}
                          {transaction.transaction_type === 'transfer' && transaction.destination_account && (
                            <span> → {transaction.destination_account.name}</span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls - Native Style */}
              <div className="flex justify-between pt-2 pb-4 px-2">
                <button
                  onClick={handlePrevPage}
                  disabled={skip === 0 || isFilterLoading}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center ${
                    skip === 0 
                      ? 'bg-gray-700 text-gray-500 opacity-50 cursor-not-allowed' 
                      : 'bg-[#30BDF2] text-white hover:bg-[#28a8d8] active:bg-[#259cc8]'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasMore || isFilterLoading}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center ${
                    !hasMore 
                      ? 'bg-gray-700 text-gray-500 opacity-50 cursor-not-allowed' 
                      : 'bg-[#30BDF2] text-white hover:bg-[#28a8d8] active:bg-[#259cc8]'
                  }`}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
          onClick={() => handleOpenModal()}
          className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-[#30BDF2] text-white shadow-lg flex items-center justify-center active:bg-[#28a8d8] transition-colors z-10"
          style={{
            boxShadow: '0 4px 10px rgba(48, 189, 242, 0.3)'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

      {/* Action Menu Modal */}
      {isActionMenuOpen && (
        <ActionSheetModal
          isOpen={isActionMenuOpen}
          title="Transaction Options"
          actions={actionItems}
          onClose={handleCloseActionMenu}
        />
      )}

      {/* Transaction Form Modal */}
      {isModalOpen && (
        <FormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
          onSubmit={handleSubmit}
          submitText={selectedTransaction ? 'Update' : 'Add'}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:border-[#30BDF2] appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="text"
                name="amount"
                value={formatAmount(formData.amount.toString())}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:border-[#30BDF2]"
                placeholder="Enter amount"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:border-[#30BDF2]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:border-[#30BDF2]"
                placeholder="Enter description"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account
              </label>
              <select
                name="account_id"
                value={formData.account_id}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:border-[#30BDF2] appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:border-[#30BDF2] appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    To Account
                  </label>
                  <select
                    name="destination_account_id"
                    value={formData.destination_account_id || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:border-[#30BDF2] appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transfer Fee (Optional)
                  </label>
                  <input
                    type="text"
                    name="transfer_fee"
                    value={formatAmount((formData.transfer_fee || 0).toString())}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:border-[#30BDF2]"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-400 mt-1">If any fee charged for this transfer</p>
                </div>
              </>
            )}
          </div>
        </FormModal>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <BottomSheetModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          title="Filters"
        >
          <div className="space-y-4 pb-6">
            {hasFilterChanges() && (
              <div className="px-3 py-2 bg-blue-900 bg-opacity-30 border border-blue-800 rounded-md mb-3">
                <p className="text-xs text-blue-300">
                  You have unapplied filter changes. Click Apply to update results.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dateFilterPresets.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleDateFilterChange(preset.value as any)}
                    className={`py-2 px-2 text-sm rounded-lg ${
                      filters.date_filter_type === preset.value
                        ? 'bg-[#30BDF2] text-white'
                        : 'bg-gray-800 text-gray-300 active:bg-gray-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            
            {filters.date_filter_type === 'custom' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-800 rounded-lg shadow-sm bg-gray-800 text-white focus:border-[#30BDF2]"
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
                    className="w-full px-3 py-2 border border-gray-800 rounded-lg shadow-sm bg-gray-800 text-white focus:border-[#30BDF2]"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Transaction Type
              </label>
              <select
                name="transaction_type"
                value={filters.transaction_type}
                onChange={handleFilterChange}
                className="w-full px-3 py-3 border border-gray-800 rounded-lg text-sm shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Account
              </label>
              <select
                name="account_name"
                value={filters.account_name}
                onChange={handleFilterChange}
                className="w-full px-3 py-3 border border-gray-800 rounded-lg shadow-sm text-sm bg-gray-800 text-white focus:border-[#30BDF2] appearance-none bg-no-repeat bg-right"
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
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category_name"
                value={filters.category_name}
                onChange={handleFilterChange}
                className="w-full px-3 py-3 border border-gray-800 rounded-lg shadow-sm text-sm bg-gray-800 text-white focus:border-[#30BDF2] appearance-none bg-no-repeat bg-right"
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
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="py-3 border border-gray-700 rounded-lg text-gray-300 font-medium active:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="py-3 border border-gray-700 rounded-lg text-gray-300 font-medium active:bg-gray-600"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                applyFilters();
                setIsFilterModalOpen(false);
              }}
              className={`py-3 rounded-lg font-medium text-white ${hasFilterChanges() ? 'bg-[#30BDF2] active:bg-[#28a8d8]' : 'bg-gray-700 cursor-not-allowed'}`}
              disabled={!hasFilterChanges()}
            >
              Apply
            </button>
          </div>
        </BottomSheetModal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && transactionToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onDelete={handleDeleteTransaction}
          title="Delete Transaction"
          itemName={transactionToDelete.description}
          itemType="transaction"
        />
      )}
    </>
  );
};

export default TransactionsMobile; 