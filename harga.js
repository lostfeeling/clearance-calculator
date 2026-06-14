} else {
    // SHEETMASK dengan skema H-7
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

    // Skema baru untuk sheetmask (berdasarkan hari sebelum expired)
    // rentang [minDays, maxDays] = jarak hari sebelum expired
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
