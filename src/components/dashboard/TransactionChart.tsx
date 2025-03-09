import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { TransactionTrends } from '../../services/api';
import { formatThousands } from '../../utils/formatters';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TransactionChartProps {
  trends: TransactionTrends;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
}

const TransactionChart: React.FC<TransactionChartProps> = ({ trends, period }) => {
  // Use the currency formatter hook
  const { formatCurrency } = useCurrencyFormatter();
  
  // Helper function to convert string values to numbers safely
  const parseNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    
    // Try to parse as number
    const parsed = parseFloat(String(value).replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (period === 'day') {
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      } else if (period === 'week') {
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      } else if (period === 'year') {
        return date.toLocaleDateString('en-US', { month: 'short' });
      } else if (period === 'all') {
        return date.getFullYear().toString();
      }
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch (e) {
      return dateStr; // Return original string if date parsing fails
    }
  };

  // Group data by week when period is month
  const groupDataByWeek = (data: TransactionTrends['trends']) => {
    if (!data || data.length === 0) {
      // Return empty array if no data
      return [];
    }
    
    if (period !== 'month') {
      // Convert string values to numbers for non-month periods too
      return data.map(item => ({
        date: item.date,
        income: parseNumber(item.income),
        expense: parseNumber(item.expense),
        transfer: parseNumber(item.transfer),
        net: parseNumber(item.net)
      }));
    }

    const weeklyData = data.reduce((acc, curr) => {
      try {
        const date = new Date(curr.date);
        const weekNumber = Math.ceil(date.getDate() / 7);
        const weekKey = `Week ${weekNumber}`;
        
        if (!acc[weekKey]) {
          acc[weekKey] = { 
            date: weekKey, 
            income: 0, 
            expense: 0, 
            transfer: 0, 
            net: 0 
          };
        }
        
        // Convert string values to numbers before adding
        acc[weekKey].income += parseNumber(curr.income);
        acc[weekKey].expense += parseNumber(curr.expense);
        acc[weekKey].transfer += parseNumber(curr.transfer);
        acc[weekKey].net += parseNumber(curr.net);
      } catch (e) {
        // Silently handle errors
      }
      
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number; transfer: number; net: number; }>);

    const result = Object.entries(weeklyData).map(([week, data]) => ({
      date: week,
      income: data.income,
      expense: data.expense,
      transfer: data.transfer,
      net: data.net
    }));
    
    return result;
  };

  // Check if we have valid data
  const hasData = trends && trends.trends && trends.trends.length > 0;
  
  // Process the data only if we have some
  const groupedTrends = hasData ? groupDataByWeek(trends.trends) : [];
  
  // If no data, show appropriate message
  if (!hasData || groupedTrends.length === 0) {
    return (
      <div className="h-64 sm:h-72 md:h-80 w-full flex items-center justify-center">
        <p className="text-gray-400 text-center">No transaction data available for this period</p>
      </div>
    );
  }

  const chartData = {
    labels: period === 'month' 
      ? groupedTrends.map(item => item.date)
      : groupedTrends.map(item => formatShortDate(item.date)),
    datasets: [
      {
        label: 'Income',
        data: groupedTrends.map(item => item.income),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Expense',
        data: groupedTrends.map(item => item.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }
    ],
  };

  // Calculate maximum value for y-axis
  const maxValue = Math.max(
    ...groupedTrends.map(item => Math.max(parseNumber(item.income), parseNumber(item.expense)))
  );
  
  // Add a small buffer (10%) to the max value for better visualization
  const yAxisMax = maxValue > 0 ? maxValue * 1.1 : 100000;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10,
          },
          callback: function(value) {
            return formatThousands(Number(value));
          }
        },
        min: 0,
        max: yAxisMax,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#d1d5db',
          font: {
            size: 12,
          },
          boxWidth: 12,
          padding: 10,
        },
      },
      title: {
        display: true,
        text: getPeriodTitle(period),
        color: '#d1d5db',
        font: {
          size: 16,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatCurrency(context.raw as number);
            return label;
          }
        }
      }
    },
  };

  function getPeriodTitle(period: 'day' | 'week' | 'month' | 'year' | 'all'): string {
    switch (period) {
      case 'day':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      case 'all':
        return 'All Time';
      default:
        return '';
    }
  }

  return (
    <div className="h-64 sm:h-72 md:h-80 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TransactionChart; 