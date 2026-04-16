import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Search, Edit2, Trash2, Mail, Phone, Wallet, Percent, Banknote, BookOpen, FileText } from 'lucide-react';
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
        await api.put(`/api/users/${editingId}`, updateData);
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
        await api.delete(`/api/users/${id}`);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('teachers.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('teachers.subtitle')}</p>
        </div>
        <button className="primary-btn" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', password: '', role: 'instructor', salary: 0, commissionRate: 0, assignedCourses: [] }); setIsModalOpen(true); }}>
          <UserPlus size={20} />
          {t('teachers.addNew')}
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', right: isRTL ? '16px' : 'auto', left: isRTL ? 'auto' : '16px', top: '15px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder={t('teachers.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', paddingRight: isRTL ? '45px' : '16px', paddingLeft: isRTL ? '16px' : '45px' }}
        />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <th style={{ padding: '20px' }}>{t('teachers.table.name')}</th>
              <th style={{ padding: '20px' }}>{t('teachers.table.contactInfo')}</th>
              <th style={{ padding: '20px' }}>{t('teachers.table.salaryCommission')}</th>
              <th style={{ padding: '20px' }}>{t('teachers.table.courses')}</th>
              <th style={{ padding: '20px' }}>{t('teachers.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>{t('common.loading')}</td></tr>
            ) : filteredTeachers.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('teachers.empty')}</td></tr>
            ) : filteredTeachers.map(teacher => (
              <tr key={teacher._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                      {teacher.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: '500' }}>{teacher.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Phone size={14} /> {teacher.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Mail size={14} /> {teacher.email}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <Banknote size={14} color="#10b981" /> {t('teachers.salaryValue', { value: teacher.salary || 0 })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <Percent size={14} color="#6366f1" /> {t('teachers.commissionValue', { value: teacher.commissionRate || 0 })}
                      </div>
                   </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', background: 'var(--primary)15', padding: '6px 12px', borderRadius: '10px', width: 'fit-content' }}>
                      <BookOpen size={16} />
                      <span style={{ fontSize: '0.85rem' }}>{t('teachers.courseCount', { count: teacher.assignedCourses?.length || 0 })}</span>
                    </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate(`/statement/teacher/${teacher._id}`)} title={t('teachers.actions.statement')} style={{ color: '#10b981', background: '#10b98115', padding: '8px', borderRadius: '8px' }}>
                      <FileText size={16} />
                    </button>
                    <button 
                      onClick={() => handleEdit(teacher)}
                      style={{ color: 'var(--primary)', background: 'var(--primary)15', padding: '8px', borderRadius: '8px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTeacher(teacher._id)}
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
        title={editingId ? t('teachers.modal.editTitle') : t('teachers.modal.addTitle')}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('teachers.modal.labels.fullName')}</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={t('teachers.modal.placeholders.name')} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('teachers.modal.labels.phone')}</label>
              <input 
                type="text" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder={t('teachers.modal.placeholders.phone')} 
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('teachers.modal.labels.email')}</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder={t('teachers.modal.placeholders.email')} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('teachers.modal.labels.password')}</label>
              <input 
                type="password" 
                required={!editingId}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={t('teachers.modal.placeholders.password')} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('teachers.modal.labels.salary')}</label>
              <input 
                type="number" 
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                placeholder={t('teachers.modal.placeholders.salary')} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('teachers.modal.labels.commission')}</label>
              <input 
                type="number" 
                value={formData.commissionRate}
                onChange={(e) => setFormData({...formData, commissionRate: e.target.value})}
                placeholder={t('teachers.modal.placeholders.commission')} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('teachers.modal.labels.assignedCourses')}</label>
            <div style={{ 
              maxHeight: '180px', 
              overflowY: 'auto', 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {courses.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>{t('teachers.modal.emptyCourses')}</p>
              ) : courses.map(course => (
                <label key={course._id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer', 
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: formData.assignedCourses.includes(course._id) ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  border: '1px solid',
                  borderColor: formData.assignedCourses.includes(course._id) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  transition: '0.3s'
                }}>
                  <span style={{ fontSize: '0.95rem' }}>{course.name}</span>
                  <input 
                    type="checkbox" 
                    checked={formData.assignedCourses.includes(course._id)}
                    onChange={() => handleCourseToggle(course._id)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ marginTop: '10px', width: '100%', padding: '15px' }}>
            {editingId ? t('teachers.modal.updateBtn') : t('teachers.modal.saveBtn')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;

