import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal_backdrop fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4">
      <div 
        className="modal_container relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        <div className="modal_header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="modal_title text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="modal_close_btn p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="close_icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal_body flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}