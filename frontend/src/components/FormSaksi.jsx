import React, { useEffect, useRef } from 'react';
import { Card, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { BsCalendar } from 'react-icons/bs';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { calculateAge, validateAge, validateNik } from '../utils/validation';

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? '#198754' : '#dee2e6',
        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(25, 135, 84, 0.25)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#198754' : '#adb5bd'
        },
        padding: '0.1rem'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#d1e7dd' : state.isFocused ? '#d1e7dd' : 'white',
        color: '#212529',
        '&:active': {
            backgroundColor: '#d1e7dd'
        }
    })
};

const binBintiOptions = [
    { value: 'bin', label: 'bin' },
    { value: 'binti', label: 'binti' }
];

const binBintiSelectStyles = {
    control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? '#198754' : '#198754',
        boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(25, 135, 84, 0.25)' : 'none',
        '&:hover': {
            borderColor: '#146c43'
        },
        minHeight: '38px',
        height: '38px',
        fontWeight: 'bold',
        fontSize: '0.95rem',
        cursor: 'pointer',
        borderRadius: '0.375rem',
        backgroundColor: '#f8f9fa'
    }),
    singleValue: (base) => ({
        ...base,
        color: '#198754',
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'center'
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 4px',
        justifyContent: 'center'
    }),
    indicatorsContainer: (base) => ({
        ...base,
        padding: '0 2px'
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '2px',
        color: '#198754',
        '&:hover': {
            color: '#146c43'
        }
    }),
    indicatorSeparator: () => ({
        display: 'none'
    }),
    menu: (base) => ({
        ...base,
        minWidth: '95px',
        zIndex: 50
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#198754' : state.isFocused ? '#d1e7dd' : 'white',
        color: state.isSelected ? 'white' : '#212529',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '6px 10px',
        cursor: 'pointer'
    })
};

const agamaOptions = [
    { value: 'Islam', label: 'Islam' },
    { value: 'Kristen', label: 'Kristen' },
    { value: 'Katolik', label: 'Katolik' },
    { value: 'Hindu', label: 'Hindu' },
    { value: 'Buddha', label: 'Buddha' },
    { value: 'Konghucu', label: 'Konghucu' },
    { value: 'Lainnya', label: 'Lainnya' }
];

const pendidikanOptions = [
    { value: 'Tidak Sekolah', label: 'Tidak Sekolah' },
    { value: 'SD', label: 'SD' },
    { value: 'SLTP', label: 'SLTP' },
    { value: 'SLTA', label: 'SLTA' },
    { value: 'D3', label: 'D3' },
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' },
    { value: 'S3', label: 'S3' },
    { value: 'Lainnya', label: 'Lainnya' }
];

