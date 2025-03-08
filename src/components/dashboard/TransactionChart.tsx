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
import { formatThousands } from '../../utils/formatters.js';
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
  
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === 'day') {
      // Don't display hours for day period
      return '';
    } else if (period === 'week') {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } else if (period === 'year') {
      return date.toLocaleDateString('en-US', { month: 'short' });
    } else if (period === 'all') {
      return date.getFullYear().toString();
    }
    return dateStr;
  };

  // Group data by week when period is month
  const groupDataByWeek = (data: TransactionTrends['trends']) => {
    if (period !== 'month') return data;

    const weeklyData = data.reduce((acc, curr) => {
      const date = new Date(curr.date);
      const weekNumber = Math.ceil(date.getDate() / 7);
      const weekKey = `Week ${weekNumber}`;
      
      if (!acc[weekKey]) {
        acc[weekKey] = { date: curr.date, income: 0, expense: 0 };
      }
      
      acc[weekKey].income += curr.income;
      acc[weekKey].expense += curr.expense;
      
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number; }>);

    return Object.entries(weeklyData).map(([week, data]) => ({
      date: week,
      income: data.income,
      expense: data.expense
    }));
  };

  const groupedTrends = groupDataByWeek(trends.trends);

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
        barPercentage: period === 'month' ? 0.8 : 0.6,
        categoryPercentage: period === 'month' ? 0.9 : 0.7,
      },
      {
        label: 'Expense',
        data: groupedTrends.map(item => item.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: period === 'month' ? 0.8 : 0.6,
        categoryPercentage: period === 'month' ? 0.9 : 0.7,
      }
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
          display: period !== 'day',
        },
      },
      y: {
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