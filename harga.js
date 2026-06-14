const bulanNama = ['Januari','Februari','Maret','April','Mei','Juni',
                   'Juli','Agustus','September','Oktober','November','Desember'];

const discColor = {
    30: { bg: '#f1c40f', label: 'Kuning' },
    40: { bg: '#2ecc71', label: 'Hijau' },
    50: { bg: '#e67e22', label: 'Orange' },
    70: { bg: '#3498db', label: 'Biru' },
    80: { bg: '#e91e8a', label: 'Pink' },
    90: { bg: '#e74c3c', label: 'Merah' }
};

const skemaReguler = {
    7: 30, 6: 40, 5: 50, 4: 70, 3: 80, 2: 90, 1: 'STOP'
};

// ========== SKEMA SHEETMASK YANG SUDAH DIGANTI ==========
// Berbasis H-7: 0-7 STOP, 8-37=90%, 38-67=70%, 68-97=50%, 98-127=30%
const skemaSheetmask = [
    { minDays: 0, maxDays: 7, disc: 'STOP', label: '1–7 Hari Sebelum Expired (STOP)' },
    { minDays: 8, maxDays: 37, disc: 90, label: '8–37 Hari Sebelum Expired (H-1 bulan dari H-7) — 90%' },
    { minDays: 38, maxDays: 67, disc: 70, label: '38–67 Hari Sebelum Expired (H-2 bulan dari H-7) — 70%' },
    { minDays: 68, maxDays: 97, disc: 50, label: '68–97 Hari Sebelum Expired (H-3 bulan dari H-7) — 50%' },
    { minDays: 98, maxDays: 127, disc: 30, label: '98–127 Hari Sebelum Expired (H-4 bulan dari H-7) — 30%' }
];

function getBulanMaju(bulanSekarang, maju) {
    let b = bulanSekarang + maju;
    if (b > 12) b -= 12;
    return b;
}

function formatBulan(nomorBulan) {
    const nomor = String(nomorBulan).padStart(2, '0');
    return bulanNama[nomorBulan - 1] + ' (' + nomor + ')';
}

