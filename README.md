# Daily Discipline

Aplikasi web **1 halaman full ke samping** untuk melacak disiplin harian:
daily activities ala Excel, statistik lingkaran (ring/donut) & diagram batang,
dengan kegiatan yang **bebas dikelola** (tambah/ubah/hapus) langsung di tabel.
Tanpa framework, tanpa server — buka file langsung jalan.

## ✨ Fitur

- **Daily Activities** — grid Excel: baris = kegiatan, kolom = tanggal 1–31, kotak centang ke samping.
  - Kolom hari tersorot (hari ini), tanggal mendatang nonaktif, weekend merah.
  - Kolom **Σ** (total per kegiatan) & baris **Σ / hari** (total per hari).
  - **Kolom Kegiatan bisa diedit langsung**: klik nama untuk mengganti,
    tombol 🗑 untuk menghapus (termasuk centangannya).
  - **Baris input di ujung tabel** — ketik nama, tekan **Enter** atau **+**
    untuk menambah kegiatan baru. Nama kegiatan tampil polos tanpa emoji.
- **Pemilih bulan & tahun modern** — klik label bulan untuk membuka dropdown
  (grid 12 bulan + stepper tahun, bulan ini & bulan berjalan tersorot),
  tutup dengan klik luar atau Esc; panah ‹ › tetap untuk langkah cepat.
- **Statistik** (mengikuti bulan yang dipilih):
  - **Ring progres** bulanan (akumulasi menit vs target menit × hari berjalan).
  - 3 kartu: skor hari ini, progres bulanan, streak ≥ 50%.
  - **Discipline Level (donut)**: busur terisi sesuai progres
    (penuh = 100%), sisa abu-abu, center menampilkan %.
  - **Discipline Level (diagram batang)** jumlah centang per tanggal — skala rendah → tinggi (penuh = semua kegiatan dicentang).
- **💾 Penyimpanan** — `localStorage` (aman dari data v1, otomatis dimigrasi),
  plus **Ekspor/Impor JSON** di footer.

> Panel **Jadwal Harian** sudah dihapus dari tampilan; data jadwal lama tetap
> tersimpan dan ikut diekspor dalam file JSON, sehingga bisa dikembalikan kapan saja.

## 🚀 Cara pakai

Buka `index.html` di browser (double-click). Tidak perlu build/server.

> Layout otomatis & responsif: desktop ≥1040px tampil berdampingan (checklist kiri,
> statistik kanan); tablet (≤1040px) menumpuk dengan ring + 3 kartu sebaris;
> HP (≤560px) menyesuaikan — toolbar sentuh besar, kolom nama merapat,
> sel centang 30px, input 16px anti-zoom iOS, label tanggal ganjil saja di batang harian.

## 🗂 Struktur

```
discipline-app/
├── index.html   # struktur 1 halaman (2 panel dashboard)
├── style.css    # tema minimalis terang, grid dashboard, ring & donut
├── app.js       # logika checklist, statistik, kelola kegiatan, ekspor/impor
└── README.md
```

## 📦 Data

| Key localStorage | Isi |
|---|---|
| `disc-v2-activities` | daftar kegiatan (nama, target menit, wajib/opsional, warna) |
| `disc-v2-log` | `{ "YYYY-MM-DD": { activityId: true } }` |
| `disc-v2-schedule` | blok jadwal lama (cadangan, tanpa UI) |

Skor harian dihitung berbasis **menit** kegiatan wajib (default 13j 15m/hari);
kegiatan opsional (rutinitas) tidak ikut menghitung skor.
