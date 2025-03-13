import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  title?: string;
  itemName?: string;
  itemType?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  title = 'Delete Confirmation',
  itemName = 'this item',
  itemType = 'item',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-5 z-50 animate-fadeIn">
      <div className="bg-[#1a2030] rounded-xl w-full max-w-xs animate-scaleIn overflow-hidden">
        <div className="p-6 flex flex-col items-center">
          {/* Trash Icon */}
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <h2 className="text-lg font-bold mb-2 text-white text-center">{title}</h2>
          
          <p className="mb-2 text-sm text-center text-gray-200">
            Are you sure you want to delete this {itemType} <span className="text-white font-medium">"{itemName}"</span>?
          </p>
          
          <p className="text-xs text-gray-400 text-center mb-4">
            This action cannot be undone.
          </p>
        </div>
        
        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="w-full py-4 bg-red-500 text-white font-medium"
        >
          Delete
        </button>
        
        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full py-4 text-center text-white font-medium bg-[#2a3446] border-t border-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 