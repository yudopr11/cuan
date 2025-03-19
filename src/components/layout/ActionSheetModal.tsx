import React, { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ActionItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  textColor?: string;
}

interface ActionSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  actions: ActionItem[];
}

const ActionSheetModal: React.FC<ActionSheetModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  actions,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-end z-50 animate-fadeIn">
      
      <div className="bg-gray-900 px-2 pt-2 rounded-t-2xl overflow-hidden animate-slideUp">
        {/* Handle indicator for bottom sheet */}
        <div className="flex justify-center mb-2">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full my-2"></div>
        </div>

        {/* Title section (optional) */}
        {(title || subtitle) && (
          <div className="px-4 text-center">
            {title && <h2 className="text-lg font-bold text-gray-200">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-400 capitalize">{subtitle}</p>}
          </div>
        )}

        {/* Action items */}
        {actions.map((action, index) => (
          <div key={action.id} className={index > 0 ? "border-t border-gray-800" : ""}>
            <button
              onClick={action.onClick}
              className={`w-full py-4 px-5 flex items-center text-left ${action.textColor || 'text-gray-200'} active:bg-gray-800`}
            >
              {action.icon && <span className="mr-3">{action.icon}</span>}
              {action.label}
            </button>
          </div>
        ))}

        {/* Cancel button */}
        <div className="border-t border-gray-800 p-6">
          <button
            onClick={onClose}
            className="w-full py-3 border border-gray-700 rounded-lg text-gray-300 font-medium active:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      
      {/* Backdrop for closing by tapping outside */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

export default ActionSheetModal; 