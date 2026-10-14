import moment from 'moment';

export const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    return moment().diff(moment(birthDate), 'years');
};

export const validateAge = (birthDate) => {
    const age = calculateAge(birthDate);
    return age >= 21;
};

export const validateNik = (nik) => {
    return /^\d{16}$/.test(nik);
};
