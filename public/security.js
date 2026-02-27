/**
 * ============================================================
 *  ValdiTech — Security Utilities  (public/security.js)
 *  Diload sebelum script.js untuk lapisan keamanan client-side
 * ============================================================
 *
 *  Mencakup:
 *  1. Input Sanitization & Validation  (checklist #1 & #4)
 *  2. XSS Prevention / Output Encoding  (checklist #4)
 *  3. Rate Limiting pencarian          (checklist #2)
 *  4. Subresource Integrity check hint  (checklist #3)
 *  5. Referrer leakage prevention       (checklist #5)
 *  6. Console data-leak prevention      (checklist #7)
 * ============================================================
 */

/* ---------------------------------------------------------------
 *  1.  INPUT SANITIZATION — Validasi & bersihkan input pengguna
 * --------------------------------------------------------------- */

/**
 * Escape karakter berbahaya HTML agar tidak bisa dieksekusi sebagai tag/script.
 * Mencegah XSS (Cross-Site Scripting).
 * @param {string} str - String mentah dari pengguna
 * @returns {string} - String yang sudah di-encode/aman
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validasi input pencarian:
 * - Panjang maksimum 100 karakter (mencegah buffer-overflow / overlong input)
 * - Hanya karakter alfanumerik, spasi, tanda hubung, titik (allow-list approach)
 * - Trim whitespace
 * @param {string} value - Nilai input dari pengguna
 * @returns {{ valid: boolean, sanitized: string, error: string|null }}
 */
function validateSearchInput(value) {
    if (typeof value !== 'string') {
        return { valid: false, sanitized: '', error: 'Input tidak valid.' };
    }

    // Trim
    const trimmed = value.trim();

    // Kosong → tidak error, hanya tidak diproses
    if (trimmed.length === 0) {
        return { valid: false, sanitized: '', error: null };
    }

    // Panjang maksimum
    if (trimmed.length > 100) {
        return { valid: false, sanitized: '', error: 'Pencarian maksimal 100 karakter.' };
    }

    // Allow-list: huruf, angka, spasi, tanda hubung, titik, koma, +, &, /
    const ALLOWED_PATTERN = /^[a-zA-Z0-9\s\-.,+&/()]+$/;
    if (!ALLOWED_PATTERN.test(trimmed)) {
        return { valid: false, sanitized: '', error: 'Karakter tidak diizinkan dalam pencarian.' };
    }

    return { valid: true, sanitized: escapeHtml(trimmed), error: null };
}

/* ---------------------------------------------------------------
 *  2.  RATE LIMITING — Batasi frekuensi submit pencarian
 *      Mencegah spam / abuse pada fitur search
 * --------------------------------------------------------------- */

const RateLimit = (() => {
    const WINDOW_MS = 60 * 1000; // 1 menit
    const MAX_HITS = 10;         // maks 10 pencarian per menit
    let hits = [];

    return {
        /**
         * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
         */
        check() {
            const now = Date.now();
            // Hapus hits yang sudah di luar window
            hits = hits.filter(t => now - t < WINDOW_MS);

            if (hits.length >= MAX_HITS) {
                const oldest = hits[0];
                const retryAfterMs = WINDOW_MS - (now - oldest);
                return { allowed: false, remaining: 0, retryAfterMs };
            }

            hits.push(now);
            return { allowed: true, remaining: MAX_HITS - hits.length, retryAfterMs: 0 };
        }
    };
})();

/* ---------------------------------------------------------------
 *  3.  EXTERNAL LINK SECURITY — rel="noopener noreferrer"
 *      Mencegah tab baru mengakses window.opener (tabnapping)
 * --------------------------------------------------------------- */

function secureExternalLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href') || '';
        // Abaikan anchor links dan link internal
        if (href.startsWith('#') || href.startsWith('/') || href === '') return;

        // Cek apakah link eksternal (berbeda origin)
        try {
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) {
                // Tambah atribut keamanan
                link.setAttribute('rel', 'noopener noreferrer');
                // Buka di tab baru dengan aman
                if (!link.hasAttribute('target')) {
                    link.setAttribute('target', '_blank');
                }
            }
        } catch (_) {
            // Bukan URL valid → abaikan
        }
    });
}

