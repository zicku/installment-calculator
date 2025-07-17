// ==================== Variabel Global ====================
let angsuranPerBulan = 0;
let jadwalAngsuran = [];

// ==================== Fungsi 1: Hitung Angsuran ====================
function hitungAngsuran() {
  const otr = parseFloat(document.getElementById("otr").value);
  const dpPercent = parseFloat(document.getElementById("dp").value);
  const jangkaTahun = parseFloat(document.getElementById("jangkaWaktu").value);
  const jangkaBulan = jangkaTahun * 12;

  const dp = otr * (dpPercent / 100);
  const pokokUtang = otr - dp;

  let bunga = 0;
  if (jangkaBulan <= 12) {
    bunga = 0.12;
  } else if (jangkaBulan <= 24) {
    bunga = 0.14;
  } else {
    bunga = 0.165;
  }

  const totalPinjaman = pokokUtang + pokokUtang * bunga;
  angsuranPerBulan = totalPinjaman / jangkaBulan;

  const output = document.getElementById("output");
  output.style.display = "block";
  output.innerHTML = `
    <strong>Hasil Perhitungan:</strong><br>
    Harga Mobil (OTR): Rp ${otr.toLocaleString("id-ID")}<br>
    Down Payment (${dpPercent}%): Rp ${dp.toLocaleString("id-ID")}<br>
    Pokok Utang: Rp ${pokokUtang.toLocaleString("id-ID")}<br>
    Bunga: ${(bunga * 100).toFixed(1)}%<br>
    Total Pinjaman + Bunga: Rp ${totalPinjaman.toLocaleString("id-ID")}<br>
    <strong>Angsuran per bulan: Rp ${angsuranPerBulan.toLocaleString(
      "id-ID"
    )}</strong>
  `;
}

// ==================== Fungsi 2: Buat Jadwal Angsuran + Checkbox ====================
function cekJatuhTempo() {
  const tanggalMulai = document.getElementById("tanggalMulai").value;
  const jangkaTahun = parseFloat(document.getElementById("jangkaWaktu").value);

  if (!tanggalMulai || isNaN(jangkaTahun)) {
    alert("Mohon isi tanggal mulai dan jangka waktu dengan benar.");
    return;
  }

  const jangkaBulan = Math.round(jangkaTahun * 12);
  const tanggalAwal = new Date(tanggalMulai);
  jadwalAngsuran = [];

  for (let i = 0; i < jangkaBulan; i++) {
    const jatuhTempo = new Date(tanggalAwal);
    jatuhTempo.setMonth(tanggalAwal.getMonth() + i);

    jadwalAngsuran.push({
      no: i + 1,
      tanggal: jatuhTempo.toISOString().split("T")[0],
    });
  }

  let html = `
    <strong>Jadwal Angsuran Lengkap:</strong>
    <table border="1" cellpadding="8" cellspacing="0" style="margin-top:10px; border-collapse: collapse;">
      <tr>
        <th>NO</th>
        <th>TANGGAL JATUH TEMPO</th>
        <th>ANGSURAN PER BULAN</th>
        <th>KETERLAMBATAN</th>
      </tr>
  `;

  jadwalAngsuran.forEach((item) => {
    html += `
      <tr>
        <td>${item.no}</td>
        <td>${item.tanggal}</td>
        <td>Rp ${angsuranPerBulan.toLocaleString("id-ID")}</td>
        <td><input type="checkbox" class="checkbox-keterlambatan" value="${
          item.tanggal
        }"></td>
      </tr>
    `;
  });

  html += `</table>`;

  const output2 = document.getElementById("output2");
  output2.style.display = "block";
  output2.innerHTML = html;

  const tombolDiv = document.getElementById("tombolKeterlambatan");
  tombolDiv.innerHTML = `
  <button onclick="centangSemua()">Centang Semua Keterlambatan</button>
  <button onclick="resetCentang()">Reset Centang</button>
`;
}

// ==================== Fungsi 3: Hitung Denda ====================
function hitungHariTerlambat(tanggalJatuhTempo, batasTanggal) {
  const tgl1 = new Date(tanggalJatuhTempo);
  const tgl2 = new Date(batasTanggal);
  const selisih = tgl2 - tgl1;
  return Math.max(Math.ceil(selisih / (1000 * 60 * 60 * 24)), 0);
}

function cekDenda() {
  const dendaPerHari = 0.001 * angsuranPerBulan; // 0,1% dari angsuran

  if (jadwalAngsuran.length === 0) {
    alert("Silakan buat jadwal angsuran terlebih dahulu.");
    return;
  }

  // Ambil tanggal jatuh tempo terakhir sebagai batas
  const batasTanggal = jadwalAngsuran[jadwalAngsuran.length - 1]?.tanggal;

  // Ambil semua checkbox yang dicentang
  const checkboxTercentang = Array.from(
    document.querySelectorAll(".checkbox-keterlambatan:checked")
  );
  const tanggalBelumBayar = checkboxTercentang.map((cb) => cb.value);

  if (tanggalBelumBayar.length === 0) {
    alert("Pilih minimal satu tanggal yang belum dibayar.");
    return;
  }

  const belumBayar = jadwalAngsuran.filter((a) =>
    tanggalBelumBayar.includes(a.tanggal)
  );

  let hasil = `
  <strong>Denda Keterlambatan:</strong><br>
  KONTRAK NO: AGR00001<br>CLIENT NAME: SUGUS<br><br>
  <table border="1" cellpadding="8" cellspacing="0" style="margin-top:10px; border-collapse: collapse;">
    <tr>
      <th>NO ANGSURAN</th>
      <th>TANGGAL JATUH TEMPO</th>
      <th>HARI TERLAMBAT</th>
      <th>TOTAL DENDA</th>
    </tr>
`;

  belumBayar.forEach((a) => {
    const hari = hitungHariTerlambat(a.tanggal, batasTanggal);
    const denda = hari * dendaPerHari;
    hasil += `
    <tr>
      <td>${a.no}</td>
      <td>${a.tanggal}</td>
      <td>${hari} hari</td>
      <td>Rp ${Math.round(denda).toLocaleString("id-ID")}</td>
    </tr>
  `;
  });

  hasil += `</table>`;

  const output3 = document.getElementById("output3");
  output3.style.display = "block";
  output3.innerHTML = hasil;
}
function centangSemua() {
  const semuaCheckbox = document.querySelectorAll(".checkbox-keterlambatan");
  semuaCheckbox.forEach((cb) => (cb.checked = true));
}

function resetCentang() {
  const semuaCheckbox = document.querySelectorAll(".checkbox-keterlambatan");
  semuaCheckbox.forEach((cb) => (cb.checked = false));
}
