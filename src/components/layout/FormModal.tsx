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
    <BottomSheetModal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-gray-300 transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={submitDisabled}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={!submitDisabled ? {
              background: 'linear-gradient(135deg, #30BDF2 0%, #2DAAE0 100%)',
              boxShadow: '0 4px 12px rgba(48,189,242,0.3)'
            } : {
              background: 'rgba(255,255,255,0.08)'
            }}
          >
            {submitText}
          </button>
        </div>
      </form>
    </BottomSheetModal>
  );
};

export default FormModal;
