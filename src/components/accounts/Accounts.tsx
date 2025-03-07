import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { getAllAccounts, createAccount, updateAccount, deleteAccount, getAccountBalance } from '../../services/api';
import type { Account, AccountCreate, AccountBalance } from '../../services/api';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import usePageTitle from '../../hooks/usePageTitle';

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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limit' ? (value ? parseFloat(value) : undefined) : value
    }));
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

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + (account.balance || 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            {/* <h1 className="text-2xl font-bold">Accounts</h1> */}
          </div>

          {/* Total Balance */}
          <div className="card-dark">
            <h2 className="text-base font-semibold mb-2 text-gray-200">Total Balance</h2>
            <p className="text-xl font-bold text-[#30BDF2]">{formatCurrency(totalBalance)}</p>
          </div>

          {/* Accounts List */}
          <div className="space-y-3">
            {accounts.map(account => (
              <div 
                key={account.account_id} 
                className="card-dark relative"
                onClick={() => handleViewDetails(account)}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-gray-200">{account.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{account.type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-200">{formatCurrency(account.balance || 0)}</p>
                    {account.type === 'credit_card' && account.payable_balance !== undefined && (
                      <p className="text-xs text-gray-400">
                        Payable: {formatCurrency(account.payable_balance)}
                      </p>
                    )}
                  </div>
                </div>
                
                {account.description && (
                  <p className="text-xs text-gray-400 mb-2">{account.description}</p>
                )}
                
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent onClick
                      handleOpenModal(account);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent onClick
                      handleOpenDeleteModal(account);
                    }}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Floating Add Button */}
          <button
            onClick={() => handleOpenModal()}
            className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-[#30BDF2] text-white shadow-lg flex items-center justify-center hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30BDF2] z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Modals - moved outside of the space-y-6 container */}
        {/* Account Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="modal-dark w-full max-w-md p-4">
              <h2 className="text-base font-bold mb-3 text-gray-200">
                {selectedAccount ? 'Edit Account' : 'Add Account'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="bank_account">Bank Account</option>
                    <option value="credit_card">Credit Card</option>
                    {/* <option value="cash">Cash</option> */}
                    {/* <option value="investment">Investment</option> */}
                    {/* <option value="loan">Loan</option> */}
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {formData.type === 'credit_card' && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-300 mb-1">Credit Limit</label>
                    <input
                      type="number"
                      name="limit"
                      value={formData.limit || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                    />
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3 py-1.5 border border-gray-700 rounded-md text-xs text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#30BDF2] text-xs text-white rounded-md hover:bg-[#28a8d8]"
                  >
                    {selectedAccount ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && accountToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="modal-dark w-full max-w-md p-4">
              <h2 className="text-base font-bold mb-3 text-gray-200">Delete Account</h2>
              <p className="mb-4 text-sm text-gray-300">
                Are you sure you want to delete the account "<span className="text-white font-medium">{accountToDelete.name}</span>"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-3 py-1.5 border border-gray-700 rounded-md text-xs text-gray-300 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-3 py-1.5 bg-red-600 text-xs text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Details Modal */}
        {isViewingDetails && accountDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="modal-dark w-full max-w-md p-4">
              <h2 className="text-base font-bold mb-3 text-gray-200">{accountDetails.account.name} Details</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Current Balance:</span>
                  <span className="font-bold text-sm text-gray-100">{formatCurrency(accountDetails.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Total Income:</span>
                  <span className="text-green-400 font-bold text-sm">{formatCurrency(accountDetails.total_income)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Total Expenses:</span>
                  <span className="text-red-400 font-bold text-sm">{formatCurrency(accountDetails.total_expenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Transfers In:</span>
                  <span className="text-[#30BDF2] font-bold text-sm">{formatCurrency(accountDetails.total_transfers_in)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Transfers Out:</span>
                  <span className="text-[#30BDF2] font-bold text-sm">{formatCurrency(accountDetails.total_transfers_out)}</span>
                </div>
                
                {accountDetails.account.type === 'credit_card' && accountDetails.account.limit && (
                  <>
                    <div className="border-t border-gray-700 my-2 pt-2"></div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Credit Limit:</span>
                      <span className="font-bold text-sm text-gray-100">{formatCurrency(accountDetails.account.limit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Available Credit:</span>
                      <span className="font-bold text-sm text-gray-100">
                        {formatCurrency(accountDetails.account.limit - Math.abs(accountDetails.balance))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Utilization:</span>
                      <span className="font-bold text-sm text-gray-100">
                        {((Math.abs(accountDetails.balance) / accountDetails.account.limit) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleCloseDetails}
                  className="px-3 py-1.5 bg-[#30BDF2] text-xs text-white rounded-md hover:bg-[#28a8d8]"
                >
                  Close
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
        <div className="flex justify-between items-center">
          {/* <h1 className="text-2xl font-bold">Accounts</h1> */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#30BDF2] text-white px-4 py-2 rounded-md hover:bg-[#28a8d8]"
          >
            Add Account
          </button>
        </div>

        {/* Total Balance */}
        <div className="card-dark">
          <h2 className="text-lg font-semibold mb-2 text-gray-200">Total Balance</h2>
          <p className="text-3xl font-bold text-[#30BDF2]">{formatCurrency(totalBalance)}</p>
        </div>

        {/* Accounts Table */}
        <div className="card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-dark min-w-full">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Account Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Balance
                  </th>
                  {accounts.some(a => a.type === 'credit_card') && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Payable
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {accounts.map(account => (
                  <tr key={account.account_id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-200">{account.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300 capitalize">{account.type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400 truncate max-w-xs">
                        {account.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-200">
                        {formatCurrency(account.balance || 0)}
                      </div>
                    </td>
                    {accounts.some(a => a.type === 'credit_card') && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-400">
                          {account.type === 'credit_card' && account.payable_balance !== undefined
                            ? formatCurrency(account.payable_balance)
                            : '-'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button 
                        onClick={() => handleViewDetails(account)}
                        className="text-[#30BDF2] hover:text-[#28a8d8] inline-block"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleOpenModal(account)}
                        className="text-indigo-400 hover:text-indigo-300 inline-block mx-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteModal(account)}
                        className="text-red-500 hover:text-red-700 inline-block"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modals - moved outside of the space-y-6 container */}
      {/* Account Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-dark w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-200">
              {selectedAccount ? 'Edit Account' : 'Add Account'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="bank_account">Bank Account</option>
                  <option value="credit_card">Credit Card</option>
                  {/* <option value="cash">Cash</option> */}
                  {/* <option value="investment">Investment</option> */}
                  {/* <option value="loan">Loan</option> */}
                  <option value="other">Other</option>
                </select>
              </div>
              
              {formData.type === 'credit_card' && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Credit Limit</label>
                  <input
                    type="number"
                    name="limit"
                    value={formData.limit || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#30BDF2] text-white rounded-md hover:bg-[#28a8d8]"
                >
                  {selectedAccount ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && accountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-dark w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Delete Account</h2>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete the account "<span className="text-white font-medium">{accountToDelete.name}</span>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseDeleteModal}
                className="px-5 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {isViewingDetails && accountDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-dark w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-200">{accountDetails.account.name} Details</h2>
              <div className="px-3 py-1 rounded-lg bg-gray-800 text-sm capitalize text-gray-300">
                {accountDetails.account.type.replace('_', ' ')}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Balance Information */}
              <div className="bg-gray-800 p-5 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Balance Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Current Balance:</span>
                    <span className="text-xl font-bold text-[#30BDF2]">{formatCurrency(accountDetails.balance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Income:</span>
                    <span className="font-bold text-green-400">{formatCurrency(accountDetails.total_income)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Expenses:</span>
                    <span className="font-bold text-red-400">{formatCurrency(accountDetails.total_expenses)}</span>
                  </div>
                </div>
              </div>
              
              {/* Transfer Information */}
              <div className="bg-gray-800 p-5 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Transfer Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Transfers In:</span>
                    <span className="font-bold text-[#30BDF2]">{formatCurrency(accountDetails.total_transfers_in)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Transfers Out:</span>
                    <span className="font-bold text-[#30BDF2]">{formatCurrency(accountDetails.total_transfers_out)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2">
                    <span className="text-gray-400">Net Transfers:</span>
                    <span className="font-bold text-white">
                      {formatCurrency(accountDetails.total_transfers_in - accountDetails.total_transfers_out)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Credit Card Information (if applicable) */}
            {accountDetails.account.type === 'credit_card' && accountDetails.account.limit && (
              <div className="bg-gray-800 p-5 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Credit Card Information</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Credit Limit</p>
                    <p className="text-lg font-bold text-gray-100">{formatCurrency(accountDetails.account.limit)}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Available Credit</p>
                    <p className="text-lg font-bold text-green-400">
                      {formatCurrency(accountDetails.account.limit - Math.abs(accountDetails.balance))}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Utilization</p>
                    <div className="flex items-center">
                      <p className="text-lg font-bold text-[#30BDF2] mr-2">
                        {((Math.abs(accountDetails.balance) / accountDetails.account.limit) * 100).toFixed(1)}%
                      </p>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-[#30BDF2] h-2 rounded-full" 
                          style={{width: `${Math.min(((Math.abs(accountDetails.balance) / accountDetails.account.limit) * 100), 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={handleCloseDetails}
                className="px-6 py-2 bg-[#30BDF2] text-white rounded-md hover:bg-[#28a8d8] font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30BDF2]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 