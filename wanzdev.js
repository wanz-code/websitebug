// Konfigurasi global — edit domain & port sesuai panel Pterodactyl lo
window.WANZ_CONFIG = {
  domain: "http://oktb.publik-panel.my.id",
  port: "22271",
};

(function (global) {
  const BASE = `${WANZ_CONFIG.domain}:${WANZ_CONFIG.port}`;

  async function apiFetch(path, opts = {}) {
    const url = BASE + path;
    const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    const method = (opts.method || "GET").toUpperCase();
    const fetchOpts = { method, headers };
    if (opts.body) fetchOpts.body = JSON.stringify(opts.body);

    try {
      const res = await fetch(url, fetchOpts);
      const txt = await res.text();
      try {
        return JSON.parse(txt);
      } catch {
        return { success: false, error: "invalid_json", raw: txt };
      }
    } catch (e) {
      return { success: false, error: e.message || "fetch_failed" };
    }
  }

  async function connect(name, phone) {
    return await apiFetch("/connect", { method: "POST", body: { name, phone } });
  }

  async function disconnect(name) {
    return await apiFetch("/disconnect", { method: "POST", body: { name } });
  }

  async function getStatus(name) {
    return await apiFetch(`/status?name=${encodeURIComponent(name)}`);
  }

  async function sendMessage(name, to, text) {
    return await apiFetch("/send", { method: "POST", body: { name, to, text } });
  }

  global.Wanzdev = { connect, disconnect, getStatus, sendMessage };
})(window);