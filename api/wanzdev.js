// api/wanzdev.js
// Config utama — edit sesuai panel Pterodactyl
globalThis.WANZ_CONFIG = {
  domain: "http://oktb.publik-panel.my.id", // isi dengan domain panel lu
  port: "22271"                             // isi dengan port panel lu
};

(function(global){
  let BASE = `${WANZ_CONFIG.domain}:${WANZ_CONFIG.port}`;

  function setBase(d, p){
    BASE = `${d}:${p}`;
    console.log("[Wanzdev] Base di-set ke", BASE);
  }

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

  // expose
  global.Wanzdev = {
    setBase,
    connect,
    getStatus,
    sendMessage,
    disconnect,
    listSessions
  };
})(window);
