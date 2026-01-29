import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Modal from '../Modal/Modal';
import './DialogProvider.css';

const DialogContext = createContext(null);

export const DialogProvider = ({ children }) => {
  const queueRef = useRef([]);
  const [dialog, setDialog] = useState(null);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift();
    if (!next) {
      setDialog(null);
      return;
    }
    setDialog(next);
  }, []);

  const enqueue = useCallback((item) => {
    queueRef.current.push(item);
    if (!dialog) {
      showNext();
    }
  }, [dialog, showNext]);

  const alert = useCallback((message, options = {}) => {
    const { title = 'Message', okText = 'OK' } = options;
    return new Promise((resolve) => {
      enqueue({
        type: 'alert',
        title,
        message: String(message ?? ''),
        okText,
        resolve,
      });
    });
  }, [enqueue]);

  const confirm = useCallback((message, options = {}) => {
    const { title = 'Confirm', okText = 'OK', cancelText = 'Cancel' } = options;
    return new Promise((resolve) => {
      enqueue({
        type: 'confirm',
        title,
        message: String(message ?? ''),
        okText,
        cancelText,
        resolve,
      });
    });
  }, [enqueue]);

  const close = useCallback(() => {
    if (!dialog) return;
    if (dialog.type === 'confirm') {
      dialog.resolve(false);
    } else {
      dialog.resolve();
    }
    showNext();
  }, [dialog, showNext]);

  const ok = useCallback(() => {
    if (!dialog) return;
    if (dialog.type === 'confirm') {
      dialog.resolve(true);
    } else {
      dialog.resolve();
    }
    showNext();
  }, [dialog, showNext]);

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Modal isOpen={!!dialog} onClose={close} title={dialog?.title || ''} size="small">
        <div className="dialog-message">
          {dialog?.message}
        </div>
        <div className="modal-footer">
          {dialog?.type === 'confirm' && (
            <button type="button" className="btn-cancel" onClick={close}>
              {dialog.cancelText || 'Cancel'}
            </button>
          )}
          <button type="button" className="dialog-btn-primary" onClick={ok}>
            {dialog?.okText || 'OK'}
          </button>
        </div>
      </Modal>
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return ctx;
};

