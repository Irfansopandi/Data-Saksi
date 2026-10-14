const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { generatePdf } = require('../services/pdfService');
const { sendToGas } = require('../services/gasService');
const { saveToSheet } = require('../services/googleSheetsService');
const { getOrCreateFolder, uploadFileToDrive } = require('../services/googleDriveService');

// Format ID SAKSI-YYYYMMDD-XXXX
const generateId = () => {
    const dateStr = moment().format('YYYYMMDD');
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digits
    return `SAKSI-${dateStr}-${randomNum}`;
};

// Sanitize nama folder
const sanitizeFolderName = (name) => {
    return name.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

const submitData = async (req, res) => {
    let tempFiles = [];
    
    try {
        const data = req.body;
        const files = req.files;

        // 1. Validation
        if (!data.nomorPerkara) return res.status(400).json({ success: false, message: 'Nomor perkara wajib diisi' });
        
        if (parseInt(data.umurSaksi1) < 21) {
            return res.status(400).json({ success: false, message: 'Saksi I harus berusia minimal 21 tahun.' });
        }
        if (parseInt(data.umurSaksi2) < 21) {
            return res.status(400).json({ success: false, message: 'Saksi II harus berusia minimal 21 tahun.' });
        }

        if (!files || !files['ktpSaksi1'] || !files['ktpSaksi2']) {
            return res.status(400).json({ success: false, message: 'KTP Saksi I dan Saksi II wajib dilampirkan.' });
        }

        // 2. Generate ID & Sanitize Folder Name
        const idPendaftaran = generateId();
        const safeNomorPerkara = sanitizeFolderName(data.nomorPerkara);

        // 3. Siapkan temp files
        const ktp1File = files['ktpSaksi1'][0];
        const ktp2File = files['ktpSaksi2'][0];
        tempFiles.push(ktp1File.path, ktp2File.path);

        const ext1 = path.extname(ktp1File.originalname) || '.jpg';
        const ext2 = path.extname(ktp2File.originalname) || '.jpg';
        
        const newKtp1Name = `Saksi1${ext1}`;
        const newKtp2Name = `Saksi2${ext2}`;
        const pdfFilename = `Data-Saksi-${safeNomorPerkara}.pdf`;

        // 4. Generate PDF secara lokal
        const pdfPath = await generatePdf(data, pdfFilename);
        tempFiles.push(pdfPath);

        let responseData;

        // 5. Simpan ke Google Drive & Sheets
        if (process.env.GAS_WEB_APP_URL) {
            // Menggunakan Google Apps Script (Permanen tanpa expired token 7 hari)
            responseData = await sendToGas({
                idPendaftaran,
                data,
                files: {
                    ktp1: { path: ktp1File.path, filename: newKtp1Name, mimeType: ktp1File.mimetype },
                    ktp2: { path: ktp2File.path, filename: newKtp2Name, mimeType: ktp2File.mimetype },
                    pdf: { path: pdfPath, filename: pdfFilename, mimeType: 'application/pdf' }
                }
            });
        } else {
            // Fallback ke Google API langsung jika GAS belum diset
            const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
            if (!rootFolderId) {
                throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID belum dikonfigurasi di backend.');
            }
            const driveFolder = await getOrCreateFolder(safeNomorPerkara, rootFolderId);
            const uploadKtp1 = await uploadFileToDrive(ktp1File.path, newKtp1Name, ktp1File.mimetype, driveFolder.id);
            const uploadKtp2 = await uploadFileToDrive(ktp2File.path, newKtp2Name, ktp2File.mimetype, driveFolder.id);
            const uploadPdf = await uploadFileToDrive(pdfPath, pdfFilename, 'application/pdf', driveFolder.id);
            await saveToSheet(data, idPendaftaran, uploadPdf.webViewLink, uploadKtp1.webViewLink, uploadKtp2.webViewLink, driveFolder.webViewLink);

            responseData = {
                idPendaftaran,
                nomorPerkara: data.nomorPerkara,
                pdf_url: uploadPdf.webViewLink,
                ktp_saksi_1_url: uploadKtp1.webViewLink,
                ktp_saksi_2_url: uploadKtp2.webViewLink,
                drive_folder_url: driveFolder.webViewLink
            };
        }

        // 6. Hapus temporary files
        cleanUpTempFiles(tempFiles);

        // 7. Return response
        res.status(200).json({
            success: true,
            message: 'Data saksi berhasil disimpan.',
            data: responseData
        });

    } catch (error) {
        console.error('Error submitting data:', error);
        cleanUpTempFiles(tempFiles);
        res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan internal.' });
    }
};

const cleanUpTempFiles = (files) => {
    files.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                fs.unlinkSync(file);
            } catch (err) {
                console.error(`Gagal menghapus file temp: ${file}`, err);
            }
        }
    });
};

module.exports = {
    submitData
};
