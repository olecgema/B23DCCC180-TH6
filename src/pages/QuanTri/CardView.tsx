import React from 'react';
import { Card, Row, Col, Rate, Typography, Popconfirm, Button, Space, Tooltip, Skeleton, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EnvironmentOutlined, ClockCircleOutlined, TagOutlined } from '@ant-design/icons';
import styles from './index.less';

const { Text, Title } = Typography;

interface ICardViewProps {
  dataSource: DiemDen.IDestination[];
  loading: boolean;
  onEdit: (record: DiemDen.IDestination) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'beach':
      return { text: 'Bãi biển', color: 'blue' };
    case 'mountain':
      return { text: 'Núi', color: 'green' };
    case 'city':
      return { text: 'Thành phố', color: 'orange' };
    default:
      return { text: type, color: 'default' };
  }
};

const CardView: React.FC<ICardViewProps> = ({ dataSource, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card>
              <Skeleton.Image style={{ width: '100%', height: '200px' }} />
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {dataSource.map((item) => {
        const typeInfo = getTypeLabel(item.type);
        
        return (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              className={styles.destinationCard}
              cover={
                <div className={styles.cardImageContainer}>
                  <img 
                    alt={item.name} 
                    src={item.imageUrl} 
                    className={styles.cardImage} 
                    onError={(e) => {
                      // Fallback image khi URL không hợp lệ
                      e.currentTarget.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              }
              actions={[
                <Tooltip title="Chỉnh sửa">
                  <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(item)} />
                </Tooltip>,
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa điểm đến này?"
                  onConfirm={() => onDelete(item.id!)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <div className={styles.cardContent} onClick={() => onEdit(item)}>
                <div className={styles.cardHeader}>
                  <Title level={5} ellipsis={{ rows: 1 }}>{item.name}</Title>
                  <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
                </div>
                
                <div className={styles.cardRating}>
                  <Rate disabled value={item.averageRating} allowHalf />
                  <Text type="secondary">{item.averageRating}/5</Text>
                </div>
                
                <Text type="secondary" ellipsis>{item.description}</Text>
                
                <Space direction="vertical" className={styles.cardInfo} size={2}>
                  <div className={styles.infoItem}>
                    <EnvironmentOutlined /> <Text>{item.location}</Text>
                  </div>
                  <div className={styles.infoItem}>
                    <ClockCircleOutlined /> <Text>Thời gian: {item.visitDuration} giờ</Text>
                  </div>
                  <div className={styles.costInfo}>
                    <Text>Ăn uống: {formatCurrency(item.foodCost)}</Text>
                    <Text>Lưu trú: {formatCurrency(item.accommodationCost)}</Text>
                    <Text>Di chuyển: {formatCurrency(item.transportationCost)}</Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default CardView;
