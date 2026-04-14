import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { STATUS_COLORS } from '../lib/constants';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('ns_leads').select('*').order('created_at', { ascending: false });
      setLeads(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Laden...</div>;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const newThisWeek = leads.filter(l => new Date(l.created_at) >= startOfWeek).length;
  const openLeads = leads.filter(l => ['neu', 'kontaktiert', 'angebot'].includes(l.status)).length;
  const wonThisMonth = leads.filter(l => l.status === 'gewonnen' && new Date(l.created_at) >= startOfMonth).length;
  const totalDecided = leads.filter(l => ['gewonnen', 'verloren'].includes(l.status)).length;
  const wonTotal = leads.filter(l => l.status === 'gewonnen').length;
  const conversionRate = totalDecided > 0 ? Math.round((wonTotal / totalDecided) * 100) : 0;

  // By source
  const bySource = {};
  leads.forEach(l => { bySource[l.source] = (bySource[l.source] || 0) + 1; });

  // By status
  const byStatus = {};
  leads.forEach(l => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });

  return (
    <>
      <div className="page-header">
        <div className="page-title">📊 Dashboard</div>
      </div>
      <div className="content">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>📥</div>
            <div className="kpi-value">{newThisWeek}</div>
            <div className="kpi-label">Neue Leads (diese Woche)</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#FEF3C7', color: '#F59E0B' }}>📋</div>
            <div className="kpi-value">{openLeads}</div>
            <div className="kpi-label">Offene Leads</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#D1FAE5', color: '#10B981' }}>🏆</div>
            <div className="kpi-value">{wonThisMonth}</div>
            <div className="kpi-label">Gewonnen (diesen Monat)</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>📈</div>
            <div className="kpi-value">{conversionRate}%</div>
            <div className="kpi-label">Conversion Rate</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="section-card">
            <h3>Leads nach Quelle</h3>
            {Object.entries(bySource).length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Noch keine Daten</p>
            ) : (
              Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                <div key={source} className="stat-row">
                  <span className="stat-label">{source}</span>
                  <span className="stat-value">{count}</span>
                </div>
              ))
            )}
          </div>

          <div className="section-card">
            <h3>Leads nach Status</h3>
            {Object.entries(byStatus).length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Noch keine Daten</p>
            ) : (
              Object.entries(byStatus).map(([status, count]) => {
                const sc = STATUS_COLORS[status] || STATUS_COLORS.neu;
                return (
                  <div key={status} className="stat-row">
                    <span>
                      <span className="badge" style={{ background: sc.bg, color: sc.color }}>{status}</span>
                    </span>
                    <span className="stat-value">{count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {leads.length === 0 && (
          <div className="empty-state" style={{ marginTop: 24 }}>
            <h3>Noch keine Leads</h3>
            <p>Füge deinen ersten Lead hinzu oder verbinde deine Formulare.</p>
          </div>
        )}
      </div>
    </>
  );
}
