import React, { useState } from 'react';
import type { FormEvent } from 'react';
import type { Account, AccountCreate, AccountBalance } from '../../services/api';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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

interface AccountsDesktopProps {
  accounts: Account[];
  totalBalance: number;
  totalCreditCardPayable: number;
  totalBankAccount: number;
  totalCreditCard: number;
  totalOther: number;
  handleOpenModal: (account?: Account) => void;
  handleOpenDeleteModal: (account: Account) => void;
  handleViewDetails: (account: Account) => void;
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isViewingDetails: boolean;
  selectedAccount: Account | null;
  accountToDelete: Account | null;
  accountDetails: AccountBalance | null;
  formData: AccountCreate;
  handleCloseModal: () => void;
  handleCloseDeleteModal: () => void;
  handleCloseDetails: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  handleDeleteAccount: () => void;
  formatLimitValue: (value: string) => string;
  formatCurrency: (value: number) => string;
  handleAdjustBalance: (accountId: string, newBalance: number) => Promise<void>;
  handleCloseAdjustmentModal: () => void;
  adjustmentAmount: string;
  accountToAdjust: Account | null;
  handleOpenAdjustmentModal: (account: Account) => void;
  isAdjustmentModalOpen: boolean;
  handleAdjustmentInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AccountsDesktop({
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
  handleCloseAdjustmentModal,
  adjustmentAmount,
  accountToAdjust,
  handleOpenAdjustmentModal,
  isAdjustmentModalOpen,
  handleAdjustmentInputChange
}: AccountsDesktopProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(accounts.length / itemsPerPage);

  const paginatedAccounts = accounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setIsTableLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsTableLoading(false);
    }, 100);
  };
  
  // Loading indicator component
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

  const handleSubmitAdjustment = async (e: FormEvent) => {
    e.preventDefault();
    if (!accountToAdjust || !handleAdjustBalance) return;
    
    setIsSubmitting(true);
    try {
      const newBalance = parseFloat(adjustmentAmount);
      await handleAdjustBalance(accountToAdjust.account_id.toString(), newBalance);
      handleCloseAdjustmentModal();
    } catch (error) {
      console.error('Failed to adjust balance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#30BDF2] text-white px-4 py-2 rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Add Account
          </button>
        </div>

        {/* Metrics Dashboard Layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Balance and Payable Card */}
          <div className="card-dark p-4">
            <p className="text-xs uppercase tracking-wider text-white mb-3">Account Summary</p>
            
            <div className="flex justify-start items-start gap-8">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Balance</p>
                <p className="text-2xl font-bold text-[#30BDF2]">{formatCurrency(totalBalance)}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Credit Card Payable</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(totalCreditCardPayable)}</p>
              </div>
            </div>
          </div>
          
          {/* Combined Account Types Card */}
          <div className="card-dark p-4">
            <p className="text-xs uppercase tracking-wider text-white mb-3">Account Types</p>
            
            <div className="flex justify-start items-start gap-8">
              <div>
                <p className="text-xs text-gray-400 mb-1">Bank</p>
                <p className="text-2xl font-bold text-[#30BDF2]">{formatCurrency(totalBankAccount)}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Other</p>
                <p className="text-2xl font-bold text-[#30BDF2]">{formatCurrency(totalOther)}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Credit</p>
                <p className="text-2xl font-bold text-[#30BDF2]">{formatCurrency(totalCreditCard)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-gray-900 shadow-md rounded-lg overflow-hidden mb-6 border border-gray-800 relative">
          <div className="overflow-x-auto relative">
            {isTableLoading && <TableLoadingIndicator />}
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
                {paginatedAccounts.length > 0 ? ( 
                  paginatedAccounts.map(account => (
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
                        className="text-[#30BDF2] hover:text-[#28a8d8] inline-block focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleOpenModal(account)}
                        className="text-indigo-400 hover:text-indigo-300 inline-block mx-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleOpenAdjustmentModal(account)}
                        className="text-amber-400 hover:text-amber-300 inline-block mx-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                      >
                        Adjust
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteModal(account)}
                        className="text-red-500 hover:text-red-400 inline-block focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-300">
                      No accounts found
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {accounts.length > itemsPerPage && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center">
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, accounts.length)}
                  </span> of{' '}
                  <span className="font-medium">{accounts.length}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === page
                          ? 'bg-[#30BDF2] text-white'
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === totalPages
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
                <SelectInput
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="bank_account">Bank Account</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="other">Other</option>
                </SelectInput>
              </div>
              
              {formData.type === 'credit_card' && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Credit Limit</label>
                  <input
                    type="text"
                    name="limit"
                    value={formData.limit ? formatLimitValue(formData.limit.toString()) : ''}
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
                  className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#30BDF2] text-white rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
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
                className="px-5 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
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
                    <span className="font-bold text-[#30BDF2]">{formatCurrency(accountDetails.balance)}</span>
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
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Transfer Fees:</span>
                    <span className="font-bold text-[#30BDF2]">{formatCurrency(accountDetails.total_transfer_fees)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2">
                    <span className="text-gray-400">Net Transfers:</span>
                    <span className="font-bold text-white">
                      {formatCurrency(accountDetails.total_transfers_in - accountDetails.total_transfers_out - accountDetails.total_transfer_fees)}
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
                    <p className="text-gray-400 text-sm mb-1">Payable Balance:</p>
                    <p className="text-lg font-bold text-green-400">
                      {formatCurrency((accountDetails.account.limit - Math.abs(accountDetails.balance)))}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Utilization</p>
                    <div className="flex items-center">
                      <p className="text-lg font-bold text-[#30BDF2] mr-2">
                        {(((accountDetails.account.limit - Math.abs(accountDetails.balance))/ accountDetails.account.limit) * 100).toFixed(1)}%
                      </p>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-[#30BDF2] h-2 rounded-full" 
                          style={{width: `${Math.min((((accountDetails.account.limit - Math.abs(accountDetails.balance))/ accountDetails.account.limit) * 100), 100)}%`}}
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
                className="px-6 py-2 bg-[#30BDF2] text-white rounded-md hover:bg-[#28a8d8] font-medium focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {isAdjustmentModalOpen && accountToAdjust && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-dark w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Adjust Balance</h2>
            
            <form onSubmit={handleSubmitAdjustment} className="space-y-4">
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <label className="block text-gray-300">Account</label>
                  <span className="text-gray-400">{accountToAdjust.name}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <label className="block text-gray-300">Current Balance</label>
                  <span className="text-gray-200 font-medium">{formatCurrency(accountToAdjust.balance || 0)}</span>
                </div>
                <label className="block text-gray-300 mb-2">New Balance</label>
                <input
                  type="text"
                  value={formatLimitValue(adjustmentAmount)}
                  onChange={handleAdjustmentInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                  placeholder="Enter new balance"
                />
                
                {adjustmentAmount && !isNaN(parseFloat(adjustmentAmount)) && accountToAdjust.balance !== undefined && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Adjustment Type:</span>
                      <span className={`font-medium ${parseFloat(adjustmentAmount) > accountToAdjust.balance ? 'text-green-400' : parseFloat(adjustmentAmount) < accountToAdjust.balance ? 'text-red-400' : 'text-gray-400'}`}>
                        {parseFloat(adjustmentAmount) > accountToAdjust.balance ? 'Income' : 
                         parseFloat(adjustmentAmount) < accountToAdjust.balance ? 'Expense' : 'No Change'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-300">Adjustment Amount:</span>
                      <span className={`font-bold ${parseFloat(adjustmentAmount) > accountToAdjust.balance ? 'text-green-400' : parseFloat(adjustmentAmount) < accountToAdjust.balance ? 'text-red-400' : 'text-gray-400'}`}>
                        {parseFloat(adjustmentAmount) !== accountToAdjust.balance 
                          ? formatCurrency(Math.abs(parseFloat(adjustmentAmount) - accountToAdjust.balance))
                          : '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAdjustmentModal}
                  className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#30BDF2] text-white rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
                  disabled={!adjustmentAmount || isNaN(parseFloat(adjustmentAmount)) || isSubmitting || (accountToAdjust.balance !== undefined && parseFloat(adjustmentAmount) === accountToAdjust.balance)}
                >
                  {isSubmitting ? 'Processing...' : 'Adjust Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 