import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { FileText, ArrowRight, Printer, Download, Calendar, CreditCard, BookOpen, Banknote, Percent, Award, User, ChevronLeft, ChevronRight, Phone, Mail, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Statement = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatement();
  }, [type, id]);

  const fetchStatement = async () => {
    try {
      const endpoint = type === 'student' ? `/reports/student/${id}` : `/reports/teacher/${id}`;
      const res = await api.get(endpoint);
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('statement.loading')}...</div>;
  if (!data) return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('statement.error')}</div>;

  const isStudent = type === 'student';
  const profile = isStudent ? data.student : data.teacher;

  return (
    <div className="animate-fade-in printable">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }} className="no-print">
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', cursor: 'pointer', padding: '10px 20px', borderRadius: '12px', fontWeight: '600' }}>
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {t('statement.back')}
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="primary-btn" onClick={handlePrint} style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary-dark)' }}>
            <Printer size={18} />
            {t('statement.print')}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '60px', marginBottom: '48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '40px', marginBottom: '48px', textAlign: isRTL ? 'right' : 'left', flexWrap: 'wrap', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <FileText size={24} />
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: '900' }}>{t('statement.title')}</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{isStudent ? t('statement.descStudent') : t('statement.descTeacher')}</p>
          </div>
          <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '1.8rem', fontWeight: '900' }}>{t('statement.academyName')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', justifyContent: isRTL ? 'flex-start' : 'flex-end' }}>
              <Calendar size={16} />
              <span>{t('statement.extractDate')}: {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', marginBottom: '48px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} />
              {t('statement.profileData')}
            </h4>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '16px' }}>{profile.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> {profile.phone}</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> {profile.email}</p>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '32px', background: 'var(--primary-glow)', border: '1px solid var(--primary-dark)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Banknote size={16} />
              {t('statement.balanceSummary')}
            </h4>
            {isStudent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('statement.totalFees')}:</span>
                  <span style={{ fontWeight: '700' }}>{data.summary.totalRequired} {t('common.currency')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('statement.totalPaid')}:</span>
                  <span style={{ fontWeight: '700', color: 'var(--success)' }}>{data.summary.totalPaid} {t('common.currency')}</span>
                </div>
                <div style={{ margin: '8px 0', height: '1px', background: 'var(--primary-dark)', opacity: '0.3' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem' }}>
                  <span style={{ fontWeight: '900' }}>{t('statement.remainingDebt')}:</span>
                  <span style={{ fontWeight: '900', color: 'var(--error)' }}>{data.summary.balance} {t('common.currency')}</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('statement.fixedSalary')}:</span>
                  <span style={{ fontWeight: '700' }}>{data.summary.fixedSalary} {t('common.currency')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('statement.totalCommissions')}:</span>
                  <span style={{ fontWeight: '700' }}>{data.summary.totalCommissions} {t('common.currency')}</span>
                </div>
                <div style={{ margin: '8px 0', height: '1px', background: 'var(--primary-dark)', opacity: '0.3' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem' }}>
                  <span style={{ fontWeight: '900' }}>{t('statement.netEarnings')}:</span>
                  <span style={{ fontWeight: '900', color: 'var(--success)' }}>{data.summary.totalEarnings} {t('common.currency')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {isStudent ? (
          <>
            <h4 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: '800' }}>
              <CreditCard size={24} color="var(--primary)" /> 
              {t('statement.paymentHistory')}
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '48px' }}>
              <table style={{ width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '20px' }}>{t('statement.paymentTable.date')}</th>
                    <th style={{ padding: '20px' }}>{t('statement.paymentTable.note')}</th>
                    <th style={{ padding: '20px' }}>{t('statement.paymentTable.amount')}</th>
                    <th style={{ padding: '20px' }}>{t('statement.paymentTable.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('statement.paymentTable.empty')}</td></tr>
                  ) : data.payments.map(payment => (
                    <tr key={payment._id}>
                      <td style={{ padding: '20px' }}>{new Date(payment.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</td>
                      <td style={{ padding: '20px' }}>{payment.note || t('statement.paymentTable.cashPayment')}</td>
                      <td style={{ padding: '20px', fontWeight: '800', fontSize: '1.1rem' }}>{payment.amount} {t('common.currency')}</td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ 
                          color: payment.status === 'paid' ? 'var(--success)' : 'var(--warning)', 
                          fontSize: '0.9rem',
                          fontWeight: '800',
                          background: payment.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          padding: '6px 14px',
                          borderRadius: '10px'
                        }}>
                          {payment.status === 'paid' ? t('statement.paymentTable.paid') : t('statement.paymentTable.pending')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: '800' }}>
              <BookOpen size={24} color="var(--primary)" /> 
              {t('statement.registeredCourses')}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {data.student.enrolledCourses?.map(course => (
                <div key={course._id} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontWeight: '800', fontSize: '1.1rem' }}>{course.name}</p>
                  <p style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: '900' }}>{course.price} {t('common.currency')}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h4 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: '800' }}>
              <Award size={24} color="var(--primary)" /> 
              {t('statement.commissionDetails')}
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '20px' }}>{t('statement.commissionTable.course')}</th>
                    <th style={{ padding: '20px' }}>{t('statement.commissionTable.studentsCount')}</th>
                    <th style={{ padding: '20px' }}>{t('statement.commissionTable.coursePrice')}</th>
                    <th style={{ padding: '20px' }}>{t('statement.commissionTable.earnedCommission')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courses.map(course => (
                    <tr key={course._id}>
                      <td style={{ padding: '20px', fontWeight: '700' }}>{course.name}</td>
                      <td style={{ padding: '20px' }}>{course.studentsCount} {t('statement.commissionTable.studentWord')}</td>
                      <td style={{ padding: '20px' }}>{course.price} {t('common.currency')}</td>
                      <td style={{ padding: '20px', fontWeight: '900', color: 'var(--primary)', fontSize: '1.1rem' }}>{course.commissionEarned} {t('common.currency')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable { background: white !important; color: #111 !important; margin: 0 !important; padding: 0 !important; }
          .glass-card { border: 2px solid #eee !important; box-shadow: none !important; color: #111 !important; background: white !important; }
          .glass-card * { color: #111 !important; }
          .glass-card [style*="primary-glow"] { background: #f8f8f8 !important; border: 1px solid #ddd !important; }
          .glass-card th { background: #f0f0f0 !important; border-bottom: 2px solid #ddd !important; }
          .glass-card tr { border-bottom: 1px solid #eee !important; }
          body { background: white !important; margin: 0 !important; }
          h1, h2, h3, h4 { color: #000 !important; }
        }
      `}</style>
    </div>
  );
};

export default Statement;

