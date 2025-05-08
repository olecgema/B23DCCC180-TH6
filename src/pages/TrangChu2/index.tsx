import React from 'react';
import { Row, Col, Typography, Spin, Empty, Divider } from 'antd';
import { useModel } from 'umi';
import DestinationCard from './components/DestinationCard';
import FilterBar from './components/FilterBar';
import './components/style.less';

const { Title } = Typography;

const TrangChu: React.FC = () => {
  const {
    loading,
    filteredDestinations,
    typeFilter,
    setTypeFilter,
    priceFilter,
    setPriceFilter,
    ratingFilter,
    setRatingFilter,
    sortBy,
    setSortBy,
  } = useModel('home.destination');

  return (
    <div className="home-container">
      <div className="title-section">
        <Title level={2} className="title-with-border">
          Khám phá điểm đến
        </Title>
      </div>

      <FilterBar
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredDestinations.length > 0 ? (
        <Row gutter={[24, 24]} className="card-container">
          {filteredDestinations.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <DestinationCard destination={item} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty 
          className="empty-state"
          description="Không tìm thấy điểm đến nào phù hợp với tiêu chí tìm kiếm"
        />
      )}

      <Divider />

      <div className="title-section">
        <Title level={3} className="title-with-border">
          Điểm đến nổi bật
        </Title>
      </div>

      <Row gutter={[24, 24]} className="card-container">
        {!loading && 
          filteredDestinations
            .filter(item => item.averageRating >= 4)
            .slice(0, 4)
            .map((item) => (
              <Col xs={24} sm={12} md={6} key={item.id}>
                <DestinationCard destination={item} />
              </Col>
            ))}
        {!loading && filteredDestinations.filter(item => item.averageRating >= 4).length === 0 && (
          <Col span={24}>
            <Empty description="Chưa có điểm đến nổi bật" />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default TrangChu;