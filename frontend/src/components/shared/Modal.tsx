import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  showBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showBackdrop = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {showBackdrop && (
	        <div
	          className="modal-backdrop-in fixed inset-0 z-40 bg-white/75 backdrop-blur-2xl"
          onClick={onClose}
        ></div>
      )}

      {/* Modal */}
      <div
	        className="modal-slide-up pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      >
        <div
          className={`
            pointer-events-auto
	            max-h-[92vh] w-full max-w-lg
            rounded-2xl border border-slate-200
            bg-white/95 shadow-2xl
            backdrop-blur-xl
            overflow-hidden
            ${className}
          `}
        >
          {/* Header */}
	          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
	            <h2 className="min-w-0 break-words text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
	            <button
	              onClick={onClose}
	              className="no-hover-lift shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
	          <div className="max-h-[72vh] overflow-y-auto px-5 py-4 sm:px-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className = '',
}: DrawerProps) {
  if (!isOpen) return null;

  const positionClasses = {
    left: 'left-0 animate-drawer-in-left',
    right: 'right-0 animate-drawer-in-right',
  };

  return (
    <>
      {/* Backdrop */}
	      <div
	        className="modal-backdrop-in fixed inset-0 z-40 bg-white/75 backdrop-blur-2xl"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`
	          fixed top-0 bottom-0 w-full max-w-md
          ${positionClasses[position]}
          bg-white/95 shadow-2xl backdrop-blur-xl
          z-50 overflow-y-auto
          border-l border-slate-200
          ${className}
        `}
      >
        {/* Header */}
	        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
	          <h2 className="min-w-0 break-words text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
	          <button
	            onClick={onClose}
	            className="no-hover-lift shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </>
  );
}
