import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import LeadNew from './pages/LeadNew';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" />Laden...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading"><div className="spinner" />Laden...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="*" element={
        <ProtectedRoute>
          <div className="app">
            <Sidebar />
            <div className="main">
              <Routes>
                <Route path="/" element={<Leads />} />
                <Route path="/neu" element={<LeadNew />} />
                <Route path="/lead/:id" element={<LeadDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
