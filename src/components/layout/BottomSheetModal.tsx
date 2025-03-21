import React, { useEffect } from 'react';
import type { ReactNode } from 'react';

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  closeOnBackdropClick?: boolean;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnBackdropClick = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // Re-enable scrolling when component unmounts or modal closes
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-end z-50 animate-fadeIn">
      <div 
        className="bg-gray-900 rounded-t-2xl px-2 pt-2 pb-6 transform transition-all animate-slideUp"
        style={{ 
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Handle indicator for bottom sheet - fixed at top */}
        <div className="flex justify-center mb-2 flex-shrink-0">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full my-2"></div>
        </div>
        
        {/* Scrollable container for title and content */}
        <div className="overflow-y-auto flex-grow">
          {/* Title (optional) */}
          {title && (
            <div className="px-4 mb-2 text-center">
              <h2 className="text-xl font-bold text-gray-200">{title}</h2>
            </div>
          )}
          
          {/* Content */}
          <div className="px-4 py-2">
            {children}
          </div>
        </div>
      </div>
      
      {/* Backdrop for closing by tapping outside */}
      <div className="absolute inset-0 -z-10" onClick={handleBackdropClick}></div>
    </div>
  );
};

export default BottomSheetModal; 