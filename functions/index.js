/* ============================================================
   Firebase Cloud Function — Kommo CRM Proxy
   POST /submitLead  { firstName, lastName, email, phone, idea }
   ============================================================ */

const functions = require('firebase-functions');
const fetch     = require('node-fetch');

const KOMMO_API    = 'https://api-c.kommo.com/api/v4';
const KOMMO_TOKEN  = functions.config().kommo.token;

/* ── CORS helper ─────────────────────────────────────────── */
function setCors(res) {
  res.set('Access-Control-Allow-Origin',  '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

/* ── Main Function ───────────────────────────────────────── */
exports.submitLead = functions.https.onRequest(async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { firstName = '', lastName = '', email = '', phone = '', idea = '' } = req.body || {};

  if (!firstName && !email) {
    res.status(400).json({ error: 'firstName and email are required' });
    return;
  }

  try {
    /* 1. Create contact */
    const contactBody = [{
      first_name: firstName,
      last_name:  lastName,
      custom_fields_values: [
        email && { field_code: 'EMAIL', values: [{ value: email, enum_code: 'WORK' }] },
        phone && { field_code: 'PHONE', values: [{ value: phone, enum_code: 'WORK' }] },
      ].filter(Boolean),
    }];

    const contactRes = await fetch(`${KOMMO_API}/contacts`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${KOMMO_TOKEN}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(contactBody),
    });
    const contactData = await contactRes.json();

    if (!contactRes.ok) {
      console.error('Kommo contacts error:', contactData);
      res.status(502).json({ error: 'Failed to create contact', detail: contactData });
      return;
    }

    const contactId = contactData._embedded?.contacts?.[0]?.id;

    /* 2. Create lead */
    const leadBody = [{
      name: `${firstName} ${lastName}`.trim() || email,
      _embedded: {
        contacts: contactId ? [{ id: contactId }] : [],
      },
      custom_fields_values: idea ? [
        { field_code: 'DESCRIPTION', values: [{ value: idea }] },
      ] : [],
    }];

    const leadRes = await fetch(`${KOMMO_API}/leads`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${KOMMO_TOKEN}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(leadBody),
    });
    const leadData = await leadRes.json();

    if (!leadRes.ok) {
      console.error('Kommo leads error:', leadData);
      res.status(502).json({ error: 'Failed to create lead', detail: leadData });
      return;
    }

    const leadId = leadData._embedded?.leads?.[0]?.id;
    console.log(`Kommo lead created: #${leadId} for ${email}`);
    res.status(200).json({ success: true, leadId });

  } catch (err) {
    console.error('submitLead error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
