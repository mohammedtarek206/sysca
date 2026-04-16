import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { CheckCircle, XCircle, Clock, Plus, Search, Calendar, User, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Attendance = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user: currentUser } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  });

  useEffect(() => {
    fetchRecords();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/attendance');
      setRecords(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
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

  const handleAddAttendance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', formData);
      setIsModalOpen(false);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || t('attendance.alerts.error'));
    }
  };

  const filteredRecords = records.filter(record => 
    record.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.course?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} color="#10b981" />;
      case 'absent': return <XCircle size={16} color="#f43f5e" />;
      case 'late': return <Clock size={16} color="#f59e0b" />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return t('attendance.status.present');
      case 'absent': return t('attendance.status.absent');
      case 'late': return t('attendance.status.late');
      default: return status;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('attendance.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('attendance.subtitle')}</p>
        </div>
        {currentUser?.role !== 'student' && (
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            {t('attendance.addNew')}
          </button>
        )}
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', right: isRTL ? '16px' : 'auto', left: isRTL ? 'auto' : '16px', top: '15px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder={t('attendance.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', paddingRight: isRTL ? '45px' : '16px', paddingLeft: isRTL ? '16px' : '45px' }}
        />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <th style={{ padding: '20px' }}>{t('attendance.table.student')}</th>
              <th style={{ padding: '20px' }}>{t('attendance.table.course')}</th>
              <th style={{ padding: '20px' }}>{t('attendance.table.date')}</th>
              <th style={{ padding: '20px' }}>{t('attendance.table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>{t('common.loading')}</td></tr>
            ) : filteredRecords.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('attendance.table.empty')}</td></tr>
            ) : filteredRecords.map(record => (
              <tr key={record._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={16} color="var(--primary)" />
                    <span style={{ fontWeight: '500' }}>{record.student?.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <BookOpen size={14} />
                    {record.course?.name}
                  </div>
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} />
                    {new Date(record.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    {getStatusIcon(record.status)}
                    {getStatusText(record.status)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t('attendance.modal.title')}
      >
        <form onSubmit={handleAddAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('attendance.modal.labels.course')}</label>
            <select 
              required
              value={formData.course}
              onChange={(e) => setFormData({...formData, course: e.target.value})}
              style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}
            >
              <option value="" style={{ background: 'var(--bg-dark)' }}>{t('attendance.modal.placeholders.chooseCourse')}</option>
              {courses.map(course => (
                <option key={course._id} value={course._id} style={{ background: 'var(--bg-dark)' }}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('attendance.modal.labels.student')}</label>
            <select 
              required
              value={formData.student}
              onChange={(e) => setFormData({...formData, student: e.target.value})}
              style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}
            >
              <option value="" style={{ background: 'var(--bg-dark)' }}>{t('attendance.modal.placeholders.chooseStudent')}</option>
              {students.map(student => (
                <option key={student._id} value={student._id} style={{ background: 'var(--bg-dark)' }}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('attendance.modal.labels.date')}</label>
            <input 
              type="date" 
              required 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('attendance.modal.labels.status')}</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}
            >
              <option value="present" style={{ background: 'var(--bg-dark)' }}>{t('attendance.status.present')}</option>
              <option value="absent" style={{ background: 'var(--bg-dark)' }}>{t('attendance.status.absent')}</option>
              <option value="late" style={{ background: 'var(--bg-dark)' }}>{t('attendance.status.late')}</option>
            </select>
          </div>
          <button type="submit" className="primary-btn" style={{ marginTop: '10px' }}>
            {t('attendance.modal.saveBtn')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;

