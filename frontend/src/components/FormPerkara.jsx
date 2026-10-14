import React, { useState, useEffect } from 'react';
import { Card, Form, InputGroup } from 'react-bootstrap';
import Select from 'react-select';

const jenisOptions = [
    { value: 'Pdt.G', label: 'Pdt.G' },
    { value: 'Pdt.P', label: 'Pdt.P' }
];

const currentYear = new Date().getFullYear();
const tahunOptions = Array.from({ length: 12 }, (_, i) => {
    const yr = String(currentYear + 1 - i);
    return { value: yr, label: yr };
});

const createSelectStyles = (desktopWidth, mobileWidth) => ({
    control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? '#198754' : '#dee2e6',
        boxShadow: state.isFocused ? '0 0 0 0.15rem rgba(25, 135, 84, 0.25)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#198754' : '#adb5bd'
        },
        borderRadius: '0',
        minHeight: '38px',
        height: '38px',
        backgroundColor: '#fff',
        fontSize: '0.875rem',
        cursor: 'pointer'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#198754' : state.isFocused ? '#d1e7dd' : 'white',
        color: state.isSelected ? '#fff' : '#212529',
        fontSize: '0.875rem',
        padding: '6px 10px',
        cursor: 'pointer',
        '&:active': {
            backgroundColor: '#198754',
            color: '#fff'
        }
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 4px',
        justifyContent: 'center'
    }),
    singleValue: (base) => ({
        ...base,
        fontWeight: '600',
        color: '#212529',
        margin: 0
    }),
    container: (base) => ({
        ...base,
        flex: '0 0 auto',
        width: desktopWidth,
        '@media (max-width: 576px)': {
            width: mobileWidth
        }
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '85px'
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999
    }),
    indicatorSeparator: () => ({
        display: 'none'
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '2px',
        color: '#6c757d'
    })
});

const jenisSelectStyles = createSelectStyles('82px', '72px');
const tahunSelectStyles = createSelectStyles('88px', '78px');

const FormPerkara = ({ value, onChange }) => {
    const [nomorUrut, setNomorUrut] = useState('');
    const [jenisPerkara, setJenisPerkara] = useState('Pdt.G');
    const [tahun, setTahun] = useState(String(currentYear));
    const pengadilan = 'PA.Krw';

    // Set initial values if parent already has value (e.g. going back to step 1)
    useEffect(() => {
        if (value && value.includes('/')) {
            const parts = value.split('/');
            if (parts.length >= 1 && parts[0]) setNomorUrut(parts[0].replace(/\D/g, ''));
            if (parts.length >= 2 && parts[1]) setJenisPerkara(parts[1]);
            if (parts.length >= 3 && parts[2]) setTahun(parts[2]);
        }
    }, [value]);

    const handleNomorChange = (e) => {
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        setNomorUrut(onlyNumbers);
        updateParent(onlyNumbers, jenisPerkara, tahun);
    };

    const handleJenisChange = (selectedJenis) => {
        setJenisPerkara(selectedJenis);
        updateParent(nomorUrut, selectedJenis, tahun);
    };

    const handleTahunChange = (selectedTahun) => {
        setTahun(selectedTahun);
        updateParent(nomorUrut, jenisPerkara, selectedTahun);
    };

    const updateParent = (nomor, jenis, yr) => {
        const combined = nomor ? `${nomor}/${jenis}/${yr}/${pengadilan}` : '';
        onChange('nomorPerkara', combined);
    };

    return (
        <Card className="mb-4 border-0 shadow">
            <Card.Body className="p-3 p-sm-4">
                <div className="text-center mb-4">
                    <h4 className="fw-bold">DATA SAKSI-SAKSI</h4>
                </div>
                <Form.Group>
                    <Form.Label className="fw-bold">
                        PERKARA NOMOR
                    </Form.Label>
                    <div className="perkara-input-wrapper">
                        <InputGroup className="flex-nowrap align-items-stretch perkara-input-group">
                            <Form.Control 
                                type="text" 
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={nomorUrut}
                                onChange={handleNomorChange}
                                onKeyDown={(e) => {
                                    if (
                                        !/[0-9]/.test(e.key) &&
                                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(e.key) &&
                                        !e.ctrlKey && !e.metaKey
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                placeholder="Misal: 123"
                                className="perkara-nomor-input"
                                required
                            />
                            <InputGroup.Text className="bg-light px-1 px-sm-2 text-muted fw-bold">/</InputGroup.Text>
                            <Select 
                                options={jenisOptions}
                                value={jenisOptions.find(opt => opt.value === jenisPerkara) || null}
                                onChange={(selected) => handleJenisChange(selected ? selected.value : '')}
                                styles={jenisSelectStyles}
                                isSearchable={false}
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                menuPosition="fixed"
                            />
                            <InputGroup.Text className="bg-light px-1 px-sm-2 text-muted fw-bold">/</InputGroup.Text>
                            <Select 
                                options={tahunOptions}
                                value={tahunOptions.find(opt => opt.value === String(tahun)) || { value: String(tahun), label: String(tahun) }}
                                onChange={(selected) => handleTahunChange(selected ? selected.value : '')}
                                styles={tahunSelectStyles}
                                isSearchable={false}
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                menuPosition="fixed"
                            />
                            <InputGroup.Text className="bg-light px-1 px-sm-2 text-muted fw-bold">/</InputGroup.Text>
                            <InputGroup.Text className="bg-light fw-bold text-secondary px-1 px-sm-2 text-nowrap">
                                {pengadilan}
                            </InputGroup.Text>
                        </InputGroup>
                    </div>
                </Form.Group>
            </Card.Body>
        </Card>
    );
};

export default FormPerkara;

