import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '36px',
        position: 'relative',
        background: 'var(--bg-dark)',
        border: '2px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-muted)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
