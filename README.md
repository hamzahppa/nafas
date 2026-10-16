# Nafas

Aplikasi latihan napas terpandu untuk Amazfit Active 3 Premium (Zepp OS). Layar bulat 466×466 menampilkan irama napas, getaran di setiap pergantian fase, detak jantung, perubahan stres, dan ringkasan sesi yang tersimpan di jam.

## Preset

| Preset | Durasi | Pola target (detik) |
| --- | --- | --- |
| Resonansi | 15 menit | tarik 6 · hembus 6 |
| Fokus (Long) | 15 menit | tarik 4 · tahan 4 · hembus 4 · tahan 4 |
| Fokus (Short) | 5 menit | tarik 4 · tahan 4 · hembus 4 · tahan 4 |
| Tidur | 10 menit | tarik 4 · tahan 7 · hembus 8 |

Resonansi naik bertahap dari napas alami (4 · 0 · 4 · 0) ke pola target. Fokus memakai box breathing sejak awal. Tidur progresif: 4 · 5 · 6 (2 menit) → 4 · 6 · 7 (3 menit) → 4 · 7 · 8 sampai selesai.

## Cara pakai

1. Buka **Nafas** dari daftar aplikasi di jam.
2. Pilih preset, lalu **Mulai**.
3. Ikuti hitung mundur, lalu label fase dan busur napas.
4. Tombol kembali mengakhiri sesi: pesan penutup muncul, lalu **Lihat statistik**.
5. **History** menampilkan sesi tersimpan, terbaru di atas (maksimum 100).

Jika aplikasi tertutup di tengah sesi, layar utama menawarkan **Lanjutkan** atau **Simpan**.

## Yang tercatat

- Durasi sesi
- Laju napas terpacing, dihitung dari siklus yang selesai
- Rata-rata dan maksimum detak jantung
- Perubahan stres, atau tanda kosong jika bacaan terlalu lama
- Detak jantung per menit dan garis waktu fase

Data tetap di jam. Aplikasi ini tidak mengirim data ke jaringan.

## Bahasa

Bahasa Indonesia adalah bahasa bawaan. English tersedia lewat string di `page/i18n/`.

## Bangun dan pasang

Target: Amazfit Active 3 Premium, Zepp OS API 4.0, layar 466×466.

Pasang [Zeus CLI](https://docs.zepp.com/docs/guides/tools/cli/), lalu dari folder proyek:

```bash
npm install
zeus dev
```

`zeus dev` membangun paket dan memasangnya ke jam yang terhubung dalam mode pengembang, atau ke simulator Zepp.

## Lisensi

[0BSD](LICENSE)
