import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Search, Edit2, Trash2, Mail, Phone, BookOpen, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';

const Students = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'student'
  });
  const [enrollData, setEnrollData] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users?role=student');
      setStudents(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
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

  const handleEnrollClick = (student) => {
    setSelectedStudent(student);
    setEnrollData(student.enrolledCourses || []);
    setIsEnrollModalOpen(true);
  };

  const handleCourseToggle = (courseId) => {
    setEnrollData(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/users/${selectedStudent._id}`, { enrolledCourses: enrollData });
      setIsEnrollModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert('Error updating enrollment');
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      password: '', // Keep empty for editing unless user wants to change it
      role: 'student'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password; // Don't update password if empty
        await api.put(`/api/users/${editingId}`, updateData);
      } else {
        // Create user
        await api.post('/users', formData);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'student' });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm(t('students.actions.confirmDelete'))) {
      try {
        await api.delete(`/api/users/${id}`);
        fetchStudents();
      } catch (err) {
        alert('Error deleting student');
      }
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('students.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('students.subtitle')}</p>
        </div>
        <button className="primary-btn" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', password: '', role: 'student' }); setIsModalOpen(true); }}>
          <UserPlus size={20} />
          {t('students.addNew')}
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', right: isRTL ? '16px' : 'auto', left: isRTL ? 'auto' : '16px', top: '15px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder={t('students.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', paddingRight: isRTL ? '45px' : '16px', paddingLeft: isRTL ? '16px' : '45px' }}
        />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <th style={{ padding: '20px' }}>{t('students.table.name')}</th>
              <th style={{ padding: '20px' }}>{t('students.table.contactInfo')}</th>
              <th style={{ padding: '20px' }}>{t('students.table.registrationDate')}</th>
              <th style={{ padding: '20px' }}>{t('students.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>{t('common.loading')}</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('students.empty')}</td></tr>
            ) : filteredStudents.map(student => (
              <tr key={student._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                      {student.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: '500' }}>{student.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Phone size={14} /> {student.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Mail size={14} /> {student.email}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <button 
                    onClick={() => handleEnrollClick(student)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', background: 'var(--primary)15', padding: '6px 12px', borderRadius: '10px' }}
                  >
                    <BookOpen size={16} />
                    <span style={{ fontSize: '0.85rem' }}>{t('students.courseCount', { count: student.enrolledCourses?.length || 0 })}</span>
                  </button>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate(`/statement/student/${student._id}`)} title={t('students.actions.statement')} style={{ color: '#10b981', background: '#10b98115', padding: '8px', borderRadius: '8px' }}>
                      <FileText size={16} />
                    </button>
                    <button 
                      onClick={() => handleEdit(student)}
                      style={{ color: 'var(--primary)', background: 'var(--primary)15', padding: '8px', borderRadius: '8px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteStudent(student._id)}
                      style={{ color: 'var(--accent)', background: 'var(--accent)15', padding: '8px', borderRadius: '8px' }}
                    >
                      <Trash2 size={16} />
                    </button>
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
        title={editingId ? t('students.modal.editTitle') : t('students.modal.addTitle')}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('students.modal.labels.fullName')}</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={t('students.modal.placeholders.name')} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('students.modal.labels.email')}</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder={t('students.modal.placeholders.email')} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('students.modal.labels.phone')}</label>
            <input 
              type="text" 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder={t('students.modal.placeholders.phone')} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>{t('students.modal.labels.password')}</label>
            <input 
              type="password" 
              required={!editingId}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder={t('students.modal.placeholders.password')} 
            />
          </div>
          <button type="submit" className="primary-btn" style={{ marginTop: '10px' }}>
            {editingId ? t('students.modal.updateBtn') : t('students.modal.saveBtn')}
          </button>
        </form>
      </Modal>

      {/* Enrollment Modal */}
      <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title={t('students.enrollModal.title', { name: selectedStudent?.name })}>
        <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              {courses.map(course => (
                <label key={course._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <input type="checkbox" checked={enrollData.includes(course._id)} onChange={() => handleCourseToggle(course._id)} />
                  {course.name} ({course.price} {t('common.currency')})
                </label>
              ))}
           </div>
           <button type="submit" className="primary-btn">{t('students.enrollModal.saveBtn')}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Students;

