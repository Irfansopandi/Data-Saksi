const { google } = require('googleapis');
const moment = require('moment');

const path = require('path');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const getAuthClient = async () => {
    try {
        // 1. Prioritaskan Service Account jika ada
        const keyPath = path.join(__dirname, '../service-account.json');
        if (fs.existsSync(keyPath)) {
            return new google.auth.GoogleAuth({
                keyFile: keyPath,
                scopes: SCOPES
            });
        }

        // 2. Fallback ke OAuth2
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
            console.warn('Google Credentials not fully set in .env');
            return null;
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        return auth;
    } catch (error) {
        console.error('Error creating Google Auth client:', error);
        return null;
    }
};

const saveToSheet = async (data, idPendaftaran, pdfLink, ktp1Link, ktp2Link, driveFolderLink) => {
    try {
        const auth = await getAuthClient();
        if (!auth) {
            console.warn('Skip saving to Google Sheets due to missing credentials');
            return false;
        }

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.SPREADSHEET_ID;
        if (!spreadsheetId) {
             console.warn('Skip saving to Google Sheets: SPREADSHEET_ID not set');
             return false;
        }

        // We assume the sheet name is 'data saksi'
        const range = "'data saksi'!A:AD"; 
        
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const parts = dateStr.split('-');
            if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
            return dateStr;
        };

        // Prepare row data
        const row = [
            '=ROW()-1', // No
            idPendaftaran,
            moment().format('YYYY-MM-DD HH:mm:ss'),
            data.nomorPerkara,
            
            // Saksi 1
            data.namaSaksi1,
            data.nikSaksi1,
            data.tempatLahirSaksi1,
            formatDate(data.tanggalLahirSaksi1),
            data.umurSaksi1,
            data.agamaSaksi1,
            data.pekerjaanSaksi1,
            data.alamatSaksi1,
            data.hubunganSaksi1,
            data.pendidikanSaksi1,
            ktp1Link ? `=HYPERLINK("${ktp1Link}"; "Lihat KTP")` : 'Link tidak tersedia',
            
            // Saksi 2
            data.namaSaksi2,
            data.nikSaksi2,
            data.tempatLahirSaksi2,
            formatDate(data.tanggalLahirSaksi2),
            data.umurSaksi2,
            data.agamaSaksi2,
            data.pekerjaanSaksi2,
            data.alamatSaksi2,
            data.hubunganSaksi2,
            data.pendidikanSaksi2,
            ktp2Link ? `=HYPERLINK("${ktp2Link}"; "Lihat KTP")` : 'Link tidak tersedia',
            
            pdfLink ? `=HYPERLINK("${pdfLink}"; "Lihat PDF")` : 'Link tidak tersedia',
            driveFolderLink ? `=HYPERLINK("${driveFolderLink}"; "Buka Folder")` : 'Link tidak tersedia',
            'Success',
            Date.now().toString()
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [row]
            }
        });

        return true;
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        throw error;
    }
};

module.exports = { saveToSheet };
