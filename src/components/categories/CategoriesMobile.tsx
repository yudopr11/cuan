import React, { useState } from 'react';
import type { Category, CategoryCreate } from '../../services/api';
import { 
  ActionSheetModal, 
  DeleteConfirmationModal, 
  FormModal 
} from '../layout';

interface CategoriesMobileProps {
  incomeCategories: Category[];
  expenseCategories: Category[];
  activeTab: 'income' | 'expense';
  handleTabChange: (tab: 'income' | 'expense') => void;
  handleOpenModal: (category?: Category) => void;
  handleOpenDeleteModal: (category: Category) => void;
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedCategory: Category | null;
  categoryToDelete: Category | null;
  formData: CategoryCreate;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCloseModal: () => void;
  handleCloseDeleteModal: () => void;
  handleDeleteCategory: () => void;
}

const CategoriesMobile: React.FC<CategoriesMobileProps> = ({
  incomeCategories,
  expenseCategories,
  activeTab,
  handleTabChange,
  handleOpenModal,
  handleOpenDeleteModal,
  isModalOpen,
  isDeleteModalOpen,
  selectedCategory,
  categoryToDelete,
  formData,
  handleInputChange,
  handleSubmit,
  handleCloseModal,
  handleCloseDeleteModal,
  handleDeleteCategory,
}) => {
  // Local state to handle the action sheet modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedCategoryForAction, setSelectedCategoryForAction] = useState<Category | null>(null);

  // Function to open the action modal for a category
  const handleCategoryPress = (category: Category) => {
    setSelectedCategoryForAction(category);
    setActionModalOpen(true);
  };

  // Function to close the action modal
  const closeActionModal = () => {
    setActionModalOpen(false);
    setSelectedCategoryForAction(null);
  };

  // Function to handle edit from action modal
  const handleEditFromAction = () => {
    if (selectedCategoryForAction) {
      handleOpenModal(selectedCategoryForAction);
      closeActionModal();
    }
  };

  // Function to handle delete from action modal
  const handleDeleteFromAction = () => {
    if (selectedCategoryForAction) {
      handleOpenDeleteModal(selectedCategoryForAction);
      closeActionModal();
    }
  };

  // Create actions for the action sheet modal
  const actionItems = selectedCategoryForAction ? [
    {
      id: 'edit',
      label: 'Edit Category',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#30BDF2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: handleEditFromAction,
    },
    {
      id: 'delete',
      label: 'Delete Category',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: handleDeleteFromAction,
      textColor: 'text-red-500',
    },
  ] : [];

  return (
    <div className="space-y-5 px-1 pb-16">
      {/* iOS/Android style segmented control / Tab Bar */}
      <div className="px-2 py-3">
        <div className="flex w-full bg-slate-800/80 rounded-full p-1.5 shadow-lg">
          <button
            className={`flex-1 text-center py-2.5 text-sm font-medium rounded-full transition-all ${
              activeTab === 'expense' ? 'bg-[#30BDF2] text-white shadow-md' : 'text-gray-300'
            }`}
            onClick={() => handleTabChange('expense')}
          >
            Expense
          </button>
          <button
            className={`flex-1 text-center py-2.5 text-sm font-medium rounded-full transition-all ${
              activeTab === 'income' ? 'bg-[#30BDF2] text-white shadow-md' : 'text-gray-300'
            }`}
            onClick={() => handleTabChange('income')}
          >
            Income
          </button>
        </div>
      </div>

      {/* Categories List - with elegant cards */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
          <h2 className="text-base font-semibold text-white">
            {activeTab === 'expense' ? 'Expense Categories' : 'Income Categories'}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-700/50">
          {activeTab === 'expense' ? (
            expenseCategories.length > 0 ? (
              expenseCategories.map(category => (
                <div 
                  key={category.category_id} 
                  className="p-4 flex justify-between items-center active:bg-gray-700/20 hover:bg-gray-750 transition-colors duration-150 cursor-pointer"
                  onClick={() => handleCategoryPress(category)}
                >
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 shadow-md mr-3">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    </div>
                    <h3 className="font-medium text-white text-base">{category.name}</h3>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-center text-gray-400 text-base">No expense categories found</p>
                <button 
                  onClick={() => handleOpenModal()} 
                  className="mt-4 px-4 py-2 bg-[#30BDF2] text-white rounded-lg text-sm font-medium"
                >
                  Add Category
                </button>
              </div>
            )
          ) : (
            incomeCategories.length > 0 ? (
              incomeCategories.map(category => (
                <div 
                  key={category.category_id} 
                  className="p-4 flex justify-between items-center active:bg-gray-700/20 hover:bg-gray-750 transition-colors duration-150 cursor-pointer"
                  onClick={() => handleCategoryPress(category)}
                >
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-green-500/10 text-green-400 shadow-md mr-3">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                    <h3 className="font-medium text-white text-base">{category.name}</h3>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-center text-gray-400 text-base">No income categories found</p>
                <button 
                  onClick={() => handleOpenModal()} 
                  className="mt-4 px-4 py-2 bg-[#30BDF2] text-white rounded-lg text-sm font-medium"
                >
                  Add Category
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Material Design FAB (Floating Action Button) */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-[#30BDF2] text-white shadow-lg flex items-center justify-center hover:bg-[#28a8d8] focus:outline-none transition-all transform hover:scale-105 active:scale-95 z-10"
        style={{ boxShadow: '0 4px 10px rgba(48, 189, 242, 0.5)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Category Action Modal */}
      <ActionSheetModal
        isOpen={actionModalOpen}
        onClose={closeActionModal}
        title={selectedCategoryForAction?.name}
        subtitle={selectedCategoryForAction?.type === 'income' ? 'Income Category' : 'Expense Category'}
        actions={actionItems}
      />

      {/* Add/Edit Category Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCategory ? 'Edit Category' : 'New Category'}
        onSubmit={handleSubmit}
        submitText={selectedCategory ? 'Update Category' : 'Create Category'}
      >
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
            required
            placeholder="Enter category name"
            autoFocus
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={handleDeleteCategory}
        title="Delete Category"
        itemName={categoryToDelete?.name}
        itemType="category"
      />
    </div>
  );
};

export default CategoriesMobile; 