import type { FormEvent } from 'react';
import type { Account, AccountCreate, AccountBalance } from '../../services/api';
import { useState } from 'react';
import { 
  ActionSheetModal, 
  BottomSheetModal, 
  DeleteConfirmationModal, 
  FormModal 
} from '../layout';
import { 
  BuildingLibraryIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  DocumentDuplicateIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon,
  ChevronDownIcon,
  DocumentPlusIcon
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
        className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
        <ChevronDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
      </div>
    </div>
  );
};

interface AccountsMobileProps {
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
  isAdjustmentModalOpen: boolean;
  accountToAdjust: Account | null;
  adjustmentAmount: string;
  handleOpenAdjustmentModal: (account: Account) => void;
  handleCloseAdjustmentModal: () => void;
  handleAdjustmentInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AccountsMobile({
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
}: AccountsMobileProps) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [accountForAction, setAccountForAction] = useState<Account | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  const handleAccountClick = (account: Account) => {
    setAccountForAction(account);
    setIsActionMenuOpen(true);
  };

  const handleBalanceClick = () => {
    setIsBalanceModalOpen(true);
  };

  const handleCloseBalanceModal = () => {
    setIsBalanceModalOpen(false);
  };

  const handleCloseActionMenu = () => {
    setIsActionMenuOpen(false);
    setAccountForAction(null);
  };

  const handleEditClick = () => {
    if (accountForAction) {
      handleOpenModal(accountForAction);
      handleCloseActionMenu();
    }
  };
  
  const handleDeleteClick = () => {
    if (accountForAction) {
      handleOpenDeleteModal(accountForAction);
      handleCloseActionMenu();
    }
  };

  const handleDetailsClick = () => {
    if (accountForAction) {
      handleViewDetails(accountForAction);
      handleCloseActionMenu();
    }
  };

  // Create actions for the action sheet modal
  const actionItems = accountForAction ? [
    {
      id: 'view',
      label: 'View Details',
      icon: <DocumentDuplicateIcon className="h-6 w-6 text-[#30BDF2]" />,
      onClick: handleDetailsClick,
    },
    {
      id: 'edit',
      label: 'Edit Account',
      icon: <PencilSquareIcon className="h-6 w-6 text-[#30BDF2]" />,
      onClick: handleEditClick,
    },
    {
      id: 'adjust',
      label: 'Adjust Balance',
      icon: <BanknotesIcon className="h-6 w-6 text-amber-400" />,
      onClick: () => {
        if (accountForAction) {
          handleOpenAdjustmentModal(accountForAction);
          handleCloseActionMenu();
        }
      },
    },
    {
      id: 'delete',
      label: 'Delete Account',
      icon: <TrashIcon className="h-6 w-6 text-red-500" />,
      onClick: handleDeleteClick,
      textColor: 'text-red-500',
    },
  ] : [];

