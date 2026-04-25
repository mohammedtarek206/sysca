import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Library, Plus, FileText, Video, ExternalLink, Trash2, Search, Filter, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';

const LibraryPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'pdf',
    url: '',
    course: '',
    description: ''
  });

  useEffect(() => {
    fetchMaterials();
    fetchCourses();
  }, [filterCourse]);

  const fetchMaterials = async () => {
    try {
      const url = filterCourse ? `/materials?course=${filterCourse}` : '/materials';
      const res = await api.get(url);
      setMaterials(res.data);
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

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/materials', formData);
      setShowAddModal(false);
      setFormData({ title: '', type: 'pdf', url: '', course: '', description: '' });
      fetchMaterials();
    } catch (err) {
      alert('Error adding material');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await api.delete(`/materials/${id}`);
      fetchMaterials();
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText size={24} color="#ef4444" />;
      case 'video': return <Video size={24} color="#6366f1" />;
      case 'link': return <ExternalLink size={24} color="#00f5d4" />;
      default: return <BookOpen size={24} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>{t('library.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('library.subtitle')}</p>
        </div>
        {user?.role !== 'student' && (
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            {t('library.addNew')}
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Filter size={20} color="var(--primary)" />
        <select 
          value={filterCourse} 
          onChange={(e) => setFilterCourse(e.target.value)}
          style={{ maxWidth: '300px', margin: 0 }}
        >
          <option value="" style={{background: 'var(--bg-dark)'}}>كل الكورسات / All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id} style={{background: 'var(--bg-dark)'}}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {loading ? (
           <p style={{textAlign: 'center', gridColumn: '1/-1'}}>{t('common.loading')}</p>
        ) : materials.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', gridColumn: '1/-1' }}>
             <p style={{ color: 'var(--text-muted)' }}>{t('library.empty')}</p>
          </div>
        ) : (
          materials.map((item) => (
            <div key={item._id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--card-border)' }}>
                  {getIcon(item.type)}
                </div>
                {user?.role !== 'student' && (
                   <button onClick={() => handleDelete(item._id)} style={{ color: 'var(--error)', background: 'none', border: 'none' }}>
                    <Trash2 size={18} />
                   </button>
                )}
              </div>
              
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{item.course.name}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '4px', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', height: '40px', overflow: 'hidden' }}>{item.description}</p>
              </div>

              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="secondary-btn"
                style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '12px' }}
              >
                {item.type === 'video' ? 'شاهد الآن / Watch Now' : 'فتح المصدر / Open Resource'}
              </a>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('library.modal.title')}>
        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: '24px' }}>
            <label>{t('library.modal.labels.title')}</label>
            <input 
              type="text" required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="..."
            />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label>{t('library.modal.labels.type')}</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="pdf" style={{background: 'var(--bg-dark)'}}>{t('library.types.pdf')}</option>
                <option value="video" style={{background: 'var(--bg-dark)'}}>{t('library.types.video')}</option>
                <option value="link" style={{background: 'var(--bg-dark)'}}>{t('library.types.link')}</option>
                <option value="other" style={{background: 'var(--bg-dark)'}}>{t('library.types.other')}</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>{t('library.modal.labels.course')}</label>
              <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}>
                <option value="" style={{background: 'var(--bg-dark)'}}>{t('courses.modal.placeholders.chooseCourse')}</option>
                {courses.map(c => <option key={c._id} value={c._id} style={{background: 'var(--bg-dark)'}}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label>{t('library.modal.labels.url')}</label>
            <input 
              type="text" required 
              value={formData.url} 
              onChange={e => setFormData({...formData, url: e.target.value})}
              placeholder="https://..."
            />
          </div>
          <div style={{ marginBottom: '32px' }}>
            <label>{t('library.modal.labels.description')}</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="..."
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--text-main)' }}
            ></textarea>
          </div>
          <button type="submit" className="primary-btn" style={{ width: '100%', height: '56px' }}>{t('library.addNew')}</button>
        </form>
      </Modal>
    </div>
  );
};

export default LibraryPage;
