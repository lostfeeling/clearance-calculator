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

const skemaSheetmask = [
    { maju: 0, disc: 'STOP', weekLabel: 'Minggu 1'   },  // expired bulan ini, minggu 1
    { maju: 0, disc: 90,     weekLabel: 'Minggu 2-4' },  // expired bulan ini, minggu 2-4
    { maju: 1, disc: 70,     weekLabel: null },            // expired bulan depan
    { maju: 2, disc: 50,     weekLabel: null },            // expired 2 bulan lagi
    { maju: 3, disc: 30,     weekLabel: null },            // expired 3 bulan lagi
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

function generate() {
    const bulanSekarang = parseInt(document.getElementById('bulan').value);
    const produk = document.getElementById('produk').value;
    const label = produk === 'reguler' ? 'Reguler Product' : 'Sheetmask Product';

    let rows = '';

    if (produk === 'reguler') {
        for (let maju = 1; maju <= 7; maju++) {
            const blnExpired = getBulanMaju(bulanSekarang, maju);
            const jarakLabel = 'H-' + maju + ' bulan sebelum expired';

            if (maju === 1) {
                rows += `<tr class="warning-row">
                    <td data-label="Bulan Expired">${formatBulan(blnExpired)}</td>
                    <td data-label="Jarak">${jarakLabel}</td>
                    <td data-label="Diskon"><span class="warning-badge">⛔ Tidak Boleh Dijual</span></td>
                    <td data-label="Warna" style="text-align:center;">—</td>
                </tr>`;
            } else {
                const disc = skemaReguler[maju];
                const color = discColor[disc];
                rows += `<tr>
                    <td data-label="Bulan Expired">${formatBulan(blnExpired)}</td>
                    <td data-label="Jarak">${jarakLabel}</td>
                    <td data-label="Diskon"><span class="disc-badge" style="background:${color.bg};">${disc}%</span></td>
                    <td data-label="Warna" style="text-align:center;"><span class="color-dot" style="background:${color.bg};" title="${color.label}"></span> ${color.label}</td>
                </tr>`;
            }
        }
    } else {
    skemaSheetmask.forEach(s => {
        const blnExpired = getBulanMaju(bulanSekarang, s.maju);
        let blnLabel = formatBulan(blnExpired);
        if (s.weekLabel) blnLabel += ' — ' + s.weekLabel;

        const jarakLabel = s.maju === 0
            ? 'Expired bulan ini — ' + s.weekLabel
            : 'H-' + s.maju + ' bulan sebelum expired';

        if (s.disc === 'STOP') {
            rows += `<tr class="warning-row">
                <td data-label="Bulan Expired">${blnLabel}</td>
                <td data-label="Jarak dari Sekarang">${jarakLabel}</td>
                <td data-label="Diskon"><span class="warning-badge">⛔ Tidak Boleh Dijual</span></td>
                <td data-label="Warna" style="text-align:center;">—</td>
            </tr>`;
            return;
        }

        const color = discColor[s.disc];
        rows += `<tr>
            <td data-label="Bulan Expired">${blnLabel}</td>
            <td data-label="Jarak dari Sekarang">${jarakLabel}</td>
            <td data-label="Diskon"><span class="disc-badge" style="background:${color.bg};">${s.disc}%</span></td>
            <td data-label="Warna" style="text-align:center;"><span class="color-dot" style="background:${color.bg};" title="${color.label}"></span> ${color.label}</td>
        </tr>`;
    });
}


    document.getElementById('result').innerHTML = `
        <div class="result-header">
            Skema Diskon — <span>${label}</span><br>
            <small style="font-weight:400;color:#e084ab;">Bulan saat ini: ${formatBulan(bulanSekarang)}</small>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Bulan Expired</th>
                    <th>Jarak dari Sekarang</th>
                    <th>Diskon</th>
                    <th style="text-align:center;">Warna</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <div class="notes">
            *Skema diskon ini berdasarkan Clearance Sale Guidelines Desember 2024
        </div>
    `;
}
