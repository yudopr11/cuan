import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { TransactionTrends } from '../../services/api';
import { formatThousands } from '../../utils/formatters';
import useCurrencyFormatter from '../../hooks/useCurrencyFormatter';
import useTimezone from '../../hooks/useTimezone';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TransactionChartProps {
  trends: TransactionTrends;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
}

const TransactionChart: React.FC<TransactionChartProps> = ({ trends, period }) => {
  const { formatCurrency } = useCurrencyFormatter();
  const { getHourInTimezone, getWeekdayInTimezone, getMonthInTimezone, getDayOfMonthInTimezone } = useTimezone();

  const [datasetVisibility, setDatasetVisibility] = useState({
    income: true,
    expense: true
  });
  const [yAxisMax, setYAxisMax] = useState<number>(100000);

  const parseNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value).replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  // 1. Move Regex outside the function so they only compile ONCE.
const TIMEZONE_REGEX = /Z|[+-]\d{2}:?\d{2}$/;
const HOUR_REGEX = /^(\d{1,2}):/;

// 2. Cache 'today' outside the loop. 
// (If your app stays open for days without refreshing, you can turn this into a memoized getter, 
// but a static string is usually perfectly fine for page load performance).
const TODAY_PREFIX = new Date().toISOString().slice(0, 10);

const formatLabel = (dateStr: string): string => {
  try {
    // Fast UTC string generation
    const utcStr = TIMEZONE_REGEX.test(dateStr) ? dateStr : `${dateStr}Z`;

    // 3. Switch statements are generally faster and easier to read than chained if/else
    switch (period) {
      case 'day': {
        // Date.parse is faster for validity checking than new Date()
        if (!isNaN(Date.parse(utcStr))) {
          return `${getHourInTimezone(utcStr)}h`;
        }
        
        // Time-only fallback
        const hourMatch = dateStr.match(HOUR_REGEX);
        if (hourMatch) {
          const normalized = dateStr.length <= 5 ? `${dateStr}:00` : dateStr;
          const fullUtc = `${TODAY_PREFIX}T${normalized}Z`;
          
          if (!isNaN(Date.parse(fullUtc))) {
            return `${getHourInTimezone(fullUtc)}h`;
          }
          // Parse base-10 to be safe
          return `${parseInt(hourMatch[1], 10)}h`; 
        }
        return dateStr;
      }

      case 'month': {
        if (dateStr.startsWith('Week')) return dateStr;
        if (isNaN(Date.parse(utcStr))) return dateStr;
        
        const weekNum = Math.ceil(getDayOfMonthInTimezone(utcStr) / 7);
        return `Week ${weekNum}`;
      }

      case 'week':
        if (isNaN(Date.parse(utcStr))) return dateStr;
        return getWeekdayInTimezone(utcStr);

      case 'year':
        if (isNaN(Date.parse(utcStr))) return dateStr;
        return getMonthInTimezone(utcStr);

      case 'all': {
        const date = new Date(utcStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.getFullYear().toString();
      }

      default:
        return dateStr;
    }
  } catch {
    return dateStr;
  }
};

  const hasData = trends && trends.trends && trends.trends.length > 0;

  const processedTrends = hasData
    ? trends.trends.map(item => ({
        date: item.date,
        income: parseNumber(item.income),
        expense: parseNumber(item.expense),
        transfer: parseNumber(item.transfer),
        net: parseNumber(item.net)
      }))
    : [];

  const calculateMeans = () => {
    if (!processedTrends.length) return { meanIncome: 0, meanExpense: 0 };
    const totalIncome = processedTrends.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = processedTrends.reduce((sum, item) => sum + item.expense, 0);
    return {
      meanIncome: totalIncome / processedTrends.length,
      meanExpense: totalExpense / processedTrends.length
    };
  };

  const { meanIncome, meanExpense } = calculateMeans();

  useEffect(() => {
    if (!hasData || processedTrends.length === 0) {
      setYAxisMax(100000);
      return;
    }
    let newMax = 0;
    if (datasetVisibility.income) {
      const incomeMax = Math.max(...processedTrends.map(item => item.income));
      if (incomeMax > newMax) newMax = incomeMax;
    }
    if (datasetVisibility.expense) {
      const expenseMax = Math.max(...processedTrends.map(item => item.expense));
      if (expenseMax > newMax) newMax = expenseMax;
    }
    if (!datasetVisibility.income && !datasetVisibility.expense) {
      newMax = 100000;
    } else {
      newMax = newMax * 1.2;
    }
    setYAxisMax(newMax);
  }, [datasetVisibility, hasData, processedTrends]);

  if (!hasData || processedTrends.length === 0) {
    return (
      <div className="h-64 sm:h-72 md:h-80 w-full flex items-center justify-center bg-gray-800/30 rounded-xl">
        <p className="text-gray-400 text-center">No transaction data available for this period</p>
      </div>
    );
  }

  const handleLegendClick = (datasetIndex: number) => {
    if (datasetIndex === 0) {
      setDatasetVisibility(prev => ({ ...prev, income: !prev.income }));
    } else if (datasetIndex === 1) {
      setDatasetVisibility(prev => ({ ...prev, expense: !prev.expense }));
    }
  };

  const labels = processedTrends.map(item => formatLabel(item.date));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: processedTrends.map(item => item.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        fill: true,
        hidden: !datasetVisibility.income,
      },
      {
        label: 'Expense',
        data: processedTrends.map(item => item.expense),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        fill: true,
        hidden: !datasetVisibility.expense,
      }
    ],
  };

  function getPeriodTitle(p: 'day' | 'week' | 'month' | 'year' | 'all'): string {
    switch (p) {
      case 'day': return 'Today (by Hour)';
      case 'week': return 'This Week (by Day)';
      case 'month': return 'This Month (by Week)';
      case 'year': return 'This Year (by Month)';
      case 'all': return 'All Time (by Year)';
    }
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
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
          font: { size: 12 },
          boxWidth: 12,
          padding: 10,
        },
        onClick: (_, legendItem) => {
          handleLegendClick(legendItem.datasetIndex as number);
        }
      },
      title: {
        display: true,
        text: getPeriodTitle(period),
        color: '#d1d5db',
        font: { size: 16 },
        padding: { bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            label += formatCurrency(context.raw as number);
            return label;
          }
        }
      }
    },
  };

  return (
    <div className="flex flex-col">
      <div className="h-64 sm:h-72 md:h-80 w-full">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 flex justify-center gap-8 text-xs">
        {datasetVisibility.income && (
          <div className="flex items-center">
            <span className="text-gray-300 mr-1">Mean Income:</span>
            <span className="font-medium text-green-400">{formatCurrency(meanIncome)}</span>
          </div>
        )}
        {datasetVisibility.expense && (
          <div className="flex items-center">
            <span className="text-gray-300 mr-1">Mean Expense:</span>
            <span className="font-medium text-red-400">{formatCurrency(meanExpense)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionChart;
