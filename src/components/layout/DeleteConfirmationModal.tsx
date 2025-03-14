import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

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
            <TrashIcon className="h-10 w-10" />
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