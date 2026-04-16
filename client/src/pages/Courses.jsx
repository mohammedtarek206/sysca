import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { BookOpen, Plus, Tag, Clock, GraduationCap, Edit2, Trash2, Home, Users } from 'lucide-react';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Courses = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    instructors: [],
    hall: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
    fetchHalls();
  }, []);

  const fetchInstructors = async () => {
    try {
      const res = await api.get('/api/users?role=instructor');
      setInstructors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHalls = async () => {
    try {
      const res = await api.get('/api/halls');
      setHalls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      setCourses(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setFormData({
      name: course.name,
      price: course.price,
      duration: course.duration,
      instructors: course.instructors?.map(i => i._id) || [],
      hall: course.hall?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleInstructorToggle = (teacherId) => {
    setFormData(prev => {
      const assigned = prev.instructors.includes(teacherId)
        ? prev.instructors.filter(id => id !== teacherId)
        : [...prev.instructors, teacherId];
      return { ...prev, instructors: assigned };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/courses/${editingId}`, formData);
      } else {
        await api.post('/api/courses', formData);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', price: '', duration: '', instructors: [], hall: '' });
      fetchCourses();
      alert(editingId ? t('courses.alerts.updated') : t('courses.alerts.created'));
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm(t('courses.alerts.confirmDelete'))) {
      try {
        await api.delete(`/api/courses/${id}`);
        fetchCourses();
      } catch (err) {
        alert('Error deleting course');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('courses.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('courses.subtitle')}</p>
        </div>
        {user?.role === 'admin' && (
          <button className="primary-btn" onClick={() => { setEditingId(null); setFormData({ name: '', price: '', duration: '', instructors: [], hall: '' }); setIsModalOpen(true); }}>
            <Plus size={20} />
            {t('courses.addNew')}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>{t('common.loading')}</p>
        ) : courses.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-muted)' }}>{t('courses.empty')}</p>
        ) : courses.map(course => (
          <div key={course._id} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ background: 'var(--primary)22', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                <BookOpen size={24} />
              </div>
              {user?.role === 'admin' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button onClick={() => handleEdit(course)} style={{ color: 'var(--text-muted)', background: 'var(--glass-border)', padding: '6px', borderRadius: '8px' }}><Edit2 size={16} /></button>
                   <button onClick={() => handleDeleteCourse(course._id)} style={{ color: 'var(--accent)', background: 'var(--accent)15', padding: '6px', borderRadius: '8px' }}><Trash2 size={16} /></button>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>{course.name}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-muted)' }}>
                <GraduationCap size={18} style={{ marginTop: '3px' }} />
                <span>{t('courses.card.instructors')}{course.instructors?.length > 0 ? course.instructors.map(i => i.name).join(isRTL ? '، ' : ', ') : t('courses.card.notAssigned')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <Home size={18} />
                <span>{t('courses.card.hall')}{course.hall?.name || t('courses.card.hallNotAssigned')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <Clock size={18} />
                <span>{t('courses.card.duration')}{course.duration}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: '600' }}>
                <Tag size={18} />
                <span>{t('courses.card.price')}{course.price} {t('common.currency')}</span>
              </div>
            </div>

            <button 
              onClick={() => setViewingCourse(course)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--glass-border)', color: 'white', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s' }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'var(--glass-border)'}
            >
              {t('courses.card.viewDetails')}
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? t('courses.modal.editTitle') : t('courses.modal.addTitle')}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('courses.modal.labels.courseName')}</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder={t('courses.modal.placeholders.name')} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('courses.modal.labels.price')}</label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder={t('courses.modal.placeholders.price')} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('courses.modal.labels.duration')}</label>
              <input type="text" required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder={t('courses.modal.placeholders.duration')} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('courses.modal.labels.hall')}</label>
              <select value={formData.hall} onChange={(e) => setFormData({...formData, hall: e.target.value})}>
                <option value="" style={{ background: 'var(--bg-dark)' }}>{t('courses.modal.placeholders.chooseHall')}</option>
                {halls.map(h => <option key={h._id} value={h._id} style={{ background: 'var(--bg-dark)' }}>{h.name} ({t('courses.modal.hallCapacity', { capacity: h.capacity })})</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('courses.modal.labels.instructors')}</label>
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
              {instructors.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>{t('courses.modal.noInstructors')}</p>
              ) : instructors.map(inst => (
                <label key={inst._id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer', 
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: formData.instructors.includes(inst._id) ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  border: '1px solid',
                  borderColor: formData.instructors.includes(inst._id) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  transition: '0.3s'
                }}>
                  <span style={{ fontSize: '0.95rem' }}>{inst.name}</span>
                  <input 
                    type="checkbox" 
                    checked={formData.instructors.includes(inst._id)} 
                    onChange={() => handleInstructorToggle(inst._id)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ marginTop: '10px', width: '100%', padding: '15px' }}>
            {editingId ? t('courses.modal.updateBtn') : t('courses.modal.saveBtn')}
          </button>
        </form>
      </Modal>

      {/* Course Details Modal */}
      <Modal isOpen={!!viewingCourse} onClose={() => setViewingCourse(null)} title={t('courses.detailsModal.title')}>
        {viewingCourse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '8px' }}>{viewingCourse.name}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{t('courses.detailsModal.courseCode')}{viewingCourse._id.slice(-6).toUpperCase()}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{t('courses.detailsModal.financialCost')}</h4>
                <p style={{ fontSize: '1.3rem', color: '#10b981', fontWeight: 'bold' }}>{viewingCourse.price} {t('common.currency')}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{t('courses.detailsModal.duration')}</h4>
                <p style={{ fontSize: '1.2rem', color: 'white' }}>{viewingCourse.duration}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>{t('courses.detailsModal.hallAndLocation')}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Home size={20} color="var(--primary)" />
                  <span style={{ fontSize: '1.1rem' }}>{viewingCourse.hall?.name || t('courses.detailsModal.hallNotAssigned')}</span>
                </div>
              </div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>{t('courses.detailsModal.instructors')}</h4>
                {viewingCourse.instructors?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {viewingCourse.instructors.map(inst => (
                      <span key={inst._id} style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={14} />
                        {inst.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>{t('courses.detailsModal.noInstructors')}</span>
                )}
              </div>
            </div>

            <button onClick={() => setViewingCourse(null)} className="primary-btn" style={{ width: '100%', padding: '16px', background: 'var(--glass-border)', marginTop: '10px' }}>
              {t('courses.detailsModal.closeBtn')}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Courses;
