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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'present': return { icon: <CheckCircle size={16} />, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)', text: t('attendance.status.present') };
      case 'absent': return { icon: <XCircle size={16} />, color: 'var(--error)', bg: 'rgba(239, 68, 68, 0.1)', text: t('attendance.status.absent') };
      case 'late': return { icon: <Clock size={16} />, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)', text: t('attendance.status.late') };
      default: return { icon: null, color: 'var(--text-muted)', bg: 'transparent', text: status };
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '12px' }}>{t('attendance.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('attendance.subtitle')}</p>
        </div>
        {currentUser?.role !== 'student' && (
          <button className="primary-btn" style={{ padding: '14px 28px' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            {t('attendance.addNew')}
          </button>
        )}
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
          placeholder={t('attendance.searchPlaceholder')}
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
        <table style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '20px' }}>{t('attendance.table.student')}</th>
              <th style={{ padding: '20px' }}>{t('attendance.table.course')}</th>
              <th style={{ padding: '20px' }}>{t('attendance.table.date')}</th>
              <th style={{ padding: '20px' }}>{t('attendance.table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('common.loading')}...</td></tr>
            ) : filteredRecords.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('attendance.table.empty')}</td></tr>
            ) : filteredRecords.map(record => (
              <tr key={record._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={18} color="var(--primary)" />
                    </div>
                    <span style={{ fontWeight: '700' }}>{record.student?.name}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                    <BookOpen size={16} style={{ color: 'var(--secondary)' }} />
                    <span style={{ fontWeight: '500' }}>{record.course?.name}</span>
                  </div>
                </td>
                <td>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    <Calendar size={16} />
                    {new Date(record.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                  </div>
                </td>
                <td>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 16px', 
                    borderRadius: '12px', 
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    background: getStatusConfig(record.status).bg,
                    color: getStatusConfig(record.status).color,
                    border: `1px solid ${getStatusConfig(record.status).color}22`
                  }}>
                    {getStatusConfig(record.status).icon}
                    {getStatusConfig(record.status).text}
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
        <form onSubmit={handleAddAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('attendance.modal.labels.course')}</label>
            <select 
              required
              value={formData.course}
              onChange={(e) => setFormData({...formData, course: e.target.value})}
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
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('attendance.modal.labels.student')}</label>
            <select 
              required
              value={formData.student}
              onChange={(e) => setFormData({...formData, student: e.target.value})}
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
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('attendance.modal.labels.date')}</label>
            <input 
              type="date" 
              required 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('attendance.modal.labels.status')}</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="present" style={{ background: 'var(--bg-dark)' }}>{t('attendance.status.present')}</option>
              <option value="absent" style={{ background: 'var(--bg-dark)' }}>{t('attendance.status.absent')}</option>
              <option value="late" style={{ background: 'var(--bg-dark)' }}>{t('attendance.status.late')}</option>
            </select>
          </div>
          <button type="submit" className="primary-btn" style={{ height: '52px', marginTop: '12px' }}>
            {t('attendance.modal.saveBtn')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;


