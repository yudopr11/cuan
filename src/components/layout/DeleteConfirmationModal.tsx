import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-5 z-50 animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div className="w-full max-w-xs rounded-3xl overflow-hidden animate-slideUp"
        style={{
          background: 'linear-gradient(135deg, #161e2e 0%, #111827 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.1)'
        }}
      >
        <div className="p-7 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <TrashIcon className="h-7 w-7 text-red-400" />
          </div>

          <h2 className="text-lg font-bold text-white text-center mb-2">{title}</h2>

          <p className="text-sm text-gray-400 text-center mb-1">
            Are you sure you want to delete this {itemType}?
          </p>
          <p className="text-sm font-semibold text-white text-center mb-4">"{itemName}"</p>

          <p className="text-xs text-gray-600 text-center">This action cannot be undone.</p>
        </div>

        <div className="grid grid-cols-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={onClose}
            className="py-4 text-sm font-medium text-gray-300 transition-colors"
            style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="py-4 text-sm font-semibold text-red-400 transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
