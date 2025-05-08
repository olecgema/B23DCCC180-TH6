import axios from '@/utils/axios';

const API_URL = 'https://67f74a7a42d6c71cca64966c.mockapi.io/Destination';

export async function getDestinations() {
  try {
    return await axios.get(API_URL);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
}

export async function getDestinationById(id: string) {
  try {
    return await axios.get(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error fetching destination with ID ${id}:`, error);
    throw error;
  }
}

export async function createDestination(payload: DiemDen.IDestination) {
  try {
    return await axios.post(API_URL, payload);
  } catch (error) {
    console.error('Error creating destination:', error);
    throw error;
  }
}

export async function updateDestination(id: string, payload: DiemDen.IDestination) {
  try {
    return await axios.put(`${API_URL}/${id}`, payload);
  } catch (error) {
    console.error(`Error updating destination with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteDestination(id: string) {
  try {
    return await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting destination with ID ${id}:`, error);
    throw error;
  }
}
