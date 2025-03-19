import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { getAllAccounts, createAccount, updateAccount, deleteAccount, getAccountBalance, createTransaction } from '../../services/api';
import type { Account, AccountCreate, AccountBalance } from '../../services/api';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import usePageTitle from '../../hooks/usePageTitle';
import AccountsDesktop from './AccountsDesktop';
import AccountsMobile from './AccountsMobile';
import { AccountsDesktopSkeleton, AccountsMobileSkeleton } from '../common/SkeletonLoader';

interface AccountsProps {
  isMobile: boolean;
}

export default function Accounts({ isMobile }: AccountsProps) {
  usePageTitle('Accounts');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [accountDetails, setAccountDetails] = useState<AccountBalance | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<AccountCreate>({
    name: '',
    type: 'bank_account',
    description: '',
    limit: undefined
  });

  // Use the currency formatter hook
  const { formatCurrency } = useCurrencyFormatter();

  // Balance adjustment states
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [accountToAdjust, setAccountToAdjust] = useState<Account | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setSelectedAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        description: account.description || '',
        limit: account.limit
      });
    } else {
      setSelectedAccount(null);
      setFormData({
        name: '',
        type: 'bank_account',
        description: '',
        limit: undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'limit') {
      // Format limit with thousand separator
      const formattedValue = formatLimitValue(value);
      const numericValue = parseFloat(value.replace(/,/g, '')) || undefined;
      
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

  // Add function to format limit with thousand separator
  const formatLimitValue = (value: string) => {
    // Remove any non-digit characters except decimal point
    const number = value.replace(/[^\d.]/g, '');
    
    // Split number into integer and decimal parts
    const [integer, decimal] = number.split('.');
    
    // Add thousand separator to integer part
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return formatted number with decimal if exists
    return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name) {
      toast.error('Account name is required');
      return;
    }
    
    if (formData.type === 'credit_card' && !formData.limit) {
      toast.error('Credit limit is required for credit card accounts');
      return;
    }
    
    try {
      if (selectedAccount) {
        // Update existing account
        await updateAccount(selectedAccount.account_id, formData);
        toast.success('Account updated successfully');
      } else {
        // Create new account
        await createAccount(formData);
        toast.success('Account created successfully');
      }
      
      // Refresh accounts list
      fetchAccounts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account');
    }
  };

  const handleOpenDeleteModal = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAccountToDelete(null);
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      await deleteAccount(accountToDelete.account_id);
      toast.success('Account deleted successfully');
      fetchAccounts();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const handleViewDetails = async (account: Account) => {
    try {
      const data = await getAccountBalance(account.account_id);
      setAccountDetails(data.data);
      setIsViewingDetails(true);
    } catch (error) {
      console.error('Error fetching account details:', error);
      toast.error('Failed to load account details');
    }
  };

  const handleCloseDetails = () => {
    setIsViewingDetails(false);
    setAccountDetails(null);
  };

  const handleAdjustBalance = async (accountId: string, newBalance: number) => {
    try {
      // Get current account details
      const account = accounts.find(a => a.account_id === parseInt(accountId));
      if (!account) {
        toast.error('Account not found');
        return;
      }

      const currentBalance = account.balance || 0;
      const difference = newBalance - currentBalance;

      // Create a transaction for the balance adjustment
      if (difference !== 0) {
        const transactionData = {
          amount: Math.abs(difference),
          description: 'Balance Adjustment',
          transaction_date: new Date().toISOString(),
          transaction_type: difference > 0 ? 'income' : 'expense',
          account_id: parseInt(accountId)
        };

        await createTransaction(transactionData);
      }

      toast.success('Balance adjusted successfully');
      fetchAccounts();
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast.error('Failed to adjust balance');
    }
  };

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => {
    // Ensure balance is treated as a number
    const accountBalance = account.balance !== undefined && account.balance !== null 
      ? Number(account.balance) 
      : 0;
    
    // Only add to sum if it's a valid number
    return sum + (isNaN(accountBalance) ? 0 : accountBalance);
  }, 0);

  // Calculate total credit card payable amount
  const totalCreditCardPayable = accounts.reduce((sum, account) => {
    if (account.type === 'credit_card' && account.payable_balance !== undefined) {
      const payableBalance = Number(account.payable_balance) || 0;
      return sum + payableBalance;
    }
    return sum;
  }, 0);
  
  // Calculate totals by account type
  const totalBankAccount = accounts.reduce((sum, account) => {
    if (account.type === 'bank_account' && account.balance !== undefined) {
      const balance = Number(account.balance) || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }
    return sum;
  }, 0);
  
  const totalCreditCard = accounts.reduce((sum, account) => {
    if (account.type === 'credit_card' && account.balance !== undefined) {
      const balance = Number(account.balance) || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }
    return sum;
  }, 0);
  
  const totalOther = accounts.reduce((sum, account) => {
    if (account.type !== 'bank_account' && account.type !== 'credit_card' && account.balance !== undefined) {
      const balance = Number(account.balance) || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }
    return sum;
  }, 0);

  // Balance adjustment handlers
  const handleOpenAdjustmentModal = (account: Account) => {
    setAccountToAdjust(account);
    setAdjustmentAmount(account.balance ? account.balance.toString() : '0');
    setIsAdjustmentModalOpen(true);
  };

  const handleCloseAdjustmentModal = () => {
    setIsAdjustmentModalOpen(false);
    setAccountToAdjust(null);
    setAdjustmentAmount('');
  };

  const handleAdjustmentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Format amount with thousand separator
    const formattedValue = formatLimitValue(value);
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
    
    setAdjustmentAmount(numericValue.toString());
    
    // Update input display value with formatting
    e.target.value = formattedValue;
  };

  if (isLoading) {
    return isMobile ? (
      <AccountsMobileSkeleton />
    ) : (
      <AccountsDesktopSkeleton />
    );
  }

  // Common props for both desktop and mobile components
  const commonProps = {
    accounts,
    totalBalance,
    totalCreditCardPayable,
    totalBankAccount,
    totalCreditCard, 
    totalOther,
    handleOpenModal,
    handleOpenDeleteModal,
    handleViewDetails,
    isModalOpen,
    isDeleteModalOpen,
    isViewingDetails,
    selectedAccount,
    accountToDelete,
    accountDetails,
    formData,
    handleCloseModal,
    handleCloseDeleteModal,
    handleCloseDetails,
    handleInputChange,
    handleSubmit,
    handleDeleteAccount,
    formatLimitValue,
    formatCurrency,
    handleAdjustBalance,
    isAdjustmentModalOpen,
    accountToAdjust,
    adjustmentAmount,
    handleOpenAdjustmentModal,
    handleCloseAdjustmentModal,
    handleAdjustmentInputChange
  };

  // Render the appropriate component based on isMobile prop
  return isMobile ? (
    <AccountsMobile {...commonProps} />
  ) : (
    <AccountsDesktop {...commonProps} />
  );
} 