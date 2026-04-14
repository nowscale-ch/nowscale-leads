import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SOURCES, FORM_TYPES_ADD, TEAM_MEMBERS } from '../lib/constants';

export default function LeadNew() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', message: '',
    source: 'Manuell', form_type: 'Kontaktanfrage', assigned_to: '',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name && !form.email) { setError('Bitte mindestens Name oder E-Mail angeben'); return; }
    setError('');
    setSaving(true);
    const { data, error: err } = await supabase.from('ns_leads').insert({
      name: form.name || null,
      email: form.email || null,
      phone: form.phone || null,
      company: form.company || null,
      message: form.message || null,
      source: form.source,
      form_type: form.form_type,
      assigned_to: form.assigned_to || null,
      status: 'neu',
    }).select().single();

    if (err) {
      setError('Fehler beim Speichern: ' + err.message);
      setSaving(false);
      return;
    }
    navigate(`/lead/${data.id}`);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">➕ Lead hinzufügen</div>
      </div>
      <div className="content">
        <div className="section-card" style={{ maxWidth: 640 }}>
          {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="Max Muster" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input className="form-input" type="email" placeholder="max@beispiel.ch" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefon</label>
              <input className="form-input" placeholder="+41 79 123 45 67" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Firma</label>
              <input className="form-input" placeholder="Firma GmbH" value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nachricht</label>
            <textarea className="form-input" rows={4} placeholder="Nachricht oder Kontext..." value={form.message} onChange={e => set('message', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quelle</label>
              <select className="form-input" value={form.source} onChange={e => set('source', e.target.value)}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Typ</label>
              <select className="form-input" value={form.form_type} onChange={e => set('form_type', e.target.value)}>
                {FORM_TYPES_ADD.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Zuweisen an</label>
            <select className="form-input" value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)}>
              <option value="">— Nicht zugewiesen —</option>
              {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Speichern...' : '💾 Lead speichern'}
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Abbrechen</button>
          </div>
        </div>
      </div>
    </>
  );
}
