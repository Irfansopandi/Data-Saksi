import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const submitSaksiData = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/saksi`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || 'Terjadi kesalahan pada server.');
        }
        throw new Error('Tidak dapat terhubung ke server.');
    }
};
