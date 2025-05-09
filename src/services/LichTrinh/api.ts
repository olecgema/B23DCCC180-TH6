import type { ItineraryItem } from '@/models/trip-planner';
import axios from '@/utils/axios';

const ITINERARIES_API = 'https://681d6a7cf74de1d219afaa71.mockapi.io/itineraries';

interface Itinerary {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	destinations: ItineraryItem[];
}

/**
 * Lấy tất cả lịch trình của người dùng
 */
export async function getItineraries() {
	try {
		const response = await axios.get(ITINERARIES_API);
		return { data: response.data || [] };
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
		const response = await axios.get(`${ITINERARIES_API}/${id}`);
		return { data: response.data };
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
		const response = await axios.post(ITINERARIES_API, payload);
		return { data: response.data };
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
		const response = await axios.put(`${ITINERARIES_API}/${id}`, payload);
		return { data: response.data };
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
		const response = await axios.delete(`${ITINERARIES_API}/${id}`);
		return { data: response.data };
	} catch (error) {
		console.error(`Error deleting itinerary with ID ${id}:`, error);
		throw error;
	}
}
