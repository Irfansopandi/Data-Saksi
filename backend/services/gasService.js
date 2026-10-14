const fs = require('fs');

/**
 * Mengirim data form, PDF, dan foto KTP ke Google Apps Script Web App
 */
const sendToGas = async ({ idPendaftaran, data, files }) => {
    const gasUrl = process.env.GAS_WEB_APP_URL;
    const apiSecret = process.env.GAS_API_SECRET;

    if (!gasUrl) {
        throw new Error('GAS_WEB_APP_URL belum dikonfigurasi di .env');
    }

    // Siapkan payload dengan file dalam bentuk base64
    const payload = {
        apiSecret,
        idPendaftaran,
        data,
        files: {
            ktp1: {
                filename: files.ktp1.filename,
                mimeType: files.ktp1.mimeType,
                base64: fs.readFileSync(files.ktp1.path).toString('base64')
            },
            ktp2: {
                filename: files.ktp2.filename,
                mimeType: files.ktp2.mimeType,
                base64: fs.readFileSync(files.ktp2.path).toString('base64')
            },
            pdf: {
                filename: files.pdf.filename,
                mimeType: files.pdf.mimeType || 'application/pdf',
                base64: fs.readFileSync(files.pdf.path).toString('base64')
            }
        }
    };

    const response = await fetch(gasUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Apps Script merespons status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Gagal menyimpan data via Google Apps Script');
    }

    return result.data;
};

module.exports = {
    sendToGas
};
