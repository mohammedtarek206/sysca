import React, { useState, useEffect } from 'react';
import api from '../api';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, User, Calendar as CalendarIcon, BookOpen } from 'lucide-react';

const Schedule = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const getDaySchedule = (day) => {
    const slots = [];
    courses.forEach(course => {
      course.schedule?.forEach(slot => {
        if (slot.day === day) {
          slots.push({ ...slot, courseName: course.name, hall: course.hall?.name, instructor: course.instructors?.[0]?.name });
        }
      });
    });
    // Sort by start time
    return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>{t('schedule.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('schedule.subtitle')}</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        overflowX: 'auto',
        paddingBottom: '20px'
      }}>
        {days.map(day => (
          <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '250px' }}>
            <div style={{ 
              background: 'var(--primary-glow)', 
              padding: '16px', 
              borderRadius: '16px', 
              textAlign: 'center', 
              border: '1px solid var(--primary-dark)',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{t(`courses.days.${day}`)}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>...</div>
              ) : getDaySchedule(day).length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--card-border)', fontSize: '0.85rem' }}>
                   {t('common.empty')}
                </div>
              ) : (
                getDaySchedule(day).map((slot, idx) => (
                  <div key={idx} className="glass-card" style={{ 
                    padding: '16px', 
                    borderLeft: isRTL ? 'none' : '4px solid var(--secondary)',
                    borderRight: isRTL ? '4px solid var(--secondary)' : 'none',
                    background: 'rgba(255,255,255,0.03)',
                    transition: 'var(--transition-smooth)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-main)', fontWeight: '700' }}>
                       <Clock size={14} color="var(--primary)" />
                       <span style={{ fontSize: '0.9rem' }}>{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '8px' }}>{slot.courseName}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <MapPin size={12} />
                          {slot.hall || 'N/A'}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <User size={12} />
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
    </div>
  );
};

export default Schedule;
