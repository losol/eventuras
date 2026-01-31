import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getUserInfo, logout } from '../../lib/auth';

export default function Dashboard() {
  const { t } = useTranslation();
  const userInfo = getUserInfo();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {t('admin.dashboard.title')}
          </h1>
          <p style={{ color: '#666' }}>
            {t('admin.dashboard.welcome', { name: userInfo?.name || userInfo?.email })} ({userInfo?.systemRole})
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {t('auth.logout')}
        </button>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* OAuth Clients Card */}
        <Link
          to="/admin/clients"
          style={{
            display: 'block',
            padding: '1.5rem',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {t('admin.dashboard.clients.title')}
          </h2>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            {t('admin.dashboard.clients.description')}
          </p>
        </Link>

        {/* Accounts Card */}
        <div
          style={{
            padding: '1.5rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            opacity: 0.6,
            cursor: 'not-allowed',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {t('admin.dashboard.accounts.title')}
          </h2>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            {t('admin.dashboard.accounts.description')}
          </p>
        </div>

        {/* Identity Providers Card */}
        <div
          style={{
            padding: '1.5rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            opacity: 0.6,
            cursor: 'not-allowed',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {t('admin.dashboard.idps.title')}
          </h2>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            {t('admin.dashboard.idps.description')}
          </p>
        </div>

        {/* JWKS Keys Card */}
        <div
          style={{
            padding: '1.5rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            opacity: 0.6,
            cursor: 'not-allowed',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {t('admin.dashboard.keys.title')}
          </h2>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            {t('admin.dashboard.keys.description')}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          {t('admin.dashboard.testFlow.title')}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem' }}>
          {t('admin.dashboard.testFlow.description')}
        </p>
        <a
          href="/api/otp/request"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: '#2563eb',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          {t('admin.dashboard.testFlow.button')}
        </a>
      </div>
    </div>
  );
}
