import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import type { Category, CategoryCreate } from '../../services/api';
import usePageTitle from '../../hooks/usePageTitle';
import CategoriesMobile from './CategoriesMobile';
import CategoriesDesktop from './CategoriesDesktop';

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

  // Pass shared props to the appropriate component based on isMobile
  const sharedProps = {
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
  };

  if (isMobile) {
    return (
      <CategoriesMobile 
        {...sharedProps}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />
    );
  }

  return <CategoriesDesktop {...sharedProps} />;
} 