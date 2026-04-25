import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Search, Edit2, Trash2, Mail, Phone, Wallet, Percent, Banknote, BookOpen, FileText, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';

const Teachers = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'instructor',
    salary: 0,
    commissionRate: 0,
    assignedCourses: []
  });

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users?role=instructor');
      setTeachers(res.data);
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

  const handleEdit = (teacher) => {
    setEditingId(teacher._id);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      password: '',
      role: 'instructor',
      salary: teacher.salary || 0,
      commissionRate: teacher.commissionRate || 0,
      assignedCourses: teacher.assignedCourses || []
    });
    setIsModalOpen(true);
  };

  const handleCourseToggle = (courseId) => {
    setFormData(prev => {
      const assigned = prev.assignedCourses.includes(courseId)
        ? prev.assignedCourses.filter(id => id !== courseId)
        : [...prev.assignedCourses, courseId];
      return { ...prev, assignedCourses: assigned };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${editingId}`, updateData);
      } else {
        await api.post('/users', formData);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'instructor', salary: 0, commissionRate: 0, assignedCourses: [] });
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm(t('teachers.actions.confirmDelete'))) {
      try {
        await api.delete(`/users/${id}`);
        fetchTeachers();
      } catch (err) {
        alert('Error deleting teacher');
      }
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '12px' }}>{t('teachers.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('teachers.subtitle')}</p>
        </div>
        <button className="primary-btn" style={{ padding: '14px 28px' }} onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', password: '', role: 'instructor', salary: 0, commissionRate: 0, assignedCourses: [] }); setIsModalOpen(true); }}>
          <UserPlus size={20} />
          {t('teachers.addNew')}
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
          placeholder={t('teachers.searchPlaceholder')}
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
              <th>{t('teachers.table.name')}</th>
              <th>{t('teachers.table.contactInfo')}</th>
              <th>{t('teachers.table.salaryCommission')}</th>
              <th>{t('teachers.table.courses')}</th>
              <th style={{ textAlign: 'center' }}>{t('teachers.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('common.loading')}...</td></tr>
            ) : filteredTeachers.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('teachers.empty')}</td></tr>
            ) : filteredTeachers.map(teacher => (
              <tr key={teacher._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '12px', 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid var(--secondary)'
                    }}>
                      <GraduationCap size={20} color="var(--secondary)" />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>{teacher.name}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Phone size={14} style={{ color: 'var(--primary)' }} /> {teacher.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      <Mail size={14} /> {teacher.email}
                    </div>
                  </div>
                </td>
                <td>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--success)' }}>
                        <Banknote size={14} /> {t('teachers.salaryValue', { value: teacher.salary || 0 })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Percent size={14} style={{ color: 'var(--secondary)' }} /> {t('teachers.commissionValue', { value: teacher.commissionRate || 0 })}
                      </div>
                   </div>
                </td>
                <td>
                    <div className="secondary-btn" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                      <BookOpen size={16} />
                      {t('teachers.courseCount', { count: teacher.assignedCourses?.length || 0 })}
                    </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={() => navigate(`/statement/teacher/${teacher._id}`)} title={t('teachers.actions.statement')} style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px' }}>
                      <FileText size={18} />
                    </button>
                    <button 
                      onClick={() => handleEdit(teacher)}
                      style={{ color: 'var(--secondary)', background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '10px' }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTeacher(teacher._id)}
                      style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '10px' }}
                    >
                      <Trash2 size={18} />
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
        title={editingId ? t('teachers.modal.editTitle') : t('teachers.modal.addTitle')}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('teachers.modal.labels.fullName')}</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={t('teachers.modal.placeholders.name')} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('teachers.modal.labels.phone')}</label>
              <input 
                type="text" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder={t('teachers.modal.placeholders.phone')} 
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('teachers.modal.labels.email')}</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder={t('teachers.modal.placeholders.email')} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('teachers.modal.labels.password')}</label>
              <input 
                type="password" 
                required={!editingId}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={t('teachers.modal.placeholders.password')} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('teachers.modal.labels.salary')}</label>
              <input 
                type="number" 
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                placeholder={t('teachers.modal.placeholders.salary')} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('teachers.modal.labels.commission')}</label>
              <input 
                type="number" 
                value={formData.commissionRate}
                onChange={(e) => setFormData({...formData, commissionRate: e.target.value})}
                placeholder={t('teachers.modal.placeholders.commission')} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('teachers.modal.labels.assignedCourses')}</label>
            <div style={{ 
              maxHeight: '180px', 
              overflowY: 'auto', 
              padding: '16px', 
              background: 'var(--glass)', 
              borderRadius: '16px',
              border: '1px solid var(--card-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {courses.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center' }}>{t('teachers.modal.emptyCourses')}</p>
              ) : courses.map(course => (
                <label key={course._id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer', 
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: formData.assignedCourses.includes(course._id) ? 'rgba(0, 245, 212, 0.05)' : 'transparent',
                  border: '1px solid',
                  borderColor: formData.assignedCourses.includes(course._id) ? 'rgba(0, 245, 212, 0.2)' : 'transparent',
                  transition: 'var(--transition-smooth)'
                }}>
                  <span style={{ fontWeight: '600' }}>{course.name}</span>
                  <input 
                    type="checkbox" 
                    checked={formData.assignedCourses.includes(course._id)}
                    onChange={() => handleCourseToggle(course._id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ height: '56px', width: '100%', fontSize: '1.1rem' }}>
            {editingId ? t('teachers.modal.updateBtn') : t('teachers.modal.saveBtn')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;
