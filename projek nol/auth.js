// GANTI DENGAN KREDENSIAL ANDA
const SUPABASE_URL = 'https://dgcuojykzhujodcijcgw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oZUTzKxvLf5oXbfLK7vC3A_qvggOb1j';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variabel Global
let authMode = 'login'; // login, signup, recovery

// 1. CEK STATUS LOGIN & RECOVERY TOKEN
async function checkSession() {
    const loader = document.getElementById('loader');

    // DETEKSI LINK RESET PASSWORD DARI EMAIL
    if (window.location.hash.includes("type=recovery")) {
        const newPass = prompt("Masukkan Password Baru Anda:");
        if (newPass) {
            const { error } = await _supabase.auth.updateUser({ password: newPass });
            if (error) alert("Gagal update: " + error.message);
            else {
                alert("Password berhasil diperbarui! Silakan masuk.");
                window.location.hash = ""; // Bersihkan URL
                location.reload();
            }
        }
        return;
    }

    const { data: { session } } = await _supabase.auth.getSession();
    const urlParams = new URLSearchParams(window.location.search);
    const viewId = urlParams.get('view');

    loader.style.display = 'none';

    if (viewId) {
        // Mode Atasan (Tanpa Login)
        document.body.classList.add('mode-viewer');
        document.getElementById('app-section').classList.remove('hidden');
        initApp(viewId);
    } else if (session) {
        // Mode Admin (Login Berhasil)
        document.getElementById('app-section').classList.remove('hidden');
        initApp(session.user.id);
    } else {
        // Belum Login
        document.getElementById('auth-section').classList.remove('hidden');
        renderAuthForm();
    }
}

// 2. TAMPILAN FORM LOGIN / DAFTAR
function renderAuthForm() {
    const container = document.getElementById('auth-container');
    if (authMode === 'login') {
        container.innerHTML = `
            <h2 class="text-2xl font-black mb-2 italic">LOGBOOK<span class="text-blue-600">PRO</span></h2>
            <p class="text-slate-500 text-sm mb-6 font-medium tracking-tight">Selamat datang kembali, silakan masuk.</p>
            <div class="space-y-4">
                <input type="email" id="email" placeholder="Email" class="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all">
                <input type="password" id="password" placeholder="Password" class="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all">
                <button onclick="handleLogin()" class="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 uppercase tracking-tighter">Masuk</button>
                <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    <button onclick="setAuthMode('signup')">Daftar Akun</button>
                    <button onclick="handleForgotPassword()" class="text-red-400">Lupa Password?</button>
                </div>
            </div>`;
    } else {
        container.innerHTML = `
            <h2 class="text-2xl font-black mb-2 italic">BUAT AKUN</h2>
            <p class="text-slate-500 text-sm mb-6 font-medium">Mulai kelola logbook Anda hari ini.</p>
            <div class="space-y-4">
                <input type="email" id="email" placeholder="Email Baru" class="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-blue-500">
                <input type="password" id="password" placeholder="Password Baru" class="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-blue-500">
                <button onclick="handleSignUp()" class="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold shadow-lg uppercase tracking-tighter">Daftar Sekarang</button>
                <button onclick="setAuthMode('login')" class="w-full text-xs font-bold text-slate-400 uppercase tracking-widest">Sudah punya akun? Masuk</button>
            </div>`;
    }
}

function setAuthMode(mode) { authMode = mode; renderAuthForm(); }

// 3. FUNGSI LOGIC AUTH
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); else location.reload();
}

async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await _supabase.auth.signUp({ email, password });
    if (error) alert(error.message); else alert("Cek email Anda untuk konfirmasi!");
}

async function handleForgotPassword() {
    const email = document.getElementById('email').value;
    if (!email) return alert("Masukkan email Anda di kolom input dahulu.");
    const { error } = await _supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) alert(error.message); else alert("Link pemulihan dikirim ke email!");
}

async function handleLogout() {
    await _supabase.auth.signOut();
    location.reload();
}

// Jalankan pengecekan saat halaman dimuat
window.onload = checkSession;