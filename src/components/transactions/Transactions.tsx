import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAllAccounts,
  getAllCategories
} from '../../services/api';
import type {
  Transaction,
  TransactionCreate,
  Account,
  Category} from '../../services/api';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import usePageTitle from '../../hooks/usePageTitle';

interface TransactionsProps {
  isMobile: boolean;
}

export default function Transactions({ isMobile }: TransactionsProps) {
  usePageTitle('Transactions');
  
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for accounts and categories
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  // State for pagination
  const [limit, setLimit] = useState(20);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState({
    account_name: '',
    category_name: '',
    transaction_type: '',
    start_date: '',
    end_date: '',
    date_filter_type: 'month' as 'day' | 'week' | 'month' | 'year' | 'custom'
  });
  
  // State for form
  const [formData, setFormData] = useState<TransactionCreate>({
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: 'expense',
    account_id: 0,
    category_id: undefined,
    destination_account_id: undefined,
    transfer_fee: 0
  });

  // New state for filter dialog (mobile)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Date presets for filter
  const dateFilterPresets = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Use the currency formatter hook
  const { formatCurrency } = useCurrencyFormatter();

  // Fetch data on component mount
  useEffect(() => {
    // Fetch accounts and categories only once on mount
    fetchAccounts();
    fetchCategories();
  }, []);

  // Fetch transactions when filters or pagination changes
  useEffect(() => {
    fetchTransactions();
  }, [filters, skip, limit]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null); // Reset error state
    try {
      // Prepare parameters - only include non-empty values
      const apiParams: Record<string, any> = {};
      
      // Only add non-empty string parameters
      if (filters.account_name) apiParams.account_name = filters.account_name;
      if (filters.category_name) apiParams.category_name = filters.category_name;
      if (filters.transaction_type) apiParams.transaction_type = filters.transaction_type;
      
      // Handle custom date range differently
      if (filters.date_filter_type === 'custom') {
        if (filters.start_date) apiParams.start_date = filters.start_date;
        if (filters.end_date) apiParams.end_date = filters.end_date;
      } else {
        // For predefined ranges, just send the date_filter_type
        apiParams.date_filter_type = filters.date_filter_type;
      }
      
      // Always include these parameters
      apiParams.limit = limit;
      apiParams.skip = skip;
      
      const response = await getAllTransactions(apiParams);
      setTransactions(response.data);
      setTotalCount(response.total_count);
      setHasMore(response.has_more);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      // For existing transaction, convert UTC to local date
      const utcDate = new Date(transaction.transaction_date);
      const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
      
      setSelectedTransaction(transaction);
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        transaction_date: localDate.toISOString().split('T')[0],
        transaction_type: transaction.transaction_type,
        account_id: transaction.account_id,
        category_id: transaction.category_id,
        destination_account_id: transaction.destination_account_id,
        transfer_fee: transaction.transfer_fee || 0
      });
    } else {
      setSelectedTransaction(null);
      // For new transaction, use today's local date
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
      
      setFormData({
        amount: 0,
        description: '',
        transaction_date: todayStr,
        transaction_type: 'expense',
        account_id: accounts.length > 0 ? accounts[0].account_id : 0,
        category_id: undefined,
        destination_account_id: undefined,
        transfer_fee: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount' || name === 'transfer_fee') {
      // Format amount with thousand separator
      const formattedValue = formatAmount(value);
      const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
      
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      
      // Update input display value with formatting
      (e.target as HTMLInputElement).value = formattedValue;
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    
    if (!formData.description) {
      toast.error('Description is required');
      return;
    }
    
    if (!formData.account_id) {
      toast.error('Account is required');
      return;
    }
    
    if (formData.transaction_type === 'transfer' && !formData.destination_account_id) {
      toast.error('Destination account is required for transfers');
      return;
    }
    
    try {
      // Get current time in local timezone
      const now = new Date();
      // Create date object from form date and current time
      const localDate = new Date(
        formData.transaction_date + 'T' + 
        now.getHours().toString().padStart(2, '0') + ':' +
        now.getMinutes().toString().padStart(2, '0') + ':' +
        now.getSeconds().toString().padStart(2, '0')
      );
      
      // Convert to UTC by adding the negative timezone offset
      const utcDate = new Date(localDate.getTime());
      
      const submissionData = {
        ...formData,
        transaction_date: utcDate.toISOString()
      };
      
      if (selectedTransaction) {
        // Update existing transaction
        await updateTransaction(selectedTransaction.transaction_id, submissionData);
        toast.success('Transaction updated successfully');
      } else {
        // Create new transaction
        await createTransaction(submissionData);
        toast.success('Transaction created successfully');
      }
      
      // Refresh transactions list
      fetchTransactions();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    }
  };

  // Add function to format amount with thousand separator
  const formatAmount = (value: string) => {
    // Remove any non-digit characters except decimal point
    const number = value.replace(/[^\d.]/g, '');
    
    // Split number into integer and decimal parts
    const [integer, decimal] = number.split('.');
    
    // Add thousand separator to integer part
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return formatted number with decimal if exists
    return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
  };

  const handleOpenDeleteModal = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      await deleteTransaction(transactionToDelete.transaction_id);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Add filter handling functions
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateFilterChange = (value: 'day' | 'week' | 'month' | 'year' | 'custom') => {
    setFilters(prev => ({ ...prev, date_filter_type: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      account_name: '',
      category_name: '',
      transaction_type: '',
      start_date: '',
      end_date: '',
      date_filter_type: 'month'
    });
  };

  const applyFilters = () => {
    // Reset pagination when filters change
    setSkip(0);
    fetchTransactions();
    setIsFilterModalOpen(false);
  };

  // Pagination handling
  const handleNextPage = () => {
    if (hasMore) {
      setSkip(prev => prev + limit);
    }
  };

  const handlePrevPage = () => {
    if (skip > 0) {
      setSkip(prev => Math.max(0, prev - limit));
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setSkip(0); // Reset to first page when changing page size
  };

  // Loading state handling
  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state handling
  if (error && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-lg w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Transactions</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => fetchTransactions()}
            className="px-4 py-2 bg-[#30BDF2] text-white rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            {/* <h1 className="text-2xl font-bold text-gray-800">Transactions</h1> */}
          </div>
          
          {/* Filter Bar - Mobile */}
          <div className="flex justify-between items-center card-dark p-3">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-xs">Filter:</span>
              <div className="flex flex-wrap gap-1">
                {filters.date_filter_type && (
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                    {dateFilterPresets.find(preset => preset.value === filters.date_filter_type)?.label || filters.date_filter_type}
                  </span>
                )}
                {filters.transaction_type && (
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                    {filters.transaction_type === 'income' ? 'Income' : 
                     filters.transaction_type === 'expense' ? 'Expense' : 'Transfer'}
                  </span>
                )}
                {filters.account_name && (
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                    Account: {filters.account_name}
                  </span>
                )}
                {filters.category_name && (
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-500 bg-opacity-30 text-indigo-300 text-xs rounded-full">
                    Category: {filters.category_name}
                  </span>
                )}
                {(filters.account_name || filters.category_name || filters.transaction_type || filters.date_filter_type !== 'month') && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="ml-2 p-1.5 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Transaction List */}
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map(transaction => (
                <div 
                  key={transaction.transaction_id} 
                  className="card-dark p-3"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`font-medium text-sm ${
                      transaction.transaction_type === 'income' ? 'text-green-400' : 
                      transaction.transaction_type === 'expense' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs">
                    <div>
                      <span className="text-gray-400">From: </span>
                      <span className="text-gray-300">{transaction.account?.name || 'Unknown account'}</span>
                    </div>
                    {transaction.transaction_type === 'transfer' && (
                      <div>
                        <span className="text-gray-400">To: </span>
                        <span className="text-gray-300">{transaction.destination_account?.name || 'Unknown account'}</span>
                      </div>
                    )}
                    {transaction.category && (
                      <div>
                        <span className="text-gray-400">Category: </span>
                        <span className="text-gray-300">{transaction.category.name}</span>
                      </div>
                    )}
                  </div>
                  {transaction.transaction_type === 'transfer' && transaction.transfer_fee !== undefined && transaction.transfer_fee > 0 && (
                    <div className="mt-1 text-xs">
                      <span className="text-gray-400">Fee: </span>
                      <span className="text-gray-300">{formatCurrency(transaction.transfer_fee)}</span>
                    </div>
                  )}
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={() => handleOpenModal(transaction)}
                      className="text-indigo-400 hover:text-indigo-300 mr-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(transaction)}
                      className="text-red-400 hover:text-red-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-300 py-3 card-dark text-sm">No transactions found</p>
            )}
          </div>
          
          {/* Pagination - Mobile */}
          {transactions.length > 0 && (
            <div className="flex justify-between items-center card-dark p-3">
              <div className="flex w-full space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={skip === 0}
                  className={`flex-1 px-3 py-2 rounded-md font-medium text-center text-xs ${
                    skip === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#30BDF2] text-white hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className={`flex-1 px-3 py-2 rounded-md font-medium text-center text-xs ${
                    !hasMore ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#30BDF2] text-white hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Floating Add Button */}
          <button
            onClick={() => handleOpenModal()}
            className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-[#30BDF2] text-white shadow-lg flex items-center justify-center hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800 z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Modals - moved outside of the space-y container */}
        {/* Filter Modal - Mobile */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="modal-dark w-full max-w-md p-4">
              <h2 className="text-lg font-bold text-white mb-3">Filter Transactions</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {dateFilterPresets.map(preset => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleDateFilterChange(preset.value as any)}
                        className={`py-1.5 px-2 text-xs rounded-md ${
                          filters.date_filter_type === preset.value
                            ? 'bg-[#30BDF2] text-white focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800'
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
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                        className="w-full h-8 px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800 text-xs"
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
                        onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                        className="w-full h-8 px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800 text-xs"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Transaction Type
                  </label>
                  <select
                    name="transaction_type"
                    value={filters.transaction_type}
                    onChange={handleFilterChange}
                    className="w-full h-8 px-3 py-2 pr-8 border border-gray-700 rounded-md text-xs shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900 appearance-none bg-no-repeat bg-right"
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
                    className="w-full h-8 px-3 py-2 pr-8 border border-gray-700 rounded-md shadow-sm text-xs bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900 appearance-none bg-no-repeat bg-right"
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
                    className="w-full h-8 px-3 py-2 pr-8 border border-gray-700 text-xs rounded-md shadow-sm bg-gray-800 text-white focus:border-[#30BDF2] focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900 appearance-none bg-no-repeat bg-right"
                  >
                    <option value="">All Categories</option>
                    {categories
                      .filter(category => 
                        (filters.transaction_type === 'income' && category.type === 'income') ||
                        (filters.transaction_type === 'expense' && category.type === 'expense') ||
                        !filters.transaction_type // Show all categories if no transaction type is selected
                      )
                      .map(category => (
                        <option key={category.category_id} value={category.name}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-700 rounded-md text-xs font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 border border-gray-700 rounded-md text-xs font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-[#30BDF2] hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="modal-dark w-full max-w-md p-4">
              <h2 className="text-base font-bold mb-3 text-gray-200">
                {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={formatAmount(formData.amount.toString())}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Account
                  </label>
                  <select
                    name="account_id"
                    value={formData.account_id}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
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
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                      <option value="">Select Category (Optional)</option>
                      {categories
                        .filter(category => 
                          (formData.transaction_type === 'income' && category.type === 'income') ||
                          (formData.transaction_type === 'expense' && category.type === 'expense')
                        )
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
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        To Account
                      </label>
                      <select
                        name="destination_account_id"
                        value={formData.destination_account_id || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
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
                    
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Transfer Fee (Optional)
                      </label>
                      <input
                        type="text"
                        name="transfer_fee"
                        value={formatAmount((formData.transfer_fee || 0).toString())}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                      />
                      <p className="text-xs text-gray-400 mt-1">If any fee charged for this transfer</p>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3 py-1.5 border border-gray-700 rounded-md text-xs text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#30BDF2] text-xs text-white rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    {selectedTransaction ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="modal-dark w-full max-w-sm p-4">
              <h2 className="text-lg font-bold text-white mb-3">Delete Transaction</h2>
              <p className="mb-4 text-gray-300 text-xs">
                Are you sure you want to delete this transaction: 
                <span className="font-medium text-white"> {transactionToDelete?.description}</span>?
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="px-3 py-1.5 border border-gray-700 rounded-md text-xs font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTransaction}
                  className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop layout
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
                    onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
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
                    onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
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
                {categories
                  .filter(category => 
                    (filters.transaction_type === 'income' && category.type === 'income') ||
                    (filters.transaction_type === 'expense' && category.type === 'expense') ||
                    !filters.transaction_type // Show all categories if no transaction type is selected
                  )
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
                className="flex-1 bg-[#30BDF2] text-white px-4 py-2 h-10 rounded-md text-sm hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
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
        <div className="bg-gray-900 shadow-md rounded-lg overflow-hidden mb-6 border border-gray-800">
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
                    {categories
                      .filter(category => 
                        (formData.transaction_type === 'income' && category.type === 'income') ||
                        (formData.transaction_type === 'expense' && category.type === 'expense')
                      )
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
} 