import React, { useState } from 'react';
import type { FormEvent } from 'react';
import type { Account, AccountCreate, AccountBalance } from '../../services/api';
import {
  ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
  BuildingLibraryIcon, CreditCardIcon, BanknotesIcon,
  EyeIcon, PencilSquareIcon, AdjustmentsHorizontalIcon, TrashIcon
} from '@heroicons/react/24/outline';

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
  selectedYear: string;
  yearOptions: number[];
  handleYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
  handleAdjustmentInputChange,
  selectedYear,
  yearOptions,
  handleYearChange
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
    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
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
      await handleAdjustBalance(accountToAdjust.id, newBalance);
      handleCloseAdjustmentModal();
    } catch (error) {
      console.error('Failed to adjust balance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-5">
        {/* Top bar: Add + Year filter */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleOpenModal()}
            className="text-white px-4 py-2 rounded-xl font-medium text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
              boxShadow: '0 4px 12px rgba(48,189,242,0.25)'
            }}
          >
            + Add Account
          </button>

          {/* Year Filter */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #161e2e 0%, #111827 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
            }}
          >
            <span className="text-xs font-medium text-gray-400">Year:</span>
            {selectedYear && (
              <>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(48,189,242,0.15)', color: '#30BDF2', border: '1px solid rgba(48,189,242,0.25)' }}
                >
                  {selectedYear}
                </span>
                <button
                  onClick={() => handleYearChange({ target: { value: '' } } as React.ChangeEvent<HTMLSelectElement>)}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-1.5 py-1 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  Clear
                </button>
              </>
            )}
            <SelectInput id="yearFilter" name="yearFilter" value={selectedYear} onChange={handleYearChange}
              className="pl-2 pr-7 py-1 text-xs rounded-lg"
            >
              <option value="">Current</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </SelectInput>
          </div>
        </div>

        {/* Stat cards — 5 across */}
        <div className="grid grid-cols-5 gap-4">
          <div className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, #0e1a2e 0%, #0a1423 100%)',
              border: '1px solid rgba(48,189,242,0.15)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(48,189,242,0.12)' }}
              >
                <BanknotesIcon className="h-4 w-4 text-[#30BDF2]" />
              </div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Total Balance</p>
            </div>
            <p className="text-xl font-extrabold text-[#30BDF2]">{formatCurrency(totalBalance)}</p>
          </div>

          <div className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, #2a0e0e 0%, #1f0d0d 100%)',
              border: '1px solid rgba(239,68,68,0.15)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.12)' }}
              >
                <CreditCardIcon className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">CC Payable</p>
            </div>
            <p className="text-xl font-extrabold text-red-400">{formatCurrency(totalCreditCardPayable)}</p>
          </div>

          <div className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, #161e2e 0%, #111827 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <BuildingLibraryIcon className="h-4 w-4 text-[#30BDF2]" />
              </div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Bank</p>
            </div>
            <p className="text-xl font-extrabold text-white">{formatCurrency(totalBankAccount)}</p>
          </div>

          <div className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, #161e2e 0%, #111827 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <CreditCardIcon className="h-4 w-4 text-[#30BDF2]" />
              </div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Credit Card</p>
            </div>
            <p className="text-xl font-extrabold text-white">{formatCurrency(totalCreditCard)}</p>
          </div>

          <div className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, #161e2e 0%, #111827 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <BanknotesIcon className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Other</p>
            </div>
            <p className="text-xl font-extrabold text-white">{formatCurrency(totalOther)}</p>
          </div>
        </div>

        {/* Accounts Table */}
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
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Balance</th>
                  {accounts.some(a => a.type === 'credit_card') && (
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Payable</th>
                  )}
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccounts.length > 0 ? (
                  paginatedAccounts.map((account, idx) => (
                    <tr key={account.id}
                      style={{
                        borderBottom: idx < paginatedAccounts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Account name + icon */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(48,189,242,0.08)', border: '1px solid rgba(48,189,242,0.12)' }}
                          >
                            {account.type === 'bank_account'
                              ? <BuildingLibraryIcon className="h-4 w-4 text-[#30BDF2]" />
                              : account.type === 'credit_card'
                                ? <CreditCardIcon className="h-4 w-4 text-[#30BDF2]" />
                                : <BanknotesIcon className="h-4 w-4 text-[#30BDF2]" />
                            }
                          </div>
                          <span className="text-sm font-semibold text-gray-100">{account.name}</span>
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                          style={
                            account.type === 'bank_account'
                              ? { background: 'rgba(48,189,242,0.1)', color: '#30BDF2' }
                              : account.type === 'credit_card'
                                ? { background: 'rgba(239,68,68,0.1)', color: '#f87171' }
                                : { background: 'rgba(255,255,255,0.07)', color: '#94a3b8' }
                          }
                        >
                          {account.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-500 truncate max-w-xs block">
                          {account.description || <span className="text-gray-700">—</span>}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-gray-100">{formatCurrency(account.balance || 0)}</span>
                      </td>

                      {accounts.some(a => a.type === 'credit_card') && (
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          {account.type === 'credit_card' && account.payable_balance !== undefined
                            ? <span className="text-sm font-medium text-red-400">{formatCurrency(account.payable_balance)}</span>
                            : <span className="text-gray-700">—</span>
                          }
                        </td>
                      )}

                      {/* Icon action buttons */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button title="View" onClick={() => handleViewDetails(account)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(48,189,242,0.08)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(48,189,242,0.18)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(48,189,242,0.08)')}
                          >
                            <EyeIcon className="h-4 w-4 text-[#30BDF2]" />
                          </button>
                          <button title="Edit" onClick={() => handleOpenModal(account)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(99,102,241,0.08)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.18)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                          >
                            <PencilSquareIcon className="h-4 w-4 text-indigo-400" />
                          </button>
                          <button title="Adjust balance" onClick={() => handleOpenAdjustmentModal(account)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(245,158,11,0.08)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.18)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.08)')}
                          >
                            <AdjustmentsHorizontalIcon className="h-4 w-4 text-amber-400" />
                          </button>
                          <button title="Delete" onClick={() => handleOpenDeleteModal(account)}
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
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No accounts found
                    </td>
                  </tr>
                )}
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
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dark w-full max-w-md p-6 animate-slideUp">
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
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dark w-full max-w-md p-6 animate-slideUp">
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
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dark w-full max-w-2xl p-6 animate-slideUp">
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
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dark w-full max-w-md p-6 animate-slideUp">
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