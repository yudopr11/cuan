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

/**
 * Generates an array of colors with different hues based on the type and count
 * @param type - 'income' or 'expense'
 * @param count - Number of colors to generate
 * @returns Array of colors in rgba format
 */
const generateColors = (type: 'income' | 'expense', count: number) => {
  // Base colors
  const baseColor = type === 'expense' 
    ? { r: 239, g: 68, b: 68 }    // red-500 for expenses
    : { r: 34, g: 197, b: 94 };   // green-500 for income
  
  // For small counts, just use opacity variations of the base color
  if (count <= 5) {
    return Array.from({ length: count }, (_, i) => {
      const opacity = 0.9 - (i * 0.1);
      return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
    });
  }
  
  // For larger counts, we need more color variation
  // Generate colors with different hues based on the type
  return Array.from({ length: count }, (_, i) => {
    // For expenses: red to orange to purple spectrum
    // For income: green to teal to blue spectrum
    let r, g, b;
    
    if (type === 'expense') {
      // Red to orange to purple spectrum
      const hueShift = (i / count) * 60; // 0 to 60 degrees shift
      
      // Adjust the base red towards orange/purple
      r = Math.max(180, baseColor.r - hueShift * 1.5);
      g = Math.max(20, Math.min(180, baseColor.g + hueShift * 1.2));
      b = Math.max(20, Math.min(200, baseColor.b + (i > count/2 ? hueShift * 3 : 0)));
    } else {
      // Green to teal to blue spectrum
      const hueShift = (i / count) * 60; // 0 to 60 degrees shift
      
      // Adjust the base green towards teal/blue
      r = Math.max(20, Math.min(150, baseColor.r + (i > count/2 ? hueShift * 1.5 : 0)));
      g = Math.max(150, baseColor.g - hueShift * 0.8);
      b = Math.max(20, Math.min(220, baseColor.b + hueShift * 2));
    }
    
    // Add slight opacity variation
    const opacity = 0.7 + (0.3 * (i % 3) / 2);
    
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${opacity})`;
  });
};

const CategoryChart: React.FC<CategoryChartProps> = ({ categoryData, type }) => {
  const { formatCurrency } = useCurrencyFormatter();

  // Generate colors based on the number of categories
  const colors = generateColors(type, categoryData.categories.length);
  // Base border color
  const borderColor = type === 'expense' ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)';

  const chartData = {
    labels: categoryData.categories.map(category => category.name),
    datasets: [
      {
        data: categoryData.categories.map(category => category.total),
        backgroundColor: colors,
        borderColor: borderColor,
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