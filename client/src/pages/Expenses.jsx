import React, { useState, useEffect } from 'react';
import api from '../api';
import { Wallet, Plus, Trash2, ArrowDownCircle, Filter, DollarSign, Calendar, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';

const Expenses = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', formData);
      setShowAddModal(false);
      setFormData({ title: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0], note: '' });
      fetchExpenses();
    } catch (err) {
      alert('Error adding expense');
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>{t('expenses.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('expenses.subtitle')}</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          {t('expenses.addNew')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
             <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowDownCircle size={24} />
             </div>
             <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('expenses.title')}</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ef4444' }}>{totalExpenses.toLocaleString()} <span style={{fontSize: '1rem'}}>{t('common.currency')}</span></h2>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '8px' }}>
        <table>
          <thead>
            <tr>
              <th>{t('expenses.table.title')}</th>
              <th>{t('expenses.table.category')}</th>
              <th>{t('expenses.table.amount')}</th>
              <th>{t('expenses.table.date')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>{t('common.loading')}</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>{t('expenses.empty')}</td></tr>
            ) : expenses.map(exp => (
              <tr key={exp._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Tag size={16} color="var(--primary)" />
                    <span style={{ fontWeight: '700' }}>{exp.title}</span>
                  </div>
                </td>
                <td>
                   <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'var(--glass)', fontSize: '0.85rem' }}>
                    {t(`expenses.categories.${exp.category}`)}
                   </span>
                </td>
                <td>
                  <span style={{ color: '#ef4444', fontWeight: '800', fontSize: '1.1rem' }}>-{exp.amount} {t('common.currency')}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <Calendar size={14} />
                    {new Date(exp.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                  </div>
                </td>
                <td>
                   <button onClick={() => deleteExpense(exp._id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('expenses.addNew')}>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '24px' }}>
            <label>{t('expenses.table.title')}</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="مثال: فاتورة الكهرباء لشهر مايو" />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
               <label>{t('expenses.table.amount')}</label>
               <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
               <label>{t('expenses.table.category')}</label>
               <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {['rent', 'electricity', 'water', 'salary', 'marketing', 'maintenance', 'other'].map(cat => (
                    <option key={cat} value={cat} style={{background: 'var(--bg-dark)'}}>{t(`expenses.categories.${cat}`)}</option>
                  ))}
               </select>
            </div>
          </div>
          <div style={{ marginBottom: '32px' }}>
            <label>{t('expenses.table.date')}</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <button type="submit" className="primary-btn" style={{ width: '100%', height: '56px' }}>{t('expenses.addNew')}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
