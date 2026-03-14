export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_IDS = process.env.TELEGRAM_CHAT_IDS?.split(',') || [];

    if (!TOKEN || CHAT_IDS.length === 0) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Missing text' });
    }

    const SEND_MESSAGE_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const errors = [];

    for (const chatId of CHAT_IDS) {
        try {
            const response = await fetch(SEND_MESSAGE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId.trim(),
                    text,
                    parse_mode: 'Markdown'
                })
            });
            const data = await response.json();
            if (!data.ok) {
                errors.push(`Chat ${chatId}: ${data.description}`);
            }
        } catch (err) {
            errors.push(`Chat ${chatId}: ${err.message}`);
        }
    }

    if (errors.length > 0) {
        return res.status(502).json({ ok: false, errors });
    }

    return res.status(200).json({ ok: true });
}
