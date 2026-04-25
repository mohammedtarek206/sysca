import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Search, Edit2, Trash2, Mail, Phone, BookOpen, FileText, User, QrCode, Printer, X, ShieldCheck } from 'lucide-react';
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
  const [selectedStudentForCard, setSelectedStudentForCard] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

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

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      password: '' // Don't show password
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/users/${editingStudent._id}`, formData);
      } else {
        await api.post('/users/register', { ...formData, role: 'student' });
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', phone: '', password: '' });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('students.actions.confirmDelete'))) {
      try {
        await api.delete(`/users/${id}`);
        fetchStudents();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const openEnrollModal = (student) => {
    setSelectedStudent(student);
    setEnrolledCourses(student.enrolledCourses?.map(c => c._id) || []);
    setIsEnrollModalOpen(true);
  };

  const handleEnrollToggle = (courseId) => {
    setEnrolledCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const saveEnrollment = async () => {
    try {
      await api.put(`/users/${selectedStudent._id}/enroll`, { courses: enrolledCourses });
      setIsEnrollModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert('Enrollment failed');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  const handlePrintCard = () => {
    window.print();
  };

  if (selectedStudentForCard) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedStudentForCard._id}`;
    return (
      <div className="animate-fade-in no-print" style={{ padding: '20px' }}>
         <button onClick={() => setSelectedStudentForCard(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '32px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} /> {t('common.close')}
         </button>

         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <button className="primary-btn" onClick={handlePrintCard}>
               <Printer size={18} /> {t('common.print')}
            </button>
         </div>

         {/* ID Card Template */}
         <div className="id-card" style={{
            width: '400px',
            height: '250px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #050508 0%, #12121a 100%)',
            borderRadius: '20px',
            border: '2px solid var(--primary)',
            padding: '24px',
            color: 'white',
            position: 'relative',
            display: 'flex',
            gap: '20px',
            direction: isRTL ? 'rtl' : 'ltr',
            fontFamily: 'Cairo, sans-serif',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden'
         }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
               <div>
                  <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '800', marginBottom: '5px' }}>{isRTL ? 'بطاقة طالب' : 'Student ID'}</h2>
                  <div style={{ width: '40px', height: '2px', background: 'var(--primary)', marginBottom: '20px' }}></div>
               </div>
               
               <div>
                  <p style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>{selectedStudentForCard.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedStudentForCard.phone}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '8px' }}>#{selectedStudentForCard._id.slice(-8).toUpperCase()}</p>
               </div>

               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="var(--primary)" />
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{isRTL ? 'أكاديميتي - نظام آمن' : 'Academiti - Secure System'}</span>
               </div>
            </div>

            <div style={{ width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
               <div style={{ background: 'white', padding: '10px', borderRadius: '12px' }}>
                  <img src={qrUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />
               </div>
               <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center' }}>Scan to Verify</span>
            </div>

            {/* Background Decoration */}
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(30px)', opacity: 0.3 }}></div>
         </div>

         <style>{`
            @media print {
               body * { visibility: hidden; }
               .id-card, .id-card * { visibility: visible; }
               .id-card { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(1.5); border: 2px solid #000 !important; background: #fff !important; color: #000 !important; }
               .no-print { display: none !important; }
            }
         `}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>{t('students.title')}</h1>
        <button className="primary-btn" onClick={() => { setEditingStudent(null); setFormData({name:'', email:'', phone:'', password:''}); setIsModalOpen(true); }}>
          <UserPlus size={18} />
          {t('students.addNew')}
        </button>
      </div>

      <div style={{ marginBottom: '32px', position: 'relative' }}>
        <Search style={{ position: 'absolute', right: isRTL ? '16px' : 'auto', left: isRTL ? 'auto' : '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={20} />
        <input
          type="text"
          placeholder={t('students.searchPlaceholder')}
          style={{ paddingRight: isRTL ? '48px' : '16px', paddingLeft: isRTL ? '16px' : '48px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>{t('students.table.name')}</th>
              <th>{t('students.table.contactInfo')}</th>
              <th>{t('students.table.registrationDate')}</th>
              <th>{t('students.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>{t('common.loading')}</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>{t('students.empty')}</td></tr>
            ) : filteredStudents.map(student => (
              <tr key={student._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: '700' }}>{student.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>ID: {student._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Phone size={14} color="var(--primary)" /> {student.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Mail size={14} /> {student.email}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {new Date(student.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button title="ID Card" onClick={() => setSelectedStudentForCard(student)} style={{ background: 'rgba(0, 245, 212, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}><QrCode size={16} /></button>
                    <button title={t('students.enrollModal.title')} onClick={() => openEnrollModal(student)} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--secondary)', padding: '8px', borderRadius: '8px' }}><BookOpen size={16} /></button>
                    <button title={t('common.edit')} onClick={() => handleEdit(student)} style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', padding: '8px', borderRadius: '8px' }}><Edit2 size={16} /></button>
                    <button title={t('common.delete')} onClick={() => handleDelete(student._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '8px', borderRadius: '8px' }}><Trash2 size={16} /></button>
                    <button title={t('students.actions.statement')} onClick={() => navigate(`/statement/student/${student._id}`)} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '8px', borderRadius: '8px' }}><FileText size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? t('students.modal.editTitle') : t('students.modal.addTitle')}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label>{t('students.modal.labels.fullName')}</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={t('students.modal.placeholders.name')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label>{t('students.modal.labels.email')}</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder={t('students.modal.placeholders.email')} />
            </div>
            <div>
              <label>{t('students.modal.labels.phone')}</label>
              <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder={t('students.modal.placeholders.phone')} />
            </div>
          </div>
          <div>
            <label>{t('students.modal.labels.password')}</label>
            <input type="password" required={!editingStudent} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={t('students.modal.placeholders.password')} />
          </div>
          <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '10px' }}>
             {editingStudent ? t('students.modal.updateBtn') : t('students.modal.saveBtn')}
          </button>
        </form>
      </Modal>

      {/* Enrollment Modal */}
      <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title={t('students.enrollModal.title', { name: selectedStudent?.name })}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }}>
            {courses.map(course => (
              <label key={course._id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '12px 16px', 
                background: 'var(--glass)', 
                borderRadius: '12px',
                border: '1px solid',
                borderColor: enrolledCourses.includes(course._id) ? 'var(--primary)' : 'var(--card-border)',
                cursor: 'pointer'
              }}>
                <span style={{ fontWeight: '600' }}>{course.name}</span>
                <input 
                  type="checkbox" 
                  checked={enrolledCourses.includes(course._id)} 
                  onChange={() => handleEnrollToggle(course._id)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </label>
            ))}
          </div>
          <button onClick={saveEnrollment} className="primary-btn" style={{ width: '100%' }}>
            {t('students.enrollModal.saveBtn')}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Students;
