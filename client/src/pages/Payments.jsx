import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { DollarSign, Plus, Search, Trash2, Calendar, User, CreditCard, Filter, AlertCircle, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
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
      const res = await api.get('/payments');
      setPayments(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users?role=student');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', formData);
      setIsModalOpen(false);
      setFormData({ student: '', course: '', amount: '', status: 'paid', note: '' });
      fetchPayments();
      fetchStudents(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding payment');
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm(t('payments.alerts.confirmDelete'))) {
      try {
        await api.delete(`/payments/${id}`);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '12px' }}>{t('payments.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('payments.subtitle')}</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button className="primary-btn" style={{ padding: '14px 28px' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            {t('payments.addNew')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'var(--glass)', padding: '6px', borderRadius: '16px', border: '1px solid var(--card-border)', width: 'fit-content' }}>
        <button 
          onClick={() => setView('all')}
          style={{ 
            padding: '12px 24px', 
            borderRadius: '12px', 
            background: view === 'all' ? 'var(--primary)' : 'transparent', 
            color: view === 'all' ? 'var(--bg-dark)' : 'var(--text-muted)', 
            border: 'none', 
            cursor: 'pointer', 
            transition: 'var(--transition-smooth)',
            fontWeight: '700',
            fontSize: '0.95rem'
          }}
        >
          {t('payments.tabs.all')}
        </button>
        <button 
          onClick={() => setView('late')}
          style={{ 
            padding: '12px 24px', 
            borderRadius: '12px', 
            background: view === 'late' ? 'var(--error)' : 'transparent', 
            color: view === 'late' ? 'white' : 'var(--text-muted)', 
            border: 'none', 
            cursor: 'pointer', 
            transition: 'var(--transition-smooth)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: '700',
            fontSize: '0.95rem'
          }}
        >
          <AlertCircle size={18} />
          {t('payments.tabs.late')}
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '32px', maxWidth: '500px' }}>
        <Search size={18} style={{ 
          position: 'absolute', 
          right: isRTL ? '16px' : 'auto', 
          left: isRTL ? 'auto' : '16px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: 'var(--text-dim)' 
        }} />
        <input 
          type="text" 
          placeholder={t('payments.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            paddingRight: isRTL ? '48px' : '16px', 
            paddingLeft: isRTL ? '16px' : '48px',
            height: '52px'
          }}
        />
      </div>

      <div className="glass-card" style={{ padding: '8px' }}>
        {view === 'all' ? (
          <table style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr>
                <th>{t('payments.allTable.student')}</th>
                <th>{t('payments.allTable.course')}</th>
                <th>{t('payments.allTable.amount')}</th>
                <th>{t('payments.allTable.date')}</th>
                <th>{t('payments.allTable.status')}</th>
                <th style={{ textAlign: 'center' }}>{t('payments.allTable.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('common.loading')}...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('payments.allTable.empty')}</td></tr>
              ) : filteredPayments.map(payment => (
                <tr key={payment._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 245, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <User size={18} color="var(--primary)" />
                      </div>
                      <span style={{ fontWeight: '700' }}>{payment.student?.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {payment.course?.name || t('payments.allTable.generalCourse')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '800', color: 'var(--success)', fontSize: '1.05rem' }}>
                      {payment.amount} {t('common.currency')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                      <Calendar size={14} />
                      {new Date(payment.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                    </div>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: payment.status === 'paid' ? 'var(--success)' : 'var(--warning)',
                      fontSize: '0.85rem',
                      fontWeight: '700'
                    }}>
                      {payment.status === 'paid' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      {payment.status === 'paid' ? t('payments.allTable.paid') : t('payments.allTable.pending')}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {currentUser?.role === 'admin' && (
                        <button onClick={() => handleDeletePayment(payment._id)} style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '10px' }}><Trash2 size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr>
                <th>{t('payments.lateTable.student')}</th>
                <th>{t('payments.lateTable.totalRequired')}</th>
                <th>{t('payments.lateTable.totalPaid')}</th>
                <th>{t('payments.lateTable.balance')}</th>
                <th style={{ textAlign: 'center' }}>{t('payments.lateTable.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {latePayments.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('payments.lateTable.empty')}</td></tr>
              ) : latePayments.map(record => (
                <tr key={record._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <User size={18} color="var(--error)" />
                      </div>
                      <span style={{ fontWeight: '700' }}>{record.student.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{record.totalRequired} {t('common.currency')}</td>
                  <td style={{ color: 'var(--success)', fontWeight: '600' }}>{record.totalPaid} {t('common.currency')}</td>
                  <td style={{ fontWeight: '800', color: 'var(--error)', fontSize: '1.1rem' }}>{record.balance} {t('common.currency')}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button className="primary-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => { setFormData({...formData, student: record._id}); setIsModalOpen(true); }}>
                        <CreditCard size={16} />
                        {t('payments.lateTable.collectBtn')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('payments.modal.title')}>
        <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('payments.modal.labels.student')}</label>
            <select required value={formData.student} onChange={(e) => setFormData({...formData, student: e.target.value})}>
              <option value="" style={{ background: 'var(--bg-dark)' }}>{t('payments.modal.placeholders.chooseStudent')}</option>
              {students.map(student => <option key={student._id} value={student._id} style={{ background: 'var(--bg-dark)' }}>{student.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('payments.modal.labels.course')}</label>
            <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})}>
              <option value="" style={{ background: 'var(--bg-dark)' }}>{t('payments.modal.placeholders.generalPayment')}</option>
              {courses.map(course => <option key={course._id} value={course._id} style={{ background: 'var(--bg-dark)' }}>{course.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('payments.modal.labels.amount')}</label>
            <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder={t('payments.modal.placeholders.amount')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('payments.modal.labels.status')}</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="paid" style={{ background: 'var(--bg-dark)' }}>{t('payments.modal.statusPaid')}</option>
              <option value="pending" style={{ background: 'var(--bg-dark)' }}>{t('payments.modal.statusPending')}</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('payments.modal.labels.note')}</label>
            <input type="text" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} placeholder={t('payments.modal.placeholders.note')} />
          </div>
          <button type="submit" className="primary-btn" style={{ height: '52px', marginTop: '12px' }}>{t('payments.modal.saveBtn')}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;


