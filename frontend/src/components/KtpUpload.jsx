import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';

const KtpUpload = ({ onChange, errors = {} }) => {
    return (
        <Card className="mb-4 border-0 shadow">
            <Card.Header className="bg-white">
                <h5 className="mb-0 fw-bold">DOKUMEN KTP</h5>
            </Card.Header>
            <Card.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Upload KTP Saksi 1</Form.Label>
                    <Form.Control 
                        type="file" 
                        name="ktpSaksi1"
                        onChange={(e) => onChange('ktpSaksi1', e.target.files[0])}
                        accept=".jpg,.jpeg,.png"
                        isInvalid={!!errors?.ktpSaksi1}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors?.ktpSaksi1}
                    </Form.Control.Feedback>
                    {!errors?.ktpSaksi1 && (
                        <Form.Text className="text-muted">
                            Format: JPG, JPEG, PNG (Maks. 5MB)
                        </Form.Text>
                    )}
                </Form.Group>
                
                <Form.Group>
                    <Form.Label>Upload KTP Saksi 2</Form.Label>
                    <Form.Control 
                        type="file" 
                        name="ktpSaksi2"
                        onChange={(e) => onChange('ktpSaksi2', e.target.files[0])}
                        accept=".jpg,.jpeg,.png"
                        isInvalid={!!errors?.ktpSaksi2}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors?.ktpSaksi2}
                    </Form.Control.Feedback>
                    {!errors?.ktpSaksi2 && (
                        <Form.Text className="text-muted">
                            Format: JPG, JPEG, PNG (Maks. 5MB)
                        </Form.Text>
                    )}
                </Form.Group>
            </Card.Body>
        </Card>
    );
};

export default KtpUpload;
