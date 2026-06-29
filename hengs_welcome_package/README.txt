HENGS AURORA GATEWAY

Isi paket:
- src/utils/welcome-card.js
- assets/hengs-bot-icon.png
- preview/welcome-preview.png
- preview/leave-preview.png

Instalasi:
  npm install @napi-rs/canvas

Pemakaian dasar:
  const { generateCard } = require('./utils/welcome-card');
  const buffer = await generateCard(member, 'welcome');

Pemakaian dengan konfigurasi:
  const buffer = await generateCard(member, 'welcome', {
    serverName: 'Hengs',
    memberNumber: member.guild.memberCount,
    logoPath: './assets/hengs-bot-icon.png',
    welcomeMessage: 'Selamat datang di Hengs. Semoga kamu betah di sini.',
  });

Environment variable opsional:
- WELCOME_SERVER_NAME=Hengs
- HENGS_LOGO_PATH=/absolute/path/to/hengs-bot-icon.png
- HENGS_FONT_REGULAR=/absolute/path/to/font-regular.ttf
- HENGS_FONT_BOLD=/absolute/path/to/font-bold.ttf

Catatan:
- Renderer tetap berjalan tanpa logo. Sistem memakai watermark procedural.
- Renderer mencoba memuat font sistem dan memilih Inter, Lato, Noto Sans, DejaVu Sans, atau Arial.
- Username, display name, pesan, dan nomor member menyesuaikan ruang secara otomatis.
- Avatar gagal dimuat akan diganti avatar inisial dengan gradient.
- Tampilan bintang dibuat deterministik berdasarkan ID member agar tidak berubah setiap render.
- Mode leave menggunakan layout yang sama dengan palet magenta dan statistik yang relevan.
