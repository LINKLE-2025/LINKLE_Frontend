import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button"
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
        <div className="flex justify-between">
          <Button onClick={onConfirm}>확인</Button>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
