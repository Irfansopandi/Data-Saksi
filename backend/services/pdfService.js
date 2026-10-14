const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF based on the physical form structure
 */
const generatePdf = async (data, pdfFilename) => {
    return new Promise((resolve, reject) => {
        try {
            const pdfPath = path.join(__dirname, '..', 'storage', 'temp', pdfFilename);
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            
            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);
            
            // Header
            doc.font('Helvetica-Bold').fontSize(14).text('DATA SAKSI-SAKSI', { align: 'center' });
            doc.moveDown();
            
            const startY = doc.y;
            doc.font('Helvetica-Bold').fontSize(12).text('PERKARA NOMOR:', 50, startY);
            doc.font('Helvetica-Bold').text(data.nomorPerkara || '........................................', 170, startY);
            
            doc.x = 50;
            doc.y = startY + doc.currentLineHeight() * 2;

            
            // Helper function for field lines
            const drawField = (label, value) => {
                const startX = 50;
                const colonX = 150;
                const valueX = 160;
                
                doc.font('Helvetica').fontSize(11);
                doc.text(label, startX, doc.y, { continued: false });
                const currentY = doc.y - doc.currentLineHeight();
                
                doc.text(':', colonX, currentY);
                doc.text(value || '-', valueX, currentY);
                doc.moveDown(0.5);
            };

            // Helper function to format date
            const formatDate = (dateStr) => {
                if (!dateStr) return '-';
                const parts = dateStr.split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                return dateStr;
            };

            // SAKSI I
            doc.font('Helvetica-Bold').fontSize(12).text('SAKSI I:', 50, doc.y);
            doc.moveDown(0.5);
            drawField('Nama', data.namaSaksi1);
            drawField('NIK', data.nikSaksi1);
            drawField('TTL', `${data.tempatLahirSaksi1}, ${formatDate(data.tanggalLahirSaksi1)}`);
            drawField('Umur', `${data.umurSaksi1} tahun`);
            drawField('Agama', data.agamaSaksi1);
            drawField('Pendidikan', data.pendidikanSaksi1);
            drawField('Pekerjaan', data.pekerjaanSaksi1);
            drawField('Hubungan', data.hubunganSaksi1);
            drawField('Alamat', data.alamatSaksi1);
            
            doc.moveDown(1.5);

            // SAKSI II
            doc.font('Helvetica-Bold').fontSize(12).text('SAKSI II:', 50, doc.y);
            doc.moveDown(0.5);
            drawField('Nama', data.namaSaksi2);
            drawField('NIK', data.nikSaksi2);
            drawField('TTL', `${data.tempatLahirSaksi2}, ${formatDate(data.tanggalLahirSaksi2)}`);
            drawField('Umur', `${data.umurSaksi2} tahun`);
            drawField('Agama', data.agamaSaksi2);
            drawField('Pendidikan', data.pendidikanSaksi2);
            drawField('Pekerjaan', data.pekerjaanSaksi2);
            drawField('Hubungan', data.hubunganSaksi2);
            drawField('Alamat', data.alamatSaksi2);

            doc.moveDown(3);

            // Footer Box
            const rectY = doc.y;
            doc.rect(50, rectY, 495, 100).stroke();
            
            // Bagian Kiri: Keterangan
            doc.y = rectY + 15;
            doc.x = 60;
            doc.font('Helvetica-Bold').fontSize(10).text('*KETERANGAN:');
            doc.moveDown(0.5);
            doc.font('Helvetica').text('- Saksi minimal telah berusia 21 tahun.');
            doc.text('- Anak tidak bisa dijadikan Saksi.');
            doc.text('- Membawa lampiran fotocopy KTP saksi pada saat sidang.');
            
            // Bagian Kanan: Kontak (diberi bingkai garis putus-putus di dalam kotak)
            const contactBoxX = 330;
            const contactBoxY = rectY + 10;
            const contactBoxW = 205;
            const contactBoxH = 80;

            doc.save();
            doc.dash(3, { space: 3 });
            doc.roundedRect(contactBoxX, contactBoxY, contactBoxW, contactBoxH, 4).stroke();
            doc.undash();
            doc.restore();

            doc.y = contactBoxY + 15;
            doc.x = contactBoxX + 15;
            doc.font('Helvetica-Bold').fontSize(10).text('No. Kantor PA Karawang');
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(10).text('Telp. (0267) 402230');
            doc.text('WA. 0851 7500 5301');

            doc.end();

            writeStream.on('finish', () => {
                resolve(pdfPath);
            });
            
            writeStream.on('error', (err) => {
                reject(err);
            });
            
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generatePdf };
