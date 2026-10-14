import React from 'react';
import { Container } from 'react-bootstrap';
import SuccessCard from '../components/SuccessCard';

const SuccessPage = ({ result, onNewInput }) => {
    return (
        <Container className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                <SuccessCard result={result} onNewInput={onNewInput} />
            </div>
        </Container>
    );
};

export default SuccessPage;
