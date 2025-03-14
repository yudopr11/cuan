import React, { useState } from 'react';
import type { Category, CategoryCreate } from '../../services/api';
import { 
  ActionSheetModal, 
  DeleteConfirmationModal, 
  FormModal 
} from '../layout';
import { PencilSquareIcon, TrashIcon, ChevronRightIcon, DocumentPlusIcon, PlusIcon, ChevronDownIcon, TagIcon } from '@heroicons/react/24/outline';

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

// SelectInput component for consistent styling
const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { style?: React.CSSProperties }> = ({ 
  className, 
  style, 
  ...props 
}) => {
  return (
    <div className="relative">
      <select
        className={className}
        style={{ paddingRight: '2.5rem', ...style }}
        {...props}
      />
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
        <ChevronDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
      </div>
    </div>
  );
};

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
        <PencilSquareIcon className="h-6 w-6 text-[#30BDF2]" />
      ),
      onClick: handleEditFromAction,
    },
    {
      id: 'delete',
      label: 'Delete Category',
      icon: (
        <TrashIcon className="h-6 w-6 text-red-500" />
      ),
      onClick: handleDeleteFromAction,
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
                    <TagIcon className="h-5 w-5 text-red-400 mr-3" />
                    <h3 className="font-medium text-white text-base">{category.name}</h3>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <ChevronRightIcon className="h-5 w-5" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <DocumentPlusIcon className="h-16 w-16 text-gray-600 mb-4" />
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
                    <TagIcon className="h-5 w-5 text-green-400 mr-3" />
                    <h3 className="font-medium text-white text-base">{category.name}</h3>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <ChevronRightIcon className="h-5 w-5" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <DocumentPlusIcon className="h-16 w-16 text-gray-600 mb-4" />
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
          <SelectInput
            name="type"
            id="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </SelectInput>
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