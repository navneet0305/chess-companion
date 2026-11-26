'use client';

import React, { useEffect, useId, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, footer, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Sync React isOpen prop with native <dialog>.showModal() / .close()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Sync native Esc / back-gesture / closedby dismissal back to React state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      if (isOpenRef.current) {
        onCloseRef.current();
      }
    };

    dialog.addEventListener('close', handleClose);

    // Fallback light-dismiss for browsers without <dialog closedby> (e.g., Safari)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const isOutside = (e: PointerEvent) => {
        const rect = dialog.getBoundingClientRect();
        return (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        );
      };
      let pressedOutside = false;
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e) && dialog.open) {
          dialog.close();
        }
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      return () => {
        dialog.removeEventListener('close', handleClose);
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg max-h-[88dvh] rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-0 text-gray-100 shadow-2xl"
    >
      <div className="flex flex-col max-h-[88dvh] w-full">
        {/* Pinned Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          {title && (
            <h1 id={titleId} className="text-lg font-bold text-gray-100 tracking-tight">
              {title}
            </h1>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#242424] hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Body (never clips bottom actions on small mobile viewports) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {/* Optional Pinned Footer */}
        {footer && (
          <div className="flex-shrink-0 px-5 py-3.5 border-t border-[#2a2a2a] bg-[#1a1a1a]">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
