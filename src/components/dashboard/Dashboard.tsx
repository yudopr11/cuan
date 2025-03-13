import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getFinancialSummary,
  getAccountSummary,
  getAllTransactions,
  getCategoryDistribution,
  getTransactionTrends
} from '../../services/api';
import type {
  FinancialSummary,
  AccountSummary,
  Transaction,
  CategoryDistribution,
  TransactionTrends
} from '../../services/api';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import usePageTitle from '../../hooks/usePageTitle';
import DashboardMobile from './DashboardMobile';
import DashboardDesktop from './DashboardDesktop';

interface DashboardProps {
  isMobile: boolean;
}

export default function Dashboard({ isMobile }: DashboardProps) {
  usePageTitle('Dashboard');

  // Base Dashboard State
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  // Statistics State
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');
  const [categoryData, setCategoryData] = useState<CategoryDistribution | null>(null);
  const [trends, setTrends] = useState<TransactionTrends | null>(null);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  
  // Error tracking
  const [errors, setErrors] = useState<{
    financial: boolean;
    accounts: boolean;
    transactions: boolean;
    categories: boolean;
    trends: boolean;
  }>({
    financial: false,
    accounts: false,
    transactions: false,
    categories: false,
    trends: false
  });

  // Use the currency formatter hook
  const { formatCurrency } = useCurrencyFormatter();

  // Initial data fetch and period changes
  useEffect(() => {
    const fetchData = async () => {
      await fetchInitialDashboardData();
      await fetchPeriodRelatedData();
      await fetchCategoryData();
      setIsInitialLoading(false);
    };
    fetchData();
  }, []);

  // Refresh data when period changes
  useEffect(() => {
    if (!isInitialLoading) {
      fetchPeriodRelatedData();
      fetchCategoryData();
    }
  }, [period]);

  // Refresh category data when type changes
  useEffect(() => {
    if (!isInitialLoading && categoryType) {
      fetchCategoryData();
    }
  }, [categoryType]);

  const fetchCategoryData = async () => {
    try {
      const categoryDistributionData = await getCategoryDistribution({ 
        transaction_type: categoryType,
        period
      });
      setCategoryData(categoryDistributionData);
      setErrors(prev => ({ ...prev, categories: false }));
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      setErrors(prev => ({ ...prev, categories: true }));
      toast.error('Failed to load category distribution data');
    }
  };

  // Fetch data that should only be loaded once at initialization
  const fetchInitialDashboardData = async () => {
    let hasErrors = false;
    
    // Fetch account summary with transactions included
    try {
      const accounts = await getAccountSummary({
        include_transactions: false
      });
      setAccountSummary(accounts);
      setErrors(prev => ({ ...prev, accounts: false }));
    } catch (error) {
      console.error('Error fetching account summary:', error);
      setErrors(prev => ({ ...prev, accounts: true }));
      hasErrors = true;
    }

    // Fetch recent transactions with period filter
    try {
      const transactions = await getAllTransactions({ 
        limit: 5, 
        skip: 0,
        date_filter_type: period === 'all' ? undefined : period
      });
      setRecentTransactions(transactions.data);
      setErrors(prev => ({ ...prev, transactions: false }));
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      setErrors(prev => ({ ...prev, transactions: true }));
      hasErrors = true;
    }
    
    // Show general error toast if any of the requests failed
    if (hasErrors) {
      toast.error('Some dashboard data could not be loaded. Please try refreshing the page.');
    }
  };

  // Fetch data that should update when the period changes
  const fetchPeriodRelatedData = async () => {
    setIsRefreshing(true);
    let hasErrors = false;
    
    // Fetch financial summary for selected period
    try {
      const summary = await getFinancialSummary({ period });
      setFinancialSummary(summary);
      setErrors(prev => ({ ...prev, financial: false }));
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      setErrors(prev => ({ ...prev, financial: true }));
      hasErrors = true;
    }
    
    // Fetch transaction trends with appropriate grouping
    try {
      const groupBy = period === 'day' ? 'day' : 
                     period === 'week' ? 'day' : 
                     period === 'month' ? 'week' : 
                     period === 'year' ? 'month' : 'year';
      
      const trendsData = await getTransactionTrends({ 
        period,
        group_by: groupBy
      });
      
      setTrends(trendsData);
      setErrors(prev => ({ ...prev, trends: false }));
    } catch (error) {
      console.error('Error fetching transaction trends:', error);
      setErrors(prev => ({ ...prev, trends: true }));
      hasErrors = true;
    }

    setIsRefreshing(false);
    
    // Show general error toast if any of the requests failed
    if (hasErrors) {
      toast.error('Some dashboard data could not be loaded. Please try refreshing the page.');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month' | 'year' | 'all') => {
    setPeriod(newPeriod);
  };

  // Handle category type change
  const handleCategoryTypeChange = (type: 'income' | 'expense') => {
    setCategoryType(type);
  };

  // Common props for both mobile and desktop components
  const dashboardProps = {
    isInitialLoading,
    isRefreshing,
    financialSummary,
    accountSummary,
    recentTransactions,
    period,
    categoryData,
    trends,
    categoryType,
    errors,
    handlePeriodChange,
    handleCategoryTypeChange,
    formatDate,
    formatCurrency
  };

  // Render either mobile or desktop based on the isMobile prop
  return isMobile 
    ? <DashboardMobile {...dashboardProps} /> 
    : <DashboardDesktop {...dashboardProps} />;
} 