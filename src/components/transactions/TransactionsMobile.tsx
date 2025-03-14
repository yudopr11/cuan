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
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowsRightLeftIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  FunnelIcon, 
  DocumentDuplicateIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

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

// Create a SelectInput component like we did for the desktop version to replace SVG backgrounds
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
        className={`appearance-none ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
      </div>
    </div>
  );
};

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
            <ArrowUpIcon className="h-5 w-5 text-green-400" />
          </div>
        );
      case 'expense':
        return (
          <div className="w-10 h-10 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center">
            <ArrowDownIcon className="h-5 w-5 text-red-400" />
          </div>
        );
      case 'transfer':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center">
            <ArrowsRightLeftIcon className="h-5 w-5 text-blue-400" />
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
      icon: <PencilSquareIcon className="h-6 w-6 text-[#30BDF2]" />,
      onClick: handleEditClick,
    },
    {
      id: 'delete',
      label: 'Delete Transaction',
      icon: <TrashIcon className="h-6 w-6 text-red-500" />,
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
              <FunnelIcon className="h-4 w-4" />
              {hasFilterChanges() && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#30BDF2]"></span>
              )}
            </div>
          </div>
        </div>
        
        {/* Section Title */}
        <div className="px-3 pt-2">
          <p className="text-sm font-medium text-gray-400">MY TRANSACTIONS</p>
        </div>
        
        {/* Transactions List with Native-like Card Styling */}
        <div className="relative px-2">
          {transactions.length === 0 ? (
            <div className="card-dark flex flex-col items-center justify-center p-8 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
              <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 mb-2" />
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
                      <div>
                        <p className="font-medium text-white truncate max-w-[170px]">
                          {transaction.description}
                        </p>
                        {transaction.transaction_type === 'transfer' ? (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Transfer
                          </p>
                        ) : transaction.category && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {transaction.category.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold text-right ${
                          transaction.transaction_type === 'income' 
                            ? 'text-green-400' 
                            : transaction.transaction_type === 'expense' 
                              ? 'text-red-400' 
                              : 'text-blue-400'
                        }`}>
                          {transaction.transaction_type === 'expense' ? '-' : ''}
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.transaction_type === 'transfer' && transaction.transfer_fee && transaction.transfer_fee > 0 && (
                          <p className="text-xs text-yellow-400 text-right">
                            Fee: {formatCurrency(transaction.transfer_fee)}
                          </p>
                        )}
                      </div>
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
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
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
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
          onClick={() => handleOpenModal()}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#30BDF2] text-white flex items-center justify-center active:bg-[#259cc8] shadow-lg z-10"
          style={{
            boxShadow: '0 4px 10px rgba(48, 189, 242, 0.3)'
          }}
        >
          <PlusIcon className="h-6 w-6" />
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
              <SelectInput
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleInputChange}
                className="w-full py-2 px-3 bg-gray-800 text-white rounded-md shadow-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#30BDF2]"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </SelectInput>
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
              <SelectInput
                name="account_id"
                value={formData.account_id.toString()}
                onChange={handleInputChange}
                className="w-full py-2 px-3 bg-gray-800 text-white rounded-md shadow-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#30BDF2]"
              >
                {accounts.map(account => (
                  <option key={account.account_id} value={account.account_id.toString()}>
                    {account.name}
                  </option>
                ))}
              </SelectInput>
            </div>
            
            {formData.transaction_type !== 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <SelectInput
                  name="category_id"
                  value={formData.category_id?.toString() || ''}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 bg-gray-800 text-white rounded-md shadow-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#30BDF2]"
                >
                  <option value="">-- Select Category --</option>
                  {categories
                    .filter(cat => cat.type === formData.transaction_type)
                    .map(category => (
                      <option key={category.category_id} value={category.category_id.toString()}>
                        {category.name}
                      </option>
                    ))
                  }
                </SelectInput>
              </div>
            )}
            
            {formData.transaction_type === 'transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    To Account
                  </label>
                  <SelectInput
                    name="destination_account_id"
                    value={formData.destination_account_id?.toString() || ''}
                    onChange={handleInputChange}
                    className="w-full py-2 px-3 bg-gray-800 text-white rounded-md shadow-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#30BDF2]"
                  >
                    <option value="">-- Select Destination Account --</option>
                    {accounts
                      .filter(acc => acc.account_id !== formData.account_id)
                      .map(account => (
                        <option key={account.account_id} value={account.account_id.toString()}>
                          {account.name}
                        </option>
                      ))
                    }
                  </SelectInput>
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
              <SelectInput
                name="transaction_type"
                value={filters.transaction_type}
                onChange={handleFilterChange}
                className="w-full py-2 px-4 bg-gray-800 text-white text-sm rounded-md shadow-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#30BDF2]"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </SelectInput>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Account
              </label>
              <SelectInput
                name="account_name"
                value={filters.account_name}
                onChange={handleFilterChange}
                className="w-full py-2 px-4 bg-gray-800 text-white text-sm rounded-md shadow-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#30BDF2]"
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.account_id} value={account.name}>
                    {account.name}
                  </option>
                ))}
              </SelectInput>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <SelectInput
                name="category_name"
                value={filters.category_name}
                onChange={handleFilterChange}
                className="w-full py-2 px-4 bg-gray-800 text-white text-sm rounded-md shadow-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#30BDF2]"
              >
                <option value="">All Categories</option>
                {getUniqueCategories(categories, filters.transaction_type || null).map(category => (
                  <option key={category.category_id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </SelectInput>
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