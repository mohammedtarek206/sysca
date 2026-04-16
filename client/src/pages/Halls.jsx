import React, { useState, useEffect } from 'react';
import api from '../api';
import { Home, Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
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
        await api.put(`/api/halls/${editingId}`, formData);
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
        await api.delete(`/api/halls/${id}`);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('halls.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('halls.subtitle')}</p>
        </div>
        <button className="primary-btn" onClick={() => { setEditingId(null); setFormData({ name: '', capacity: '', description: '' }); setIsModalOpen(true); }}>
          <Plus size={20} />
          {t('halls.addNew')}
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', right: isRTL ? '16px' : 'auto', left: isRTL ? 'auto' : '16px', top: '15px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder={t('halls.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', paddingRight: isRTL ? '45px' : '16px', paddingLeft: isRTL ? '16px' : '45px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : filteredHalls.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>{t('halls.empty')}</p>
        ) : filteredHalls.map(hall => (
          <div key={hall._id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                <Home size={24} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEdit(hall)} style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(hall._id)} style={{ color: 'var(--accent)', background: 'rgba(244, 63, 94, 0.1)', padding: '6px', borderRadius: '8px' }}><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--primary)' }}>{hall.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', marginBottom: '15px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '10px', width: 'fit-content' }}>
              <Users size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t('halls.card.capacity', { capacity: hall.capacity })}</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {hall.description || t('halls.card.noDescription')}
            </p>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? t('halls.modal.editTitle') : t('halls.modal.addTitle')}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('halls.modal.labels.name')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('halls.modal.placeholders.name')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('halls.modal.labels.capacity')}</label>
            <input
              type="number"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder={t('halls.modal.placeholders.capacity')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('halls.modal.labels.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('halls.modal.placeholders.description')}
              style={{ minHeight: '120px' }}
            />
          </div>
          <button type="submit" className="primary-btn" style={{ marginTop: '10px', width: '100%', padding: '15px' }}>
            {editingId ? t('halls.modal.updateBtn') : t('halls.modal.saveBtn')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Halls;

