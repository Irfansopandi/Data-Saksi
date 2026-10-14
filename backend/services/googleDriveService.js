const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const getAuthClient = () => {
    // 1. Prioritaskan OAuth2 jika tersedia (menggunakan kuota storage 200GB milik akun Google Drive)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        return auth;
    }

    // 2. Fallback ke Service Account (hanya berfungsi jika menggunakan Google Workspace Shared Drive)
    const keyPath = path.join(__dirname, '../service-account.json');
    if (fs.existsSync(keyPath)) {
        return new google.auth.GoogleAuth({
            keyFile: keyPath,
            scopes: SCOPES
        });
    }

    return null;
};

const drive = google.drive({ version: 'v3', auth: getAuthClient() });

/**
 * Mendapatkan atau membuat folder perkara
 */
const getOrCreateFolder = async (folderName, parentFolderId) => {
    try {
        if (!parentFolderId) throw new Error('Root Folder ID tidak ditemukan.');

        // Cari folder dengan nama tersebut
        const query = `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name, webViewLink)',
            spaces: 'drive',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        if (res.data.files.length > 0) {
            // Folder sudah ada
            return res.data.files[0];
        }

        // Jika belum ada, buat baru
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
        };

        const createRes = await drive.files.create({
            resource: fileMetadata,
            fields: 'id, name, webViewLink',
            supportsAllDrives: true
        });

        return createRes.data;
    } catch (error) {
        console.error('Error in getOrCreateFolder:', error);
        throw error;
    }
};

/**
 * Upload file ke folder di Google Drive
 */
const uploadFileToDrive = async (filePath, fileName, mimeType, folderId) => {
    try {
        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };
        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath)
        };

        const res = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink',
            supportsAllDrives: true
        });

        return res.data;
    } catch (error) {
        console.error(`Error uploading file ${fileName}:`, error);
        throw error;
    }
};

module.exports = {
    getOrCreateFolder,
    uploadFileToDrive
};
