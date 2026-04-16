import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { FileText, ArrowRight, Printer, Download, Calendar, CreditCard, BookOpen, Banknote, Percent, Award } from 'lucide-react';
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
      const endpoint = type === 'student' ? `/api/reports/student/${id}` : `/api/reports/teacher/${id}`;
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('statement.loading')}</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('statement.error')}</div>;

  const isStudent = type === 'student';
  const profile = isStudent ? data.student : data.teacher;

  return (
    <div className="animate-fade-in printable">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="no-print">
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowRight size={20} style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
          {t('statement.back')}
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="primary-btn" onClick={handlePrint} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            <Printer size={18} />
            {t('statement.print')}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '40px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '30px', marginBottom: '30px', textAlign: isRTL ? 'right' : 'left' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{t('statement.title')}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{isStudent ? t('statement.descStudent') : t('statement.descTeacher')}</p>
          </div>
          <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '5px' }}>{t('statement.academyName')}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('statement.extractDate')}: {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <div>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '15px', fontSize: '0.9rem', textTransform: 'uppercase' }}>{t('statement.profileData')}</h4>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '5px' }}>{profile.name}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t('statement.phone')}: {profile.phone}</p>
            <p style={{ color: 'var(--text-muted)' }}>{t('statement.email')}: {profile.email}</p>
          </div>
          <div className="glass-card" style={{ padding: '20px', background: 'var(--primary)05' }}>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.9rem' }}>{t('statement.balanceSummary')}</h4>
            {isStudent ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>{t('statement.totalFees')}:</span>
                  <span style={{ fontWeight: '600' }}>{data.summary.totalRequired} {t('common.currency')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>{t('statement.totalPaid')}:</span>
                  <span style={{ fontWeight: '600', color: '#10b981' }}>{data.summary.totalPaid} {t('common.currency')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ fontWeight: '700' }}>{t('statement.remainingDebt')}:</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent)' }}>{data.summary.balance} {t('common.currency')}</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>{t('statement.fixedSalary')}:</span>
                  <span style={{ fontWeight: '600' }}>{data.summary.fixedSalary} {t('common.currency')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>{t('statement.totalCommissions')}:</span>
                  <span style={{ fontWeight: '600' }}>{data.summary.totalCommissions} {t('common.currency')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ fontWeight: '700' }}>{t('statement.netEarnings')}:</span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>{data.summary.totalEarnings} {t('common.currency')}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {isStudent ? (
          <>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><CreditCard size={18} /> {t('statement.paymentHistory')}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px', textAlign: isRTL ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '15px' }}>{t('statement.paymentTable.date')}</th>
                  <th style={{ padding: '15px' }}>{t('statement.paymentTable.note')}</th>
                  <th style={{ padding: '15px' }}>{t('statement.paymentTable.amount')}</th>
                  <th style={{ padding: '15px' }}>{t('statement.paymentTable.status')}</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('statement.paymentTable.empty')}</td></tr>
                ) : data.payments.map(payment => (
                  <tr key={payment._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '15px' }}>{new Date(payment.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</td>
                    <td style={{ padding: '15px' }}>{payment.note || t('statement.paymentTable.cashPayment')}</td>
                    <td style={{ padding: '15px', fontWeight: '600' }}>{payment.amount} {t('common.currency')}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ color: payment.status === 'paid' ? '#10b981' : '#f59e0b', fontSize: '0.85rem' }}>
                        {payment.status === 'paid' ? t('statement.paymentTable.paid') : t('statement.paymentTable.pending')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen size={18} /> {t('statement.registeredCourses')}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              {data.student.enrolledCourses?.map(course => (
                <div key={course._id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <p style={{ fontWeight: '500', marginBottom: '5px' }}>{course.name}</p>
                  <p style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{course.price} {t('common.currency')}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Award size={18} /> {t('statement.commissionDetails')}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '15px' }}>{t('statement.commissionTable.course')}</th>
                  <th style={{ padding: '15px' }}>{t('statement.commissionTable.studentsCount')}</th>
                  <th style={{ padding: '15px' }}>{t('statement.commissionTable.coursePrice')}</th>
                  <th style={{ padding: '15px' }}>{t('statement.commissionTable.earnedCommission')}</th>
                </tr>
              </thead>
              <tbody>
                {data.courses.map(course => (
                  <tr key={course._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '15px', fontWeight: '500' }}>{course.name}</td>
                    <td style={{ padding: '15px' }}>{course.studentsCount} {t('statement.commissionTable.studentWord')}</td>
                    <td style={{ padding: '15px' }}>{course.price} {t('common.currency')}</td>
                    <td style={{ padding: '15px', fontWeight: '700', color: 'var(--primary)' }}>{course.commissionEarned} {t('common.currency')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable { background: white !important; color: black !important; }
          .glass-card { border: 1px solid #eee !important; box-shadow: none !important; color: black !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default Statement;
