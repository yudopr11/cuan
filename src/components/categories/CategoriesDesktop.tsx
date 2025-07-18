import React, { useState } from 'react';
import type { Category, CategoryCreate } from '../../services/api';
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
        className={`w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
      </div>
    </div>
  );
};

interface CategoriesDesktopProps {
  incomeCategories: Category[];
  expenseCategories: Category[];
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

const CategoriesDesktop: React.FC<CategoriesDesktopProps> = ({
  incomeCategories,
  expenseCategories,
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
  // Pagination state for income categories
  const [incomeCurrentPage, setIncomeCurrentPage] = useState(1);
  const [isIncomeTableLoading, setIsIncomeTableLoading] = useState(false);
  
  // Pagination state for expense categories
  const [expenseCurrentPage, setExpenseCurrentPage] = useState(1);
  const [isExpenseTableLoading, setIsExpenseTableLoading] = useState(false);
  
  // Number of items to show per page
  const itemsPerPage = 10;
  
  // Calculate pagination parameters
  const incomeTotalPages = Math.ceil(incomeCategories.length / itemsPerPage);
  const expenseTotalPages = Math.ceil(expenseCategories.length / itemsPerPage);
  
  // Paginate the categories arrays
  const paginatedIncomeCategories = incomeCategories.slice(
    (incomeCurrentPage - 1) * itemsPerPage,
    incomeCurrentPage * itemsPerPage
  );
  
  const paginatedExpenseCategories = expenseCategories.slice(
    (expenseCurrentPage - 1) * itemsPerPage,
    expenseCurrentPage * itemsPerPage
  );
  
  // Handle page change for income categories
  const handleIncomePageChange = (page: number) => {
    setIsIncomeTableLoading(true);
    setTimeout(() => {
      setIncomeCurrentPage(page);
      setIsIncomeTableLoading(false);
    }, 100);
  };
  
  // Handle page change for expense categories
  const handleExpensePageChange = (page: number) => {
    setIsExpenseTableLoading(true);
    setTimeout(() => {
      setExpenseCurrentPage(page);
      setIsExpenseTableLoading(false);
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          {/* <h1 className="text-2xl font-bold">Categories</h1> */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#30BDF2] text-white px-4 py-2 rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Add Category
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Income Categories */}
          <div className="card-dark overflow-hidden">
            <div className="bg-green-900 px-6 py-4 border-b border-gray-700 rounded-lg mb-4">
              <h2 className="text-lg font-semibold text-green-200">Income Categories</h2>
            </div>
            
            {incomeCategories.length > 0 ? (
              <div className="overflow-x-auto border border-gray-800 rounded-lg relative">
                {isIncomeTableLoading && <TableLoadingIndicator />}
                <table className="min-w-full divide-y divide-gray-700 table-dark">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedIncomeCategories.map(category => (
                      <tr key={category.id} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-green-400">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(category)}
                            className="text-indigo-400 hover:text-indigo-300 mr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(category)}
                            className="text-red-500 hover:text-red-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination Controls for Income */}
                {incomeCategories.length > itemsPerPage && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
                    <div className="flex items-center">
                      <p className="text-sm text-gray-400">
                        Showing <span className="font-medium">{(incomeCurrentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(incomeCurrentPage * itemsPerPage, incomeCategories.length)}
                        </span> of{' '}
                        <span className="font-medium">{incomeCategories.length}</span> results
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleIncomePageChange(incomeCurrentPage - 1)}
                        disabled={incomeCurrentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          incomeCurrentPage === 1
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <div className="flex space-x-1">
                        {Array.from({ length: incomeTotalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handleIncomePageChange(page)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              incomeCurrentPage === page
                                ? 'bg-[#30BDF2] text-white'
                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleIncomePageChange(incomeCurrentPage + 1)}
                        disabled={incomeCurrentPage === incomeTotalPages}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          incomeCurrentPage === incomeTotalPages
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
            ) : (
              <div className="p-6 text-center text-gray-400">
                No income categories found
              </div>
            )}
          </div>
          
          {/* Expense Categories */}
          <div className="card-dark overflow-hidden">
            <div className="bg-red-900 px-6 py-4 border-b border-gray-700 rounded-lg mb-4">
              <h2 className="text-lg font-semibold text-red-200">Expense Categories</h2>
            </div>
            
            {expenseCategories.length > 0 ? (
              <div className="overflow-x-auto border border-gray-800 rounded-lg relative">
                {isExpenseTableLoading && <TableLoadingIndicator />}
                <table className="min-w-full divide-y divide-gray-700 table-dark">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedExpenseCategories.map(category => (
                      <tr key={category.id} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-red-400">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(category)}
                            className="text-indigo-400 hover:text-indigo-300 mr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(category)}
                            className="text-red-500 hover:text-red-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination Controls for Expense */}
                {expenseCategories.length > itemsPerPage && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
                    <div className="flex items-center">
                      <p className="text-sm text-gray-400">
                        Showing <span className="font-medium">{(expenseCurrentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(expenseCurrentPage * itemsPerPage, expenseCategories.length)}
                        </span> of{' '}
                        <span className="font-medium">{expenseCategories.length}</span> results
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExpensePageChange(expenseCurrentPage - 1)}
                        disabled={expenseCurrentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          expenseCurrentPage === 1
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <div className="flex space-x-1">
                        {Array.from({ length: expenseTotalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handleExpensePageChange(page)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              expenseCurrentPage === page
                                ? 'bg-[#30BDF2] text-white'
                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleExpensePageChange(expenseCurrentPage + 1)}
                        disabled={expenseCurrentPage === expenseTotalPages}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          expenseCurrentPage === expenseTotalPages
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
            ) : (
              <div className="p-6 text-center text-gray-400">
                No expense categories found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals - moved outside of the space-y-6 container */}
      {/* Category Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-dark w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-200">
              {selectedCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="type" className="block text-base font-medium text-gray-300 mb-1">
                  Type
                </label>
                <SelectInput
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </SelectInput>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 border border-gray-700 rounded-md text-base text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#30BDF2] text-base text-white rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  {selectedCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-dark w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Delete Category</h2>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete the category "<span className="text-white font-medium">{categoryToDelete.name}</span>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesDesktop; 