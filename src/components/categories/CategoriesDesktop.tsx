import React, { useState } from 'react';
import type { Category, CategoryCreate } from '../../services/api';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';

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
  const [incomeCurrentPage, setIncomeCurrentPage] = useState(1);
  const [isIncomeTableLoading, setIsIncomeTableLoading] = useState(false);
  const [expenseCurrentPage, setExpenseCurrentPage] = useState(1);
  const [isExpenseTableLoading, setIsExpenseTableLoading] = useState(false);
  const itemsPerPage = 10;

  const incomeTotalPages = Math.ceil(incomeCategories.length / itemsPerPage);
  const expenseTotalPages = Math.ceil(expenseCategories.length / itemsPerPage);

  const paginatedIncomeCategories = incomeCategories.slice(
    (incomeCurrentPage - 1) * itemsPerPage,
    incomeCurrentPage * itemsPerPage
  );
  const paginatedExpenseCategories = expenseCategories.slice(
    (expenseCurrentPage - 1) * itemsPerPage,
    expenseCurrentPage * itemsPerPage
  );

  const handleIncomePageChange = (page: number) => {
    setIsIncomeTableLoading(true);
    setTimeout(() => { setIncomeCurrentPage(page); setIsIncomeTableLoading(false); }, 100);
  };
  const handleExpensePageChange = (page: number) => {
    setIsExpenseTableLoading(true);
    setTimeout(() => { setExpenseCurrentPage(page); setIsExpenseTableLoading(false); }, 100);
  };

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

  const PaginationBar = ({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800/60"
      style={{ background: 'rgba(22,30,46,0.8)' }}
    >
      <p className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-300">{(currentPage - 1) * itemsPerPage + 1}</span>–
        <span className="font-semibold text-gray-300">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
        <span className="font-semibold text-gray-300">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all"
          style={currentPage === 1
            ? { background: 'rgba(255,255,255,0.03)', color: '#4b5563', cursor: 'not-allowed' }
            : { background: 'rgba(255,255,255,0.06)', color: '#d1d5db' }
          }
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all"
            style={currentPage === page
              ? { background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)', color: 'white', boxShadow: '0 2px 8px rgba(48,189,242,0.35)' }
              : { background: 'rgba(255,255,255,0.06)', color: '#d1d5db' }
            }
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all"
          style={currentPage === totalPages
            ? { background: 'rgba(255,255,255,0.03)', color: '#4b5563', cursor: 'not-allowed' }
            : { background: 'rgba(255,255,255,0.06)', color: '#d1d5db' }
          }
        >
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleOpenModal()}
            className="text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
              boxShadow: '0 4px 12px rgba(48,189,242,0.25)'
            }}
          >
            + Add Category
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Income Categories */}
          <div className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f1623 0%, #0d1520 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            {/* Card header */}
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(90deg, #0a2a1e 0%, #0d1f16 100%)', borderBottom: '1px solid rgba(16,185,129,0.1)' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <TagIcon className="h-4 w-4 text-emerald-400" />
              </div>
              <h2 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">Income Categories</h2>
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}
              >
                {incomeCategories.length}
              </span>
            </div>

            {incomeCategories.length > 0 ? (
              <div className="relative">
                {isIncomeTableLoading && <TableLoadingIndicator />}
                <table className="min-w-full">
                  <thead>
                    <tr style={{ background: 'linear-gradient(90deg, #1a2236 0%, #1e293b 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedIncomeCategories.map((category, idx) => (
                      <tr key={category.id}
                        style={{ borderBottom: idx < paginatedIncomeCategories.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                              style={{ background: 'rgba(16,185,129,0.1)' }}
                            >
                              <TagIcon className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-100">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button title="Edit" onClick={() => handleOpenModal(category)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: 'rgba(99,102,241,0.08)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.18)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                            >
                              <PencilSquareIcon className="h-3.5 w-3.5 text-indigo-400" />
                            </button>
                            <button title="Delete" onClick={() => handleOpenDeleteModal(category)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: 'rgba(239,68,68,0.08)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                            >
                              <TrashIcon className="h-3.5 w-3.5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {incomeCategories.length > itemsPerPage && (
                  <PaginationBar
                    currentPage={incomeCurrentPage}
                    totalPages={incomeTotalPages}
                    totalItems={incomeCategories.length}
                    onPageChange={handleIncomePageChange}
                  />
                )}
              </div>
            ) : (
              <div className="px-5 py-12 text-center text-gray-500 text-sm">
                No income categories found
              </div>
            )}
          </div>

          {/* Expense Categories */}
          <div className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f1623 0%, #0d1520 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            {/* Card header */}
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(90deg, #2a0e0e 0%, #1f0d0d 100%)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239,68,68,0.15)' }}
              >
                <TagIcon className="h-4 w-4 text-red-400" />
              </div>
              <h2 className="text-sm font-semibold text-red-300 uppercase tracking-wider">Expense Categories</h2>
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
              >
                {expenseCategories.length}
              </span>
            </div>

            {expenseCategories.length > 0 ? (
              <div className="relative">
                {isExpenseTableLoading && <TableLoadingIndicator />}
                <table className="min-w-full">
                  <thead>
                    <tr style={{ background: 'linear-gradient(90deg, #1a2236 0%, #1e293b 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenseCategories.map((category, idx) => (
                      <tr key={category.id}
                        style={{ borderBottom: idx < paginatedExpenseCategories.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                              style={{ background: 'rgba(239,68,68,0.1)' }}
                            >
                              <TagIcon className="h-3.5 w-3.5 text-red-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-100">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button title="Edit" onClick={() => handleOpenModal(category)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: 'rgba(99,102,241,0.08)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.18)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                            >
                              <PencilSquareIcon className="h-3.5 w-3.5 text-indigo-400" />
                            </button>
                            <button title="Delete" onClick={() => handleOpenDeleteModal(category)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: 'rgba(239,68,68,0.08)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                            >
                              <TrashIcon className="h-3.5 w-3.5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {expenseCategories.length > itemsPerPage && (
                  <PaginationBar
                    currentPage={expenseCurrentPage}
                    totalPages={expenseTotalPages}
                    totalItems={expenseCategories.length}
                    onPageChange={handleExpensePageChange}
                  />
                )}
              </div>
            ) : (
              <div className="px-5 py-12 text-center text-gray-500 text-sm">
                No expense categories found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dark w-full max-w-md p-6 animate-slideUp">
            <h2 className="text-xl font-bold mb-4 text-gray-200">
              {selectedCategory ? 'Edit Category' : 'Add Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-base font-medium text-gray-300 mb-1">Type</label>
                <SelectInput name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </SelectInput>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold text-gray-300 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
                    boxShadow: '0 4px 12px rgba(48,189,242,0.3)'
                  }}
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
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dark w-full max-w-sm p-6 animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                <TrashIcon className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Category</h2>
            </div>
            <p className="mb-6 text-gray-300 text-sm">
              Are you sure you want to delete{' '}
              <span className="font-medium text-white">"{categoryToDelete.name}"</span>?
              This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCloseDeleteModal}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-300 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
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
