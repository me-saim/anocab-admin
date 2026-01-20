import React from 'react';
import ReactDOM from 'react-dom';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  const dialogContent = (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>{cancelText}</button>
          <button type="button" className="btn-confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(dialogContent, document.body);
};

export default ConfirmDialog;
