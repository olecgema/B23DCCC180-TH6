declare namespace DiemDen {
  export interface IDestination {
    id?: string;
    name: string;
    description: string;
    location: string;
    type: 'beach' | 'mountain' | 'city'; // Kiểu điểm đến: bãi biển, núi, thành phố
    imageUrl: string;
    visitDuration: number; // Thời gian tham quan (giờ)
    averageRating: number;
    foodCost: number;
    accommodationCost: number;
    transportationCost: number;
    createdAt?: string;
    updatedAt?: string;
  }

  export type TSearchParams = {
    page?: number;
    limit?: number;
    name?: string;
    type?: 'beach' | 'mountain' | 'city';
    location?: string;
  };
}