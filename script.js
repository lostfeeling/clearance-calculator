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
    { jarak: '1 minggu', maju: 1, disc: 90, isMinggu: true },
    { jarak: '1 bulan', maju: 1, disc: 70, isMinggu: false },
    { jarak: '2 bulan', maju: 2, disc: 50, isMinggu: false },
    { jarak: '3 bulan', maju: 3, disc: 30, isMinggu: false }
];

function getBulanMaju(bulanSekarang, maju) {
    let b = bulanSekarang + maju;
    if (b > 12) b -= 12;
    return b;
}

function generate() {
    const bulanSekarang = parseInt(document.getElementById('bulan').value);
    const produk = document.getElementById('produk').value;
    const label = produk === 'reguler' ? 'Reguler Product' : 'Sheetmask Product';

    let rows = '';

    if (produk === 'reguler') {
        for (let maju = 1; maju <= 7; maju++) {
            const blnExpired = getBulanMaju(bulanSekarang, maju);
            const jarakLabel = maju + ' bulan dari sekarang';

            if (maju === 1) {
                rows += `<tr class="warning-row">
                    <td data-label="Bulan Expired">${bulanNama[blnExpired - 1]}</td>
                    <td data-label="Jarak">${jarakLabel}</td>
                    <td data-label="Diskon"><span class="warning-badge">⛔ Tidak Boleh Dijual</span></td>
                    <td data-label="Warna" style="text-align:center;">—</td>
                </tr>`;
            } else {
                const disc = skemaReguler[maju];
                const color = discColor[disc];
                rows += `<tr>
                    <td data-label="Bulan Expired">${bulanNama[blnExpired - 1]}</td>
                    <td data-label="Jarak">${jarakLabel}</td>
                    <td data-label="Diskon"><span class="disc-badge" style="background:${color.bg};">${disc}%</span></td>
                    <td data-label="Warna" style="text-align:center;"><span class="color-dot" style="background:${color.bg};" title="${color.label}"></span> ${color.label}</td>
                </tr>`;
            }
        }
    } else {
        skemaSheetmask.forEach(s => {
            const color = discColor[s.disc];
            const blnExpired = getBulanMaju(bulanSekarang, s.maju);
            let blnLabel = bulanNama[blnExpired - 1];

            if (s.isMinggu) {
                blnLabel = bulanNama[blnExpired - 1] + ' (minggu pertama)';
            }

            rows += `<tr>
                <td data-label="Bulan Expired">${blnLabel}</td>
                <td data-label="Jarak">H-${s.jarak} sebelum expired</td>
                <td data-label="Diskon"><span class="disc-badge" style="background:${color.bg};">${s.disc}%</span></td>
                <td data-label="Warna" style="text-align:center;"><span class="color-dot" style="background:${color.bg};" title="${color.label}"></span> ${color.label}</td>
            </tr>`;
        });
    }

    document.getElementById('result').innerHTML = `
        <div class="result-header">
            Skema Diskon — <span>${label}</span><br>
            <small style="font-weight:400;color:#e084ab;">Bulan saat ini: ${bulanNama[bulanSekarang - 1]}</small>
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