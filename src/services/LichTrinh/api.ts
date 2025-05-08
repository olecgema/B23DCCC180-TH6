import axios from '@/utils/axios';
import type { ItineraryItem } from '@/models/trip-planner';

const API_URL = 'https://67f74a7a42d6c71cca64966c.mockapi.io/Itinerary';

/**
 * Lấy tất cả lịch trình của người dùng
 */
export async function getItineraries() {
	try {
		return await axios.get(API_URL);
	} catch (error) {
		console.error('Error fetching itineraries:', error);
		throw error;
	}
}

/**
 * Lấy chi tiết một lịch trình
 */
export async function getItineraryById(id: string) {
	try {
		return await axios.get(`${API_URL}/${id}`);
	} catch (error) {
		console.error(`Error fetching itinerary with ID ${id}:`, error);
		throw error;
	}
}

/**
 * Tạo lịch trình mới
 */
export async function createItinerary(payload: {
	name: string;
	startDate: string;
	endDate: string;
	destinations: ItineraryItem[];
}) {
	try {
		return await axios.post(API_URL, payload);
	} catch (error) {
		console.error('Error creating itinerary:', error);
		throw error;
	}
}

/**
 * Cập nhật lịch trình
 */
export async function updateItinerary(
	id: string,
	payload: {
		name?: string;
		startDate?: string;
		endDate?: string;
		destinations?: ItineraryItem[];
	},
) {
	try {
		return await axios.put(`${API_URL}/${id}`, payload);
	} catch (error) {
		console.error(`Error updating itinerary with ID ${id}:`, error);
		throw error;
	}
}

/**
 * Xóa lịch trình
 */
export async function deleteItinerary(id: string) {
	try {
		return await axios.delete(`${API_URL}/${id}`);
	} catch (error) {
		console.error(`Error deleting itinerary with ID ${id}:`, error);
		throw error;
	}
}
