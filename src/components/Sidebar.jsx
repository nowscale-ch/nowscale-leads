import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();
  const path = location.pathname;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (p) => {
    if (!p) return '?';
    return ((p.first_name?.[0] || '') + (p.last_name?.[0] || '')).toUpperCase() || '?';
  };

  const navItems = [
    { path: '/', icon: '📥', label: 'Alle Leads', exact: true },
    { path: '/neu', icon: '➕', label: 'Lead hinzufügen' },
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  ];

  return (
    <div className="sidebar">
      <div className="sb-logo">
        <img src="/logo.webp" alt="NowScale" />
        <span>Leads</span>
      </div>
      <div className="sb-nav">
        <div className="sb-label">Navigation</div>
        {navItems.map(item => {
          const isActive = item.exact ? path === item.path : path.startsWith(item.path);
          return (
            <div key={item.path}
              className={`sb-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </div>
      <div className="sb-user" onClick={handleLogout}>
        <div className="sb-avatar">{initials(profile)}</div>
        <div className="sb-user-info">
          <div className="sb-user-name">{profile?.first_name || ''} {profile?.last_name || ''}</div>
          <div className="sb-user-role">Abmelden</div>
        </div>
      </div>
    </div>
  );
}
