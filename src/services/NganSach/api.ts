import { Budget } from '@/models/trip-planner';
import axios from '@/utils/axios';

const BUDGETS_API = 'https://681d6a7cf74de1d219afaa71.mockapi.io/budgets';

interface BudgetRecord {
	id: string;
	itineraryId: string;
	budgetLimit: number;
	categories: Budget;
	createdAt: string;
	updatedAt: string;
}

/**
 * Lấy tất cả ngân sách
 */
export async function getAllBudgets() {
	try {
		const response = await axios.get(BUDGETS_API);
		return { data: response.data || [] };
	} catch (error) {
		console.error('Error fetching budgets:', error);
		throw error;
	}
}

/**
 * Lấy ngân sách theo ID lịch trình
 */
export async function getBudgetByItineraryId(itineraryId: string) {
	try {
		const response = await axios.get(`${BUDGETS_API}?itineraryId=${itineraryId}`);
		return {
			data: response.data && response.data.length > 0 ? response.data[0] : null,
		};
	} catch (error) {
		console.error(`Error fetching budget for itinerary ID ${itineraryId}:`, error);
		throw error;
	}
}

/**
 * Tạo ngân sách mới
 */
export async function createBudget(payload: { itineraryId: string; budgetLimit: number; categories: Budget }) {
	try {
		const response = await axios.post(BUDGETS_API, {
			...payload,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		return { data: response.data };
	} catch (error) {
		console.error('Error creating budget:', error);
		throw error;
	}
}

/**
 * Cập nhật ngân sách
 */
export async function updateBudget(
	id: string,
	payload: {
		budgetLimit?: number;
		categories?: Budget;
	},
) {
	try {
		const response = await axios.put(`${BUDGETS_API}/${id}`, {
			...payload,
			updatedAt: new Date().toISOString(),
		});
		return { data: response.data };
	} catch (error) {
		console.error(`Error updating budget with ID ${id}:`, error);
		throw error;
	}
}

/**
 * Xóa ngân sách
 */
export async function deleteBudget(id: string) {
	try {
		const response = await axios.delete(`${BUDGETS_API}/${id}`);
		return { data: response.data };
	} catch (error) {
		console.error(`Error deleting budget with ID ${id}:`, error);
		throw error;
	}
}
