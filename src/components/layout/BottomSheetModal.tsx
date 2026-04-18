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
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex flex-col justify-end z-50 animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-t-3xl px-2 pt-2 pb-8 animate-slideUp flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #161e2e 0%, #111827 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderBottom: 'none',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
          maxHeight: '90vh',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-3 shrink-0">
          <div className="w-10 h-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
        </div>

        <div className="overflow-y-auto grow">
          {title && (
            <div className="px-4 mb-4 text-center">
              <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
          )}
          <div className="px-4 py-2">
            {children}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10" onClick={closeOnBackdropClick ? onClose : undefined} />
    </div>
  );
};

export default BottomSheetModal;
