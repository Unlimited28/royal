import api from './api';

export const getRanks = async (): Promise<string[]> => {
    const response = await api.get('/ranks');
    return response.data;
};

export const getAssociations = async (): Promise<{ id: string; name: string }[]> => {
    const response = await api.get('/associations');
    return response.data;
};
