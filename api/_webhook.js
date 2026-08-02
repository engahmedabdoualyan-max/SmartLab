/* smartLAB — Webhook dispatch helper (Vercel Serverless Function)
 * Sends WhatsApp/SMS notifications when an engineer approves a specimen.
 * Provider selection (first match wins):
 *   1. Twilio  — requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE.
 *      Set TWILIO_USE_WHATSAPP=true to deliver via WhatsApp instead of SMS.
 *   2. Generic — WHATSAPP_WEBHOOK_URL (POSTs a JSON payload to your own gateway).
 *   3. Dry run — nothing configured: records a dry_run row so the pipeline is
 *      still auditable while you are scaffolding.
 * Every dispatch is recorded in public.webhook_logs.
 */

const SB = require('./_supabase');

function buildMessage(event, specimen, portalUrl) {
    const samples = [
        'Sample: ' + (specimen.sample_no || '--'),
        'Status: ' + (specimen.status || '--').toUpperCase(),
        'Project: ' + (specimen.project || '--'),
        'Material: ' + (specimen.material_type || '--')
    ];
    if (specimen.location) samples.push('Location: ' + specimen.location);
    if (portalUrl) samples.push('Track it here: ' + portalUrl);
    return 'smartLAB · ' + (event === 'specimen.approved' ? 'Approved' : 'Update') + '\n' + samples.join('\n');
}

async function dispatchTwilio(c, cfgEnv, message, to) {
    const twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + cfgEnv.sid + '/Messages.json';
    const useWhatsApp = cfgEnv.whatsapp === 'true';
    const from = useWhatsApp ? 'whatsapp:' + cfgEnv.from : cfgEnv.from;
    const toAddr = useWhatsApp && to.indexOf('whatsapp:') !== 0 ? 'whatsapp:' + to : to;
    const body = new URLSearchParams({ From: from, To: toAddr, Body: message });
    const resp = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(cfgEnv.sid + ':' + cfgEnv.token).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    });
    const data = await resp.json().catch(function(){ return {}; });
    return {
        provider: useWhatsApp ? 'twilio_whatsapp' : 'twilio_sms',
        status: resp.ok ? 'sent' : 'failed',
        response: data
    };
}

async function dispatchGeneric(c, cfgEnv, message, payload) {
    const resp = await fetch(cfgEnv.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ text: message }, payload))
    });
    let data = {};
    try { data = await resp.json(); } catch (e) { data = { http: resp.status }; }
    return { provider: 'generic_webhook', status: resp.ok ? 'sent' : 'failed', response: data };
}

/* Dispatches a notification for an event (e.g. specimen.approved) and writes
 * an audit row to webhook_logs. Never throws — always resolves to a result. */
async function dispatchNotification(c, opts) {
    const event = opts.event || 'specimen.update';
    const specimen = opts.specimen || {};
    const profile = opts.profile || null;
    const payload = { event: event, specimen: specimen, ts: new Date().toISOString() };

    const cfgEnv = {
        sid: process.env.TWILIO_ACCOUNT_SID || '',
        token: process.env.TWILIO_AUTH_TOKEN || '',
        from: process.env.TWILIO_PHONE || '',
        whatsapp: process.env.TWILIO_USE_WHATSAPP || 'false',
        url: process.env.WHATSAPP_WEBHOOK_URL || ''
    };
    const portalUrl = process.env.CLIENT_PORTAL_URL || '';
    const message = buildMessage(event, specimen, portalUrl);
    const destination = (profile && profile.phone) || (cfgEnv.url ? cfgEnv.url : '');

    let result;
    if (cfgEnv.sid && cfgEnv.token && cfgEnv.from) {
        result = await dispatchTwilio(c, cfgEnv, message, destination);
    } else if (cfgEnv.url) {
        result = await dispatchGeneric(c, cfgEnv, message, payload);
    } else {
        result = { provider: 'dry_run', status: 'queued', response: { note: 'No Twilio/webhook configured; dispatch skipped.' } };
    }

    const log = await SB.pgInsert(c, 'webhook_logs', {
        specimen_id: specimen.id || null,
        event: event,
        provider: result.provider,
        destination: destination || null,
        payload: payload,
        status: result.status,
        response: result.response
    });

    return { result: result, log: log };
}

module.exports = { dispatchNotification: dispatchNotification, buildMessage: buildMessage };