const FormSaksi = ({ title, prefix, data, onChange, errors }) => {
    const datePickerRef = useRef(null);
    
    // Auto calculate age when birth date changes
    useEffect(() => {
        if (data[`tanggalLahir${prefix}`]) {
            const age = calculateAge(data[`tanggalLahir${prefix}`]);
            onChange(`umur${prefix}`, age);
        }
    }, [data[`tanggalLahir${prefix}`]]);

    // Sync split fields if nama already exists
    useEffect(() => {
        if (data[`nama${prefix}`] && !data[`namaDepan${prefix}`]) {
            const fullName = data[`nama${prefix}`];
            const match = fullName.match(/^(.*?)\s+(bin|binti)\s+(.*)$/i);
            if (match) {
                onChange(`namaDepan${prefix}`, match[1].trim());
                onChange(`binBinti${prefix}`, match[2].toLowerCase());
                onChange(`namaAyah${prefix}`, match[3].trim());
            } else {
                onChange(`namaDepan${prefix}`, fullName);
                onChange(`binBinti${prefix}`, 'bin');
            }
        }
    }, []);

    const handleNameChange = (field, value) => {
        const currentNamaDepan = field === 'namaDepan' ? value : (data[`namaDepan${prefix}`] || '');
        const currentBinBinti = field === 'binBinti' ? value : (data[`binBinti${prefix}`] || 'bin');
        const currentNamaAyah = field === 'namaAyah' ? value : (data[`namaAyah${prefix}`] || '');

        onChange(`namaDepan${prefix}`, currentNamaDepan);
        onChange(`binBinti${prefix}`, currentBinBinti);
        onChange(`namaAyah${prefix}`, currentNamaAyah);

        // Otomatis satukan menjadi "Nama bin/binti Nama Ayah"
        let combined = '';
        if (currentNamaDepan.trim()) {
            if (currentNamaAyah.trim()) {
                combined = `${currentNamaDepan.trim()} ${currentBinBinti} ${currentNamaAyah.trim()}`;
            } else {
                combined = currentNamaDepan.trim();
            }
        }
        onChange(`nama${prefix}`, combined);
    };

    return (
        <Card className="mb-4 border-0 shadow">
            <Card.Header className="bg-white">
                <h5 className="mb-0 fw-bold">{title}</h5>
            </Card.Header>
            <Card.Body>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Nama Saksi</Form.Label>
                    <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch">
                        {/* Input Nama Saksi */}
                        <div className="flex-grow-1">
                            <Form.Control 
                                type="text" 
                                placeholder="Nama Saksi (contoh: Budi)"
                                value={data[`namaDepan${prefix}`] || ''}
                                onChange={(e) => handleNameChange('namaDepan', e.target.value)}
                                required
                            />
                        </div>

                        {/* Baris Dropdown bin/binti & Nama Ayah */}
                        <div className="d-flex gap-2 align-items-center flex-grow-1">
                            <div style={{ width: '92px', minWidth: '92px', flexShrink: 0 }}>
                                <Select
                                    options={binBintiOptions}
                                    value={binBintiOptions.find(opt => opt.value === (data[`binBinti${prefix}`] || 'bin'))}
                                    onChange={(selected) => handleNameChange('binBinti', selected ? selected.value : 'bin')}
                                    styles={binBintiSelectStyles}
                                    isSearchable={false}
                                />
                            </div>
                            <div className="flex-grow-1">
                                <Form.Control 
                                    type="text" 
                                    placeholder="Nama Ayah (contoh: Ahmad)"
                                    value={data[`namaAyah${prefix}`] || ''}
                                    onChange={(e) => handleNameChange('namaAyah', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    {data[`nama${prefix}`] && (
                        <Form.Text className="text-muted mt-1 d-block">
                            Nama di berkas & PDF: <span className="fw-bold text-success">{data[`nama${prefix}`]}</span>
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>NIK (16 Digit)</Form.Label>
                    <Form.Control 
                        type="text" 
                        name={`nik${prefix}`}
                        value={data[`nik${prefix}`] || ''}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                            onChange(e.target.name, val);
                        }}
                        isInvalid={!!errors[`nik${prefix}`] || (data[`nik${prefix}`] && data[`nik${prefix}`].length > 0 && data[`nik${prefix}`].length < 16)}
                        placeholder="Masukkan 16 digit NIK"
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors[`nik${prefix}`] || 'NIK harus 16 digit.'}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Tempat Lahir</Form.Label>
                    <Form.Control 
                        type="text" 
                        name={`tempatLahir${prefix}`}
                        value={data[`tempatLahir${prefix}`] || ''}
                        onChange={(e) => onChange(e.target.name, e.target.value)}
                        list={`kotaList-${prefix}`}
                        placeholder="Contoh: Karawang"
                        required
                    />
                    <datalist id={`kotaList-${prefix}`}>
                        {/* Jawa Barat (Prioritas) */}
                        <option value="Karawang" />
                        <option value="Purwakarta" />
                        <option value="Subang" />
                        <option value="Bekasi" />
                        <option value="Cikarang" />
                        <option value="Bandung" />
                        <option value="Cimahi" />
                        <option value="Bogor" />
                        <option value="Depok" />
                        <option value="Cirebon" />
                        <option value="Indramayu" />
                        <option value="Majalengka" />
                        <option value="Sumedang" />
                        <option value="Kuningan" />
                        <option value="Garut" />
                        <option value="Tasikmalaya" />
                        <option value="Ciamis" />
                        <option value="Banjar" />
                        <option value="Pangandaran" />
                        <option value="Cianjur" />
                        <option value="Sukabumi" />

                        {/* DKI Jakarta & Banten */}
                        <option value="Jakarta" />
                        <option value="Tangerang" />
                        <option value="Serang" />
                        <option value="Cilegon" />
                        <option value="Pandeglang" />
                        <option value="Lebak" />

                        {/* Jawa Tengah & DIY */}
                        <option value="Semarang" />
                        <option value="Surakarta (Solo)" />
                        <option value="Yogyakarta" />
                        <option value="Sleman" />
                        <option value="Bantul" />
                        <option value="Magelang" />
                        <option value="Tegal" />
                        <option value="Pekalongan" />
                        <option value="Brebes" />
                        <option value="Cilacap" />
                        <option value="Banyumas" />
                        <option value="Kudus" />
                        <option value="Jepara" />
                        <option value="Pati" />
                        <option value="Salatiga" />

                        {/* Jawa Timur */}
                        <option value="Surabaya" />
                        <option value="Malang" />
                        <option value="Sidoarjo" />
                        <option value="Gresik" />
                        <option value="Banyuwangi" />
                        <option value="Jember" />
                        <option value="Madiun" />
                        <option value="Kediri" />
                        <option value="Blitar" />
                        <option value="Probolinggo" />
                        <option value="Pasuruan" />
                        <option value="Mojokerto" />
                        <option value="Batu" />

                        {/* Luar Jawa (Kota Besar) */}
                        <option value="Medan" />
                        <option value="Padang" />
                        <option value="Palembang" />
                        <option value="Pekanbaru" />
                        <option value="Batam" />
                        <option value="Bandar Lampung" />
                        <option value="Jambi" />
                        <option value="Bengkulu" />
                        <option value="Banda Aceh" />
                        <option value="Pangkal Pinang" />
                        <option value="Pontianak" />
                        <option value="Palangkaraya" />
                        <option value="Banjarmasin" />
                        <option value="Samarinda" />
                        <option value="Balikpapan" />
                        <option value="Makassar" />
                        <option value="Manado" />
                        <option value="Kendari" />
                        <option value="Palu" />
                        <option value="Gorontalo" />
                        <option value="Denpasar" />
                        <option value="Mataram" />
                        <option value="Kupang" />
                        <option value="Ambon" />
                        <option value="Ternate" />
                        <option value="Jayapura" />
                        <option value="Sorong" />
                        <option value="Manokwari" />
                    </datalist>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Tanggal Lahir</Form.Label>
                    <InputGroup>
                        <DatePicker
                            ref={datePickerRef}
                            selected={data[`tanggalLahir${prefix}`] ? new Date(`${data[`tanggalLahir${prefix}`]}T00:00:00`) : null}
                            onChange={(date) => {
                                if (date && !isNaN(date.getTime())) {
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    onChange(`tanggalLahir${prefix}`, `${year}-${month}-${day}`);
                                } else {
                                    onChange(`tanggalLahir${prefix}`, '');
                                }
                            }}
                            onChangeRaw={(e) => {
                                if (!e || !e.target || typeof e.target.value !== 'string') return;
                                let val = e.target.value.replace(/[^\d/]/g, '');
                                
                                if (e.nativeEvent && e.nativeEvent.inputType !== 'deleteContentBackward') {
                                    let parts = val.split('/');
                                    
                                    // Auto-pad when user types '/'
                                    if (parts.length > 1 && parts[0].length === 1) parts[0] = '0' + parts[0];
                                    if (parts.length > 2 && parts[1].length === 1) parts[1] = '0' + parts[1];

                                    // Auto-pad and cap Day
                                    if (parts[0]) {
                                        let day = parseInt(parts[0], 10);
                                        if (parts[0].length === 1 && day > 3) parts[0] = '0' + day;
                                        else if (parts[0].length === 2) {
                                            if (day > 31) parts[0] = '31';
                                            if (day === 0) parts[0] = '01';
                                        }
                                    }
                                    
                                    // Auto-pad and cap Month
                                    if (parts.length > 1 && parts[1]) {
                                        let month = parseInt(parts[1], 10);
                                        if (parts[1].length === 1 && month > 1) parts[1] = '0' + month;
                                        else if (parts[1].length === 2) {
                                            if (month > 12) parts[1] = '12';
                                            if (month === 0) parts[1] = '01';
                                        }
                                    }
                                    
                                    // Limit Year
                                    if (parts.length > 2 && parts[2]) {
                                        parts[2] = parts[2].slice(0, 4);
                                    }
                                    
                                    // Reconstruct with slashes
                                    val = parts[0] || '';
                                    if (val.length === 2 || parts.length > 1) val += '/';
                                    
                                    if (parts.length > 1) {
                                        val += parts[1] || '';
                                        if (parts[1].length === 2 || parts.length > 2) val += '/';
                                    }
                                    
                                    if (parts.length > 2) {
                                        val += parts[2] || '';
                                    }
                                }
                                
                                e.target.value = val;
                            }}
                            dateFormat={["dd/MM/yyyy", "d/M/yyyy", "dd/M/yyyy", "d/MM/yyyy"]}
                            minDate={new Date(1920, 0, 1)}
                            maxDate={new Date()}
                            className="form-control"
                            wrapperClassName="flex-grow-1"
                            placeholderText="dd/mm/yyyy"
                            required
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={105}
                            scrollableYearDropdown
                        />
                        <InputGroup.Text 
                            role="button" 
                            title="Buka Kalender" 
                            className="bg-light text-secondary" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                if (datePickerRef.current) {
                                    datePickerRef.current.setOpen(true);
                                }
                            }}
                        >
                            <BsCalendar />
                        </InputGroup.Text>
                    </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Umur (Tahun)</Form.Label>
                    <Form.Control 
                        type="number" 
                        name={`umur${prefix}`}
                        value={data[`umur${prefix}`] || ''}
                        onChange={(e) => onChange(e.target.name, e.target.value)}
                        isInvalid={!!errors[`umur${prefix}`] || (data[`umur${prefix}`] !== undefined && data[`umur${prefix}`] !== '' && Number(data[`umur${prefix}`]) < 21)}
                        placeholder="Contoh: 35"
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors[`umur${prefix}`] || 'Saksi harus berusia minimal 21 tahun.'}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Agama</Form.Label>
                    <Select 
                        options={agamaOptions}
                        value={agamaOptions.find(opt => opt.value === data[`agama${prefix}`]) || null}
                        onChange={(selected) => onChange(`agama${prefix}`, selected ? selected.value : '')}
                        styles={customSelectStyles}
                        placeholder="Pilih Agama"
                        isClearable
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Pekerjaan</Form.Label>
                    <Form.Control 
                        type="text" 
                        name={`pekerjaan${prefix}`}
                        value={data[`pekerjaan${prefix}`] || ''}
                        onChange={(e) => onChange(e.target.name, e.target.value)}
                        list={`pekerjaanList-${prefix}`}
                        placeholder="Contoh: Karyawan Swasta"
                        required
                    />
                    <datalist id={`pekerjaanList-${prefix}`}>
                        <option value="Pegawai Negeri Sipil (PNS)" />
                        <option value="Karyawan Swasta" />
                        <option value="Wiraswasta" />
                        <option value="Mengurus Rumah Tangga" />
                        <option value="Buruh Harian Lepas" />
                        <option value="Petani/Pekebun" />
                        <option value="Pelajar/Mahasiswa" />
                        <option value="Pensiunan" />
                        <option value="Tentara Nasional Indonesia (TNI)" />
                        <option value="Kepolisian RI (POLRI)" />
                        <option value="Guru" />
                        <option value="Dosen" />
                        <option value="Pedagang" />
                        <option value="Sopir" />
                        <option value="Nelayan/Perikanan" />
                        <option value="Belum/Tidak Bekerja" />
                    </datalist>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Pendidikan</Form.Label>
                    <Select 
                        options={pendidikanOptions}
                        value={pendidikanOptions.find(opt => opt.value === data[`pendidikan${prefix}`]) || null}
                        onChange={(selected) => onChange(`pendidikan${prefix}`, selected ? selected.value : '')}
                        styles={customSelectStyles}
                        placeholder="Pilih Pendidikan"
                        isClearable
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Hubungan dengan Pihak/Perkara</Form.Label>
                    <Form.Control 
                        type="text" 
                        name={`hubungan${prefix}`}
                        value={data[`hubungan${prefix}`] || ''}
                        onChange={(e) => onChange(e.target.name, e.target.value)}
                        list={`hubunganList-${prefix}`}
                        placeholder="Contoh: Kakak Kandung"
                        required
                    />
                    <datalist id={`hubunganList-${prefix}`}>
                        <option value="Ayah Kandung" />
                        <option value="Ibu Kandung" />
                        <option value="Kakak Kandung" />
                        <option value="Adik Kandung" />
                        <option value="Paman / Pakde / Uwak" />
                        <option value="Bibi / Bude" />
                        <option value="Sepupu" />
                        <option value="Kakek / Nenek" />
                        <option value="Tetangga" />
                        <option value="Teman / Sahabat" />
                        <option value="Rekan Kerja" />
                        <option value="Ketua RT / RW" />
                        <option value="Karyawan / Karyawati" />
                        <option value="Lainnya" />
                    </datalist>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Alamat Lengkap</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name={`alamat${prefix}`}
                        value={data[`alamat${prefix}`] || ''}
                        onChange={(e) => onChange(e.target.name, e.target.value)}
                        placeholder="Contoh: Jl. Ahmad Yani No. 1, RT 01/RW 02, Kec. Karawang Barat, Kab. Karawang"
                        required
                    />
                </Form.Group>
            </Card.Body>
        </Card>
    );
};

export default FormSaksi;
