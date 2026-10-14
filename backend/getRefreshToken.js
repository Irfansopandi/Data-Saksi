require('dotenv').config();
const http = require('http');
const url = require('url');
const readline = require('readline');
const { google } = require('googleapis');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Pastikan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET sudah ada di .env
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ Error: GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET harus diisi di .env terlebih dahulu!");
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Memaksa Google selalu memberikan refresh_token baru
});

let isCompleted = false;

// Fungsi umum untuk menukar code dengan refresh_token dan menyimpannya ke .env
const processAuthCode = async (rawInput) => {
    if (isCompleted) return;
    try {
        let code = rawInput.trim();

        // Jika user paste full URL (misal: http://localhost:3000/oauth2callback?code=4/0Abc...)
        if (code.includes('code=')) {
            try {
                // Parse code dari parameter url
                const parsedUrl = new URL(code.startsWith('http') ? code : `http://localhost:${PORT}/${code}`);
                code = parsedUrl.searchParams.get('code') || code;
            } catch (e) {
                const match = code.match(/code=([^&]+)/);
                if (match) code = decodeURIComponent(match[1]);
            }
        }

        if (!code) {
            console.error('❌ Kode otorisasi tidak ditemukan dari input yang dimasukkan!');
            return;
        }

        console.log('\n⏳ Sedang menukar kode dengan Refresh Token dari Google...');
        const { tokens } = await oauth2Client.getToken(code);

        isCompleted = true;

        console.log('\n======================================================');
        console.log('✅ BERHASIL MENDAPATKAN REFRESH TOKEN!');
        console.log('======================================================');
        console.log('\nToken Refresh:');
        console.log(tokens.refresh_token || '(Tidak ada refresh token baru - gunakan token yang lama atau ulangi dengan prompt=consent)');
        console.log('======================================================\n');

        // Otomatis simpan ke .env
        const envPath = path.resolve(__dirname, '.env');
        if (fs.existsSync(envPath) && tokens.refresh_token) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
                envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/, `GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
            } else {
                envContent += `\nGOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`;
            }
            fs.writeFileSync(envPath, envContent);
            console.log('💾 File .env BERHASIL diperbarui secara otomatis dengan token baru!');
        }

        console.log('\n🎉 Selesai! Anda sekarang bisa menjalankan kembali backend/server Anda.');
        setTimeout(() => {
            process.exit(0);
        }, 1500);

    } catch (err) {
        console.error('\n❌ Terjadi kesalahan saat menukar token:', err.message);
        console.log('Silakan pastikan kodenya benar atau coba jalankan script ini kembali.');
    }
};

// Jalankan web server lokal sementara untuk menangkap kode jika browser berjalan di komputer yang sama
const server = http.createServer(async (req, res) => {
    try {
        if (req.url.startsWith('/oauth2callback')) {
            const reqUrl = new url.URL(req.url, `http://localhost:${PORT}`);
            const code = reqUrl.searchParams.get('code');
            const error = reqUrl.searchParams.get('error');

            if (error) {
                res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<h2>Gagal otorisasi Google: ${error}</h2><p>Silakan tutup tab ini.</p>`);
                console.error('\n❌ Otorisasi dibatalkan / gagal:', error);
                server.close();
                process.exit(1);
            }

            if (code) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: #10b981;">✅ Berhasil Mendapatkan Refresh Token!</h1>
                        <p style="font-size: 16px;">Silakan kembali ke terminal/CMD Anda. File .env sudah otomatis diperbarui.</p>
                        <p style="color: #6b7280;">Tab browser ini boleh ditutup.</p>
                    </div>
                `);

                await processAuthCode(code);
                server.close();
            }
        }
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Gagal memproses token: ' + err.message);
        console.error('\n❌ Terjadi kesalahan server:', err.message);
    }
});

server.listen(PORT, () => {
    console.log('======================================================');
    console.log(`🚀 Siap Mengambil Refresh Token Google untuk Email Instansi`);
    console.log('======================================================');
    console.log('⚠️  PENTING SEBELUM LOGIN:');
    console.log('1. Pastikan email instansi staf sudah ditambahkan di:');
    console.log('   Google Cloud Console -> OAuth consent screen -> Test users');
    console.log('2. Pastikan Authorized Redirect URI di Google Cloud Console adalah:');
    console.log(`   👉 ${REDIRECT_URI}`);
    console.log('------------------------------------------------------');
    console.log('🔗 Link Otorisasi (Kirim ke staf atau buka di browser):');
    console.log('\n' + authUrl + '\n');
    console.log('======================================================');
    console.log('💡 TIPS JIKA LINK DIKIRIM KE WA STAF:');
    console.log('Setelah staf login di HP dan muncul error "Situs tidak dapat dijangkau",');
    console.log('Minta staf SALIN (COPY) URL di address bar browser HP-nya (yang berawalan http://localhost:3000...),');
    console.log('Lalu tempelkan (PASTE) di bawah ini dan tekan ENTER:\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('👉 Tempelkan (Paste) URL atau Kode di sini: ', async (answer) => {
        if (answer) {
            await processAuthCode(answer);
        }
        rl.close();
    });
});
