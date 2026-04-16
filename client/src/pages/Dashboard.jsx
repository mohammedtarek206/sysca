import React, { useContext, useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Calendar, CheckSquare, FileText, ChevronLeft, CreditCard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon, color, trend, onClick }) => (
  <div 
    className="glass-card animate-fade-in" 
    style={{ padding: '24px', flex: '1 1 240px', cursor: onClick ? 'pointer' : 'default', transition: '0.3s' }}
    onClick={onClick}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <div style={{ color, background: `${color}15`, padding: '12px', borderRadius: '16px' }}>{icon}</div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', background: '#10b98115', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem' }}>
          <TrendingUp size={14} />
          {trend}
        </div>
      )}
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{title}</p>
    <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>{value}</h2>
  </div>
);

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, revenue: 0 });
  const [roleData, setRoleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      if (user.role === 'admin') {
        const res = await api.get('/api/stats');
        setStats(res.data);
      } else if (user.role === 'instructor') {
        const res = await api.get(`/api/reports/teacher/${user.id}`);
        setRoleData(res.data);
      } else if (user.role === 'student') {
        const res = await api.get(`/api/reports/student/${user.id}`);
        setRoleData(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  const renderAdminDashboard = () => (
    <>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard title={t('dashboard.totalStudents')} value={stats.students} icon={<Users />} color="#6366f1" onClick={() => navigate('/students')} />
        <StatCard title={t('dashboard.totalInstructors')} value={stats.teachers} icon={<GraduationCap />} color="#a855f7" onClick={() => navigate('/teachers')} />
        <StatCard title={t('dashboard.activeCourses')} value={stats.courses} icon={<BookOpen />} color="#f43f5e" onClick={() => navigate('/courses')} />
        <StatCard title={t('dashboard.totalRevenue')} value={`${stats.revenue.toLocaleString()} ${t('common.currency')}`} icon={<DollarSign />} color="#10b981" onClick={() => navigate('/reports')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '30px', height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '20px', alignSelf: 'flex-start' }}>{t('dashboard.subscriptionsGrowth')}</h3>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            <TrendingUp size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
            <p>{t('dashboard.chartsComingSoon')}</p>
          </div>
        </div>
        
        <div className="glass-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>{t('dashboard.quickLinks')}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button className="glass-card" style={{ padding: '15px', textAlign: isRTL ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--glass-border)' }} onClick={() => navigate('/reports')}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TrendingUp size={18} color="var(--primary)" />
                  {t('dashboard.viewProfitReport')}
               </div>
               <ChevronLeft size={16} style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
            </button>
            <button className="glass-card" style={{ padding: '15px', textAlign: isRTL ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--glass-border)' }} onClick={() => navigate('/halls')}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} color="#a855f7" />
                  {t('dashboard.manageHalls')}
               </div>
               <ChevronLeft size={16} style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderStudentDashboard = () => (
    <>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard title={t('dashboard.myEnrolledCourses')} value={roleData?.student?.enrolledCourses?.length || 0} icon={<BookOpen />} color="#6366f1" onClick={() => navigate('/payments')} />
        <StatCard title={t('dashboard.totalFees')} value={`${roleData?.summary?.totalRequired || 0} ${t('common.currency')}`} icon={<CreditCard />} color="#a855f7" />
        <StatCard title={t('dashboard.payments')} value={`${roleData?.summary?.totalPaid || 0} ${t('common.currency')}`} icon={<CheckSquare />} color="#10b981" />
        <StatCard title={t('dashboard.remainingBalance')} value={`${roleData?.summary?.balance || 0} ${t('common.currency')}`} icon={<DollarSign />} color="#f43f5e" onClick={() => navigate(`/statement/student/${user.id}`)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>{t('dashboard.myCurrentCourses')}</h3>
          {(!roleData?.student?.enrolledCourses || roleData?.student?.enrolledCourses?.length === 0) ? (
            <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.notEnrolled')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {roleData?.student?.enrolledCourses?.map(course => (
                 <div key={course._id} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{course.name}</span>
                    <span style={{ color: 'var(--primary)' }}>{course.duration}</span>
                 </div>
               ))}
            </div>
          )}
        </div>
        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
           <FileText size={40} color="var(--primary)" style={{ marginBottom: '15px' }} />
           <h3>{t('dashboard.statement')}</h3>
           <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{t('dashboard.downloadStatementDesc')}</p>
           <button className="primary-btn" onClick={() => navigate(`/statement/student/${user.id}`)}>{t('dashboard.viewStatementBtn')}</button>
        </div>
      </div>
    </>
  );

  const renderInstructorDashboard = () => (
    <>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard title={t('dashboard.coursesITeach')} value={roleData?.courses?.length || 0} icon={<BookOpen />} color="#6366f1" onClick={() => navigate('/courses')} />
        <StatCard title={t('dashboard.fixedSalary')} value={`${roleData?.summary?.fixedSalary || 0} ${t('common.currency')}`} icon={<CreditCard />} color="#a855f7" />
        <StatCard title={t('dashboard.totalCommissions')} value={`${roleData?.summary?.totalCommissions || 0} ${t('common.currency')}`} icon={<TrendingUp />} color="#10b981" />
        <StatCard title={t('dashboard.netDue')} value={`${roleData?.summary?.totalEarnings || 0} ${t('common.currency')}`} icon={<DollarSign />} color="#f43f5e" onClick={() => navigate(`/statement/teacher/${user.id}`)} />
      </div>

      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>{t('dashboard.courseStudentStats')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
           {roleData?.courses?.map(course => (
             <div key={course._id} className="glass-card" style={{ padding: '24px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '1.2rem', color: 'var(--primary)' }}>{course.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                   <span>{t('dashboard.students')} {course.studentsCount}</span>
                   <span style={{ color: '#10b981', fontWeight: 'bold' }}>{t('dashboard.commissionDue')} {course.commissionEarned} {t('common.currency')}</span>
                </div>
                
                <h5 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{t('dashboard.enrolledStudentsLabel')}</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                  {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
                    course.enrolledStudents.map(student => (
                      <div key={student._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                          {student.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.9rem' }}>{student.name}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('dashboard.noStudentsYet')}</p>
                  )}
                </div>
             </div>
           ))}
           {(!roleData?.courses || roleData?.courses?.length === 0) && <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.noCoursesYet')}</p>}
        </div>
      </div>
    </>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>{t('common.loading')}</div>;

  const getDesc = () => {
    if (user?.role === 'admin') return t('dashboard.adminDesc');
    if (user?.role === 'student') return t('dashboard.studentDesc');
    return t('dashboard.instructorDesc');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('dashboard.welcome', { name: user?.name })}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{getDesc()}</p>
        </div>
        <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ textTransform: 'capitalize' }}>
            {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>
      
      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'student' && renderStudentDashboard()}
      {user?.role === 'instructor' && renderInstructorDashboard()}
    </div>
  );
};

export default Dashboard;
