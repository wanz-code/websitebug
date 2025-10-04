export default async function handler(req, res) {
  try {
    const target = `http://oktb.publik-panel.my.id:22271${req.url.replace(/^\/api\/proxy/, '')}`;
    const response = await fetch(target, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
