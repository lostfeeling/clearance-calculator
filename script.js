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

// Skema sheetmask berdasarkan hari sebelum expired
const skemaSheetmask = [
    { minDays: 0, maxDays: 7, disc: 'STOP', label: '1–7 Hari Sebelum Expired' },
    { minDays: 8, maxDays: 30, disc: 90, label: '8–30 Hari Sebelum Expired' },
    { minDays: 31, maxDays: 60, disc: 70, label: '31–60 Hari (H-2 Bulan) Sebelum Expired' },
    { minDays: 61, maxDays: 90, disc: 50, label: '61–90 Hari (H-3 Bulan) Sebelum Expired' },
    { minDays: 91, maxDays: 120, disc: 30, label: '91–120 Hari (H-4 Bulan) Sebelum Expired' }
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
                return;
            }

            const color = discColor[s.disc];
            const hargaSetelah = Math.round(hargaAwal * (1 - s.disc / 100));
            rows += `<tr>
                <td data-label="Periode">${formatTanggal(startDate)} – ${formatTanggal(endDate)}</td>
                <td data-label="Jarak">${jarakLabel}</td>
                <td data-label="Diskon"><span class="disc-badge" style="background:${color.bg};">${s.disc}%</span></td>
                <td data-label="Warna" style="text-align:center;"><span class="color-dot" style="background:${color.bg};" title="${color.label}"></span> ${color.label}</td>
                <td data-label="Harga" class="harga-cell">${formatRupiah(hargaSetelah)}</td>
            </tr>`;
        });
    }

    let notesText = '';
    if (produk === 'reguler') {
        notesText = `
            <strong>📌 Panduan Skema Diskon - Reguler Product</strong><br>
            • <strong>H-1 bulan</strong> sebelum expired → <span style="color:#c2185b;">⛔ TIDAK BOLEH DIJUAL (STOP)</span><br>
            • <strong>H-2 bulan</strong> sebelum expired → Diskon <strong>90%</strong> <span style="background:#e74c3c; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Merah)<br>
            • <strong>H-3 bulan</strong> sebelum expired → Diskon <strong>80%</strong> <span style="background:#e91e8a; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Pink)<br>
            • <strong>H-4 bulan</strong> sebelum expired → Diskon <strong>70%</strong> <span style="background:#3498db; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Biru)<br>
            • <strong>H-5 bulan</strong> sebelum expired → Diskon <strong>50%</strong> <span style="background:#e67e22; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Orange)<br>
            • <strong>H-6 bulan</strong> sebelum expired → Diskon <strong>40%</strong> <span style="background:#2ecc71; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Hijau)<br>
            • <strong>H-7 bulan</strong> sebelum expired → Diskon <strong>30%</strong> <span style="background:#f1c40f; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Kuning)<br>
            <em>Contoh: Jika hari ini bulan Maret, maka H-2 artinya bulan Mei (2 bulan dari sekarang).</em>
        `;
    } else {
        notesText = `
            <strong>📌 Panduan Skema Diskon - Sheetmask Product</strong><br>
            • <strong>1–7 hari</strong> sebelum expired → <span style="color:#c2185b;">⛔ TIDAK BOLEH DIJUAL (STOP)</span><br>
            • <strong>8–30 hari</strong> sebelum expired → Diskon <strong>90%</strong> <span style="background:#e74c3c; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Merah)<br>
            • <strong>31–60 hari</strong> sebelum expired → Diskon <strong>70%</strong> <span style="background:#3498db; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Biru)<br>
            • <strong>61–90 hari</strong> sebelum expired → Diskon <strong>50%</strong> <span style="background:#e67e22; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Orange)<br>
            • <strong>91–120 hari</strong> sebelum expired → Diskon <strong>30%</strong> <span style="background:#f1c40f; display:inline-block; width:12px; height:12px; border-radius:12px;"></span> (Kuning)<br>
            <em>Catatan: Perhitungan mundur dari tanggal expired. Contoh: expired 30 Juni, maka 8–30 hari sebelum expired adalah 31 Mei – 22 Juni.</em>
        `;
    }

    const info = produk === 'reguler'
        ? `Bulan saat ini: ${formatBulan(parseInt(document.getElementById('bulan2').value))} • Harga normal: ${formatRupiah(hargaAwal)}`
        : `Expired: ${document.getElementById('hariExpired').value} ${bulanNama[document.getElementById('bulan2').value - 1]} • Harga normal: ${formatRupiah(hargaAwal)}`;

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
        <div class="notes">
            *Skema diskon ini berdasarkan Clearance Sale Guidelines 2026
        </div>
    `;
}
