import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { STATUS_OPTIONS, SOURCES, TEAM_MEMBERS, STATUS_COLORS } from '../lib/constants';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    const { data, error } = await supabase
      .from('ns_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setLeads(data || []);
    setLoading(false);
  };

  const filtered = leads.filter(l => {
    if (filterStatus && l.status !== filterStatus) return false;
    if (filterSource && l.source !== filterSource) return false;
    if (filterType && l.form_type !== filterType) return false;
    if (filterAssigned && l.assigned_to !== filterAssigned) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(l.name || '').toLowerCase().includes(s) &&
          !(l.email || '').toLowerCase().includes(s) &&
          !(l.company || '').toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const uniqueTypes = [...new Set(leads.map(l => l.form_type).filter(Boolean))];
  const uniqueSources = [...new Set(leads.map(l => l.source).filter(Boolean))];

  if (loading) return <div className="loading"><div className="spinner" />Laden...</div>;

  return (
    <>
      <div className="page-header">
        <div className="page-title">📥 Alle Leads</div>
        <div className="header-actions">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input placeholder="Name, E-Mail, Firma..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/neu')}>+ Neuer Lead</button>
        </div>
      </div>

      <div className="content">
        <div className="filter-bar">
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Alle Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select className="filter-select" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="">Alle Quellen</option>
            {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Alle Typen</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)}>
            <option value="">Alle Mitarbeiter</option>
            {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {(filterStatus || filterSource || filterType || filterAssigned || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilterStatus(''); setFilterSource(''); setFilterType(''); setFilterAssigned(''); setSearch(''); }}>
              ✕ Filter zurücksetzen
            </button>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} Leads</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Keine Leads gefunden</h3>
            <p>Es gibt noch keine Leads oder die Filter passen nicht.</p>
            <button className="btn btn-primary" onClick={() => navigate('/neu')}>+ Lead hinzufügen</button>
          </div>
        ) : (
          <div className="section-card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Name</th>
                  <th>E-Mail</th>
                  <th>Quelle</th>
                  <th>Typ</th>
                  <th>Status</th>
                  <th>Zugewiesen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const sc = STATUS_COLORS[lead.status] || STATUS_COLORS.neu;
                  return (
                    <tr key={lead.id} className="clickable" onClick={() => navigate(`/lead/${lead.id}`)}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(lead.created_at)}</td>
                      <td style={{ fontWeight: 600 }}>{lead.name || '-'}</td>
                      <td>{lead.email || '-'}</td>
                      <td><span className="badge badge-source">{lead.source}</span></td>
                      <td><span className="badge badge-type">{lead.form_type}</span></td>
                      <td>
                        <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                          {lead.status}
                        </span>
                      </td>
                      <td>{lead.assigned_to || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
