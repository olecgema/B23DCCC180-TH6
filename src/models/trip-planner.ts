import { Dispatch } from 'redux';
import type { AnyAction } from 'redux';
import { message } from 'antd';
import { getDestinations, getDestinationById } from '@/services/DiemDen/api';

export interface ActionWithPayload<T = any> extends AnyAction {
	payload: T;
}

export type Effect = (
	action: AnyAction,
	effects: {
		put: (action: AnyAction) => void;
		call: (fn: (...args: any[]) => any, ...args: any[]) => any;
		select: (selector: (state: any) => any) => any;
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
	};
	reducers: {
		saveDestinations: Reducer<TripState>;
		saveItinerary: Reducer<TripState>;
		saveBudget: Reducer<TripState>;
		saveBudgetLimit: Reducer<TripState>;
		setLoading: Reducer<TripState>;
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
			const tripState = yield select((rootState: any) => rootState.trip);
			const itinerary = (tripState as TripState).selectedDestinations;

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
			const tripState = yield select((rootState: any) => rootState.trip);
			const itinerary = (tripState as TripState).selectedDestinations;

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
			const rootState = yield select((rootState: any) => rootState);
			const tripState = (rootState as any).trip as TripState;
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
	},
};

export default TripModel;
