import React from 'react';
import { Card, Rate, Tag, Typography, Space } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { DiemDen } from '@/services/DiemDen/typing';

const { Text, Paragraph } = Typography;

interface IDestinationCardProps {
  destination: DiemDen.IDestination;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getTypeTag = (type: string): { color: string; text: string } => {
  switch (type) {
    case 'beach':
      return { color: 'blue', text: 'Bãi biển' };
    case 'mountain':
      return { color: 'green', text: 'Núi' };
    case 'city':
      return { color: 'orange', text: 'Thành phố' };
    default:
      return { color: 'default', text: type };
  }
};

const DestinationCard: React.FC<IDestinationCardProps> = ({ destination }) => {
  const typeInfo = getTypeTag(destination.type);
  const totalPrice = destination.foodCost + destination.accommodationCost + destination.transportationCost;

  return (
    <Card
      hoverable
      className="destination-card"
      cover={
        <img
          alt={destination.name}
          src={destination.imageUrl}
          onError={(e) => {
            e.currentTarget.src = '/favicon.ico'; // fallback image
          }}
        />
      }
    >
      <div className="destination-type">
        <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
      </div>

      <Card.Meta
        title={destination.name}
        description={
          <>
            <div className="destination-location">
              <EnvironmentOutlined /> {destination.location}
            </div>
            <Rate disabled allowHalf defaultValue={destination.averageRating} style={{ fontSize: 14 }} />
            <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8 }}>
              {destination.description}
            </Paragraph>
            <Space className="destination-info" direction="vertical" size={0}>
              <Text type="secondary">
                <ClockCircleOutlined /> {destination.visitDuration} giờ tham quan
              </Text>
              <div className="destination-price">
                {formatCurrency(totalPrice)}
              </div>
            </Space>
          </>
        }
      />
    </Card>
  );
};

export default DestinationCard;