import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { BsCheckCircleFill } from 'react-icons/bs';


const SuccessCard = ({ result, onNewInput }) => {
    
    if (!result) return null;

    const { idPendaftaran, nomorPerkara, pdf_url, drive_folder_url } = result.data;

    return (
        <Card className="text-center shadow-lg border-0 py-5">
            <Card.Body>
                <BsCheckCircleFill className="text-success mb-3" size={64} />
                <h3 className="fw-bold mb-4">DATA BERHASIL DISIMPAN</h3>
                
                <p className="text-muted mb-1">Nomor Perkara:</p>
                <h5 className="mb-3">{nomorPerkara}</h5>

                <p className="text-muted mb-1">ID Pendaftaran:</p>
                <h4 className="fw-bold text-success mb-4">{idPendaftaran}</h4>

                <div className="d-flex flex-column align-items-center gap-3">
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        {pdf_url && (
                            <Button 
                                variant="success" 
                                href={pdf_url} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 fw-semibold shadow-sm"
                            >
                                Lihat/Unduh PDF
                            </Button>
                        )}
                    </div>
                    
                    <Button 
                        variant="light" 
                        onClick={onNewInput}
                        className="px-4 py-2 text-secondary border mt-2 fw-semibold shadow-sm"
                    >
                        Isi Data Baru
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SuccessCard;
