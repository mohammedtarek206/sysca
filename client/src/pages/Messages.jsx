import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, Trash2, Bell, Clock, User, ShieldCheck, UserCheck } from 'lucide-react';
import Modal from '../components/Modal';

const Messages = () => {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'all',
    recipient: ''
  });

  useEffect(() => {
    fetchMessages();
    if (user?.role === 'admin') {
      fetchStudents();
    }
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users?role=student');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleAddMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    setErrorMessage('');
    try {
      await api.post('/messages', formData);
      setShowAddModal(false);
      setFormData({ title: '', content: '', targetRole: 'all', recipient: '' });
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setErrorMessage(err.response?.data?.msg || 'حدث خطأ أثناء الإرسال. تأكد من تشغيل السيرفر.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await api.delete(`/messages/${id}`);
        fetchMessages();
      } catch (err) {
        console.error('Error deleting message:', err);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid var(--glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin {to {transform: rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>{t('messages.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('messages.subtitle')}</p>
        </div>
        {user?.role === 'admin' && (
          <button className="primary-btn" onClick={() => { setErrorMessage(''); setShowAddModal(true); }}>
            <Send size={18} />
            {t('messages.addNew')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <Bell size={48} style={{ color: 'var(--text-dim)', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('messages.empty')}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="glass-card" style={{ padding: '32px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: msg.targetRole === 'single_student' ? 'rgba(99, 102, 241, 0.1)' : 'var(--primary-glow)', color: msg.targetRole === 'single_student' ? 'var(--secondary)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', border: '1px solid currentColor' }}>
                    {msg.targetRole === 'single_student' ? <UserCheck size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '4px' }}>{msg.title}</h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {new Date(msg.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} />
                        {msg.targetRole === 'single_student' ? (t('messages.targets.single_student')) : t('messages.targets.' + msg.targetRole)}
                      </span>
                    </div>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => handleDeleteMessage(msg._id)}
                    style={{ color: 'var(--error)', padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--card-border)', color: 'var(--text-main)', lineHeight: '1.8' }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('messages.modal.title')}>
        <form onSubmit={handleAddMessage}>
          {errorMessage && (
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {errorMessage}
            </div>
          )}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>{t('messages.modal.labels.title')}</label>
            <input 
              type="text" 
              required
              placeholder={t('messages.modal.placeholders.title')}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>{t('messages.modal.labels.target')}</label>
              <select 
                value={formData.targetRole}
                onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
              >
                <option value="all" style={{background: 'var(--bg-dark)'}}>{t('messages.targets.all')}</option>
                <option value="student" style={{background: 'var(--bg-dark)'}}>{t('messages.targets.student')}</option>
                <option value="instructor" style={{background: 'var(--bg-dark)'}}>{t('messages.targets.instructor')}</option>
                <option value="single_student" style={{background: 'var(--bg-dark)'}}>{t('messages.targets.single_student')}</option>
              </select>
            </div>
            {formData.targetRole === 'single_student' && (
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>{t('messages.modal.labels.recipient')}</label>
                <select 
                  required
                  value={formData.recipient}
                  onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                >
                  <option value="" style={{background: 'var(--bg-dark)'}}>{t('messages.modal.placeholders.chooseRecipient')}</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id} style={{background: 'var(--bg-dark)'}}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>{t('messages.modal.labels.content')}</label>
            <textarea 
              rows="5"
              required
              placeholder={t('messages.modal.placeholders.content')}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--text-main)', fontFamily: 'inherit' }}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            ></textarea>
          </div>
          <button type="submit" className="primary-btn" style={{ width: '100%', height: '56px' }} disabled={sending}>
            {sending ? t('common.loading') : t('messages.modal.saveBtn')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Messages;
