import type { ItineraryItem } from '@/models/trip-planner';

const STORAGE_KEY = 'travel_itineraries';

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
		const itineraries = localStorage.getItem(STORAGE_KEY);
		return { data: itineraries ? JSON.parse(itineraries) : [] };
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
		const itineraries = localStorage.getItem(STORAGE_KEY);
		const allItineraries = itineraries ? JSON.parse(itineraries) : [];
		const itinerary = allItineraries.find((item: Itinerary) => item.id === id);
		return { data: itinerary };
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
		const itineraries = localStorage.getItem(STORAGE_KEY);
		const allItineraries = itineraries ? JSON.parse(itineraries) : [];

		const newItinerary = {
			id: Date.now().toString(), // Tạo ID đơn giản bằng timestamp
			...payload,
		};

		allItineraries.push(newItinerary);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(allItineraries));

		return { data: newItinerary };
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
		const itineraries = localStorage.getItem(STORAGE_KEY);
		const allItineraries = itineraries ? JSON.parse(itineraries) : [];

		const index = allItineraries.findIndex((item: Itinerary) => item.id === id);
		if (index === -1) {
			throw new Error('Itinerary not found');
		}

		allItineraries[index] = {
			...allItineraries[index],
			...payload,
		};

		localStorage.setItem(STORAGE_KEY, JSON.stringify(allItineraries));
		return { data: allItineraries[index] };
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
		const itineraries = localStorage.getItem(STORAGE_KEY);
		const allItineraries = itineraries ? JSON.parse(itineraries) : [];

		const filteredItineraries = allItineraries.filter((item: Itinerary) => item.id !== id);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItineraries));

		return { data: { id } };
	} catch (error) {
		console.error(`Error deleting itinerary with ID ${id}:`, error);
		throw error;
	}
}
