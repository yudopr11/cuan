import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-700/50 rounded-md ${className}`}></div>
  );
};

export const DashboardMobileSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 px-1 pb-16">
      {/* Period Selector Skeleton */}
      <div className="px-2 py-3">
        <div className="w-full bg-slate-800/80 rounded-full p-1.5 shadow-lg h-14"></div>
      </div>

      {/* Financial Summary Skeleton */}
      <div className="grid grid-cols-2 gap-3 px-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-dark p-4 rounded-xl shadow-lg bg-gradient-to-br from-gray-800 to-gray-900">
            <Skeleton className="h-3 w-16 mb-3" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>

      {/* Stats Skeleton */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex border-b border-gray-700/50 mb-4">
          <div className="flex-1 px-4 py-3.5 font-medium text-sm">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex-1 px-4 py-3.5 font-medium text-sm">
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>

        <div className="px-3 pb-4">
          <div className="h-64 w-full rounded-lg overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
      
      {/* Recent Transactions Skeleton */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div>
          {[...Array(5)].map((_, i, arr) => (
            <div 
              key={i} 
              className={`py-3.5 px-4 flex items-center justify-between ${i < arr.length - 1 ? 'border-b border-gray-700/50' : ''}`}
            >
              <div className="flex items-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="ml-3.5">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Accounts Skeleton */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center p-4 border-t border-gray-700/50">
              <div className="flex items-center">
                <Skeleton className="w-9 h-9 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardDesktopSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Period Selector Skeleton */}
      <div className="flex justify-end">
        <Skeleton className="w-96 h-12 rounded-lg" />
      </div>

      {/* Row 1: Financial Summary Skeleton */}
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-dark p-5">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-28 mb-3" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      
      {/* Row 2: Transaction Trends and Category Distribution Skeleton */}
      <div className="grid grid-cols-12 gap-6">
        {/* Transaction Trends Skeleton */}
        <div className="card-dark col-span-7 p-5">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="h-80 w-full rounded-lg overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
        </div>

        {/* Category Distribution Skeleton */}
        <div className="card-dark col-span-5 p-5">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-40 rounded-md" />
          </div>
          <div className="text-right mb-4">
            <Skeleton className="h-5 w-24 ml-auto" />
          </div>
          <div className="h-64 w-full rounded-lg overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>

      {/* Row 3: Accounts and Recent Transactions Skeleton */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Transactions Skeleton */}
        <div className="card-dark p-5">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i, arr) => (
              <div key={i} className={`py-3 flex items-center justify-between ${i < arr.length - 1 ? 'border-b border-gray-700' : ''}`}>
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="ml-4">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Account Summary Skeleton */}
        <div className="card-dark p-5">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-2 border-b border-gray-700">
                <div>
                  <Skeleton className="h-5 w-36 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3">
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TransactionsDesktopSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Add Transaction Button Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="w-32 h-10 rounded-md" />
      </div>
      
      {/* Filter Section */}
      <div className="bg-gray-900 shadow-md rounded-lg mb-6 p-4 border border-gray-800">
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex items-end">
            <Skeleton className="h-10 w-24 rounded-md mr-2" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
      
      {/* Transaction Table */}
      <div className="bg-gray-900 shadow-md rounded-lg overflow-hidden mb-6 border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-3 text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900">
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between bg-gray-900 shadow-md rounded-lg p-4 border border-gray-800">
        <div className="flex items-center">
          <Skeleton className="h-8 w-24 rounded-md mr-2" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-8 w-24 rounded-md mr-2" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const TransactionsMobileSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 px-1 pb-16">
      {/* Filter Bar Skeleton */}
      <div className="px-2">
        <div className="card-dark rounded-xl p-3 shadow-lg bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-12" />
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      </div>
      
      {/* Section Title Skeleton */}
      <div className="px-3 pt-2">
        <Skeleton className="h-4 w-28" />
      </div>
      
      {/* Transactions List Skeleton */}
      <div className="px-2">
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card-dark flex items-center p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
              <Skeleton className="w-10 h-10 rounded-full" />
              
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-20" />
                </div>
                
                <div className="flex justify-between mt-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
          
          {/* Pagination Controls Skeleton */}
          <div className="flex justify-between pt-2 pb-4 px-2">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Floating Add Button Skeleton */}
      <div className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gray-700 animate-pulse"></div>
      
    </div>
  );
};

export const AccountsDesktopSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Add Account Button Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="w-32 h-10 rounded-md" />
      </div>

      {/* Total Balance and Credit Card Payable Cards Skeleton */}
      <div className="grid grid-cols-2 gap-6">
        {/* Total Balance Skeleton */}
        <div className="card-dark p-5">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-9 w-40" />
        </div>
        
        {/* Credit Card Payable Skeleton */}
        <div className="card-dark p-5">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      {/* Accounts Table Skeleton */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark min-w-full">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-28" />
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-48" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-5 w-24 ml-auto" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-5 w-24 ml-auto" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <Skeleton className="h-5 w-20 inline-block ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AccountsMobileSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 px-1 pb-16">
      {/* Summary Cards Skeleton */}
      <div className="flex flex-col space-y-3 px-2 pt-3">
        {/* Total Balance Card Skeleton */}
        <div className="card-dark rounded-xl shadow-lg p-4 bg-gradient-to-br from-gray-800 to-gray-900">
          <Skeleton className="h-3 w-24 mb-1.5" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        {/* Credit Card Payable Skeleton */}
        <div className="card-dark rounded-xl shadow-lg p-4 bg-gradient-to-br from-gray-800 to-gray-900">
          <Skeleton className="h-3 w-32 mb-1.5" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Section Title Skeleton */}
      <div className="px-3 pt-2">
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Accounts List Skeleton */}
      <div className="space-y-3 px-2">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="card-dark rounded-xl shadow-lg p-4 bg-gradient-to-b from-gray-800 to-gray-900"
          >
            {/* Account Info Skeleton */}
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Skeleton className="w-9 h-9 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-24 ml-auto mb-1" />
                <Skeleton className="h-3 w-20 ml-auto" />
              </div>
            </div>
            
            {/* Description Skeleton (displayed on some accounts) */}
            {i % 2 === 0 && (
              <div className="mt-2 pl-12">
                <Skeleton className="h-3 w-48" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Floating Add Button Skeleton */}
      <div className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gray-700 animate-pulse"></div>
    </div>
  );
};

export const CategoryDesktopSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Add Category Button Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="w-32 h-10 rounded-md" />
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="card-dark overflow-hidden">
          <div className="bg-green-900 px-6 py-4 border-b border-gray-700 rounded-lg mb-4">
            <Skeleton className="h-6 w-40" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 table-dark">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Skeleton className="h-5 w-24 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          
        {/* Expense Categories */}
        <div className="card-dark overflow-hidden">
          <div className="bg-red-900 px-6 py-4 border-b border-gray-700 rounded-lg mb-4">
            <Skeleton className="h-6 w-40" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 table-dark">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[...Array(7)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Skeleton className="h-5 w-24 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryMobileSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 px-1 pb-16">
      {/* Tab Bar Skeleton */}
      <div className="px-2 py-3">
        <div className="w-full bg-slate-800/80 rounded-full p-1.5 shadow-lg h-14"></div>
      </div>

      {/* Categories List Skeleton */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
          <Skeleton className="h-5 w-40" />
        </div>
        
        <div className="divide-y divide-gray-700/50">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="p-4 flex justify-between items-center"
            >
              <div className="flex items-center">
                <Skeleton className="w-9 h-9 rounded-full mr-3" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Floating Add Button Skeleton */}
      <div className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gray-700 animate-pulse"></div>
    </div>
  );
};