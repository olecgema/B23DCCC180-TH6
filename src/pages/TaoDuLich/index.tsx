import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, Dispatch, history, Link } from 'umi';
import {
	Button,
	Card,
	Row,
	Col,
	Select,
	List,
	Tag,
	DatePicker,
	InputNumber,
	Form,
	Empty,
	Typography,
	message,
	Spin,
	Divider,
} from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ArrowRightOutlined, DeleteOutlined, PlusOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import { TripState, ItineraryItem } from '@/models/trip-planner';
import styles from './styles.less';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TaoDuLichProps {
	trip: TripState;
	dispatch: Dispatch;
	loading: boolean;
}

const TaoDuLich: React.FC<TaoDuLichProps> = ({ trip, dispatch, loading }) => {
	const [form] = Form.useForm();
	const [tripDays, setTripDays] = useState<number>(1);
	const [startDate, setStartDate] = useState<moment.Moment>(moment());
	const [selectedDestination, setSelectedDestination] = useState<string>('');
	const [selectedDay, setSelectedDay] = useState<number>(1);

	useEffect(() => {
		dispatch({
			type: 'trip/fetchDestinations',
		});
	}, [dispatch]);

	const handleAddDestination = () => {
		if (!selectedDestination || !selectedDay) {
			message.warning('Vui lòng chọn điểm đến và ngày');
			return;
		}

		const dayItinerary = trip.selectedDestinations.filter((item) => item.day === selectedDay);
		const order = dayItinerary.length + 1;

		dispatch({
			type: 'trip/addDestinationToItinerary',
			payload: {
				destinationId: selectedDestination,
				day: selectedDay,
				order,
			},
		});

		// Reset selection
		setSelectedDestination('');
	};

	const handleRemoveDestination = (destinationId: string, day: number) => {
		dispatch({
			type: 'trip/removeDestinationFromItinerary',
			payload: {
				destinationId,
				day,
			},
		});
	};

	const handleDragEnd = (result: any) => {
		const { destination, source } = result;

		// Dropped outside the list
		if (!destination) return;

		// Same position
		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		// Get the day from droppableId (format: "day-1", "day-2", etc.)
		const sourceDay = parseInt(source.droppableId.split('-')[1], 10);
		const destinationDay = parseInt(destination.droppableId.split('-')[1], 10);

		// Copy the itinerary
		const newItinerary = [...trip.selectedDestinations];

		// Find the item that was dragged
		const sourceItem = newItinerary.find((item) => item.day === sourceDay && item.order === source.index + 1);

		if (!sourceItem) return;

		if (sourceDay === destinationDay) {
			// Reordering within the same day
			const dayItems = newItinerary.filter((item) => item.day === sourceDay);
			const otherItems = newItinerary.filter((item) => item.day !== sourceDay);

			// Remove the dragged item
			const updatedDayItems = dayItems.filter((item) => !(item.day === sourceDay && item.order === source.index + 1));

			// Insert the dragged item at the new position
			updatedDayItems.splice(destination.index, 0, {
				...sourceItem,
				order: destination.index + 1,
			});

			// Update orders for all items in the day
			const reorderedDayItems = updatedDayItems.map((item, index) => ({
				...item,
				order: index + 1,
			}));

			// Combine all items
			const combinedItems = [...otherItems, ...reorderedDayItems];

			// Update the itinerary
			dispatch({
				type: 'trip/reorderItinerary',
				payload: {
					itinerary: combinedItems,
				},
			});
		} else {
			// Moving between different days
			// Remove the source item
			const filteredItinerary = newItinerary.filter(
				(item) => !(item.day === sourceDay && item.order === source.index + 1),
			);

			// Update order for source day items
			const updatedSourceDayItems = filteredItinerary
				.filter((item) => item.day === sourceDay)
				.map((item) => ({
					...item,
					order: item.order > source.index + 1 ? item.order - 1 : item.order,
				}));

			// Filter out the source day items
			const restItems = filteredItinerary.filter((item) => item.day !== sourceDay);

			// Insert the dragged item at the destination
			const draggedItem = {
				...sourceItem,
				day: destinationDay,
				order: destination.index + 1,
			};

			// Update order for destination day items
			const updatedDestDayItems = filteredItinerary
				.filter((item) => item.day === destinationDay)
				.map((item) => ({
					...item,
					order: item.order >= destination.index + 1 ? item.order + 1 : item.order,
				}));

			// Filter out the destination day items
			const restItems2 = restItems.filter((item) => item.day !== destinationDay);

			// Combine all items
			const combinedItems = [...restItems2, ...updatedSourceDayItems, ...updatedDestDayItems, draggedItem];

			// Update the itinerary
			dispatch({
				type: 'trip/reorderItinerary',
				payload: {
					itinerary: combinedItems,
				},
			});
		}
	};

	const handleDateChange = (dates: any) => {
		if (dates && dates.length === 2) {
			const start = dates[0];
			const end = dates[1];
			setStartDate(start);
			const days = end.diff(start, 'days') + 1;
			setTripDays(days);
			setSelectedDay(1); // Reset to first day
		}
	};

	const renderDestinationCard = (destination: DiemDen.IDestination) => {
		const totalCost = destination.foodCost + destination.accommodationCost + destination.transportationCost;
		return (
			<Card
				hoverable
				className={styles.destinationCard}
				cover={<img alt={destination.name} src={destination.imageUrl} />}
			>
				<Card.Meta
					title={destination.name}
					description={
						<>
							<div>
								<Tag color='blue'>
									{destination.type === 'beach' ? 'Biển' : destination.type === 'mountain' ? 'Núi' : 'Thành phố'}
								</Tag>
								<Tag color='green'>{destination.location}</Tag>
							</div>
							<div className={styles.destinationInfo}>
								<div>
									<CalendarOutlined /> {destination.visitDuration} giờ
								</div>
								<div>
									<UserOutlined /> {destination.averageRating.toFixed(1)}/5
								</div>
								<div className={styles.cost}>Chi phí: {totalCost.toLocaleString('vi-VN')}đ</div>
							</div>
						</>
					}
				/>
			</Card>
		);
	};

	const renderDayItinerary = (day: number) => {
		const dayItinerary = trip.selectedDestinations.filter((item) => item.day === day).sort((a, b) => a.order - b.order);

		const date = moment(startDate)
			.add(day - 1, 'days')
			.format('DD/MM/YYYY');

		return (
			<div key={`day-${day}`} className={styles.dayItinerary}>
				<Title level={4}>
					Ngày {day} - {date}
				</Title>
				<Droppable droppableId={`day-${day}`}>
					{(provided, snapshot) => (
						<div
							ref={provided.innerRef}
							{...provided.droppableProps}
							className={`${styles.droppableArea} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
						>
							{dayItinerary.length === 0 ? (
								<Empty description='Chưa có điểm đến cho ngày này' />
							) : (
								dayItinerary.map((item, index) => {
									const destination = trip.destinations.find((d) => d.id === item.destinationId);
									if (!destination) return null;

									return (
										<Draggable
											key={`${item.destinationId}-${item.day}`}
											draggableId={`${item.destinationId}-${item.day}`}
											index={index}
										>
											{(provided, snapshot) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													className={`${styles.itineraryItem} ${snapshot.isDragging ? styles.dragging : ''}`}
												>
													<div className={styles.itineraryItemContent}>
														<div className={styles.itineraryOrder}>{index + 1}</div>
														<div className={styles.itineraryDetails}>
															<div className={styles.itineraryName}>{destination.name}</div>
															<div className={styles.itineraryInfo}>
																<span>{destination.location}</span>
																<span>•</span>
																<span>{destination.visitDuration} giờ</span>
															</div>
														</div>
														<Button
															type='text'
															danger
															icon={<DeleteOutlined />}
															onClick={() => handleRemoveDestination(item.destinationId, item.day)}
														/>
													</div>
												</div>
											)}
										</Draggable>
									);
								})
							)}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</div>
		);
	};

	const calculateTravelTime = () => {
		// This is a simplified calculation for this example
		// In a real application, you would likely use a service to calculate travel times
		let totalHours = 0;

		trip.selectedDestinations.forEach((item) => {
			const destination = trip.destinations.find((d) => d.id === item.destinationId);
			if (destination) {
				totalHours += destination.visitDuration;
			}
		});

		// Add 1 hour of travel time between destinations
		totalHours += Math.max(0, trip.selectedDestinations.length - tripDays);

		return totalHours;
	};

	const renderTripSummary = () => {
		const totalBudget = Object.values(trip.budget).reduce((sum, cost) => sum + cost, 0);
		const travelTimeHours = calculateTravelTime();

		return (
			<Card title='Tổng quan chuyến đi' className={styles.summaryCard}>
				<div className={styles.summaryItem}>
					<Text strong>Thời gian:</Text>
					<Text>
						{tripDays} ngày ({travelTimeHours} giờ)
					</Text>
				</div>
				<div className={styles.summaryItem}>
					<Text strong>Số điểm đến:</Text>
					<Text>{trip.selectedDestinations.length}</Text>
				</div>
				<div className={styles.summaryItem}>
					<Text strong>Tổng chi phí:</Text>
					<Text>{totalBudget.toLocaleString('vi-VN')}đ</Text>
				</div>
				<Divider />
				<div className={styles.summaryActions}>
					<Button type='primary' icon={<ArrowRightOutlined />} onClick={() => history.push('/du-lich/NganSach')}>
						Chuyển đến Quản lý ngân sách
					</Button>
				</div>
			</Card>
		);
	};

	return (
		<PageContainer title='Tạo lịch trình du lịch' content='Thêm và sắp xếp các điểm đến cho chuyến đi của bạn'>
			<Spin spinning={loading}>
				<Row gutter={[24, 24]}>
					<Col xs={24} md={24} lg={24}>
						<Card>
							<Form form={form} layout='vertical'>
								<Row gutter={16}>
									<Col xs={24} md={8}>
										<Form.Item
											label='Thời gian chuyến đi'
											name='tripDates'
											rules={[{ required: true, message: 'Vui lòng chọn thời gian chuyến đi' }]}
										>
											<RangePicker format='DD/MM/YYYY' onChange={handleDateChange} className={styles.datePicker} />
										</Form.Item>
									</Col>
									<Col xs={24} md={16}>
										<Row gutter={16}>
											<Col xs={24} md={12}>
												<Form.Item label='Chọn điểm đến' name='destination'>
													<Select
														placeholder='Chọn điểm đến'
														value={selectedDestination}
														onChange={setSelectedDestination}
														className={styles.select}
														showSearch
														optionFilterProp='children'
													>
														{trip.destinations.map((destination) => (
															<Option key={destination.id} value={destination.id}>
																{destination.name} - {destination.location}
															</Option>
														))}
													</Select>
												</Form.Item>
											</Col>
											<Col xs={12} md={6}>
												<Form.Item label='Ngày' name='day'>
													<Select
														placeholder='Chọn ngày'
														value={selectedDay}
														onChange={setSelectedDay}
														className={styles.select}
													>
														{Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
															<Option key={day} value={day}>
																Ngày {day}
															</Option>
														))}
													</Select>
												</Form.Item>
											</Col>
											<Col xs={12} md={6}>
												<Form.Item label=' ' className={styles.addButtonFormItem}>
													<Button type='primary' icon={<PlusOutlined />} onClick={handleAddDestination} block>
														Thêm
													</Button>
												</Form.Item>
											</Col>
										</Row>
									</Col>
								</Row>
							</Form>
						</Card>
					</Col>

					<Col xs={24} lg={16}>
						<Card title='Lịch trình chuyến đi' className={styles.itineraryCard}>
							<DragDropContext onDragEnd={handleDragEnd}>
								{Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => renderDayItinerary(day))}
							</DragDropContext>
						</Card>
					</Col>

					<Col xs={24} lg={8}>
						<div className={styles.stickyContainer}>
							{renderTripSummary()}

							<Card title='Danh sách điểm đến' className={styles.destinationsCard}>
								<List
									grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 1, xl: 1, xxl: 1 }}
									dataSource={trip.destinations}
									renderItem={(destination) => <List.Item>{renderDestinationCard(destination)}</List.Item>}
								/>
							</Card>
						</div>
					</Col>
				</Row>
			</Spin>
		</PageContainer>
	);
};

export default connect(({ trip, loading }: { trip: TripState; loading: { effects: Record<string, boolean> } }) => ({
	trip,
	loading: loading.effects['trip/fetchDestinations'],
}))(TaoDuLich);
