import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tabs, Typography, Select, DatePicker, Space, Button, Progress, Tag, Divider } from 'antd';
import { 
  BarChart, 
  PieChart,
  Column, 
  Pie, 
  Line, 
  Bar 
} from '@ant-design/plots';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  DollarCircleOutlined, 
  CalendarOutlined,
  RiseOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  FireOutlined,
  DollarOutlined,
  BulbOutlined,
  InfoCircleFilled
} from '@ant-design/icons';
import moment from 'moment';
import { genExcelFile } from '@/utils/utils';
import { getItineraries } from '@/services/LichTrinh/api';

const { TabPane } = Tabs;
const { Paragraph, Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface StatisticsProps {
  destinations: DiemDen.IDestination[];
}

const StatisticsComponent: React.FC<StatisticsProps> = ({ destinations }) => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().startOf('month'), 
    moment()
  ]);
  const [travelPlans, setTravelPlans] = useState<any[]>([]);
  
  // Add these constants at the top of your component
  const REVENUE_TARGET = 10000000000; // 10 billion VND example target
  const TRIPS_TARGET = 100; // Example target

  // Replace your existing useEffect that generates mock data
  useEffect(() => {
    const fetchTravelPlans = async () => {
      try {
        // Get saved itineraries from local storage or API
        const response = await getItineraries();
        const allItineraries = response?.data || [];
        
        // Group itineraries by month
        const plansByMonth = Array.from({ length: 12 }, (_, i) => {
          const monthItineraries = allItineraries.filter(item => {
            const startDate = moment(item.startDate);
            return startDate.month() === i && startDate.year() === year;
          });
          
          // Calculate revenue based on actual destinations in each itinerary
          let totalRevenue = 0;
          const tourDetails = [];
          
          for (const itinerary of monthItineraries) {
            // For each destination in itinerary
            for (const dest of itinerary.destinations) {
              const destination = destinations.find(d => d.id === dest.destinationId);
              if (destination) {
                const baseCost = destination.foodCost + destination.accommodationCost + destination.transportationCost;
                const activitiesCost = baseCost * 0.1;
                const otherCost = baseCost * 0.05;
                const tourCost = baseCost + activitiesCost + otherCost;
                
                totalRevenue += tourCost;
                
                tourDetails.push({
                  destinationId: destination.id,
                  cost: tourCost,
                  baseCost: baseCost,
                  activitiesCost: activitiesCost,
                  otherCost: otherCost
                });
              }
            }
          }
          
          return {
            month: i + 1,
            count: monthItineraries.length,
            revenue: totalRevenue,
            tourDetails: tourDetails
          };
        });
        
        setTravelPlans(plansByMonth);
      } catch (error) {
        console.error('Error fetching travel plans data:', error);
      }
    };
    
    if (destinations && destinations.length > 0) {
      fetchTravelPlans();
    }
  }, [destinations, year]); // Re-run when year changes or destinations are loaded

  // Replace your current calculateStats function with this enhanced version
  const calculateStats = () => {
    if (!destinations || destinations.length === 0) {
      return { typeData: [], costData: [], popularDestinations: [] };
    }

    // Count destinations by type
    const typeCount = destinations.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeMapping: Record<string, string> = {
      'beach': 'Bãi biển',
      'mountain': 'Núi',
      'city': 'Thành phố'
    };

    const typeData = Object.entries(typeCount).map(([type, count]) => ({
      type: typeMapping[type] || type,
      count
    }));

    // Calculate average costs
    const avgFoodCost = destinations.reduce((sum, item) => sum + item.foodCost, 0) / destinations.length;
    const avgAccommodationCost = destinations.reduce((sum, item) => sum + item.accommodationCost, 0) / destinations.length;
    const avgTransportationCost = destinations.reduce((sum, item) => sum + item.transportationCost, 0) / destinations.length;

    // Calculate activity and other costs based on the same formulas used in the itinerary calculation
    const avgBaseCost = avgFoodCost + avgAccommodationCost + avgTransportationCost;
    const avgActivitiesCost = avgBaseCost * 0.1;  // 10% of base cost
    const avgOtherCost = avgBaseCost * 0.05;      // 5% of base cost

    const costData = [
      { category: 'Ăn uống', cost: avgFoodCost },
      { category: 'Lưu trú', cost: avgAccommodationCost },
      { category: 'Di chuyển', cost: avgTransportationCost },
      { category: 'Hoạt động', cost: avgActivitiesCost },
      { category: 'Khác', cost: avgOtherCost }
    ];

    // Popular destinations (sorted by rating)
    const popularDestinations = [...destinations]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    return { typeData, costData, popularDestinations };
  };

  const { typeData, costData, popularDestinations } = calculateStats();

  // Revenue by month chart config
  const revenueConfig = {
    data: travelPlans,
    xField: 'month',
    yField: 'revenue',
    color: '#1890ff',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
      formatter: (val: any) => `${(val.revenue / 1000000).toFixed(1)}M`,
    },
    xAxis: {
      label: {
        formatter: (val: string) => `Tháng ${val}`,
      },
    },
    yAxis: {
      label: {
        formatter: (val: string) => `${(Number(val) / 1000000).toFixed(0)}M`,
      },
    },
  };

  // Travel plans by month chart config
  const planCountConfig = {
    data: travelPlans,
    xField: 'month',
    yField: 'count',
    color: '#52c41a',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        formatter: (val: string) => `Tháng ${val}`,
      },
    },
  };

  // Destination types pie chart config
  const typeChartConfig = {
    data: typeData,
    angleField: 'count',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      formatter: (datum: any) => {
        if (!datum || datum.type === undefined) return '';
        const percent = datum.percent || 0;
        return `${datum.type}: ${datum.count || 0} (${(percent * 100).toFixed(0)}%)`;
      },
    },
    interactions: [{ type: 'element-active' }],
  };

  // Average costs bar chart config
  const costChartConfig = {
    data: costData,
    xField: 'cost',
    yField: 'category',
    seriesField: 'category',
    color: ['#ffd666', '#ff7a45', '#36cfc9'],
    label: {
      position: 'middle',
      formatter: (val: any) => `${(val.cost / 1000).toFixed(0)}K`,
    },
    xAxis: {
      label: {
        formatter: (val: string) => `${(Number(val) / 1000).toFixed(0)}K`,
      },
    },
  };

  const popularDestinationsColumns = [
    {
      title: 'Tên điểm đến',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'averageRating',
      key: 'rating',
      render: (rating: number) => `${rating}/5`,
      sorter: (a: any, b: any) => a.averageRating - b.averageRating,
      defaultSortOrder: 'descend' as 'descend',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        switch (type) {
          case 'beach': return 'Bãi biển';
          case 'mountain': return 'Núi';
          case 'city': return 'Thành phố';
          default: return type;
        }
      },
    },
  ];

  const handleYearChange = (value: number) => {
    setYear(value);
    // In a real app, you would fetch data for the selected year
  };

  const handleRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0], dates[1]]);
      // In a real app, you would fetch data for the selected range
    }
  };

  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i).map(optionYear => (
      <Select.Option key={optionYear} value={optionYear}>{optionYear}</Select.Option>
    ));
  };

  // Update the exportStatistics function to include more detailed data
  const exportStatistics = () => {
    // Calculate total spending by category across all months
    const totalFoodCost = travelPlans.reduce((sum, plan) => 
      sum + plan.tourDetails.reduce((acc: number, tour: { baseCost: number }) => acc + tour.baseCost * 0.3, 0), 0);
    const totalAccommodationCost = travelPlans.reduce((sum, plan) => 
      sum + plan.tourDetails.reduce((acc: number, tour: { baseCost: number }) => acc + tour.baseCost * 0.4, 0), 0);
    const totalTransportationCost = travelPlans.reduce((sum, plan) => 
      sum + plan.tourDetails.reduce((acc: number, tour: { baseCost: number }) => acc + tour.baseCost * 0.3, 0), 0);
    const totalActivitiesCost = travelPlans.reduce((sum, plan) => 
      sum + plan.tourDetails.reduce((acc: number, tour: { baseCost: number; activitiesCost: number }) => acc + tour.activitiesCost, 0), 0);
    const totalOtherCost = travelPlans.reduce((sum, plan) => 
      sum + plan.tourDetails.reduce((acc: number, tour: { baseCost: number; otherCost: number }) => acc + tour.otherCost, 0), 0);
  
    // Prepare the data for Excel export with multiple sheets
    const monthlyData = [
      ['Tháng', 'Số lượng lịch trình', 'Doanh thu (VNĐ)'],
      ...travelPlans.map(plan => [
        `Tháng ${plan.month}`, 
        plan.count, 
        plan.revenue
      ])
    ];
    
    const categoryData = [
      ['Hạng mục', 'Tổng chi phí (VNĐ)'],
      ['Ăn uống', totalFoodCost],
      ['Lưu trú', totalAccommodationCost], 
      ['Di chuyển', totalTransportationCost],
      ['Hoạt động', totalActivitiesCost],
      ['Khác', totalOtherCost],
      ['Tổng cộng', totalFoodCost + totalAccommodationCost + totalTransportationCost + totalActivitiesCost + totalOtherCost]
    ];
  
    // Use the utility function to generate Excel with multiple sheets
    genExcelFile(
      monthlyData, 
      'Thống_kê_du_lịch.xlsx', 
      [{ name: 'Chi phí theo hạng mục', data: categoryData }]
    );
  };

  // Add this function inside your StatisticsComponent
  const renderInsights = () => {
    // Calculate key metrics for insights
    const totalRevenue = travelPlans.reduce((sum, plan) => sum + plan.revenue, 0);
    const totalTrips = travelPlans.reduce((sum, plan) => sum + plan.count, 0);
    const avgRevenuePerTrip = totalTrips > 0 ? totalRevenue / totalTrips : 0;
    
    // Find the month with highest revenue
    const highestRevenueMonth = travelPlans.reduce(
      (highest, current) => current.revenue > highest.revenue ? current : highest,
      { month: 0, revenue: 0 }
    );
    
    // Find most popular destination type
    const mostPopularType = typeData.reduce(
      (highest, current) => current.count > highest.count ? current : highest,
      { type: '', count: 0 }
    );
  
    return (
      <Card title="Phân tích và đề xuất" className="insights-card">
        <Paragraph>
          <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Tổng doanh thu năm {year} là <Text strong>{totalRevenue.toLocaleString('vi-VN')}đ</Text> từ <Text strong>{totalTrips}</Text> lịch trình.
        </Paragraph>
        
        {highestRevenueMonth.month > 0 && (
          <Paragraph>
            <RiseOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            Tháng <Text strong>{highestRevenueMonth.month}</Text> có doanh thu cao nhất với <Text strong>{highestRevenueMonth.revenue.toLocaleString('vi-VN')}đ</Text>.
          </Paragraph>
        )}
        
        {mostPopularType.type && (
          <Paragraph>
            <FireOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
            Loại điểm đến phổ biến nhất là <Text strong>{mostPopularType.type}</Text> với <Text strong>{mostPopularType.count}</Text> điểm.
          </Paragraph>
        )}
        
        <Paragraph>
          <DollarOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          Doanh thu trung bình cho mỗi lịch trình là <Text strong>{avgRevenuePerTrip.toLocaleString('vi-VN')}đ</Text>.
        </Paragraph>
        
        <Divider />
        
        <Title level={5}>Đề xuất:</Title>
        <Paragraph>
          <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
          {mostPopularType.type && `Nên tập trung phát triển thêm điểm đến loại "${mostPopularType.type}" do nhu cầu cao.`}
        </Paragraph>
        <Paragraph>
          <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
          {highestRevenueMonth.month > 0 && `Nên chuẩn bị nhiều tour hơn cho tháng ${highestRevenueMonth.month} trong năm sau.`}
        </Paragraph>
      </Card>
    );
  };

  // Then add this function to your component
  const renderProgressCards = () => {
    const totalRevenue = travelPlans.reduce((sum, plan) => sum + plan.revenue, 0);
    const revenueProgress = Math.min(Math.round((totalRevenue / REVENUE_TARGET) * 100), 100);
    
    const totalTrips = travelPlans.reduce((sum, plan) => sum + plan.count, 0);
    const tripsProgress = Math.min(Math.round((totalTrips / TRIPS_TARGET) * 100), 100);
    
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Title level={5}>Mục tiêu doanh thu</Title>
            <Progress 
              percent={revenueProgress} 
              status={revenueProgress >= 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Row justify="space-between">
              <Text>{totalRevenue.toLocaleString('vi-VN')}đ</Text>
              <Text>{REVENUE_TARGET.toLocaleString('vi-VN')}đ</Text>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Title level={5}>Mục tiêu lịch trình</Title>
            <Progress 
              percent={tripsProgress} 
              status={tripsProgress >= 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#ff7a45',
                '100%': '#73d13d',
              }}
            />
            <Row justify="space-between">
              <Text>{totalTrips} lịch trình</Text>
              <Text>{TRIPS_TARGET} lịch trình</Text>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  };

  // Add this function to your component
  const renderDestinationCostComparison = () => {
    // Create a table showing costs for each destination
    const destinationCosts = destinations.map(dest => {
      const baseCost = dest.foodCost + dest.accommodationCost + dest.transportationCost;
      const activitiesCost = baseCost * 0.1;
      const otherCost = baseCost * 0.05;
      const totalCost = baseCost + activitiesCost + otherCost;
      
      return {
        id: dest.id,
        name: dest.name,
        location: dest.location,
        type: dest.type,
        food: dest.foodCost,
        accommodation: dest.accommodationCost,
        transportation: dest.transportationCost,
        activities: activitiesCost,
        other: otherCost,
        total: totalCost
      };
    }).sort((a, b) => b.total - a.total); // Sort by highest cost
    
    const columns = [
      {
        title: 'Điểm đến',
        dataIndex: 'name',
        key: 'name',
        render: (name: string, record: any) => (
          <div>
            <div>{name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{record.location}</div>
          </div>
        ),
      },
      {
        title: 'Loại',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => {
          switch (type) {
            case 'beach': return <Tag color="blue">Bãi biển</Tag>;
            case 'mountain': return <Tag color="green">Núi</Tag>;
            case 'city': return <Tag color="orange">Thành phố</Tag>;
            default: return type;
          }
        },
      },
      {
        title: 'Ăn uống',
        dataIndex: 'food',
        key: 'food',
        render: (value: number) => value.toLocaleString('vi-VN') + 'đ',
        sorter: (a: any, b: any) => a.food - b.food,
      },
      {
        title: 'Lưu trú',
        dataIndex: 'accommodation',
        key: 'accommodation',
        render: (value: number) => value.toLocaleString('vi-VN') + 'đ',
        sorter: (a: any, b: any) => a.accommodation - b.accommodation,
      },
      {
        title: 'Di chuyển',
        dataIndex: 'transportation',
        key: 'transportation',
        render: (value: number) => value.toLocaleString('vi-VN') + 'đ',
        sorter: (a: any, b: any) => a.transportation - b.transportation,
      },
      {
        title: 'Tổng chi phí',
        dataIndex: 'total',
        key: 'total',
        render: (value: number) => <Text strong>{value.toLocaleString('vi-VN')}đ</Text>,
        sorter: (a: any, b: any) => a.total - b.total,
        defaultSortOrder: 'descend' as 'descend',
      },
    ];
  
    return (
      <Card title="So sánh chi phí theo điểm đến">
        <Table 
          dataSource={destinationCosts} 
          columns={columns} 
          rowKey="id"
          pagination={{ pageSize: 5 }}
          summary={(pageData) => {
            let totalCost = 0;
            pageData.forEach(({ total }) => {
              totalCost += total;
            });
  
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <Text strong>Tổng chi phí</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <Text strong>{totalCost.toLocaleString('vi-VN')}đ</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>
    );
  };

  return (
    <Card title="Thống kê" className="statistics-card">
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Select 
            defaultValue={year} 
            style={{ width: 120 }} 
            onChange={handleYearChange}
          >
            {yearOptions()}
          </Select>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: 'right' }}>
          <Space>
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={exportStatistics} 
              type="primary"
            >
              Xuất Excel
            </Button>
            <RangePicker 
              value={[dateRange[0], dateRange[1]]}
              onChange={handleRangeChange}
            />
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Tổng số điểm đến" 
              value={destinations.length} 
              prefix={<EnvironmentOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Lịch trình đã tạo" 
              value={travelPlans.reduce((sum, plan) => sum + plan.count, 0)} 
              prefix={<CalendarOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Doanh thu" 
              value={travelPlans.reduce((sum, plan) => sum + plan.revenue, 0)} 
              prefix={<DollarCircleOutlined />}
              formatter={(value: number) => `${(Number(value) / 1000000000).toFixed(2)} tỷ`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Đánh giá trung bình" 
              value={destinations.reduce((sum, dest) => sum + dest.averageRating, 0) / destinations.length} 
              precision={1}
              prefix={<RiseOutlined />}
              suffix="/5"
            />
          </Card>
        </Col>
      </Row>

      {renderProgressCards()}

      <Tabs defaultActiveKey="1">
        <TabPane tab="Lịch trình theo tháng" key="1">
          <Card title="Số lượng lịch trình được tạo theo tháng">
            <Column {...planCountConfig} />
          </Card>
        </TabPane>
        
        <TabPane tab="Doanh thu" key="2">
          <Card title="Doanh thu theo tháng">
            <Column {...revenueConfig} />
          </Card>
        </TabPane>
        
        <TabPane tab="Loại điểm đến" key="3">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Phân bố theo loại điểm đến">
                <Pie {...typeChartConfig} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Chi phí trung bình theo hạng mục">
                <Bar {...costChartConfig} />
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Điểm đến phổ biến" key="4">
          <Card title="Top điểm đến được đánh giá cao nhất">
            <Table 
              dataSource={popularDestinations} 
              columns={popularDestinationsColumns} 
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="Chi tiêu theo hạng mục" key="5">
          <Card title="Phân bổ chi tiêu theo hạng mục">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Pie 
                  {...{
                    data: [
                      { type: 'Ăn uống', value: costData.find(item => item.category === 'Ăn uống')?.cost || 0 },
                      { type: 'Lưu trú', value: costData.find(item => item.category === 'Lưu trú')?.cost || 0 },
                      { type: 'Di chuyển', value: costData.find(item => item.category === 'Di chuyển')?.cost || 0 },
                      { type: 'Hoạt động', value: costData.find(item => item.category === 'Hoạt động')?.cost || 0 },
                      { type: 'Khác', value: costData.find(item => item.category === 'Khác')?.cost || 0 },
                    ],
                    angleField: 'value',
                    colorField: 'type',
                    radius: 0.8,
                    label: {
                      type: 'outer',
                      formatter: (datum: any) => {
                        if (!datum || datum.type === undefined) return '';
                        return `${datum.type}: ${((datum.value || 0) / 1000).toFixed(0)}K`;
                      },
                    },
                    interactions: [{ type: 'element-active' }],
                  }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Table
                  dataSource={[
                    { category: 'Ăn uống', cost: costData.find(item => item.category === 'Ăn uống')?.cost || 0 },
                    { category: 'Lưu trú', cost: costData.find(item => item.category === 'Lưu trú')?.cost || 0 },
                    { category: 'Di chuyển', cost: costData.find(item => item.category === 'Di chuyển')?.cost || 0 },
                    { category: 'Hoạt động', cost: costData.find(item => item.category === 'Hoạt động')?.cost || 0 },
                    { category: 'Khác', cost: costData.find(item => item.category === 'Khác')?.cost || 0 },
                  ]}
                  columns={[
                    { title: 'Hạng mục', dataIndex: 'category' },
                    { 
                      title: 'Chi phí trung bình (VNĐ)', 
                      dataIndex: 'cost',
                      render: (val) => val.toLocaleString('vi-VN')
                    }
                  ]}
                  pagination={false}
                />
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="Phân tích và đề xuất" key="6">
          {renderInsights()}
        </TabPane>

        <TabPane tab="So sánh chi phí theo điểm đến" key="7">
          {renderDestinationCostComparison()}
        </TabPane>

        {/* Add this tab with a Line chart to see monthly trends */}
        <TabPane tab="Xu hướng theo tháng" key="7">
          <Card title="Xu hướng doanh thu và lịch trình theo tháng">
            <Line
              {...{
                data: travelPlans,
                xField: 'month',
                yField: ['revenue', 'count'],
                seriesField: 'category',
                xAxis: {
                  title: { text: 'Tháng' },
                  label: { formatter: (val: string) => `Tháng ${val}` },
                },
                yAxis: {
                  revenue: {
                    min: 0,
                    title: { text: 'Doanh thu (VNĐ)' },
                    label: { formatter: (val: number) => `${(val / 1000000).toFixed(0)}M` },
                  },
                  count: {
                    min: 0,
                    title: { text: 'Số lượng lịch trình' },
                  },
                },
                legend: {
                  itemName: {
                    formatter: (text) => {
                      if (text === 'revenue') return 'Doanh thu';
                      if (text === 'count') return 'Số lượng lịch trình';
                      return text;
                    }
                  }
                },
                tooltip: {
                  formatter: (datum) => {
                    return { 
                      name: datum.category === 'revenue' ? 'Doanh thu' : 'Số lượng lịch trình',
                      value: datum.category === 'revenue' 
                        ? datum.revenue.toLocaleString('vi-VN') + 'đ'
                        : datum.count
                    };
                  }
                },
                meta: {
                  revenue: { alias: 'Doanh thu' },
                  count: { alias: 'Số lượng lịch trình' },
                }
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <div style={{ marginTop: 24 }}>
        {renderInsights()}
      </div>
    </Card>
  );
};

export default StatisticsComponent;