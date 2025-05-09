import { Dispatch, AnyAction } from 'redux';
import { message } from 'antd';
import { getDestinations, getDestinationById } from '@/services/DiemDen/api';
import {
	createItinerary,
	getItineraries,
	updateItinerary,
	deleteItinerary,
	getItineraryById,
} from '@/services/LichTrinh/api';
import { createBudget, getBudgetByItineraryId, updateBudget } from '@/services/NganSach/api';

export interface ActionWithPayload<T = any> extends AnyAction {
	payload: T;
}

export type Effect = (
	action: AnyAction,
	effects: {
		put: (action: AnyAction) => void;
		call: Function;
		select: Function;
	},
) => Generator<any, void, unknown>;

export type Reducer<S> = (state: S, action: AnyAction) => S;

export interface ItineraryItem {
	destinationId: string;
	day: number;
	order: number;
}

export interface Budget {
	food: number;
	accommodation: number;
	transportation: number;
	activities: number;
	other: number;
}

export interface TripState {
	destinations: DiemDen.IDestination[];
	selectedDestinations: ItineraryItem[];
	budget: Budget;
	budgetLimit: number;
	loading: boolean;
	currentItineraryId: string;
	currentBudgetId: string;
}

export interface TripModelType {
	namespace: string;
	state: TripState;
	effects: {
		fetchDestinations: Effect;
		addDestinationToItinerary: Effect;
		removeDestinationFromItinerary: Effect;
		reorderItinerary: Effect;
		updateBudget: Effect;
		setBudgetLimit: Effect;
		saveItineraryToApi: Effect;
		fetchItineraryFromApi: Effect;
		saveBudgetToApi: Effect;
		fetchBudgetFromApi: Effect;
	};
	reducers: {
		saveDestinations: Reducer<TripState>;
		saveItinerary: Reducer<TripState>;
		saveBudget: Reducer<TripState>;
		saveBudgetLimit: Reducer<TripState>;
		setLoading: Reducer<TripState>;
		setCurrentItineraryId: Reducer<TripState>;
		setCurrentBudgetId: Reducer<TripState>;
	};
}

