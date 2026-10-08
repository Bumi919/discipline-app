# ✅ Disiplin Harian

Aplikasi web **1 halaman full ke samping** untuk melacak disiplin harian:
checklist kotak-kotak ala Excel, statistik lingkaran (ring/donut) & diagram batang,
serta jadwal harian yang bisa diedit. Tanpa framework, tanpa server — buka file langsung jalan.

## ✨ Fitur

- **📅 Checklist Kotak-Kotak** — grid Excel: baris = kegiatan, kolom = tanggal 1–31, kotak centang ke samping.
  - Kolom hari tersorot (hari ini), tanggal mendatang nonaktif, weekend merah.
  - Kolom **Σ** (total per kegiatan) & baris **Σ / hari** (total per hari).
  - Tombol **✎ ubah** (nama & target menit) dan **🗑 hapus** di setiap baris.
  - Form **tambah kegiatan** (ikon, nama, target menit).
- **📊 Statistik** (mengikuti bulan yang dipilih):
  - **Ring progres** bulanan (akumulasi menit vs target menit × hari berjalan).
  - 4 kartu: skor hari ini, progres bulanan, akumulasi jam, streak ≥ 50%.
  - **Diagram lingkaran (donut)** distribusi menit per kegiatan + legenda persentase.
  - **Diagram batang** skor harian 1–31 (warna berdasarkan level skor).
  - Bar akumulasi progres per kegiatan.
- **⏰ Jadwal Harian** — 20 blok default (06:00–22:00, **tepat 16 jam**):
  jam mulai/selesai & keterangan bisa diubah, blok bisa ditambah/dihapus.
  Sesi maksimal 45 menit (kecuali trading 2×2 jam).
- **💾 Penyimpanan** — `localStorage` (aman dari data v1, otomatis dimigrasi),
  plus **Ekspor/Impor JSON** di footer.

## 🚀 Cara pakai

Buka `index.html` di browser (double-click). Tidak perlu build/server.

> Layout otomatis: di layar ≥1040px tampil berdampingan (checklist kiri, statistik kanan,
> jadwal lebar penuh); di layar sempit menumpuk.

## 🗂 Struktur

```
discipline-app/
├── index.html   # struktur 1 halaman (3 panel dashboard)
├── style.css    # tema minimalis terang, grid dashboard, ring & donut
├── app.js       # logika checklist, statistik, jadwal, ekspor/impor
└── README.md
```

## 📦 Data

| Key localStorage | Isi |
|---|---|
| `disc-v2-activities` | daftar kegiatan (ikon, nama, target menit, wajib/opsional) |
| `disc-v2-log` | `{ "YYYY-MM-DD": { activityId: true } }` |
| `disc-v2-schedule` | blok jadwal (mulai, selesai, kegiatan, keterangan) |

Skor harian dihitung berbasis **menit** kegiatan wajib (total 13j 15m/hari);
kegiatan opsional (rutinitas) tidak ikut menghitung skor.
