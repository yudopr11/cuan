import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
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
import usePageTitle from '../../hooks/usePageTitle';
import TransactionsDesktop from './TransactionsDesktop';
import TransactionsMobile from './TransactionsMobile';
import { TransactionsDesktopSkeleton, TransactionsMobileSkeleton } from '../common/SkeletonLoader';

interface TransactionsProps {
  isMobile: boolean;
}

export default function Transactions({ isMobile }: TransactionsProps) {
  usePageTitle('Transactions');
  
  // Initial filter state
  const initialFilterState = {
    account_name: '',
    category_name: '',
    transaction_type: '',
    start_date: '',
    end_date: '',
    date_filter_type: 'month' as 'day' | 'week' | 'month' | 'year' | 'custom'
  };
  
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
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
  const limit = 10; // Fixed page size
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState(initialFilterState);
  
  // State for active filters (used for data fetching)
  const [activeFilters, setActiveFilters] = useState(initialFilterState);
  
  // State for form
  const [formData, setFormData] = useState<TransactionCreate>({
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: 'expense',
    account_id: '',
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

  // Fetch data on component mount
  useEffect(() => {
    // Fetch accounts and categories only once on mount
    fetchAccounts();
    fetchCategories();
  }, []);

  // Fetch transactions when active filters or pagination changes
  useEffect(() => {
    fetchTransactions();
  }, [activeFilters, skip, limit]);

  // New function to handle unique categories based on name and type for filtering
  const getUniqueCategories = (categories: Category[], transactionType: string | null = null) => {
    // Create a map to track categories by name and type
    const uniqueCategories: Record<string, Category[]> = {};
    
    // Group categories by name
    categories.forEach(category => {
      if (!uniqueCategories[category.name]) {
        uniqueCategories[category.name] = [];
      }
      uniqueCategories[category.name].push(category);
    });
    
    // Flatten the map to an array, filtering by transaction type if provided
    const result: Category[] = [];
    Object.values(uniqueCategories).forEach(categoryGroup => {
      if (transactionType) {
        // When a transaction type is selected, filter by that type
        const filtered = categoryGroup.filter(cat => cat.type === transactionType);
        result.push(...filtered);
      } else {
        // When no transaction type is selected, take the first category of each name
        // This preserves backwards compatibility with existing data where we just
        // store category_name in the filter
        if (categoryGroup.length > 0) {
          result.push(categoryGroup[0]);
        }
      }
    });
    
    return result;
  };

  const fetchTransactions = async () => {
    // Gunakan isFilterLoading untuk semua kasus, tapi pertahankan tracking initialLoading
    setIsFilterLoading(true);
    
    setError(null); // Reset error state
    try {
      const apiParams: Record<string, any> = {};
      
      if (activeFilters.account_name) apiParams.account_name = activeFilters.account_name;
      
      // Handle category filtering with transaction type consideration
      if (activeFilters.category_name) {
        // Always include category_name for API
        apiParams.category_name = activeFilters.category_name;
      }
      
      if (activeFilters.transaction_type) apiParams.transaction_type = activeFilters.transaction_type;
      
      if (activeFilters.date_filter_type === 'custom') {
        if (activeFilters.start_date) apiParams.start_date = activeFilters.start_date;
        if (activeFilters.end_date) apiParams.end_date = activeFilters.end_date;
      } else {
        apiParams.date_filter_type = activeFilters.date_filter_type;
      }
      
      apiParams.limit = limit;
      apiParams.skip = skip;
      
      const response = await getAllTransactions(apiParams);
      setTransactions(response.data);
      setTotalCount(response.total_count);
      setHasMore(response.has_more);
      
      // Selalu atur initialLoading ke false setelah data pertama diambil
      setInitialLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to load transactions');
      setInitialLoading(false);
    } finally {
      setIsFilterLoading(false);
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
        account_id: accounts.length > 0 ? accounts[0].id : '',
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
        await updateTransaction(selectedTransaction.id, {
          ...submissionData,
          transaction_date: selectedTransaction.created_at
        });
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
      await deleteTransaction(transactionToDelete.id);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Add filter handling functions
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateFilterChange = (value: 'day' | 'week' | 'month' | 'year' | 'custom') => {
    setFilters(prev => ({ ...prev, date_filter_type: value }));
  };

  const handleClearFilters = () => {
    setIsFilterLoading(true);
    
    setFilters(initialFilterState);
    
    Promise.resolve().then(() => {
      setActiveFilters(initialFilterState);
      setSkip(0);
      
      setIsFilterModalOpen(false);
    });
  };

  const applyFilters = () => {
    setIsFilterLoading(true);
    
    setIsFilterModalOpen(false);
    
    Promise.resolve().then(() => {
      setActiveFilters({...filters});
      
      setSkip(0);
    });
  };

  // Pagination handling
  const handleNextPage = () => {
    if (hasMore) {
      setSkip(prev => prev + limit);
    }
  };

  const handlePrevPage = () => {
    if (skip > 0) {
      setSkip(Math.max(0, skip - limit));
    }
  };

  const handlePageChange = (page: number) => {
    setSkip((page - 1) * limit);
  };

  const hasFilterChanges = () => {
    return (
      filters.account_name !== activeFilters.account_name ||
      filters.category_name !== activeFilters.category_name ||
      filters.transaction_type !== activeFilters.transaction_type ||
      filters.start_date !== activeFilters.start_date ||
      filters.end_date !== activeFilters.end_date ||
      filters.date_filter_type !== activeFilters.date_filter_type
    );
  };

  // Loading state handling - only show full loading screen on initial load
  if (initialLoading) {
    return isMobile ? (
      <TransactionsMobileSkeleton />
    ) : (
      <TransactionsDesktopSkeleton />
    );
  }

  // Error state handling
  if (error && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-lg w-full text-center">
          <ExclamationCircleIcon className="h-12 w-12 mx-auto text-red-500 mb-4" aria-hidden="true" />
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

  // Render mobile or desktop component based on prop
  return isMobile ? (
    <TransactionsMobile 
      transactions={transactions}
      accounts={accounts}
      categories={categories}
      isFilterLoading={isFilterLoading}
      isModalOpen={isModalOpen}
      isDeleteModalOpen={isDeleteModalOpen}
      isFilterModalOpen={isFilterModalOpen}
      selectedTransaction={selectedTransaction}
      transactionToDelete={transactionToDelete}
      formData={formData}
      filters={filters}
      activeFilters={activeFilters}
      hasMore={hasMore}
      skip={skip}
      dateFilterPresets={dateFilterPresets}
      handleOpenModal={handleOpenModal}
      handleCloseModal={handleCloseModal}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleOpenDeleteModal={handleOpenDeleteModal}
      handleCloseDeleteModal={handleCloseDeleteModal}
      handleDeleteTransaction={handleDeleteTransaction}
      handleFilterChange={handleFilterChange}
      handleDateFilterChange={handleDateFilterChange}
      handleClearFilters={handleClearFilters}
      applyFilters={applyFilters}
      hasFilterChanges={hasFilterChanges}
      handleNextPage={handleNextPage}
      handlePrevPage={handlePrevPage}
      formatAmount={formatAmount}
      setIsFilterModalOpen={setIsFilterModalOpen}
      getUniqueCategories={getUniqueCategories}
    />
  ) : (
    <TransactionsDesktop
      transactions={transactions}
      accounts={accounts}
      categories={categories}
      isFilterLoading={isFilterLoading}
      isModalOpen={isModalOpen}
      isDeleteModalOpen={isDeleteModalOpen}
      selectedTransaction={selectedTransaction}
      transactionToDelete={transactionToDelete}
      formData={formData}
      filters={filters}
      activeFilters={activeFilters}
      hasMore={hasMore}
      skip={skip}
      limit={limit}
      totalCount={totalCount}
      dateFilterPresets={dateFilterPresets}
      handleOpenModal={handleOpenModal}
      handleCloseModal={handleCloseModal}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleOpenDeleteModal={handleOpenDeleteModal}
      handleCloseDeleteModal={handleCloseDeleteModal}
      handleDeleteTransaction={handleDeleteTransaction}
      handleFilterChange={handleFilterChange}
      handleClearFilters={handleClearFilters}
      applyFilters={applyFilters}
      hasFilterChanges={hasFilterChanges}
      handleNextPage={handleNextPage}
      handlePrevPage={handlePrevPage}
      formatAmount={formatAmount}
      getUniqueCategories={getUniqueCategories}
      handlePageChange={handlePageChange}
    />
  );
} 