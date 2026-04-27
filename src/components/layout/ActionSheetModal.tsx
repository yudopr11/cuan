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
  description?: string;
  actions: ActionItem[];
}

const ActionSheetModal: React.FC<ActionSheetModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  actions,
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
      <div className="rounded-t-3xl overflow-hidden animate-slideUp"
        style={{
          background: 'linear-gradient(180deg, #161e2e 0%, #111827 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderBottom: 'none',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)'
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 mb-1">
          <div className="w-10 h-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
        </div>

        {(title || subtitle || description) && (
          <div className="px-5 pt-2 pb-3 text-center"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {title && <h2 className="text-base font-bold text-white">{title}</h2>}
            {subtitle && <p className="text-xs text-gray-400 capitalize mt-0.5">{subtitle}</p>}
            {description && <p className="text-xs text-gray-500 mt-1 px-4 break-words">{description}</p>}
          </div>
        )}

        <div className="py-1">
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`w-full py-4 px-5 flex items-center text-left transition-colors ${action.textColor || 'text-gray-200'}`}
              style={index > 0 ? { borderTop: '1px solid rgba(255,255,255,0.04)' } : {}}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {action.icon && <span className="mr-4">{action.icon}</span>}
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-gray-300 transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default ActionSheetModal;
