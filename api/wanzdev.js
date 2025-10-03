// api/wanzdev.js
// Konfigurasi utama
globalThis.WANZ_CONFIG = {
  domain: "http://oktb.publik-panel.my.id", // Ganti sesuai panel Pterodactyl
  port: "22271"                             // Ganti sesuai port panel
};

(function(global){
  let BASE = `${WANZ_CONFIG.domain}:${WANZ_CONFIG.port}`;

  async function apiFetch(path, opts = {}){
    const url = BASE + path;
    const headers = Object.assign({'Content-Type':'application/json'}, opts.headers || {});
    const method = (opts.method || 'GET').toUpperCase();
    const fetchOpts = { method, headers };
    if(opts.body) fetchOpts.body = JSON.stringify(opts.body);
    const res = await fetch(url, fetchOpts);
    const txt = await res.text();
    try { return JSON.parse(txt); } catch(e) { return { success:false, error:'invalid_json', raw:txt }; }
  }

  async function connect(name, phone){
    return await apiFetch('/connect', { method:'POST', body:{ name, phone }});
  }
  async function getStatus(name){
    return await apiFetch('/status?name=' + encodeURIComponent(name), { method:'GET' });
  }
  async function sendMessage(name, to, text){
    return await apiFetch('/send', { method:'POST', body:{ name, to, text } });
  }
  async function disconnect(name){
    return await apiFetch('/disconnect', { method:'POST', body:{ name } });
  }
  async function listSessions(){
    return await apiFetch('/sessions', { method:'GET' });
  }

  // Expose
  global.Wanzdev = { connect, getStatus, sendMessage, disconnect, listSessions };
})(window);
