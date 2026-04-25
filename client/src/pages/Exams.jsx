import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Plus, Save, ChevronLeft, Edit3, Trash2, Calendar, BookOpen, User, Star } from 'lucide-react';
import Modal from '../components/Modal';

const Exams = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [gradingExam, setGradingExam] = useState(null); // The exam being graded
  const [students, setStudents] = useState([]);
  const [resultsData, setResultsData] = useState([]); // Array of { studentId, score, note }

  const [formData, setFormData] = useState({
    title: '',
    course: '',
    date: new Date().toISOString().split('T')[0],
    maxScore: 100
  });

  useEffect(() => {
    fetchExams();
    if (user?.role !== 'student') {
      fetchCourses();
    }
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
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

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', formData);
      setShowAddModal(false);
      setFormData({ title: '', course: '', date: new Date().toISOString().split('T')[0], maxScore: 100 });
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating exam');
    }
  };

  const startGrading = async (exam) => {
    try {
      setGradingExam(exam);
      // Fetch students for this course
      const resStudents = await api.get(`/courses/${exam.course._id}`); 
      // Actually course detail might not have full students, let's check API.
      // Assuming a generic endpoint for now or fetching all and filtering if needed.
      // Better: we need students enrolled in this course.
      
      // Let's use users?role=student as a fallback if course-specific one isn't clear
      const resAllStudents = await api.get('/users?role=student');
      setStudents(resAllStudents.data); 

      // Fetch existing results
      const resResults = await api.get(`/exams/${exam._id}/results`);
      
      const initialResults = resAllStudents.data.map(s => {
        const existing = resResults.data.find(r => r.student._id === s._id);
        return {
          studentId: s._id,
          name: s.name,
          score: existing ? existing.score : '',
          note: existing ? existing.note : ''
        };
      });
      setResultsData(initialResults);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveResults = async () => {
    try {
      await api.post(`/exams/${gradingExam._id}/results`, { formData: resultsData });
      setGradingExam(null);
      alert('تم حفظ الدرجات بنجاح');
    } catch (err) {
      alert('خطأ في حفظ الدرجات');
    }
  };

  const deleteExam = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await api.delete(`/exams/${id}`);
      fetchExams();
    }
  };

  if (gradingExam) {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setGradingExam(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '32px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ChevronLeft size={20} />
          {t('statement.back')}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '8px' }}>{t('exams.results.title', { exam: gradingExam.title })}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{gradingExam.course.name}</p>
          </div>
          <button className="primary-btn" onClick={handleSaveResults}>
            <Save size={18} />
            {t('exams.results.saveBtn')}
          </button>
        </div>

        <div className="glass-card" style={{ padding: '8px' }}>
          <table>
            <thead>
              <tr>
                <th>{t('exams.results.student')}</th>
                <th>{t('exams.results.score')} / {gradingExam.maxScore}</th>
                <th>{t('exams.results.note')}</th>
              </tr>
            </thead>
            <tbody>
              {resultsData.map((res, index) => (
                <tr key={res.studentId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <User size={16} color="var(--primary)" />
                      <span style={{ fontWeight: '700' }}>{res.name}</span>
                    </div>
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={res.score}
                      max={gradingExam.maxScore}
                      onChange={(e) => {
                        const newResults = [...resultsData];
                        newResults[index].score = e.target.value;
                        setResultsData(newResults);
                      }}
                      style={{ width: '100px', textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={res.note}
                      onChange={(e) => {
                        const newResults = [...resultsData];
                        newResults[index].note = e.target.value;
                        setResultsData(newResults);
                      }}
                      placeholder="..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>{t('exams.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('exams.subtitle')}</p>
        </div>
        {user?.role !== 'student' && (
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            {t('exams.addNew')}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : exams.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', gridColumn: '1/-1' }}>
            <p style={{ color: 'var(--text-muted)' }}>{t('exams.empty')}</p>
          </div>
        ) : (
          exams.map((exam) => (
            <div key={exam._id} className="glass-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--primary-dark)' }}>
                  <Star size={24} />
                </div>
                {user?.role === 'admin' && (
                  <button onClick={() => deleteExam(exam._id)} style={{ color: 'var(--error)', background: 'none', border: 'none' }}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }}>{exam.title}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <BookOpen size={16} color="var(--secondary)" />
                  {exam.course.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Calendar size={16} />
                  {new Date(exam.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontSize: '1rem', fontWeight: '700' }}>
                  <Star size={16} />
                  {t('exams.table.maxScore')}: {exam.maxScore}
                </div>
              </div>

              {user?.role !== 'student' && (
                <button 
                  className="secondary-btn" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  onClick={() => startGrading(exam)}
                >
                  <Edit3 size={18} />
                  {t('exams.results.saveBtn')}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('exams.modal.title')}>
        <form onSubmit={handleCreateExam}>
          <div style={{ marginBottom: '24px' }}>
            <label>{t('exams.modal.labels.title')}</label>
            <input 
              type="text" required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="مثال: اختبار الشهر الأول"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label>{t('exams.modal.labels.course')}</label>
            <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}>
              <option value="">{t('courses.modal.placeholders.chooseCourse')}</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
            <div style={{ flex: 1 }}>
              <label>{t('exams.modal.labels.date')}</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
              <label>{t('exams.modal.labels.maxScore')}</label>
              <input type="number" required value={formData.maxScore} onChange={e => setFormData({...formData, maxScore: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="primary-btn" style={{ width: '100%', height: '56px' }}>{t('exams.addNew')}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Exams;
