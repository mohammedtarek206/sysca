import React, { useContext, useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Calendar, CheckSquare, FileText, ChevronLeft, CreditCard, ArrowUpRight, BarChart3, Clock, UserCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon, color, trend, onClick }) => (
  <div 
    className="glass-card animate-fade-in" 
    style={{ 
      padding: '28px', 
      flex: '1 1 240px', 
      cursor: onClick ? 'pointer' : 'default', 
      position: 'relative',
      overflow: 'hidden'
    }}
    onClick={onClick}
  >
    <div style={{ 
      position: 'absolute', 
      top: '-20px', 
      right: '-20px', 
      width: '80px', 
      height: '80px', 
      background: color, 
      filter: 'blur(40px)', 
      opacity: 0.15,
      zIndex: 0
    }} />
    
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ 
          color, 
          background: `${color}15`, 
          padding: '14px', 
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}20`
        }}>{icon}</div>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            color: 'var(--success)', 
            background: 'rgba(16, 185, 129, 0.1)', 
            padding: '6px 12px', 
            borderRadius: '100px', 
            fontSize: '0.75rem',
            fontWeight: '700'
          }}>
            <ArrowUpRight size={14} />
            {trend}
          </div>
        )}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500', marginBottom: '8px' }}>{title}</p>
      <h2 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{value}</h2>
    </div>
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
        const res = await api.get('/stats');
        setStats(res.data);
      } else if (user.role === 'instructor') {
        const res = await api.get(`/reports/teacher/${user.id}`);
        setRoleData(res.data);
      } else if (user.role === 'student') {
        const res = await api.get(`/reports/student/${user.id}`);
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
        <StatCard title={t('dashboard.totalStudents')} value={stats.students || 0} icon={<Users size={24} />} color="var(--primary)" onClick={() => navigate('/students')} trend="+12%" />
        <StatCard title={t('dashboard.totalInstructors')} value={stats.teachers || 0} icon={<GraduationCap size={24} />} color="var(--secondary)" onClick={() => navigate('/teachers')} />
        <StatCard title={t('dashboard.activeCourses')} value={stats.courses || 0} icon={<BookOpen size={24} />} color="var(--accent)" onClick={() => navigate('/courses')} />
        <StatCard title={t('dashboard.totalRevenue')} value={`${(stats.revenue || 0).toLocaleString()} ${t('common.currency')}`} icon={<DollarSign size={24} />} color="var(--success)" onClick={() => navigate('/reports')} trend="+5.4k" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', minHeight: '400px' }}>
        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{t('dashboard.subscriptionsGrowth')}</h3>
            <div style={{ background: 'var(--glass)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>أخر 30 يوم</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '2px dashed var(--card-border)' }}>
            <TrendingUp size={64} style={{ marginBottom: '24px', opacity: 0.2, color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: '600' }}>{t('dashboard.chartsComingSoon')}</p>
          </div>
        </div>
        
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '32px' }}>{t('dashboard.quickLinks')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button className="glass-card" style={{ 
              padding: '24px', 
              textAlign: isRTL ? 'right' : 'left', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'var(--card-border)',
              cursor: 'pointer'
            }} onClick={() => navigate('/reports')}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '14px', border: '1px solid var(--primary-dark)' }}>
                    <TrendingUp size={22} color="var(--primary)" />
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{t('dashboard.viewProfitReport')}</span>
               </div>
               <ChevronLeft size={20} style={{ transform: isRTL ? 'none' : 'rotate(180deg)', color: 'var(--text-dim)' }} />
            </button>
            <button className="glass-card" style={{ 
              padding: '24px', 
              textAlign: isRTL ? 'right' : 'left', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'var(--card-border)',
              cursor: 'pointer'
            }} onClick={() => navigate('/halls')}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <Calendar size={22} color="var(--secondary)" />
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{t('dashboard.manageHalls')}</span>
               </div>
               <ChevronLeft size={20} style={{ transform: isRTL ? 'none' : 'rotate(180deg)', color: 'var(--text-dim)' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderStudentDashboard = () => (
    <>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard title={t('dashboard.myEnrolledCourses')} value={roleData?.student?.enrolledCourses?.length || 0} icon={<BookOpen size={24} />} color="var(--primary)" onClick={() => navigate('/payments')} />
        <StatCard title={t('dashboard.totalFees')} value={`${roleData?.summary?.totalRequired || 0} ${t('common.currency')}`} icon={<CreditCard size={24} />} color="var(--secondary)" />
        <StatCard title={t('dashboard.payments')} value={`${roleData?.summary?.totalPaid || 0} ${t('common.currency')}`} icon={<CheckSquare size={24} />} color="var(--success)" />
        <StatCard title={t('dashboard.remainingBalance')} value={`${roleData?.summary?.balance || 0} ${t('common.currency')}`} icon={<DollarSign size={24} />} color="var(--error)" onClick={() => navigate(`/statement/student/${user.id}`)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '32px', fontSize: '1.4rem', fontWeight: '800' }}>{t('dashboard.myCurrentCourses')}</h3>
          {(!roleData?.student?.enrolledCourses || roleData?.student?.enrolledCourses?.length === 0) ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '2px dashed var(--card-border)' }}>
               <p style={{ color: 'var(--text-dim)', fontWeight: '600' }}>{t('dashboard.notEnrolled')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {roleData?.student?.enrolledCourses?.map(course => (
                 <div key={course._id} style={{ 
                   padding: '24px', 
                   background: 'rgba(255,255,255,0.02)', 
                   borderRadius: '20px', 
                   display: 'flex', 
                   justifyContent: 'space-between',
                   alignItems: 'center',
                   border: '1px solid var(--card-border)'
                 }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{course.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800' }}>
                      <Clock size={14} />
                      {course.duration}
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
        <div className="glass-card" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.03) 0%, rgba(0, 245, 212, 0.08) 100%)' }}>
           <div style={{ 
             width: '100px', 
             height: '100px', 
             background: 'var(--primary-glow)', 
             borderRadius: '32px', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             marginBottom: '32px',
             border: '1px solid var(--primary-dark)',
             boxShadow: '0 20px 40px rgba(0, 245, 212, 0.15)'
           }}>
             <FileText size={48} color="var(--primary)" />
           </div>
           <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px' }}>{t('dashboard.statement')}</h3>
           <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '340px' }}>{t('dashboard.downloadStatementDesc')}</p>
           <button className="primary-btn" style={{ minWidth: '240px', height: '60px', fontSize: '1.1rem' }} onClick={() => navigate(`/statement/student/${user.id}`)}>{t('dashboard.viewStatementBtn')}</button>
        </div>
      </div>
    </>
  );

  const renderInstructorDashboard = () => (
    <>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard title={t('dashboard.myActiveCourses')} value={roleData?.courses?.length || 0} icon={<BookOpen size={24} />} color="var(--primary)" onClick={() => navigate('/courses')} trend="+2" />
        <StatCard title={t('dashboard.fixedSalary')} value={`${roleData?.summary?.fixedSalary || 0} ${t('common.currency')}`} icon={<DollarSign size={24} />} color="var(--secondary)" />
        <StatCard title={t('dashboard.totalCommissions')} value={`${roleData?.summary?.totalCommissions || 0} ${t('common.currency')}`} icon={<TrendingUp size={24} />} color="var(--accent)" />
        <StatCard title={t('dashboard.totalEarnings')} value={`${roleData?.summary?.totalEarnings || 0} ${t('common.currency')}`} icon={<DollarSign size={24} />} color="var(--success)" onClick={() => navigate(`/statement/teacher/${user.id}`)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '32px', fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={24} color="var(--primary)" />
            {t('dashboard.coursePerformance')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roleData?.courses?.map(course => (
              <div key={course._id} style={{ 
                padding: '24px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '20px', 
                border: '1px solid var(--card-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                   <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{course.name}</span>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700' }}>
                     <Users size={16} />
                     <span>{course.studentsCount} {t('common.student')}</span>
                   </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>العمولة المكتسبة</span>
                  <span style={{ fontWeight: '900', color: 'var(--success)', fontSize: '1.2rem' }}>{course.commissionEarned} {t('common.currency')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '48px 32px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(99, 102, 241, 0.08) 100%)' }}>
          <div style={{ width: '100px', height: '100px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <UserCheck size={48} color="var(--secondary)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px' }}>إدارة الحضور</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '40px', maxWidth: '320px', margin: '0 auto 40px' }}>يمكنك تسجيل حضور الطلاب ومتابعة تقاريرهم بسهولة من خلال صفحة الحضور.</p>
          <button className="primary-btn" style={{ minWidth: '240px', height: '60px', fontSize: '1.1rem' }} onClick={() => navigate('/attendance')}>انتقل لتسجيل الحضور</button>
        </div>
      </div>
    </>
  );

  if (loading) return (
    <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
      <div style={{ width: '56px', height: '56px', border: '4px solid rgba(0, 245, 212, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '1.2rem', letterSpacing: '1px' }}>{t('common.loading')}...</span>
    </div>
  );

  const getDesc = () => {
    if (user?.role === 'admin') return t('dashboard.adminDesc');
    if (user?.role === 'student') return t('dashboard.studentDesc');
    return t('dashboard.instructorDesc');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '56px', flexWrap: 'wrap', gap: '32px' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(to left, var(--text-main), var(--text-dim))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>{t('dashboard.welcome', { name: user?.name?.split(' ')[0] || '' })}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>{getDesc()}</p>
        </div>
        <div className="glass-card" style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
          <div style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: '12px', border: '1px solid var(--primary-dark)' }}>
            <Calendar size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <span style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '0.5px' }}>
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



