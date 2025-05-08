import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getDestinations } from '@/services/DiemDen/api';
import type { DiemDen } from '@/services/DiemDen/typing';

export default () => {
  const [destinations, setDestinations] = useState<DiemDen.IDestination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<DiemDen.IDestination[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [priceFilter, setPriceFilter] = useState<number | undefined>(undefined);
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [typeFilter, priceFilter, ratingFilter, sortBy, destinations]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const response = await getDestinations();
      setDestinations(response?.data || []);
      setFilteredDestinations(response?.data || []);
    } catch (error) {
      message.error('Không thể tải danh sách điểm đến');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...destinations];

    // Áp dụng bộ lọc loại
    if (typeFilter) {
      result = result.filter((item) => item.type === typeFilter);
    }

    // Áp dụng bộ lọc giá (tổng chi phí)
    if (priceFilter) {
      result = result.filter(
        (item) => (item.foodCost + item.accommodationCost + item.transportationCost) <= priceFilter
      );
    }

    // Áp dụng bộ lọc đánh giá
    if (ratingFilter) {
      result = result.filter((item) => item.averageRating >= ratingFilter);
    }

    // Áp dụng sắp xếp
    if (sortBy) {
      switch (sortBy) {
        case 'rating-desc':
          result.sort((a, b) => b.averageRating - a.averageRating);
          break;
        case 'price-asc':
          result.sort(
            (a, b) => 
              (a.foodCost + a.accommodationCost + a.transportationCost) - 
              (b.foodCost + b.accommodationCost + b.transportationCost)
          );
          break;
        case 'price-desc':
          result.sort(
            (a, b) => 
              (b.foodCost + b.accommodationCost + b.transportationCost) - 
              (a.foodCost + a.accommodationCost + a.transportationCost)
          );
          break;
        default:
          break;
      }
    }

    setFilteredDestinations(result);
  };

  return {
    loading,
    destinations,
    filteredDestinations,
    typeFilter,
    setTypeFilter,
    priceFilter,
    setPriceFilter,
    ratingFilter,
    setRatingFilter,
    sortBy,
    setSortBy,
    fetchDestinations,
  };
};