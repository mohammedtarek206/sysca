import React, { useState, useEffect } from 'react';
import api from '../api';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={18} color="var(--warning)" />;
      case 'success': return <CheckCircle size={18} color="var(--success)" />;
      case 'error': return <XCircle size={18} color="var(--error)" />;
      default: return <Info size={18} color="var(--primary)" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '300px', // Beside sidebar
      width: '350px',
      maxHeight: '500px',
      background: 'var(--bg-sidebar)',
      border: '1px solid var(--card-border)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bell size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{t('notifications.title')}</h3>
        </div>
        <button onClick={clearAll} style={{ fontSize: '0.8rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {t('notifications.clearAll')}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
            <Bell size={32} style={{ opacity: 0.2, marginBottom: '10px' }} />
            <p>{t('notifications.empty')}</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n._id} style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              background: n.isRead ? 'transparent' : 'rgba(255,255,255,0.03)', 
              marginBottom: '8px',
              border: '1px solid',
              borderColor: n.isRead ? 'transparent' : 'var(--card-border)',
              transition: 'var(--transition-smooth)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ marginTop: '3px' }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)' }}>{n.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '8px', display: 'block' }}>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)} style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: 'none', padding: '4px', borderRadius: '50%', cursor: 'pointer', height: '24px', width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <button onClick={onClose} style={{ padding: '12px', background: 'var(--glass)', border: 'none', borderTop: '1px solid var(--card-border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
        {t('common.close')}
      </button>
    </div>
  );
};

export default NotificationPanel;