const TripModel: TripModelType = {
	namespace: 'trip',

	state: {
		destinations: [],
		selectedDestinations: [],
		budget: {
			food: 0,
			accommodation: 0,
			transportation: 0,
			activities: 0,
			other: 0,
		},
		budgetLimit: 0,
		loading: false,
		currentItineraryId: '',
		currentBudgetId: '',
	},

	effects: {
		*fetchDestinations(_: AnyAction, { call, put }: { call: any; put: any }) {
			yield put({ type: 'setLoading', payload: true });
			try {
				const response = yield call(getDestinations);
				// Type assertion for response
				const data = (response as any)?.data || [];
				yield put({
					type: 'saveDestinations',
					payload: data,
				});
			} catch (error) {
				message.error('Không thể tải danh sách điểm đến!');
			} finally {
				yield put({ type: 'setLoading', payload: false });
			}
		},

		*addDestinationToItinerary(action: AnyAction, { call, put, select }: { call: any; put: any; select: any }) {
			const { destinationId, day, order } = action.payload || {};
			// Type assertion for the select result
			const state = yield select((state: any) => state.trip);
			const itinerary = (state as TripState).selectedDestinations;

			// Create new itinerary item
			const newItem: ItineraryItem = {
				destinationId,
				day,
				order,
			};

			// Add to itinerary
			const updatedItinerary = [...itinerary, newItem];

			// Sort by day and order
			updatedItinerary.sort((a, b) => {
				if (a.day === b.day) {
					return a.order - b.order;
				}
				return a.day - b.day;
			});

			yield put({
				type: 'saveItinerary',
				payload: updatedItinerary,
			});

			// Update budget automatically
			yield put({ type: 'updateBudget' });
		},

		*removeDestinationFromItinerary(action: AnyAction, { put, select }: { put: any; select: any }) {
			const { destinationId, day } = action.payload || {};
			// Type assertion for the select result
			const state = yield select((state: any) => state.trip);
			const itinerary = (state as TripState).selectedDestinations;

			const updatedItinerary = itinerary.filter(
				(item: ItineraryItem) => !(item.destinationId === destinationId && item.day === day),
			);

			yield put({
				type: 'saveItinerary',
				payload: updatedItinerary,
			});

			// Update budget automatically
			yield put({ type: 'updateBudget' });
		},

		*reorderItinerary(action: AnyAction, { put }: { put: any }) {
			const { itinerary } = action.payload || {};

			yield put({
				type: 'saveItinerary',
				payload: itinerary,
			});
		},

		*updateBudget(_: AnyAction, { put, select }: { put: any; select: any }) {
			// Type assertion for the select result
			const state = yield select((state: any) => state);
			const tripState = (state as any).trip as TripState;
			const { selectedDestinations, destinations } = tripState;

			// Initialize budget categories
			const budget = {
				food: 0,
				accommodation: 0,
				transportation: 0,
				activities: 0,
				other: 0,
			};

			// Calculate budget based on selected destinations
			for (const item of selectedDestinations) {
				const destination = destinations.find((d: DiemDen.IDestination) => d.id === item.destinationId);
				if (destination) {
					budget.food += destination.foodCost || 0;
					budget.accommodation += destination.accommodationCost || 0;
					budget.transportation += destination.transportationCost || 0;
					// Assume 10% of the total cost for activities and 5% for other expenses
					const totalBaseCost = destination.foodCost + destination.accommodationCost + destination.transportationCost;
					budget.activities += totalBaseCost * 0.1;
					budget.other += totalBaseCost * 0.05;
				}
			}

			yield put({
				type: 'saveBudget',
				payload: budget,
			});
		},

		*setBudgetLimit(action: AnyAction, { put }: { put: any }) {
			yield put({
				type: 'saveBudgetLimit',
				payload: action.payload,
			});
		},

		*saveItineraryToApi(action: AnyAction, { call, put, select }: { call: any; put: any; select: any }) {
			yield put({ type: 'setLoading', payload: true });
			try {
				const { name, startDate, endDate } = action.payload || {};
				const state = yield select((state: any) => state.trip);
				const { selectedDestinations, currentItineraryId } = state as TripState;

				const payload = {
					name,
					startDate,
					endDate,
					destinations: selectedDestinations,
				};

				let response: any;
				if (currentItineraryId) {
					// Update existing itinerary
					response = yield call(updateItinerary, currentItineraryId, payload);
				} else {
					// Create new itinerary
					response = yield call(createItinerary, payload);
					// Save the new ID
					yield put({
						type: 'setCurrentItineraryId',
						payload: response.data.id,
					});

					// Also save a new budget for this itinerary
					yield put({
						type: 'saveBudgetToApi',
						payload: {
							itineraryId: response.data.id,
						},
					});
				}

				message.success('Lịch trình đã được lưu!');
			} catch (error) {
				message.error('Không thể lưu lịch trình!');
				console.error('Error saving itinerary:', error);
			} finally {
				yield put({ type: 'setLoading', payload: false });
			}
		},

		*fetchItineraryFromApi(action: AnyAction, { call, put }: { call: any; put: any }) {
			yield put({ type: 'setLoading', payload: true });
			try {
				const { itineraryId } = action.payload || {};

				if (!itineraryId) {
					return;
				}

				// Use direct API call to get specific itinerary by ID instead of fetching all
				const response: any = yield call(getItineraryById, itineraryId);
				const itinerary = response.data;

				if (itinerary) {
					yield put({
						type: 'saveItinerary',
						payload: itinerary.destinations || [],
					});

					yield put({
						type: 'setCurrentItineraryId',
						payload: itineraryId,
					});

					// Also fetch the budget for this itinerary
					yield put({
						type: 'fetchBudgetFromApi',
						payload: {
							itineraryId,
						},
					});
				}
			} catch (error) {
				message.error('Không thể tải lịch trình!');
				console.error('Error fetching itinerary:', error);
			} finally {
				yield put({ type: 'setLoading', payload: false });
			}
		},

		*saveBudgetToApi(action: AnyAction, { call, put, select }: { call: any; put: any; select: any }) {
			yield put({ type: 'setLoading', payload: true });
			try {
				const { itineraryId } = action.payload || {};
				const state = yield select((state: any) => state.trip);
				const { budget, budgetLimit, currentBudgetId, currentItineraryId } = state as TripState;

				const finalItineraryId = itineraryId || currentItineraryId;
				if (!finalItineraryId) {
					message.warning('Vui lòng lưu lịch trình trước khi lưu ngân sách!');
					return;
				}

				const payload = {
					itineraryId: finalItineraryId,
					budgetLimit,
					categories: budget,
				};

				let response: any;
				if (currentBudgetId) {
					// Update existing budget
					response = yield call(updateBudget, currentBudgetId, payload);
				} else {
					// Create new budget
					response = yield call(createBudget, payload);
					// Save the new ID
					yield put({
						type: 'setCurrentBudgetId',
						payload: response.data.id,
					});
				}

				message.success('Ngân sách đã được lưu!');
			} catch (error) {
				message.error('Không thể lưu ngân sách!');
				console.error('Error saving budget:', error);
			} finally {
				yield put({ type: 'setLoading', payload: false });
			}
		},

		*fetchBudgetFromApi(action: AnyAction, { call, put }: { call: any; put: any }) {
			yield put({ type: 'setLoading', payload: true });
			try {
				const { itineraryId } = action.payload || {};

				if (!itineraryId) {
					return;
				}

				const response: any = yield call(getBudgetByItineraryId, itineraryId);
				const budget = response.data;

				if (budget) {
					yield put({
						type: 'saveBudget',
						payload: budget.categories || {
							food: 0,
							accommodation: 0,
							transportation: 0,
							activities: 0,
							other: 0,
						},
					});

					yield put({
						type: 'saveBudgetLimit',
						payload: budget.budgetLimit || 0,
					});

					yield put({
						type: 'setCurrentBudgetId',
						payload: budget.id,
					});
				}
			} catch (error) {
				message.error('Không thể tải ngân sách!');
				console.error('Error fetching budget:', error);
			} finally {
				yield put({ type: 'setLoading', payload: false });
			}
		},
	},

	reducers: {
		saveDestinations(state, { payload }) {
			return {
				...state,
				destinations: payload,
			};
		},

		saveItinerary(state, { payload }) {
			return {
				...state,
				selectedDestinations: payload,
			};
		},

		saveBudget(state, { payload }) {
			return {
				...state,
				budget: payload,
			};
		},

		saveBudgetLimit(state, { payload }) {
			return {
				...state,
				budgetLimit: payload,
			};
		},

		setLoading(state, { payload }) {
			return {
				...state,
				loading: payload,
			};
		},

		setCurrentItineraryId(state, { payload }) {
			return {
				...state,
				currentItineraryId: payload,
			};
		},

		setCurrentBudgetId(state, { payload }) {
			return {
				...state,
				currentBudgetId: payload,
			};
		},
	},
};

export default TripModel;
