import React, { useState, useEffect } from 'react';
import api from '../api';
import { Home, Plus, Search, Edit2, Trash2, Users, MapPin, AlignLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';

const Halls = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    description: ''
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const res = await api.get('/halls');
      setHalls(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleEdit = (hall) => {
    setEditingId(hall._id);
    setFormData({
      name: hall.name,
      capacity: hall.capacity,
      description: hall.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/halls/${editingId}`, formData);
      } else {
        await api.post('/halls', formData);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', capacity: '', description: '' });
      fetchHalls();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('halls.alerts.confirmDelete'))) {
      try {
        await api.delete(`/halls/${id}`);
        fetchHalls();
      } catch (err) {
        alert('Error deleting hall');
      }
    }
  };

  const filteredHalls = halls.filter(hall =>
    hall.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '12px' }}>{t('halls.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('halls.subtitle')}</p>
        </div>
        <button className="primary-btn" style={{ padding: '14px 28px' }} onClick={() => { setEditingId(null); setFormData({ name: '', capacity: '', description: '' }); setIsModalOpen(true); }}>
          <Plus size={20} />
          {t('halls.addNew')}
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
          placeholder={t('halls.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            paddingRight: isRTL ? '48px' : '16px', 
            paddingLeft: isRTL ? '16px' : '48px',
            height: '52px'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-dim)', padding: '60px' }}>{t('common.loading')}...</p>
        ) : filteredHalls.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-dim)', padding: '60px' }}>{t('halls.empty')}</p>
        ) : filteredHalls.map(hall => (
          <div key={hall._id} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
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
                <MapPin size={28} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleEdit(hall)} style={{ color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' }}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(hall._id)} style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '10px' }}><Trash2 size={16} /></button>
              </div>
            </div>
            
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '16px' }}>{hall.name}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '24px', background: 'rgba(0, 245, 212, 0.05)', padding: '10px 16px', borderRadius: '12px', width: 'fit-content' }}>
              <Users size={18} />
              <span style={{ fontWeight: '700' }}>{t('halls.card.capacity', { capacity: hall.capacity })}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', lineHeight: '1.6', flex: 1 }}>
              <AlignLeft size={18} style={{ marginTop: '4px', flexShrink: 0 }} />
              <p style={{ fontSize: '0.95rem' }}>
                {hall.description || t('halls.card.noDescription')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? t('halls.modal.editTitle') : t('halls.modal.addTitle')}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('halls.modal.labels.name')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('halls.modal.placeholders.name')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('halls.modal.labels.capacity')}</label>
            <input
              type="number"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder={t('halls.modal.placeholders.capacity')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('halls.modal.labels.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('halls.modal.placeholders.description')}
              style={{ minHeight: '140px', padding: '16px' }}
            />
          </div>
          <button type="submit" className="primary-btn" style={{ height: '56px', marginTop: '12px', width: '100%', fontSize: '1.1rem' }}>
            {editingId ? t('halls.modal.updateBtn') : t('halls.modal.saveBtn')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Halls;