function formatTanggal(date) {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

function formatRupiah(angka) {
    if (isNaN(angka)) return '-';
    return 'Rp ' + angka.toLocaleString('id-ID');
}

function generateHarga() {
    const hargaInput = document.getElementById('hargaAwal').value;
    const hargaAwal = parseFloat(hargaInput);
    const produk = document.getElementById('produk2').value;
    const label = produk === 'reguler' ? 'Reguler Product' : 'Sheetmask Product';

    if (!hargaAwal || hargaAwal <= 0) {
        document.getElementById('resultHarga').innerHTML =
            '<p style="color:#c2185b; font-weight:600; font-size:0.9rem; margin-top:10px;">⚠️ Masukkan harga normal yang valid terlebih dahulu.</p>';
        return;
    }

    let rows = '';

    if (produk === 'reguler') {
        const bulanSekarang = parseInt(document.getElementById('bulan2').value);
        for (let maju = 1; maju <= 7; maju++) {
            const blnExpired = getBulanMaju(bulanSekarang, maju);
            const jarakLabel = 'H-' + maju + ' bulan sebelum expired';

            if (maju === 1) {
                rows += `<tr class="warning-row">
                    <td data-label="Bulan Expired">${formatBulan(blnExpired)}</td>
                    <td data-label="Jarak">${jarakLabel}</td>
                    <td data-label="Diskon"><span class="warning-badge">⛔ Tidak Boleh Dijual</span></td>
                    <td data-label="Warna" style="text-align:center;">—</td>
                    <td data-label="Harga" class="harga-cell">—</td>
                </tr>`;
            } else {
                const disc = skemaReguler[maju];
                const color = discColor[disc];
                const hargaSetelah = Math.round(hargaAwal * (1 - disc / 100));
                rows += `<tr>
                    <td data-label="Bulan Expired">${formatBulan(blnExpired)}</td>
                    <td data-label="Jarak">${jarakLabel}</td>
                    <td data-label="Diskon"><span class="disc-badge" style="background:${color.bg};">${disc}%</span></td>
                    <td data-label="Warna" style="text-align:center;"><span class="color-dot" style="background:${color.bg};" title="${color.label}"></span> ${color.label}</td>
                    <td data-label="Harga" class="harga-cell">${formatRupiah(hargaSetelah)}</td>
                </tr>`;
            }
        }
    } else {
        // SHEETMASK: baca bulan dan hari
        const bulanExpired = parseInt(document.getElementById('bulan2').value);
        const hariExpired = parseInt(document.getElementById('hariExpired').value);

        if (!hariExpired || hariExpired < 1 || hariExpired > 31) {
            document.getElementById('resultHarga').innerHTML =
                '<p style="color:#c2185b; font-weight:600;">⚠️ Isi tanggal expired (1–31) terlebih dahulu.</p>';
            return;
        }

        // Tentukan tahun expired otomatis
        const now = new Date();
        const thisYear = now.getFullYear();
        let expiredDate = new Date(thisYear, bulanExpired - 1, hariExpired);
        if (expiredDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            expiredDate.setFullYear(thisYear + 1);
        }

        // Gunakan skemaSheetmask yang baru (sudah diganti di atas)
        skemaSheetmask.forEach(s => {
            const startDate = new Date(expiredDate);
            startDate.setDate(expiredDate.getDate() - s.maxDays);
            const endDate = new Date(expiredDate);
            endDate.setDate(expiredDate.getDate() - s.minDays);

            const jarakLabel = s.label;

            if (s.disc === 'STOP') {
                rows += `<tr class="warning-row">
                    <td data-label="Periode">${formatTanggal(startDate)} – ${formatTanggal(endDate)}</td>
                    <td data-label="Jarak">${jarakLabel}</td>
                    <td data-label="Diskon"><span class="warning-badge">⛔ Tidak Boleh Dijual</span></td>
                    <td data-label="Warna" style="text-align:center;">—</td>
                    <td data-label="Harga" class="harga-cell">—</td>
                </tr>`;
            } else {
                const color = discColor[s.disc];
                const hargaSetelah = Math.round(hargaAwal * (1 - s.disc / 100));
                rows += `<tr>
                    <td data-label="Periode">${formatTanggal(startDate)} – ${formatTanggal(endDate)}</td>
                    <td data-label="Jarak">${jarakLabel}</td>
                    <td data-label="Diskon"><span class="disc-badge" style="background:${color.bg};">${s.disc}%</span></td>
                    <td data-label="Warna" style="text-align:center;"><span class="color-dot" style="background:${color.bg};" title="${color.label}"></span> ${color.label}</td>
                    <td data-label="Harga" class="harga-cell">${formatRupiah(hargaSetelah)}</td>
                </tr>`;
            }
        });
    }

    const info = produk === 'reguler'
        ? `Bulan saat ini: ${formatBulan(parseInt(document.getElementById('bulan2').value))} • Harga normal: ${formatRupiah(hargaAwal)}`
        : `Expired: ${document.getElementById('hariExpired').value} ${bulanNama[document.getElementById('bulan2').value - 1]} • Harga normal: ${formatRupiah(hargaAwal)}`;

    let notesText = '';
if (produk === 'reguler') {
    notesText = `
        📌 <strong>PANDUAN SKEMA DISKON UNTUK PRODUK REGULER</strong><br>
        • H-1 bulan sebelum kadaluarsa → <strong>TIDAK BOLEH DIJUAL</strong> (STOP)<br>
        • H-2 bulan sebelum kadaluarsa → Diskon <strong>90%</strong> (warna Merah)<br>
        • H-3 bulan sebelum kadaluarsa → Diskon <strong>80%</strong> (warna Pink)<br>
        • H-4 bulan sebelum kadaluarsa → Diskon <strong>70%</strong> (warna Biru)<br>
        • H-5 bulan sebelum kadaluarsa → Diskon <strong>50%</strong> (warna Orange)<br>
        • H-6 bulan sebelum kadaluarsa → Diskon <strong>40%</strong> (warna Hijau)<br>
        • H-7 bulan sebelum kadaluarsa → Diskon <strong>30%</strong> (warna Kuning)<br>
        <em>Contoh: Jika hari ini bulan Maret, maka H-2 artinya bulan Mei (2 bulan dari sekarang).</em>
    `;
} else {
    notesText = `
        📌 <strong>PANDUAN SKEMA DISKON UNTUK PRODUK SHEETMASK</strong><br>
        • <strong>1–7 hari sebelum kadaluarsa</strong> → <strong>TIDAK BOLEH DIJUAL</strong> (STOP)<br>
        • <strong>8–37 hari sebelum kadaluarsa</strong> → Diskon <strong>90%</strong> (warna Merah)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;<em>≈ setara 1 bulan sebelum tanggal H-7</em><br>
        • <strong>38–67 hari sebelum kadaluarsa</strong> → Diskon <strong>70%</strong> (warna Biru)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;<em>≈ setara 2 bulan sebelum tanggal H-7</em><br>
        • <strong>68–97 hari sebelum kadaluarsa</strong> → Diskon <strong>50%</strong> (warna Orange)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;<em>≈ setara 3 bulan sebelum tanggal H-7</em><br>
        • <strong>98–127 hari sebelum kadaluarsa</strong> → Diskon <strong>30%</strong> (warna Kuning)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;<em>≈ setara 4 bulan sebelum tanggal H-7</em><br>
        <strong>*Catatan:</strong> H-7 adalah 7 hari sebelum tanggal kadaluarsa. Perhitungan hari mundur dari tanggal expired.<br>
        <em>Contoh: Jika kadaluarsa 30 Juni, maka H-7 = 23 Juni. Rentang 8–37 hari sebelum expired = 24 Mei – 23 Juni.</em>
    `;
}
  
    document.getElementById('resultHarga').innerHTML = `
        <div class="result-header">
            Harga Setelah Diskon — <span>${label}</span><br>
            <small style="font-weight:400;color:#e084ab;">${info}</small>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Periode Penjualan</th>
                    <th>Jarak ke Expired</th>
                    <th>Diskon</th>
                    <th style="text-align:center;">Warna</th>
                    <th>Harga Setelah Diskon</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <div class="notes">${notesText}</div>
    `;
}
