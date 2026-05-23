import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-[700px]',
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div 
        className={`bg-white w-full rounded-2xl shadow-2xl border border-studio-border relative z-10 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300 ${maxWidthClass}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-studio-border flex-shrink-0 bg-studio-bg/30">
          <h3 className="text-xl font-bold text-studio-text tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-studio-border/60 text-studio-muted hover:text-studio-text transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
