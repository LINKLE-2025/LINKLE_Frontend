import React from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return createPortal(
    <div className='fixed inset-0 z-[10000] flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-lg p-6 w-[300px]'>
        <p className='mb-4 text-center'>{message}</p>
        <div className='flex justify-between'>
          <button onClick={onConfirm} className='px-4 py-2 bg-blue-500 text-white rounded'>
            확인
          </button>
          <button onClick={onCancel} className='px-4 py-2 border rounded'>
            취소
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
