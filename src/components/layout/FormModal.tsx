import React from 'react';
import type { ReactNode } from 'react';
import BottomSheetModal from './BottomSheetModal';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  cancelText?: string;
  submitDisabled?: boolean;
  children: ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitText,
  cancelText = 'Cancel',
  submitDisabled = false,
  children,
}) => {
  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 border border-gray-700 rounded-lg text-gray-300 font-medium active:bg-gray-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={submitDisabled}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              submitDisabled 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-[#30BDF2] text-white active:bg-[#28a8d8]'
            }`}
          >
            {submitText}
          </button>
        </div>
      </form>
    </BottomSheetModal>
  );
};

export default FormModal; 