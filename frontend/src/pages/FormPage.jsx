import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { BsPerson, BsPeople, BsUpload, BsTelephoneFill, BsWhatsapp } from 'react-icons/bs';
import FormPerkara from '../components/FormPerkara';
import FormSaksi from '../components/FormSaksi';
import KtpUpload from '../components/KtpUpload';
import { submitSaksiData } from '../services/api';

const FormPage = ({ onSuccess }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');

    const [step, setStep] = useState(1);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Age validation
        if (formData.umurSaksi1 < 21) newErrors.umurSaksi1 = 'Saksi 1 harus berusia minimal 21 tahun.';
        if (formData.umurSaksi2 < 21) newErrors.umurSaksi2 = 'Saksi 2 harus berusia minimal 21 tahun.';
        
        // NIK Validation
        if (formData.nikSaksi1 && formData.nikSaksi1.length !== 16) newErrors.nikSaksi1 = 'NIK Saksi 1 harus 16 digit.';
        if (formData.nikSaksi2 && formData.nikSaksi2.length !== 16) newErrors.nikSaksi2 = 'NIK Saksi 2 harus 16 digit.';

        // File Size Validation (Max 5MB)
        if (formData.ktpSaksi1 && formData.ktpSaksi1.size > 5 * 1024 * 1024) {
            newErrors.ktpSaksi1 = 'Ukuran file terlalu besar (Maks. 5MB).';
        }
        if (formData.ktpSaksi2 && formData.ktpSaksi2.size > 5 * 1024 * 1024) {
            newErrors.ktpSaksi2 = 'Ukuran file terlalu besar (Maks. 5MB).';
        }

        setErrors(newErrors);
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGlobalError('');
        
        const currentErrors = validateForm();
        if (Object.keys(currentErrors).length > 0) {
            if (currentErrors.umurSaksi1 || currentErrors.nikSaksi1) {
                setStep(1);
            } else if (currentErrors.umurSaksi2 || currentErrors.nikSaksi2) {
                setStep(2);
            } else if (currentErrors.ktpSaksi1 || currentErrors.ktpSaksi2) {
                setStep(3);
            }
            setGlobalError('Terdapat kesalahan pada input. Silakan periksa kembali bagian yang ditandai merah.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            const dataToSubmit = new FormData();
            
            // Append all text data
            Object.keys(formData).forEach(key => {
                if (key !== 'ktpSaksi1' && key !== 'ktpSaksi2') {
                    dataToSubmit.append(key, formData[key]);
                }
            });
            
            // Append files
            if (formData.ktpSaksi1) dataToSubmit.append('ktpSaksi1', formData.ktpSaksi1);
            if (formData.ktpSaksi2) dataToSubmit.append('ktpSaksi2', formData.ktpSaksi2);

            const result = await submitSaksiData(dataToSubmit);
            if (result.success) {
                onSuccess(result);
            }
        } catch (error) {
            setGlobalError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isStep1Complete = () => {
        const requiredFields = [
            'nomorPerkara',
            'namaSaksi1', 'nikSaksi1', 'tempatLahirSaksi1', 'tanggalLahirSaksi1', 'umurSaksi1', 'agamaSaksi1', 'pekerjaanSaksi1', 'pendidikanSaksi1', 'hubunganSaksi1', 'alamatSaksi1'
        ];
        return requiredFields.every(field => {
            const val = formData[field];
            return val !== undefined && val !== null && val !== '';
        });
    };

    const isStep2Complete = () => {
        const requiredFields = [
            'namaSaksi2', 'nikSaksi2', 'tempatLahirSaksi2', 'tanggalLahirSaksi2', 'umurSaksi2', 'agamaSaksi2', 'pekerjaanSaksi2', 'pendidikanSaksi2', 'hubunganSaksi2', 'alamatSaksi2'
        ];
        return requiredFields.every(field => {
            const val = formData[field];
            return val !== undefined && val !== null && val !== '';
        });
    };

    const isStep3Complete = () => {
        const requiredFields = ['ktpSaksi1', 'ktpSaksi2'];
        return requiredFields.every(field => {
            const val = formData[field];
            return val !== undefined && val !== null && val !== '';
        });
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Container className="py-5" style={{ maxWidth: '800px', position: 'relative' }}>
            {loading && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Spinner animation="border" variant="success" style={{ width: '4rem', height: '4rem', borderWidth: '0.4em' }} />
                    <h4 className="mt-3 fw-bold text-success">Sedang Mengirim Data...</h4>
                    <p className="text-muted">Mohon tunggu sebentar, sedang membuat PDF dan menyimpan dokumen.</p>
                </div>
            )}
            
            {/* Stepper Progress */}
            <div className="mb-5 d-flex justify-content-between position-relative">
                {/* Dashed background line */}
                <div className="position-absolute" style={{ borderTop: '2px dashed #adb5bd', top: '20px', left: '16.66%', width: '66.66%', zIndex: 1 }}></div>
                
                {/* Solid green foreground line */}
                <div className="position-absolute" style={{ height: '2px', backgroundColor: '#198754', top: '20px', left: '16.66%', zIndex: 1, width: step === 1 ? '0%' : step === 2 ? '33.33%' : '66.66%', transition: 'width 0.3s ease-in-out' }}></div>

                <div className="text-center position-relative" style={{ zIndex: 2, width: '33.33%' }}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${step >= 1 ? 'bg-success text-white shadow-sm' : 'bg-light text-secondary border'}`} style={{ width: '40px', height: '40px', transition: 'all 0.3s' }}>
                        <BsPerson size={20} />
                    </div>
                    <div className={`fw-bold ${step >= 1 ? 'text-success' : 'text-secondary'}`} style={{ fontSize: '0.85rem' }}>SAKSI I</div>
                </div>
                
                <div className="text-center position-relative" style={{ zIndex: 2, width: '33.33%' }}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${step >= 2 ? 'bg-success text-white shadow-sm' : 'bg-light text-secondary border'}`} style={{ width: '40px', height: '40px', transition: 'all 0.3s' }}>
                        <BsPeople size={20} />
                    </div>
                    <div className={`fw-bold ${step >= 2 ? 'text-success' : 'text-secondary'}`} style={{ fontSize: '0.85rem' }}>SAKSI II</div>
                </div>
                
                <div className="text-center position-relative" style={{ zIndex: 2, width: '33.33%' }}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${step >= 3 ? 'bg-success text-white shadow-sm' : 'bg-light text-secondary border'}`} style={{ width: '40px', height: '40px', transition: 'all 0.3s' }}>
                        <BsUpload size={20} />
                    </div>
                    <div className={`fw-bold ${step >= 3 ? 'text-success' : 'text-secondary'}`} style={{ fontSize: '0.85rem' }}>UPLOAD KTP</div>
                </div>
            </div>

            {globalError && <Alert variant="danger">{globalError}</Alert>}
            
            <Form onSubmit={handleSubmit}>
                {step === 1 && (
                    <>
                        <FormPerkara 
                            value={formData.nomorPerkara} 
                            onChange={handleChange} 
                        />
                        <FormSaksi 
                            title="SAKSI I" 
                            prefix="Saksi1" 
                            data={formData} 
                            onChange={handleChange} 
                            errors={errors}
                        />
                    </>
                )}
                
                {step === 2 && (
                    <FormSaksi 
                        title="SAKSI II" 
                        prefix="Saksi2" 
                        data={formData} 
                        onChange={handleChange} 
                        errors={errors}
                    />
                )}

                {step === 3 && (
                    <KtpUpload onChange={handleChange} errors={errors} />
                )}

                <Row className="mb-4">
                    <Col md={6} className="mb-3 mb-md-0">
                        <Card className="h-100 bg-light" style={{ border: '2px dashed #adb5bd' }}>
                            <Card.Body>
                                <h6 className="fw-bold">*KETERANGAN:</h6>
                                <ul className="mb-0 text-muted">
                                    <li>Saksi minimal telah berusia 21 tahun.</li>
                                    <li>Anak tidak bisa dijadikan Saksi.</li>
                                    <li>Membawa lampiran fotocopy KTP saksi pada saat sidang.</li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="h-100 bg-light" style={{ border: '2px dashed #198754' }}>
                            <Card.Body>
                                <h6 className="fw-bold text-success mb-3">No. Kantor PA Karawang :</h6>
                                <div className="d-flex flex-column gap-2">
                                    <a href="tel:0267402230" className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2">
                                        <BsTelephoneFill /> ( 0267 ) 402230
                                    </a>
                                    <a href="https://wa.me/6285175005301?text=Halo%20Admin%20PA%20Karawang,%20saya%20ingin%20bertanya%20terkait%20pendaftaran%20saksi..." target="_blank" rel="noopener noreferrer" className="btn btn-success d-flex align-items-center justify-content-center gap-2 text-white">
                                        <BsWhatsapp /> 0851 7500 5301
                                    </a>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="d-flex justify-content-between gap-3">
                    {step > 1 && (
                        <Button variant="secondary" size="lg" onClick={prevStep} className="w-50">
                            KEMBALI
                        </Button>
                    )}
                    
                    {step < 3 && (
                        <Button 
                            variant="success" 
                            size="lg" 
                            onClick={nextStep} 
                            disabled={step === 1 ? !isStep1Complete() : !isStep2Complete()}
                            className={step === 1 ? 'w-100' : 'w-50'}
                        >
                            SELANJUTNYA
                        </Button>
                    )}
                    
                    {step === 3 && (
                        <Button 
                            variant="success" 
                            size="lg" 
                            type="submit" 
                            disabled={loading || !isStep3Complete()}
                            className="w-50"
                        >
                            {loading ? 'Menyimpan...' : 'SUBMIT DATA'}
                        </Button>
                    )}
                </div>
            </Form>
        </Container>
    );
};

export default FormPage;
