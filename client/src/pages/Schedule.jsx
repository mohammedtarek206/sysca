import React, { useState, useEffect } from 'react';
import api from '../api';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, User, Calendar as CalendarIcon, BookOpen, LayoutGrid, Home, AlertCircle } from 'lucide-react';

const Schedule = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [courses, setCourses] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('days'); // 'days' or 'halls'

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, hallsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/halls')
      ]);
      setCourses(coursesRes.data);
      setHalls(hallsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getDaySchedule = (day) => {
    const slots = [];
    courses.forEach(course => {
      course.schedule?.forEach(slot => {
        if (slot.day === day) {
          slots.push({ ...slot, courseName: course.name, hall: course.hall?.name, instructor: course.instructors?.[0]?.name, courseId: course._id });
        }
      });
    });
    return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getHallSchedule = (hallId) => {
    const slots = [];
    courses.forEach(course => {
      if (course.hall?._id === hallId) {
        course.schedule?.forEach(slot => {
          slots.push({ ...slot, courseName: course.name, instructor: course.instructors?.[0]?.name });
        });
      }
    });
    return slots.sort((a, b) => {
      const dayIndexA = days.indexOf(a.day);
      const dayIndexB = days.indexOf(b.day);
      if (dayIndexA !== dayIndexB) return dayIndexA - dayIndexB;
      return a.startTime.localeCompare(b.startTime);
    });
  };

  // Check for conflicts (Two courses in same hall at same time on same day)
  const checkConflict = (slot, hallId, allSlots) => {
     return allSlots.some(s => 
       s.day === slot.day && 
       s.courseId !== slot.courseId &&
       ((slot.startTime >= s.startTime && slot.startTime < s.endTime) || 
        (slot.endTime > s.startTime && slot.endTime <= s.endTime))
     );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>{t('schedule.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('schedule.subtitle')}</p>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--glass)', padding: '6px', borderRadius: '14px', border: '1px solid var(--card-border)' }}>
           <button 
             onClick={() => setViewMode('days')}
             style={{ 
               padding: '10px 20px', 
               borderRadius: '10px', 
               background: viewMode === 'days' ? 'var(--primary)' : 'transparent',
               color: viewMode === 'days' ? '#000' : 'var(--text-main)',
               display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontWeight: '700'
             }}
           >
             <LayoutGrid size={18} />
             {isRTL ? 'حسب الأيام' : 'By Day'}
           </button>
           <button 
             onClick={() => setViewMode('halls')}
             style={{ 
               padding: '10px 20px', 
               borderRadius: '10px', 
               background: viewMode === 'halls' ? 'var(--secondary)' : 'transparent',
               color: viewMode === 'halls' ? '#fff' : 'var(--text-main)',
               display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontWeight: '700'
             }}
           >
             <Home size={18} />
             {isRTL ? 'حسب القاعات' : 'By Hall'}
           </button>
        </div>
      </div>

      {viewMode === 'days' ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          overflowX: 'auto',
          paddingBottom: '20px'
        }}>
          {days.map(day => (
            <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '280px' }}>
              <div style={{ 
                background: 'var(--glass)', 
                padding: '20px', 
                borderRadius: '16px', 
                textAlign: 'center', 
                borderBottom: '4px solid var(--primary)',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{t(`courses.days.${day}`)}</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>...</div>
                ) : getDaySchedule(day).length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', background: 'var(--glass)', borderRadius: '16px', border: '1px dashed var(--card-border)', fontSize: '0.85rem' }}>
                    {t('common.empty')}
                  </div>
                ) : (
                  getDaySchedule(day).map((slot, idx) => (
                    <div key={idx} className="glass-card" style={{ 
                      padding: '20px', 
                      position: 'relative',
                      borderLeft: isRTL ? 'none' : '4px solid var(--secondary)',
                      borderRight: isRTL ? '4px solid var(--secondary)' : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700' }}>
                            <Clock size={16} />
                            <span style={{ fontSize: '1rem' }}>{slot.startTime} - {slot.endTime}</span>
                         </div>
                         {/* Conflict indicator would go here if we were checking against all day slots */}
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px' }}>{slot.courseName}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <Home size={14} color="var(--secondary)" />
                            {slot.hall || 'Unassigned'}
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <User size={14} />
                            {slot.instructor || 'N/A'}
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
           {halls.map(hall => (
             <div key={hall._id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                   <div style={{ width: '40px', height: '40px', background: 'var(--secondary-glow)', color: 'var(--secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Home size={20} />
                   </div>
                   <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{hall.name} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: '500' }}>(سعة {hall.capacity})</span></h2>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '16px' 
                }}>
                   {getHallSchedule(hall._id).length === 0 ? (
                     <p style={{ color: 'var(--text-dim)', gridColumn: '1/-1', background: 'var(--glass)', padding: '20px', borderRadius: '12px' }}>{isRTL ? 'هذه القاعة غير مشغولة حالياً.' : 'This hall is not occupied currently.'}</p>
                   ) : getHallSchedule(hall._id).map((slot, idx) => (
                     <div key={idx} className="glass-card" style={{ 
                       padding: '16px', 
                       borderTop: '3px solid var(--primary)',
                       background: 'rgba(255,255,255,0.02)'
                     }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '8px' }}>{t(`courses.days.${slot.day}`)}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '8px' }}>{slot.courseName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                           <Clock size={12} />
                           {slot.startTime} - {slot.endTime}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;
