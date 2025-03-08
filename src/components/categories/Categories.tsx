import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import type { Category, CategoryCreate } from '../../services/api';
import usePageTitle from '../../hooks/usePageTitle';

interface CategoriesProps {
  isMobile: boolean;
}

export default function Categories({ isMobile }: CategoriesProps) {
  usePageTitle('Categories');

  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  
  // Form state
  const [formData, setFormData] = useState<CategoryCreate>({
    name: '',
    type: 'expense'
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories by type when categories change
  useEffect(() => {
    setIncomeCategories(categories.filter(category => category.type === 'income'));
    setExpenseCategories(categories.filter(category => category.type === 'expense'));
  }, [categories]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        type: category.type
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        type: activeTab
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      if (selectedCategory) {
        // Update existing category
        await updateCategory(selectedCategory.category_id, formData);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await createCategory(formData);
        toast.success('Category created successfully');
      }
      
      // Refresh categories list
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleOpenDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory(categoryToDelete.category_id);
      toast.success('Category deleted successfully');
      fetchCategories();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleTabChange = (tab: 'income' | 'expense') => {
    setActiveTab(tab);
  };

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
            {/* <h1 className="text-2xl font-bold">Categories</h1> */}
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              className={`flex-1 py-2 px-2 text-center text-xs ${
                activeTab === 'expense'
                  ? 'bg-[#30BDF2] text-white focus:outline-none'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 focus:outline-none'
              }`}
              onClick={() => handleTabChange('expense')}
            >
              Expense
            </button>
            <button
              className={`flex-1 py-2 px-2 text-center text-xs ${
                activeTab === 'income'
                  ? 'bg-[#30BDF2] text-white focus:outline-none'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 focus:outline-none'
              }`}
              onClick={() => handleTabChange('income')}
            >
              Income
            </button>
          </div>

          {/* Categories List */}
          <div className="space-y-3">
            {activeTab === 'expense' ? (
              expenseCategories.length > 0 ? (
                expenseCategories.map(category => (
                  <div key={category.category_id} className="card-dark flex justify-between items-center p-3">
                    <h3 className="font-medium text-red-400 text-sm">{category.name}</h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="text-indigo-400 hover:text-indigo-300 mr-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(category)}
                        className="text-red-500 hover:text-red-400 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-3 text-sm">No expense categories found</p>
              )
            ) : (
              incomeCategories.length > 0 ? (
                incomeCategories.map(category => (
                  <div key={category.category_id} className="card-dark flex justify-between items-center p-3">
                    <h3 className="font-medium text-green-400 text-sm">{category.name}</h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="text-indigo-400 hover:text-indigo-300 mr-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(category)}
                        className="text-red-500 hover:text-red-400 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-3 text-sm">No income categories found</p>
              )
            )}
          </div>

          {/* Floating Add Button */}
          <button
            onClick={() => handleOpenModal()}
            className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-[#30BDF2] text-white shadow-lg flex items-center justify-center hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800 z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Modals - moved outside of the space-y-6 container */}
        {/* Category Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="modal-dark w-full max-w-md p-4">
              <h2 className="text-base font-bold mb-3 text-gray-200">
                {selectedCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Category Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3 py-1.5 border border-gray-700 rounded-md text-xs text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#30BDF2] text-xs text-white rounded-md hover:bg-[#28a8d8] focus:outline-none focus:ring-2 focus:ring-[#30BDF2] focus:ring-offset-2 focus:ring-offset-gray-800"
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
            <div className="modal-dark w-full max-w-md p-4">
              <h2 className="text-base font-bold mb-3 text-gray-200">Delete Category</h2>
              <p className="mb-4 text-sm text-gray-300">
                Are you sure you want to delete the category "<span className="text-white font-medium">{categoryToDelete.name}</span>"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-3 py-1.5 border border-gray-700 rounded-md text-xs text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="px-3 py-1.5 bg-red-600 text-xs text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Delete
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
              <div className="overflow-x-auto">
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
                    {incomeCategories.map(category => (
                      <tr key={category.category_id} className="hover:bg-gray-800">
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
              <div className="overflow-x-auto">
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
                    {expenseCategories.map(category => (
                      <tr key={category.category_id} className="hover:bg-gray-800">
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
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">
                  Category Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30BDF2] appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2388888B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
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
} 