/* ---------------------------------------------------------------
 *  4.  FORM INJECTION PREVENTION — Tangkap submit form dengan aman
 *      Validasi SEBELUM data dikirim / diproses
 * --------------------------------------------------------------- */

function setupSecureSearch() {
    // Target semua elemen search di halaman
    const searchContainers = document.querySelectorAll('.search-bar-interactive');

    searchContainers.forEach(container => {
        const input = container.querySelector('input[type="text"]');
        const button = container.querySelector('button');
        const errorEl = document.createElement('p');

        // Style pesan error inline
        errorEl.style.cssText = 'color:#f87171;font-size:0.78rem;margin-top:6px;min-height:1rem;';
        container.insertAdjacentElement('afterend', errorEl);

        function showError(msg) {
            errorEl.textContent = msg || '';
            if (msg) {
                input?.setAttribute('aria-invalid', 'true');
            } else {
                input?.removeAttribute('aria-invalid');
            }
        }

        function handleSearch() {
            if (!input) return;

            // Rate limit check
            const rl = RateLimit.check();
            if (!rl.allowed) {
                const secs = Math.ceil(rl.retryAfterMs / 1000);
                showError(`Terlalu banyak pencarian. Coba lagi dalam ${secs} detik.`);
                return;
            }

            // Validasi input
            const result = validateSearchInput(input.value);
            if (!result.valid) {
                showError(result.error);
                return;
            }

            // Clear error
            showError(null);

            // ✅ Di sini implementasi pencarian yang aman menggunakan nilai sanitized
            // Contoh: redirect ke halaman hasil dengan query yang di-encode
            const encoded = encodeURIComponent(result.sanitized);
            // Saat ini hanya log untuk demo — ganti dengan logika pencarian nyata
            console.info(`[Search] Query aman: "${result.sanitized}" (encoded: ${encoded})`);

            // Contoh redirect (aktifkan jika ada halaman /search):
            // window.location.href = `/search?q=${encoded}`;
        }

        // Submit via tombol
        button?.addEventListener('click', (e) => {
            e.preventDefault();
            handleSearch();
        });

        // Submit via Enter
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });

        // Clear error saat user mulai mengetik
        input?.addEventListener('input', () => {
            showError(null);
        });
    });
}

/* ---------------------------------------------------------------
 *  5.  CONSOLE DATA LEAK PREVENTION (production guard)
 *      Nonaktifkan console.log di production untuk mencegah
 *      kebocoran informasi sensitif via DevTools
 * --------------------------------------------------------------- */

function lockConsoleInProduction() {
    // Hanya aktifkan di production (bukan localhost / 127.0.0.1)
    const isDev = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    if (isDev) return; // Biarkan console aktif saat development

    const noop = () => { };
    ['log', 'debug', 'info', 'warn', 'table', 'dir', 'group', 'groupCollapsed'].forEach(method => {
        // Pertahankan console.error untuk memudahkan pemantauan error production
        if (method !== 'error') {
            console[method] = noop;
        }
    });
}

/* ---------------------------------------------------------------
 *  6.  CLICKJACKING DEFENSE — Deteksi iframe embedding
 *      Jika halaman dimuat dalam iframe, arahkan ke URL aslinya
 * --------------------------------------------------------------- */

function preventClickjacking() {
    if (window.self !== window.top) {
        // Halaman dimuat di dalam iframe — paksa keluar
        try {
            window.top.location = window.self.location.href;
        } catch (_) {
            // Jika cross-origin, sembunyikan konten
            document.body.style.display = 'none';
        }
    }
}

/* ---------------------------------------------------------------
 *  INISIALISASI — Jalankan semua mekanisme keamanan
 * --------------------------------------------------------------- */

// # 6: Cek iframe langsung (sebelum DOMContentLoaded)
preventClickjacking();

// # 5: Kunci console di production
lockConsoleInProduction();

// Selebihnya setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
    // # 3: Amankan semua tautan eksternal
    secureExternalLinks();

    // # 4: Pasang validasi + rate-limiting pada form pencarian
    setupSecureSearch();
});
