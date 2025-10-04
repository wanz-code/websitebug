// =========================
// ⚙️ KONFIGURASI UTAMA
// =========================

const WANZ_CONFIG = {
  domain: "/api/proxy", // ganti ke domain panel Pterodactyl lo
  port: "22271",                            // port bot.js lo
};

// =========================
// ⚡ UTILITAS UTAMA
// =========================

async function wanzFetch(endpoint, method = "GET", body = null) {
  const { domain, port } = WANZ_CONFIG;

  if (!domain || !port) {
    return {
      success: false,
      message: "Domain atau port belum diatur di wanzdev.js",
      code: "NO_CONFIG",
    };
  }

  const baseUrl = `${domain}:${port}`;
  const url = `${baseUrl}/${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    clearTimeout(timeout);

    if (!res.ok) {
      let text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
    }

    const data = await res.json().catch(() => ({}));

    if (!data || typeof data !== "object") {
      throw new Error("Respon server tidak valid atau kosong.");
    }

    // respons valid
    return { success: true, ...data };

  } catch (err) {
    clearTimeout(timeout);

    // Deteksi jenis error
    let reason = "UNKNOWN";
    if (err.name === "AbortError") reason = "TIMEOUT";
    else if (err.message.includes("Failed to fetch")) reason = "CONNECTION_REFUSED";
    else if (err.message.includes("CORS")) reason = "CORS_BLOCKED";

    console.error(`[WANZDEV] ⚠️ Request gagal ke ${endpoint}:`, err);

    return {
      success: false,
      message: `Gagal menghubungi server: ${err.message}`,
      reason,
      code: "FETCH_ERROR",
      detail: err.stack?.split("\n")[0],
    };
  }
}

// =========================
// 🧩 API FUNGSI UTAMA
// =========================

const Wanzdev = {
  /**
   * Cek status server bot.js
   */
  async status() {
    return await wanzFetch("", "GET");
  },

  /**
   * Minta pairing code baru untuk nomor tertentu
   */
  async connect(name, phone) {
    if (!name || !phone)
      return { success: false, message: "Nama dan nomor wajib diisi." };

    const result = await wanzFetch("connect", "POST", { name, phone });

    // Tangani respon dari backend
    if (!result.success) {
      if (result?.message?.includes("Connection Closed")) {
        result.message = "Koneksi tertutup sebelum pairing code diterima.";
      }
    }

    return result;
  },

  /**
   * Putuskan dan hapus sesi
   */
  async disconnect(name) {
    if (!name) return { success: false, message: "Nama session wajib diisi." };

    const result = await wanzFetch("disconnect", "POST", { name });
    if (result.success) result.message ||= "Session dihapus.";
    return result;
  },

  /**
   * Kirim pesan teks ke nomor
   */
  async sendMessage(name, to, text) {
    if (!name || !to || !text)
      return { success: false, message: "Nama, nomor, dan teks wajib diisi." };

    const result = await wanzFetch("send", "POST", { name, to, text });
    if (result.success) result.message ||= "Pesan berhasil dikirim.";
    return result;
  },

  /**
   * Ambil daftar session aktif
   */
  async listSessions() {
    const result = await wanzFetch("sessions", "GET");
    if (!result.success) result.sessions = [];
    return result;
  },
};

// =========================
// 🛰️ LOGGING STATUS OTOMATIS
// =========================

(async () => {
  const s = await Wanzdev.status();
  if (s.success) {
    console.log("%c[WANZDEV] ✅ Server aktif:", "color:#00ff9c", s.message);
  } else {
    console.warn("%c[WANZDEV] ⚠️ Server tidak aktif:", "color:#ff5050", s.message);
  }
})();

// =========================
// 🌐 EKSPOR KE WINDOW
// =========================
if (typeof window !== "undefined") {
  window.Wanzdev = Wanzdev;
  window.WANZ_CONFIG = WANZ_CONFIG;
}
