let currentUser = null;

// 1. INISIALISASI APLIKASI
async function initApp(userId) {
    currentUser = userId;
    console.log("App Started for User:", currentUser);

    renderSidebarMenu(); // Munculkan menu di samping
    showTab('rekap');    // Halaman default saat buka adalah Rekap
}

// 2. NAVIGASI TAB (Pindah-pindah Menu)
function showTab(tabName) {
    const content = document.getElementById('content-area');

    // Matikan Sidebar di HP setelah pilih menu
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
    }

    if (tabName === 'rekap') {
        renderHalamanRekap(); // Fungsi ini ada di render.js
    } else if (tabName === 'input') {
        content.innerHTML = `
            <div class="max-w-md mx-auto bg-white p-6 rounded-3xl shadow-sm">
                <h2 class="font-black text-xl mb-6 uppercase tracking-tighter">Input Logbook</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 mb-1">TANGGAL</label>
                        <input type="date" id="in-tgl" class="w-full p-3 bg-slate-100 rounded-xl outline-none">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 mb-1">NOMOR RM</label>
                        <input type="text" id="in-rm" placeholder="00-00-00" class="w-full p-3 bg-slate-100 rounded-xl outline-none">
                    </div>
                    <button onclick="alert('Fungsi Simpan akan kita buat di tahap berikutnya')" class="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg">SIMPAN DATA</button>
                </div>
            </div>`;
    } else if (tabName === 'profil') {
        content.innerHTML = `<div class="p-10 text-center">Halaman Profil (Coming Soon)</div>`;
    }
}

// 3. RENDER MENU SIDEBAR
function renderSidebarMenu() {
    const nav = document.getElementById('main-nav');
    // Jika Mode Atasan, Jangan tampilkan menu input
    if (document.body.classList.contains('mode-viewer')) {
        nav.innerHTML = `<p class="text-[10px] font-bold p-4 text-slate-500 uppercase">Mode Lihat Laporan</p>`;
        return;
    }

    nav.innerHTML = `
        <button onclick="showTab('rekap')" class="w-full text-left p-3 hover:bg-slate-800 rounded-xl transition flex items-center gap-3">
            <span>📊</span> Laporan Rekap
        </button>
        <button onclick="showTab('input')" class="w-full text-left p-3 hover:bg-slate-800 rounded-xl transition flex items-center gap-3">
            <span>✍️</span> Input Harian
        </button>
        <button onclick="showTab('profil')" class="w-full text-left p-3 hover:bg-slate-800 rounded-xl transition flex items-center gap-3">
            <span>👤</span> Profil Saya
        </button>
    `;
}

// 4. TOGGLE SIDEBAR (UNTUK HP)
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}