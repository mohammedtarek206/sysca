import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Award, Download, Printer, User, Book, Calendar, ShieldCheck, Plus, X } from 'lucide-react';
import Modal from '../components/Modal';

const Certificates = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user } = useContext(AuthContext);
  const [certs, setCerts] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    grade: ''
  });

  useEffect(() => {
    fetchCerts();
    if (user?.role === 'admin') {
      fetchStudents();
      fetchCourses();
    }
  }, []);

  const fetchCerts = async () => {
    try {
      const res = await api.get('/certificates');
      setCerts(res.data);
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

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      await api.post('/certificates', formData);
      setShowAddModal(false);
      setFormData({ studentId: '', courseId: '', grade: '' });
      fetchCerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error issuing certificate');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (selectedCert) {
    return (
      <div className="animate-fade-in no-print">
         <button 
          onClick={() => setSelectedCert(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '32px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} />
          {t('common.close')}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
           <button className="primary-btn" onClick={handlePrint}>
              <Printer size={18} />
              {t('certificates.print')}
           </button>
        </div>

        {/* Certificate Template */}
        <div className="certificate-container" style={{
           width: '1000px',
           height: '700px',
           margin: '0 auto',
           background: '#fff',
           color: '#333',
           padding: '60px',
           position: 'relative',
           border: '20px solid #d4af37', // Gold border
           boxSizing: 'border-box',
           textAlign: 'center',
           direction: isRTL ? 'rtl' : 'ltr',
           fontFamily: isRTL ? 'Cairo' : 'serif',
           boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
        }}>
           <div style={{ border: '2px solid #d4af37', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                 <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#d4af37', marginBottom: '20px' }}>{t('certificates.template.header')}</h1>
                 <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', margin: '0 auto 40px', width: '80%' }}></div>
              </div>

              <div>
                 <p style={{ fontSize: '1.4rem', marginBottom: '30px' }}>{t('certificates.template.body')}</p>
                 <h2 style={{ fontSize: '3rem', fontWeight: '800', borderBottom: '1px solid #333', display: 'inline-block', padding: '0 40px', marginBottom: '40px' }}>{selectedCert.student.name}</h2>
                 <p style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{t('certificates.template.completion')}</p>
                 <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6366f1' }}>{selectedCert.course.name}</h3>
                 {selectedCert.grade && <p style={{marginTop: '10px', fontWeight: '700'}}>( {selectedCert.grade} )</p>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>
                 <div style={{ textAlign: 'start' }}>
                    <p style={{fontSize: '0.9rem', color: '#777'}}>{t('certificates.template.id')} {selectedCert.certificateId}</p>
                    <p style={{fontSize: '1rem', fontWeight: '600'}}>{t('certificates.template.date')} {new Date(selectedCert.issueDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '150px', height: '2px', background: '#333', marginBottom: '10px' }}></div>
                    <p style={{ fontWeight: '700' }}>{t('certificates.template.signature')}</p>
                 </div>
              </div>

              {/* Decorative Seal */}
              <div style={{ position: 'absolute', bottom: '40px', left: isRTL ? 'auto' : '50%', right: isRTL ? '50%' : 'auto', transform: 'translateX(50%)', width: '100px', height: '100px', border: '5px double #d4af37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', opacity: 0.8 }}>
                 <Award size={40} />
              </div>
           </div>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; background: #fff !important; }
            .certificate-container, .certificate-container * { visibility: visible; }
            .certificate-container { position: fixed; left: 0; top: 0; width: 100%; height: 100%; border: 15px solid #d4af37 !important; transform: scale(0.9); }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>{t('certificates.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('certificates.subtitle')}</p>
        </div>
        {user?.role === 'admin' && (
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            {t('certificates.addNew')}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {loading ? (
           <p>{t('common.loading')}</p>
        ) : certs.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', gridColumn: '1/-1' }}>
             <Award size={48} color="var(--text-dim)" style={{marginBottom: '16px', opacity: 0.5}} />
             <p style={{ color: 'var(--text-muted)' }}>{t('certificates.empty')}</p>
          </div>
        ) : (
          certs.map((cert) => (
            <div key={cert._id} className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: 'var(--primary-glow)', transform: 'rotate(45deg)', opacity: 0.2 }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--primary-dark)' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{cert.course.name}</h3>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cert.certificateId}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    <User size={16} color="var(--primary)" />
                    {cert.student.name}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <Calendar size={16} />
                    {new Date(cert.issueDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                 </div>
              </div>

              <button className="secondary-btn" style={{ width: '100%' }} onClick={() => setSelectedCert(cert)}>
                 {t('certificates.view')}
              </button>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('certificates.modal.title')}>
        <form onSubmit={handleIssue}>
          <div style={{ marginBottom: '24px' }}>
             <label>{t('certificates.modal.labels.student')}</label>
             <select required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                <option value="" style={{background: 'var(--bg-dark)'}}>{isRTL ? 'اختر الطالب...' : 'Select student...'}</option>
                {students.map(s => <option key={s._id} value={s._id} style={{background: 'var(--bg-dark)'}}>{s.name} ({s.phone})</option>)}
             </select>
          </div>
          <div style={{ marginBottom: '24px' }}>
             <label>{t('certificates.modal.labels.course')}</label>
             <select required value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
                <option value="" style={{background: 'var(--bg-dark)'}}>{t('courses.modal.placeholders.chooseCourse')}</option>
                {courses.map(c => <option key={c._id} value={c._id} style={{background: 'var(--bg-dark)'}}>{c.name}</option>)}
             </select>
          </div>
          <div style={{ marginBottom: '32px' }}>
             <label>{t('certificates.modal.labels.grade')}</label>
             <input type="text" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} placeholder="Ex: Excellent, A+, 95%..." />
          </div>
          <button type="submit" className="primary-btn" style={{ width: '100%', height: '56px' }}>{t('certificates.addNew')}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Certificates;
