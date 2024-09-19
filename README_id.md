# rf_paste_share - Aplikasi Node.js Paste Sharing

## Software Apakah Ini?

rf_paste_share adalah Node.js paste sharing web app.

## Cara Kerja

Aplikasi ini bekerja seperti CRUD pada umumnya, hanya saja ada beberapa fitur tambahan seperti auto delete.

## Cara Mencoba Kode Ini

### Cara Mencoba server-mongoose

Untuk mencoba kode server-mongoose, masuk ke dalam folder server-mongoose via command line.

Selanjutnya, buat file .env di dalam foldernya.

Selanjutnya, konfigurasi database setting dan lainnya di file .env sesuai dengan .env-example.

Kode server-mongoose membutuhkan MongoDB, jadi pastikan Anda telah menginstallnya dan membuat databasenya sesuai konfigurasi tadi.

Selanjutnya, jalankan:

```
npm install
```

Selanjutnya, jalankan:

```
npm run dev
```

Terakhir, buka browser Anda ke alamat yang tertera di BASE_URL yang ada di .env.

### Cara Mencoba server-knex

Untuk mencoba kode server-knex, buat file .env di dalam foldernya.

Selanjutnya, isi .env sesuai .env-example. Di sini Anda bisa mengubah port, environment, dan detail database.

Kode server-knex membutuhkan MySQL, jadi pastikan Anda telah menginstallnya dan membuat databasenya sesuai konfigurasi tadi.

Sekarang, pastikan Anda berada dalam folder server-knex.

Selanjutnya, jalankan:

```
npm install
```

Selanjutnya, jalankan:

```
npm run db:refresh
```

Selanjutnya, jalankan:

```
npm run dev
```

Terakhir, buka browser Anda ke alamat yang tertera di BASE_URL yang ada di .env.

Default admin login:

```
username: admin@example.com
password: admin
```

## Freelance Worker Link

- https://projects.co.id/public/browse_users/view/99bc11/rakifsul