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
        // ================= REGULER (tetap seperti semula) =================
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
        const info = `Bulan saat ini: ${formatBulan(parseInt(document.getElementById('bulan2').value))} • Harga normal: ${formatRupiah(hargaAwal)}`;
        document.getElementById('resultHarga').innerHTML = `
            <div class="result-header">
                Harga Setelah Diskon — <span>${label}</span><br>
                <small style="font-weight:400;color:#e084ab;">${info}</small>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Bulan Expired</th>
                        <th>Jarak ke Expired</th>
                        <th>Diskon</th>
                        <th style="text-align:center;">Warna</th>
                        <th>Harga Setelah Diskon</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <div class="notes">*Skema reguler: H-1 bulan STOP, H-2=90%, H-3=80%, H-4=70%, H-5=50%, H-6=40%, H-7=30%.</div>
        `;
    } 
    else {
        // ================= SHEETMASK dengan skema H-7 (baru) =================
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

        // Skema baru untuk sheetmask (berdasarkan H-7)
        const skemaSheetmaskBaru = [
            { minDays: 0, maxDays: 7, disc: 'STOP', label: '1–7 Hari Sebelum Expired' },
            { minDays: 8, maxDays: 37, disc: 90, label: '8–37 Hari Sebelum Expired (H-1 bulan dari H-7)' },
            { minDays: 38, maxDays: 67, disc: 70, label: '38–67 Hari Sebelum Expired (H-2 bulan dari H-7)' },
            { minDays: 68, maxDays: 97, disc: 50, label: '68–97 Hari Sebelum Expired (H-3 bulan dari H-7)' },
            { minDays: 98, maxDays: 127, disc: 30, label: '98–127 Hari Sebelum Expired (H-4 bulan dari H-7)' }
        ];

        skemaSheetmaskBaru.forEach(s => {
            const startDate = new Date(expiredDate);
            startDate.setDate(expiredDate.getDate() - s.maxDays);
            const endDate = new Date(expiredDate);
            endDate.setDate(expiredDate.getDate() - s.minDays);

            if (s.disc === 'STOP') {
                rows += `<tr class="warning-row">
                    <td data-label="Periode">${formatTanggal(startDate)} – ${formatTanggal(endDate)}</td>
                    <td data-label="Jarak">${s.label}</td>
                    <td data-label="Diskon"><span class="warning-badge">⛔ Tidak Boleh Dijual</span></td>
                    <td data-label="Warna" style="text-align:center;">—</td>
                    <td data-label="Harga" class="harga-cell">—</td>
                </tr>`;
            } else {
                const color = discColor[s.disc];
                const hargaSetelah = Math.round(hargaAwal * (1 - s.disc / 100));
                rows += `<tr>
                    <td data-label="Periode">${formatTanggal(startDate)} – ${formatTanggal(endDate)}</td>
                    <td data-label="Jarak">${s.label}</td>
                    <td data-label="Diskon"><span class="disc-badge" style="background:${color.bg};">${s.disc}%</span></td>
                    <td data-label="Warna" style="text-align:center;"><span class="color-dot" style="background:${color.bg};" title="${color.label}"></span> ${color.label}</td>
                    <td data-label="Harga" class="harga-cell">${formatRupiah(hargaSetelah)}</td>
                </tr>`;
            }
        });

        const info = `Expired: ${hariExpired} ${bulanNama[bulanExpired-1]} ${expiredDate.getFullYear()} • Harga normal: ${formatRupiah(hargaAwal)}`;
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
            <div class="notes">*Skema sheetmask (berbasis H-7): STOP (1-7 hari), 90% (8-37), 70% (38-67), 50% (68-97), 30% (98-127).</div>
        `;
    }
}
