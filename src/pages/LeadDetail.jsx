import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { STATUS_OPTIONS, TEAM_MEMBERS, STATUS_COLORS } from '../lib/constants';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => { loadLead(); }, [id]);

  const loadLead = async () => {
    const { data, error } = await supabase.from('ns_leads').select('*').eq('id', id).single();
    if (error) { navigate('/'); return; }
    setLead(data);
    setNotes(data.notes || '');
    setLoading(false);
  };

  const updateField = async (field, value) => {
    setSaving(true);
    const updates = { [field]: value, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('ns_leads').update(updates).eq('id', id);
    if (!error) {
      setLead(prev => ({ ...prev, ...updates }));
      showToast('Gespeichert');
    } else {
      showToast('Fehler beim Speichern', true);
    }
    setSaving(false);
  };

  const saveNotes = async () => {
    await updateField('notes', notes);
  };

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="loading"><div className="spinner" />Laden...</div>;
  if (!lead) return null;

  const sc = STATUS_COLORS[lead.status] || STATUS_COLORS.neu;
  const formData = lead.form_data && typeof lead.form_data === 'object' && Object.keys(lead.form_data).length > 0 ? lead.form_data : null;

  return (
    <>
      <div className="detail-header">
        <div className="detail-breadcrumb">
          <a onClick={() => navigate('/')}>Alle Leads</a>
          <span>/</span>
          <span>{lead.name || lead.email || 'Lead'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="detail-title">{lead.name || 'Unbenannter Lead'}</div>
          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 13, padding: '4px 12px' }}>
            {lead.status}
          </span>
        </div>
        <div className="detail-meta">
          <div className="detail-meta-item">📅 {formatDate(lead.created_at)}</div>
          {lead.email && <div className="detail-meta-item">✉️ {lead.email}</div>}
          {lead.phone && <div className="detail-meta-item">📞 {lead.phone}</div>}
          {lead.company && <div className="detail-meta-item">🏢 {lead.company}</div>}
        </div>
      </div>

      <div className="content">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          {/* Left Column */}
          <div>
            {/* Message */}
            {lead.message && (
              <div className="section-card">
                <h3>Nachricht</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{lead.message}</p>
              </div>
            )}

            {/* Form Data */}
            {formData && (
              <div className="section-card">
                <h3>Formular-Daten</h3>
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{key}</span>
                    <span style={{ fontWeight: 500 }}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="section-card">
              <h3>Notizen</h3>
              <textarea className="form-input" rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Notizen zum Lead..." />
              <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={saveNotes} disabled={saving}>
                {saving ? 'Speichern...' : 'Notizen speichern'}
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Status & Assignment */}
            <div className="section-card">
              <h3>CRM</h3>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={lead.status} onChange={e => updateField('status', e.target.value)}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Zugewiesen an</label>
                <select className="form-input" value={lead.assigned_to || ''} onChange={e => updateField('assigned_to', e.target.value || null)}>
                  <option value="">— Nicht zugewiesen —</option>
                  {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Source Info */}
            <div className="section-card">
              <h3>Quelle</h3>
              <div style={{ fontSize: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Quelle</span>
                  <div><span className="badge badge-source">{lead.source}</span></div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Formular-Typ</span>
                  <div><span className="badge badge-type">{lead.form_type}</span></div>
                </div>
                {lead.page_url && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Seite</span>
                    <div style={{ fontSize: 12, wordBreak: 'break-all' }}>
                      <a href={lead.page_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{lead.page_url}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="section-card">
              <h3>Meta</h3>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <div>Erstellt: {formatDate(lead.created_at)}</div>
                <div>Aktualisiert: {formatDate(lead.updated_at)}</div>
                <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 10 }}>ID: {lead.id}</div>
              </div>
            </div>
          </div>
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
          ← Zurück zur Übersicht
        </button>
      </div>

      {toast && (
        <div className={`toast ${toast.isError ? 'toast-error' : 'toast-success'}`}>{toast.msg}</div>
      )}
    </>
  );
}
