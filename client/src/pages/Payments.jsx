import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { DollarSign, Plus, Search, Trash2, Calendar, User, CreditCard, Filter, AlertCircle, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Payments = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user: currentUser } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('all'); // 'all' or 'late'
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    amount: '',
    status: 'paid',
    note: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/api/payments');
      setPayments(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/users?role=student');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/payments', formData);
      setIsModalOpen(false);
      setFormData({ student: '', course: '', amount: '', status: 'paid', note: '' });
      fetchPayments();
      fetchStudents(); // Refresh student data to get updated balances
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding payment');
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm(t('payments.alerts.confirmDelete'))) {
      try {
        await api.delete(`/api/payments/${id}`);
        fetchPayments();
      } catch (err) {
        alert('Error deleting payment');
      }
    }
  };

  const calculateLatePayments = () => {
    const lateRecords = [];
    students.forEach(student => {
      const totalEnrolledPrice = student.enrolledCourses?.reduce((sum, c) => sum + (c.price || 0), 0) || 0;
      const totalPaid = payments
        .filter(p => p.student?._id === student._id && p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      
      if (totalPaid < totalEnrolledPrice) {
        lateRecords.push({
          _id: student._id,
          student: student,
          totalRequired: totalEnrolledPrice,
          totalPaid: totalPaid,
          balance: totalEnrolledPrice - totalPaid
        });
      }
    });
    return lateRecords;
  };

  const latePayments = calculateLatePayments();

  const filteredPayments = payments.filter(payment => 
    payment.student?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('payments.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('payments.subtitle')}</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            {t('payments.addNew')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '12px', width: 'fit-content' }}>
        <button 
          onClick={() => setView('all')}
          style={{ padding: '10px 20px', borderRadius: '10px', background: view === 'all' ? 'var(--primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', transition: '0.3s' }}
        >
          {t('payments.tabs.all')}
        </button>
        <button 
          onClick={() => setView('late')}
          style={{ padding: '10px 20px', borderRadius: '10px', background: view === 'late' ? 'var(--accent)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <AlertCircle size={18} />
          {t('payments.tabs.late')}
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', right: isRTL ? '16px' : 'auto', left: isRTL ? 'auto' : '16px', top: '15px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder={t('payments.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', paddingRight: isRTL ? '45px' : '16px', paddingLeft: isRTL ? '16px' : '45px' }}
        />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {view === 'all' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <th style={{ padding: '20px' }}>{t('payments.allTable.student')}</th>
                <th style={{ padding: '20px' }}>{t('payments.allTable.course')}</th>
                <th style={{ padding: '20px' }}>{t('payments.allTable.amount')}</th>
                <th style={{ padding: '20px' }}>{t('payments.allTable.date')}</th>
                <th style={{ padding: '20px' }}>{t('payments.allTable.status')}</th>
                <th style={{ padding: '20px' }}>{t('payments.allTable.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>{t('common.loading')}</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('payments.allTable.empty')}</td></tr>
              ) : filteredPayments.map(payment => (
                <tr key={payment._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <User size={16} color="var(--primary)" />
                      <span style={{ fontWeight: '500' }}>{payment.student?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                    {payment.course?.name || t('payments.allTable.generalCourse')}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: '#10b981' }}>
                    {payment.amount} {t('common.currency')}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} />
                      {new Date(payment.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem',
                      background: payment.status === 'paid' ? '#10b98122' : '#f59e0b22',
                      color: payment.status === 'paid' ? '#10b981' : '#f59e0b',
                      border: `1px solid ${payment.status === 'paid' ? '#10b981' : '#f59e0b'}33`
                    }}>
                      {payment.status === 'paid' ? t('payments.allTable.paid') : t('payments.allTable.pending')}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {currentUser?.role === 'admin' && (
                      <button onClick={() => handleDeletePayment(payment._id)} style={{ color: 'var(--accent)', background: 'var(--accent)15', padding: '8px', borderRadius: '8px' }}><Trash2 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <th style={{ padding: '20px' }}>{t('payments.lateTable.student')}</th>
                <th style={{ padding: '20px' }}>{t('payments.lateTable.totalRequired')}</th>
                <th style={{ padding: '20px' }}>{t('payments.lateTable.totalPaid')}</th>
                <th style={{ padding: '20px' }}>{t('payments.lateTable.balance')}</th>
                <th style={{ padding: '20px' }}>{t('payments.lateTable.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {latePayments.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('payments.lateTable.empty')}</td></tr>
              ) : latePayments.map(record => (
                <tr key={record._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontWeight: '500' }}>{record.student.name}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>{record.totalRequired} {t('common.currency')}</td>
                  <td style={{ padding: '16px 20px', color: '#10b981' }}>{record.totalPaid} {t('common.currency')}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--accent)' }}>{record.balance} {t('common.currency')}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { setFormData({...formData, student: record._id}); setIsModalOpen(true); }}>
                      {t('payments.lateTable.collectBtn')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('payments.modal.title')}>
        <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('payments.modal.labels.student')}</label>
            <select required value={formData.student} onChange={(e) => setFormData({...formData, student: e.target.value})} style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}>
              <option value="" style={{ background: 'var(--bg-dark)' }}>{t('payments.modal.placeholders.chooseStudent')}</option>
              {students.map(student => <option key={student._id} value={student._id} style={{ background: 'var(--bg-dark)' }}>{student.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('payments.modal.labels.course')}</label>
            <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}>
              <option value="" style={{ background: 'var(--bg-dark)' }}>{t('payments.modal.placeholders.generalPayment')}</option>
              {courses.map(course => <option key={course._id} value={course._id} style={{ background: 'var(--bg-dark)' }}>{course.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('payments.modal.labels.amount')}</label>
            <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder={t('payments.modal.placeholders.amount')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('payments.modal.labels.status')}</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}>
              <option value="paid" style={{ background: 'var(--bg-dark)' }}>{t('payments.modal.statusPaid')}</option>
              <option value="pending" style={{ background: 'var(--bg-dark)' }}>{t('payments.modal.statusPending')}</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('payments.modal.labels.note')}</label>
            <input type="text" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} placeholder={t('payments.modal.placeholders.note')} />
          </div>
          <button type="submit" className="primary-btn">{t('payments.modal.saveBtn')}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
