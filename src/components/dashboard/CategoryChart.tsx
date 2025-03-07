import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { CategoryDistribution } from '../../services/api';
import { formatThousands } from '../../utils/formatters.js';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface CategoryChartProps {
  categoryData: CategoryDistribution;
  type: 'income' | 'expense';
}

const CategoryChart: React.FC<CategoryChartProps> = ({ categoryData, type }) => {
  const { formatCurrency } = useCurrencyFormatter();

  const chartData = {
    labels: categoryData.categories.map(category => category.name),
    datasets: [
      {
        data: categoryData.categories.map(category => category.total),
        backgroundColor: type === 'expense' 
          ? [
              'rgba(239, 68, 68, 0.9)',   // red-500
              'rgba(239, 68, 68, 0.8)',
              'rgba(239, 68, 68, 0.7)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(239, 68, 68, 0.5)',
            ]
          : [
              'rgba(34, 197, 94, 0.9)',    // green-500
              'rgba(34, 197, 94, 0.8)',
              'rgba(34, 197, 94, 0.7)',
              'rgba(34, 197, 94, 0.6)',
              'rgba(34, 197, 94, 0.5)',
            ],
        borderColor: type === 'expense' 
          ? 'rgb(239, 68, 68)'    // red-500
          : 'rgb(34, 197, 94)',   // green-500
        borderWidth: 1,
      }
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#d1d5db',
          font: {
            size: 12
          },
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const percentage = ((value / categoryData.total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="h-64">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default CategoryChart; 