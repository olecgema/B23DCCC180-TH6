import React from 'react';
import { Row, Col, Select, InputNumber, Rate, Divider, Card, Button } from 'antd';
import { FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';

const { Option } = Select;

interface IFilterBarProps {
  typeFilter: string | undefined;
  setTypeFilter: (type: string | undefined) => void;
  priceFilter: number | undefined;
  setPriceFilter: (price: number | undefined) => void;
  ratingFilter: number | undefined;
  setRatingFilter: (rating: number | undefined) => void;
  sortBy: string | undefined;
  setSortBy: (sort: string | undefined) => void;
}

const FilterBar: React.FC<IFilterBarProps> = ({
  typeFilter,
  setTypeFilter,
  priceFilter,
  setPriceFilter,
  ratingFilter,
  setRatingFilter,
  sortBy,
  setSortBy,
}) => {
  const handleReset = () => {
    setTypeFilter(undefined);
    setPriceFilter(undefined);
    setRatingFilter(undefined);
    setSortBy(undefined);
  };

  return (
    <Card className="filter-container">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={12} lg={5}>
          <div style={{ marginBottom: 8 }}>
            <FilterOutlined /> Loại điểm đến
          </div>
          <Select
            allowClear
            style={{ width: '100%' }}
            placeholder="Tất cả loại"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
          >
            <Option value="beach">Bãi biển</Option>
            <Option value="mountain">Núi</Option>
            <Option value="city">Thành phố</Option>
          </Select>
        </Col>

        <Col xs={24} md={12} lg={5}>
          <div style={{ marginBottom: 8 }}>
            <FilterOutlined /> Tổng chi phí tối đa
          </div>
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={500000}
            value={priceFilter}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => parseInt(value?.replace(/\$\s?|(,*)/g, '') || '0')}
            placeholder="Nhập giá tối đa"
            onChange={(value) => setPriceFilter(value || undefined)}
            addonAfter="VNĐ"
          />
        </Col>

        <Col xs={24} md={12} lg={5}>
          <div style={{ marginBottom: 8 }}>
            <FilterOutlined /> Đánh giá tối thiểu
          </div>
          <Rate
            allowHalf
            value={ratingFilter || 0}
            onChange={(value) => setRatingFilter(value)}
          />
        </Col>

        <Col xs={24} md={12} lg={5}>
          <div style={{ marginBottom: 8 }}>
            <SortAscendingOutlined /> Sắp xếp theo
          </div>
          <Select
            allowClear
            style={{ width: '100%' }}
            placeholder="Mặc định"
            value={sortBy}
            onChange={(value) => setSortBy(value)}
          >
            <Option value="rating-desc">Đánh giá cao nhất</Option>
            <Option value="price-asc">Giá thấp đến cao</Option>
            <Option value="price-desc">Giá cao đến thấp</Option>
          </Select>
        </Col>

        <Col xs={24} md={24} lg={4} style={{ textAlign: 'right' }}>
          <Button onClick={handleReset} style={{ marginTop: 26 }}>
            Đặt lại bộ lọc
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default FilterBar;