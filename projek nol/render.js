// 1. FUNGSI UTAMA HALAMAN REKAP
async function renderHalamanRekap() {
    const content = document.getElementById('content-area');
    const thnSkrg = new Date().getFullYear();

    // Siapkan Kerangka Filter & Area Tabel
    content.innerHTML = `
        <div class="no-print bg-white p-6 rounded-3xl shadow-sm mb-6 flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[150px]">
                <label class="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Pilih Bulan</label>
                <select id="f-bulan" onchange="renderSemua()" class="w-full p-3 bg-slate-100 rounded-xl outline-none text-sm font-bold">
                    <option value="0">Januari</option><option value="1">Februari</option><option value="2">Maret</option>
                    <option value="3">April</option><option value="4">Mei</option><option value="5">Juni</option>
                    <option value="6">Juli</option><option value="7">Agustus</option><option value="8">September</option>
                    <option value="9">Oktober</option><option value="10">November</option><option value="11">Desember</option>
                </select>
            </div>
            <div class="w-32">
                <label class="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Tahun</label>
                <select id="f-tahun" onchange="renderSemua()" class="w-full p-3 bg-slate-100 rounded-xl outline-none text-sm font-bold">
                    <option value="${thnSkrg}">${thnSkrg}</option>
                    <option value="${thnSkrg - 1}">${thnSkrg - 1}</option>
                </select>
            </div>
            <button onclick="window.print()" class="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Cetak</button>
            <button onclick="exportToExcel()" class="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-200">Excel</button>
        </div>
        
        <div id="rekap-container" class="bg-white p-6 md:p-12 shadow-2xl rounded-sm border min-h-screen">
            <div id="table-output" class="table-container">
                <p class="text-center py-20 text-slate-300 italic">Memproses data laporan...</p>
            </div>
        </div>
    `;

    // Set bulan sekarang sebagai default
    document.getElementById('f-bulan').value = new Date().getMonth();
    renderSemua();
}

// 2. LOGIKA MATEMATIKA TABEL (Sesuai index.html lama)
async function renderSemua() {
    const bln = parseInt(document.getElementById('f-bulan').value);
    const thn = parseInt(document.getElementById('f-tahun').value);
    const output = document.getElementById('table-output');

    try {
        // Ambil Data Profil, Kamus, dan Logbook secara paralel
        const [p, k, l, all] = await Promise.all([
            _supabase.from('profiles').select('*').eq('id', currentUser).single(),
            _supabase.from('kamus_kegiatan').select('*').eq('user_id', currentUser),
            _supabase.from('logbook_harian').select('*').eq('user_id', currentUser)
                .gte('tanggal', `${thn}-${String(bln + 1).padStart(2, '0')}-01`)
                .lte('tanggal', `${thn}-${String(bln + 1).padStart(2, '0')}-${new Date(thn, bln + 1, 0).getDate()}`),
            _supabase.from('logbook_harian').select('qty, kegiatan_id').eq('user_id', currentUser)
        ]);

        const profile = p.data;
        const kamus = k.data || [];
        const logs = l.data || [];
        const logsTotal = all.data || [];

        // Buat Tabel Matriks
        const totalDays = new Date(thn, bln + 1, 0).getDate();
        let html = `<table>
            <thead>
                <tr>
                    <th rowspan="2" class="w-8">No</th>
                    <th rowspan="2">Butir Kegiatan (Target | Real | Sisa)</th>
                    <th colspan="${totalDays}">Tanggal</th>
                    <th rowspan="2" class="w-10">Total</th>
                </tr>
                <tr>`;

        for (let d = 1; d <= totalDays; d++) html += `<th class="w-6 text-[7pt]">${d}</th>`;
        html += `</tr></thead><tbody>`;

        kamus.forEach((kg, idx) => {
            const realAll = logsTotal.filter(x => x.kegiatan_id === kg.id).reduce((s, c) => s + (c.qty || 0), 0);
            const sisa = (kg.target_tahunan || 0) - realAll;
            let sumBulan = 0;

            html += `<tr>
                <td class="text-center">${idx + 1}</td>
                <td>
                    <div class="font-bold text-slate-800">${kg.nama_kegiatan}</div>
                    <div class="text-[7pt] text-blue-600 font-bold uppercase">T:${kg.target_tahunan} | R:${realAll} | S:${sisa}</div>
                </td>`;

            for (let d = 1; d <= totalDays; d++) {
                const tgl = `${thn}-${String(bln + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const q = logs.filter(x => x.kegiatan_id === kg.id && x.tanggal === tgl).reduce((s, c) => s + (c.qty || 0), 0);
                sumBulan += q;
                html += `<td class="text-center ${q > 0 ? 'bg-blue-50 font-bold' : 'text-slate-200'}">${q || ''}</td>`;
            }
            html += `<td class="text-center font-black bg-slate-50">${sumBulan}</td></tr>`;
        });

        html += `</tbody></table>`;
        output.innerHTML = html;

    } catch (err) {
        output.innerHTML = `<div class="p-10 text-red-500 font-bold">Error: ${err.message}</div>`;
    }
}

// 3. FUNGSI EKSPOR EXCEL (Sesuai fitur lama Anda)
function exportToExcel() {
    const table = document.querySelector("table");
    const wb = XLSX.utils.table_to_book(table, { sheet: "Logbook" });
    XLSX.writeFile(wb, `Logbook_Export_${new Date().getTime()}.xlsx`);
}