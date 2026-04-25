import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { BookOpen, Plus, Tag, Clock, GraduationCap, Edit2, Trash2, Home, Users, ChevronRight, MapPin, Calendar, Clock3, X } from 'lucide-react';
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
    hall: '',
    schedule: []
  });

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
    fetchHalls();
  }, []);

  const fetchInstructors = async () => {
    try {
      const res = await api.get('/users?role=instructor');
      setInstructors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHalls = async () => {
    try {
      const res = await api.get('/halls');
      setHalls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
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
      hall: course.hall?._id || '',
      schedule: course.schedule || []
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

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: 'Saturday', startTime: '00:00', endTime: '00:00' }]
    }));
  };

  const removeScheduleSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const updateScheduleSlot = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index][field] = value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', price: '', duration: '', instructors: [], hall: '', schedule: [] });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm(t('courses.alerts.confirmDelete'))) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
      } catch (err) {
        alert('Error deleting course');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '12px' }}>{t('courses.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('courses.subtitle')}</p>
        </div>
        {user?.role === 'admin' && (
          <button className="primary-btn" style={{ padding: '14px 28px' }} onClick={() => { setEditingId(null); setFormData({ name: '', price: '', duration: '', instructors: [], hall: '', schedule: [] }); setIsModalOpen(true); }}>
            <Plus size={20} />
            {t('courses.addNew')}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-dim)', padding: '60px' }}>{t('common.loading')}...</p>
        ) : courses.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-dim)', padding: '60px' }}>{t('courses.empty')}</p>
        ) : courses.map(course => (
          <div key={course._id} className="glass-card" style={{ 
            padding: '24px', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'var(--transition-smooth)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: 'var(--primary-glow)', 
                color: 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '16px',
                border: '1px solid var(--primary-dark)'
              }}>
                <BookOpen size={28} />
              </div>
              {user?.role === 'admin' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                   <button onClick={() => handleEdit(course)} style={{ color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' }}><Edit2 size={16} /></button>
                   <button onClick={() => handleDeleteCourse(course._id)} style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '10px' }}><Trash2 size={16} /></button>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px' }}>{course.name}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <GraduationCap size={18} style={{ marginTop: '2px', color: 'var(--secondary)' }} />
                <span>{t('courses.card.instructors')}{course.instructors?.length > 0 ? course.instructors.map(i => i.name).join(isRTL ? '، ' : ', ') : t('courses.card.notAssigned')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <span>{t('courses.card.hall')}{course.hall?.name || t('courses.card.hallNotAssigned')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <Calendar size={18} style={{ color: 'var(--text-dim)' }} />
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  {course.schedule?.length > 0 ? course.schedule.map((s, idx) => (
                    <span key={idx} style={{background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem'}}>
                      {t(`courses.days.${s.day}`)} {s.startTime}
                    </span>
                  )) : t('courses.card.duration') + course.duration}
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              paddingTop: '20px', 
              borderTop: '1px solid rgba(255,255,255,0.05)',
              marginTop: 'auto'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block' }}>{t('courses.card.price')}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--success)' }}>{course.price} {t('common.currency')}</span>
              </div>
              <button 
                onClick={() => setViewingCourse(course)}
                className="secondary-btn"
                style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {t('courses.card.viewDetails')}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? t('courses.modal.editTitle') : t('courses.modal.addTitle')}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('courses.modal.labels.courseName')}</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder={t('courses.modal.placeholders.name')} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('courses.modal.labels.price')}</label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder={t('courses.modal.placeholders.price')} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('courses.modal.labels.duration')}</label>
              <input type="text" required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder={t('courses.modal.placeholders.duration')} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('courses.modal.labels.hall')}</label>
              <select value={formData.hall} onChange={(e) => setFormData({...formData, hall: e.target.value})}>
                <option value="" style={{ background: 'var(--bg-dark)' }}>{t('courses.modal.placeholders.chooseHall')}</option>
                {halls.map(h => <option key={h._id} value={h._id} style={{ background: 'var(--bg-dark)' }}>{h.name} ({t('courses.modal.hallCapacity', { capacity: h.capacity })})</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('courses.modal.labels.schedule')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.schedule.map((slot, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select value={slot.day} onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)} style={{flex: 1.5}}>
                    {days.map(d => <option key={d} value={d} style={{background: 'var(--bg-dark)'}}>{t(`courses.days.${d}`)}</option>)}
                  </select>
                  <input type="time" value={slot.startTime} onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)} style={{flex: 1}} />
                  <input type="time" value={slot.endTime} onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)} style={{flex: 1}} />
                  <button type="button" onClick={() => removeScheduleSlot(index)} style={{ color: 'var(--error)', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px' }}><X size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={addScheduleSlot} className="secondary-btn" style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <Plus size={16} /> إضافة موعد / Add Slot
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('courses.modal.labels.instructors')}</label>
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
              {instructors.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center' }}>{t('courses.modal.noInstructors')}</p>
              ) : instructors.map(inst => (
                <label key={inst._id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer', 
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: formData.instructors.includes(inst._id) ? 'rgba(0, 245, 212, 0.05)' : 'transparent',
                  border: '1px solid',
                  borderColor: formData.instructors.includes(inst._id) ? 'rgba(0, 245, 212, 0.2)' : 'transparent',
                  transition: 'var(--transition-smooth)'
                }}>
                  <span style={{ fontWeight: '600' }}>{inst.name}</span>
                  <input 
                    type="checkbox" 
                    checked={formData.instructors.includes(inst._id)} 
                    onChange={() => handleInstructorToggle(inst._id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ height: '56px', width: '100%', fontSize: '1.1rem' }}>
            {editingId ? t('courses.modal.updateBtn') : t('courses.modal.saveBtn')}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!viewingCourse} onClose={() => setViewingCourse(null)} title={t('courses.detailsModal.title')}>
        {viewingCourse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px' }}>
            <div style={{ 
              background: 'var(--primary-glow)', 
              padding: '32px', 
              borderRadius: '24px', 
              border: '1px solid var(--primary-dark)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>{viewingCourse.name}</h3>
              <p style={{ color: 'var(--text-dim)', letterSpacing: '1px' }}>{t('courses.detailsModal.courseCode')} #{viewingCourse._id.slice(-6).toUpperCase()}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                <h4 style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase' }}>{t('courses.detailsModal.financialCost')}</h4>
                <p style={{ fontSize: '1.6rem', color: 'var(--success)', fontWeight: '800' }}>{viewingCourse.price} {t('common.currency')}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                <h4 style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase' }}>{t('courses.detailsModal.duration')}</h4>
                <p style={{ fontSize: '1.4rem', color: 'white', fontWeight: '700' }}>{viewingCourse.duration}</p>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '16px', textTransform: 'uppercase' }}>{t('courses.detailsModal.hallAndLocation')}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(0, 245, 212, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} color="var(--primary)" />
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>{viewingCourse.hall?.name || t('courses.detailsModal.hallNotAssigned')}</span>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '16px', textTransform: 'uppercase' }}>{t('courses.modal.labels.schedule')}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                   {viewingCourse.schedule?.length > 0 ? viewingCourse.schedule.map((s, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Clock size={16} color="var(--primary)" />
                        <span style={{ fontWeight: '600' }}>{t(`courses.days.${s.day}`)}</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{s.startTime} - {s.endTime}</span>
                     </div>
                   )) : <span style={{color: 'var(--text-dim)'}}>لم يتم تحديد مواعيد أسبوعية</span>}
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '16px', textTransform: 'uppercase' }}>{t('courses.detailsModal.instructors')}</h4>
                {viewingCourse.instructors?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {viewingCourse.instructors.map(inst => (
                      <span key={inst._id} style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '10px 20px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontWeight: '600'
                      }}>
                        <Users size={16} color="var(--secondary)" />
                        {inst.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-dim)' }}>{t('courses.detailsModal.noInstructors')}</span>
                )}
              </div>
            </div>

            <button onClick={() => setViewingCourse(null)} className="primary-btn" style={{ height: '56px', width: '100%', background: 'var(--glass-border)', marginTop: '8px' }}>
              {t('courses.detailsModal.closeBtn')}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Courses;