  return (
    <div className="pb-24 space-y-4">
      {/* Balance Cards */}
      <div 
        className="card-dark rounded-xl shadow-lg overflow-hidden mx-2 bg-gradient-to-b from-gray-800 to-gray-900"
        onClick={handleBalanceClick}
      >
        <div className="p-4">
          <h2 className="text-sm font-medium text-gray-300">Total Balance</h2>
          <p className="text-2xl font-bold text-[#30BDF2]">{formatCurrency(totalBalance)}</p>
        </div>
        
        {totalCreditCardPayable > 0 && (
          <div className="border-t border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-gray-400">Credit Card Payable</h3>
              <p className="text-sm font-bold text-red-400">{formatCurrency(totalCreditCardPayable)}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Section Title */}
      <div className="px-3 pt-2">
          <p className="text-sm font-medium text-gray-400 uppercase">My Accounts</p>
      </div>

      {/* Account List */}
      <div className="space-y-3 px-2">
        {accounts.length > 0 ? (
          accounts.map(account => (
          <div 
            key={account.account_id} 
            className="card-dark rounded-xl shadow-lg p-4 bg-gradient-to-b from-gray-800 to-gray-900 active:bg-gray-700/20 transition-colors"
            onClick={() => handleAccountClick(account)}
          >
            {/* Account Info */}
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 mr-3 shadow-md">
                  <span className="text-xl" role="img" aria-label={account.type}>
                    {account.type === 'bank_account' ? <BuildingLibraryIcon className="h-6 w-6 text-blue-300" /> : 
                     account.type === 'credit_card' ? <CreditCardIcon className="h-6 w-6 text-blue-300" /> : <BanknotesIcon className="h-6 w-6 text-blue-300" />}
                  </span>
                </div>
                <div>
                  <p className="text-base font-medium text-white truncate max-w-[120px]">{account.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{account.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-white">{formatCurrency(account.balance || 0)}</p>
                {account.type === 'credit_card' && account.payable_balance !== undefined && (
                  <p className="text-xs text-gray-400">
                    Payable: {formatCurrency(account.payable_balance)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Description (if available) */}
            {account.description && (
              <div className="mt-2 pl-12">
                <p className="text-xs text-gray-400 truncate">{account.description}</p>
              </div>
            )}
          </div>
        ))): (
          <div className="card-dark flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
            <div className="flex flex-col items-center justify-center py-10">
              <DocumentPlusIcon className="h-16 w-16 text-gray-600 mb-4" />
              <p className="text-center text-gray-400 text-base">No accounts found</p>
              <button 
                onClick={() => handleOpenModal()} 
                className="mt-4 px-4 py-2 bg-[#30BDF2] text-white rounded-lg text-sm font-medium"
              >
                Add Account
              </button>
            </div>
          </div>)}
      </div>
      
      {/* Floating Add Button */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#30BDF2] text-white flex items-center justify-center active:bg-[#28a8d8] shadow-lg z-10"
        style={{
          boxShadow: '0 4px 10px rgba(48, 189, 242, 0.3)'
        }}
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* MODALS */}

      {/* Action Sheet Modal */}
      <ActionSheetModal
        isOpen={isActionMenuOpen}
        onClose={handleCloseActionMenu}
        title={accountForAction?.name}
        subtitle={accountForAction?.type ? accountForAction.type.replace('_', ' ') : ''}
        actions={actionItems}
      />

      {/* Account Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedAccount ? 'Edit Account' : 'New Account'}
        onSubmit={handleSubmit}
        submitText={selectedAccount ? 'Update' : 'Create'}
      >
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter account name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
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
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">Credit Limit</label>
            <input
              type="text"
              name="limit"
              value={formData.limit ? formatLimitValue(formData.limit.toString()) : ''}
              onChange={handleInputChange}
              placeholder="Enter credit limit"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
            />
          </div>
        )}
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Add a description"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
            rows={3}
          />
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={handleDeleteAccount}
        title="Delete Account"
        itemName={accountToDelete?.name}
        itemType="account"
      />

      {/* Account Details Modal */}
      {isViewingDetails && accountDetails && (
        <BottomSheetModal
          isOpen={isViewingDetails}
          onClose={handleCloseDetails}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 mr-3 shadow-md">
              <span className="text-xl" role="img" aria-label={accountDetails.account.type}>
                {accountDetails.account.type === 'bank_account' ? <BuildingLibraryIcon className="h-6 w-6 text-blue-300" /> : 
                 accountDetails.account.type === 'credit_card' ? <CreditCardIcon className="h-6 w-6 text-blue-300" /> : <BanknotesIcon className="h-6 w-6 text-blue-300" />}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{accountDetails.account.name}</h2>
              <p className="text-sm text-gray-400 capitalize">{accountDetails.account.type.replace('_', ' ')}</p>
            </div>
          </div>
          
          {/* Balance Card */}
          <div className="card-dark rounded-xl shadow-lg p-4 mb-6 bg-gradient-to-br from-gray-800 to-gray-900">
            <p className="text-xs text-gray-300 mb-1.5 font-medium">Current Balance</p>
            <p className="text-xl font-bold text-[#30BDF2]">{formatCurrency(accountDetails.balance)}</p>
          </div>
          
          {/* Credit Card Info with Divider */}
          {accountDetails.account.type === 'credit_card' && accountDetails.account.limit && (
            <>
              {/* Section Divider */}
              <div className="mb-6"></div>
              
              <div className="card-dark rounded-xl shadow-lg p-4 mb-8 bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-400">Credit Limit</span>
                  <span className="font-bold text-white">{formatCurrency(accountDetails.account.limit)}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-400">Payable Balance</span>
                  <span className="font-bold text-green-400">{formatCurrency(accountDetails.account.limit - Math.abs(accountDetails.balance))}</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-400">Utilization</span>
                    <span className="text-xs font-medium text-[#30BDF2]">
                      {(((accountDetails.account.limit - Math.abs(accountDetails.balance)) / accountDetails.account.limit) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-[#30BDF2] h-2.5 rounded-full" 
                      style={{width: `${Math.min((((accountDetails.account.limit - Math.abs(accountDetails.balance))/ accountDetails.account.limit) * 100), 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Section Divider */}
          <div className="mb-6"></div>
          
          {/* Transactions Summary */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Transactions Summary</p>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Income */}
              <div className="card-dark rounded-xl p-4 bg-gray-800 shadow-md">
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Income</p>
                <p className="text-base font-bold text-green-400">{formatCurrency(accountDetails.total_income)}</p>
              </div>
              
              {/* Expenses */}
              <div className="card-dark rounded-xl p-4 bg-gray-800 shadow-md">
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Expenses</p>
                <p className="text-base font-bold text-red-400">{formatCurrency(accountDetails.total_expenses)}</p>
              </div>
            </div>
          </div>
          
          {/* Section Divider */}
          <div className="border-t border-gray-700 mb-5"></div>
          
          {/* Transfers Summary */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Transfers</p>
            
            <div className="card-dark rounded-xl p-4 bg-gray-800 shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Transfers In</span>
                <span className="font-medium text-[#30BDF2]">{formatCurrency(accountDetails.total_transfers_in)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Transfers Out</span>
                <span className="font-medium text-[#30BDF2]">{formatCurrency(accountDetails.total_transfers_out)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Transfer Fees</span>
                <span className="font-medium text-[#30BDF2]">{formatCurrency(accountDetails.total_transfer_fees)}</span>
              </div>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleCloseDetails}
            className="w-full py-3.5 px-4 bg-[#30BDF2] text-white rounded-lg shadow-md active:bg-[#28a8d8] transition-colors font-medium"
          >
            Close
          </button>
        </BottomSheetModal>
      )}

      {/* Balance Adjustment Modal */}
      <FormModal
        isOpen={isAdjustmentModalOpen}
        onClose={handleCloseAdjustmentModal}
        title="Adjust Balance"
        onSubmit={(e) => {
          e.preventDefault();
          if (!accountToAdjust) return;
          
          const newBalance = parseFloat(adjustmentAmount);
          handleAdjustBalance(accountToAdjust.account_id.toString(), newBalance)
            .then(() => handleCloseAdjustmentModal())
            .catch(error => console.error('Failed to adjust balance:', error));
        }}
        submitText="Adjust Balance"
        submitDisabled={!accountToAdjust || !adjustmentAmount || isNaN(parseFloat(adjustmentAmount)) || (accountToAdjust?.balance !== undefined && parseFloat(adjustmentAmount) === accountToAdjust.balance)}
      >
        {accountToAdjust && (
          <>
            <div className="card-dark rounded-xl p-4 bg-gray-800 mb-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-300">Account</h3>
                <p className="text-base font-bold text-white">{accountToAdjust.name}</p>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-300">Current Balance</h3>
                <p className="text-base font-bold text-white">{formatCurrency(accountToAdjust.balance || 0)}</p>
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">New Balance</label>
              <input
                type="text" 
                value={formatLimitValue(adjustmentAmount)}
                onChange={handleAdjustmentInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                placeholder="Enter new balance"
              />
            </div>
            
            {adjustmentAmount && !isNaN(parseFloat(adjustmentAmount)) && accountToAdjust.balance !== undefined && (
              <div className="card-dark rounded-xl p-4 bg-gray-800 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-300">Adjustment Type:</span>
                  <span className={`text-base font-medium ${parseFloat(adjustmentAmount) > accountToAdjust.balance ? 'text-green-400' : parseFloat(adjustmentAmount) < accountToAdjust.balance ? 'text-red-400' : 'text-gray-400'}`}>
                    {parseFloat(adjustmentAmount) > accountToAdjust.balance ? 'Income' : 
                     parseFloat(adjustmentAmount) < accountToAdjust.balance ? 'Expense' : 'No Change'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Adjustment Amount:</span>
                  <span className={`text-base font-bold ${parseFloat(adjustmentAmount) > accountToAdjust.balance ? 'text-green-400' : parseFloat(adjustmentAmount) < accountToAdjust.balance ? 'text-red-400' : 'text-gray-400'}`}>
                    {parseFloat(adjustmentAmount) !== accountToAdjust.balance 
                      ? formatCurrency(Math.abs(parseFloat(adjustmentAmount) - accountToAdjust.balance))
                      : '-'}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </FormModal>

      {/* Balance Detail Modal */}
      <BottomSheetModal
        isOpen={isBalanceModalOpen}
        onClose={handleCloseBalanceModal}
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Balance Details</h2>
        </div>

        {/* Total Balance */}
        <div className="card-dark rounded-xl p-5 bg-gradient-to-b from-gray-800 to-gray-900">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Total Balance</h3>
          <p className="text-3xl font-bold text-[#30BDF2]">{formatCurrency(totalBalance)}</p>
        </div>

        <div className="mb-6"></div>

        {/* Account Type Balance Breakdown */}
        <p className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Balance Breakdown</p>

        {/* Individual Account Type Balances */}
        <div className="space-y-3">
          {/* Bank Account Balance */}
          <div className="card-dark rounded-xl p-4 bg-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BuildingLibraryIcon className="h-5 w-5 text-blue-300 mr-2" />
                <span className="text-sm font-medium text-gray-300">Bank Accounts</span>
              </div>
              <span className="text-base font-bold text-white">{formatCurrency(totalBankAccount)}</span>
            </div>
          </div>
          
          {/* Other Balance */}
          <div className="card-dark rounded-xl p-4 bg-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BanknotesIcon className="h-5 w-5 text-blue-300 mr-2" />
                <span className="text-sm font-medium text-gray-300">Other Accounts</span>
              </div>
              <span className="text-base font-bold text-white">{formatCurrency(totalOther)}</span>
            </div>
          </div>
          
          {/* Credit Card Balance */}
          <div className="card-dark rounded-xl p-4 bg-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CreditCardIcon className="h-5 w-5 text-blue-300 mr-2" />
                <span className="text-sm font-medium text-gray-300">Credit Cards</span>
              </div>
              <span className="text-base font-bold text-white">{formatCurrency(totalCreditCard)}</span>
            </div>
          </div>
        </div>

        <div className="mb-8"></div>

        {/* Close Button */}
        <button
          onClick={handleCloseBalanceModal}
          className="w-full py-3.5 px-4 bg-[#30BDF2] text-white rounded-lg shadow-md active:bg-[#28a8d8] transition-colors font-medium"
        >
          Close
        </button>
      </BottomSheetModal>
    </div>
  );
}

// Add this to your global CSS or add it inline if needed
// .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
// .animate-slideUp { animation: slideUp 0.3s ease-out; }
// .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
// @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } } 