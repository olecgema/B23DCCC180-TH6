import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, Dispatch, Link, history, useLocation } from 'umi';
import {
	Card,
	Row,
	Col,
	Statistic,
	Typography,
	InputNumber,
	Button,
	Table,
	Progress,
	Alert,
	Divider,
	Form,
	Space,
	Tabs,
	Tag,
	Spin,
	message,
	Empty,
} from 'antd';
import {
	ArrowLeftOutlined,
	DollarOutlined,
	ExclamationCircleOutlined,
	SaveOutlined,
	LoadingOutlined,
} from '@ant-design/icons';
import { TripState } from '@/models/trip-planner';
import DonutChart from '@/components/Chart/DonutChart';
import styles from './styles.less';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface BudgetProps {
	trip: TripState;
	dispatch: Dispatch;
	loading: boolean;
}

interface ChartDataItem {
	type: string;
	value: number;
	percent: number;
}

interface DestinationBudget {
	id: string;
	name: string;
	location: string;
	food: number;
	accommodation: number;
	transportation: number;
	activities: number;
	other: number;
	total: number;
	day: number;
	order: number;
}

const NganSach: React.FC<BudgetProps> = ({ trip, dispatch, loading }) => {
	const [budgetForm] = Form.useForm();
	const [budgetLimit, setBudgetLimit] = useState<number>(trip.budgetLimit || 0);
	const [isOverBudget, setIsOverBudget] = useState<boolean>(false);
	const location = useLocation();

	useEffect(() => {
		// If we don't have destinations yet, fetch them
		if (!trip.destinations || trip.destinations.length === 0) {
			dispatch({
				type: 'trip/fetchDestinations',
			});
		}

		// If we have a current itinerary ID, always fetch its budget data
		if (trip.currentItineraryId) {
			// Calculate budget
			dispatch({
				type: 'trip/updateBudget',
			});

			// Fetch budget data from API
			dispatch({
				type: 'trip/fetchBudgetFromApi',
				payload: {
					itineraryId: trip.currentItineraryId,
				},
			});
		}
	}, [dispatch, trip.destinations, trip.currentItineraryId]);

	useEffect(() => {
		// Set initial form values
		budgetForm.setFieldsValue({
			budgetLimit: trip.budgetLimit,
		});

		// Check if over budget
		const totalBudget = Object.values(trip.budget).reduce((sum, cost) => sum + cost, 0);
		setIsOverBudget(totalBudget > trip.budgetLimit && trip.budgetLimit > 0);
	}, [trip.budget, trip.budgetLimit, budgetForm]);

	// Thêm useEffect để kiểm tra nếu không có lịch trình hiện tại
	useEffect(() => {
		if (!trip.currentItineraryId) {
			// Không có lịch trình nào đang được chọn, reset form
			budgetForm.setFieldsValue({
				budgetLimit: 0,
			});
		}
	}, [trip.currentItineraryId, budgetForm]);

	// Remove or update the useEffect that checks for navigation
	useEffect(() => {
		const state = (location.state as { from?: string }) || {};
		if (state.from === 'TaoDuLich') {
			// No need to do anything additional since we always load budget data
			// when trip.currentItineraryId exists in the above useEffect
		}
	}, [location]);

	const handleSetBudgetLimit = (values: { budgetLimit: number }) => {
		const { budgetLimit } = values;
		setBudgetLimit(budgetLimit);

		// Update in redux store
		dispatch({
			type: 'trip/setBudgetLimit',
			payload: budgetLimit,
		});

		// Save to API
		saveBudgetToApi();
	};

	const saveBudgetToApi = () => {
		if (!trip.currentItineraryId) {
			message.warning('Vui lòng lưu lịch trình trước khi lưu ngân sách!');
			return;
		}

		dispatch({
			type: 'trip/saveBudgetToApi',
			payload: {},
		});
	};

	const calculateTotalBudget = () => {
		return Object.values(trip.budget).reduce((sum, cost) => sum + cost, 0);
	};

	const calculateBudgetPercentage = (category: keyof typeof trip.budget) => {
		const totalBudget = calculateTotalBudget();
		if (totalBudget === 0) return 0;
		return Math.round((trip.budget[category] / totalBudget) * 100);
	};

	const getBudgetStatusColor = (category: keyof typeof trip.budget) => {
		// If we have a budget limit, calculate what percentage of the budget limit this category is using
		if (trip.budgetLimit > 0) {
			const percentOfLimit = (trip.budget[category] / trip.budgetLimit) * 100;
			if (percentOfLimit >= 40) return 'red'; // Over 40% of total budget on one category
			if (percentOfLimit >= 30) return 'orange'; // Between 30-40% of total budget
			return 'green'; // Under 30% of budget
		}

		// If no budget limit, just base it on percentage of total expenses
		const percent = calculateBudgetPercentage(category);
		if (percent >= 40) return 'red';
		if (percent >= 30) return 'orange';
		return 'green';
	};

	const renderBudgetSummary = () => {
		const totalBudget = calculateTotalBudget();
		const budgetPercentage =
			trip.budgetLimit > 0 ? Math.min(Math.round((totalBudget / trip.budgetLimit) * 100), 100) : 0;

		const budgetStatus = budgetPercentage >= 100 ? 'exception' : budgetPercentage >= 80 ? 'normal' : 'success';

		return (
			<Card className={styles.summaryCard}>
				<Row gutter={[24, 24]}>
					<Col xs={24} md={12}>
						<Statistic
							title='Tổng chi phí dự kiến'
							value={totalBudget}
							suffix='VNĐ'
							precision={0}
							valueStyle={{ color: isOverBudget ? '#ff4d4f' : '#3f8600' }}
						/>
						{trip.budgetLimit > 0 && (
							<div className={styles.budgetLimitInfo}>
								<Text type='secondary'>Giới hạn ngân sách: {trip.budgetLimit.toLocaleString('vi-VN')}đ</Text>
								<Progress percent={budgetPercentage} status={budgetStatus} size='small' />
							</div>
						)}
					</Col>
					<Col xs={24} md={12}>
						<Form form={budgetForm} onFinish={handleSetBudgetLimit} layout='vertical'>
							<Form.Item
								name='budgetLimit'
								label='Giới hạn ngân sách của bạn'
								rules={[{ required: true, message: 'Vui lòng nhập giới hạn ngân sách' }]}
							>
								<InputNumber
									style={{ width: '100%' }}
									placeholder='Nhập giới hạn ngân sách'
									formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
									parser={(value) => parseInt(value?.replace(/\$\s?|(,*)/g, '') || '0', 10) as any}
									min={0}
									step={100000}
								/>
							</Form.Item>
							<Form.Item>
								<Button type='primary' htmlType='submit'>
									Cập nhật
								</Button>
							</Form.Item>
						</Form>
					</Col>
				</Row>

				{isOverBudget && (
					<Alert
						message='Cảnh báo vượt ngân sách!'
						description={`Chi phí dự kiến của bạn (${totalBudget.toLocaleString(
							'vi-VN',
						)}đ) vượt quá giới hạn ngân sách (${trip.budgetLimit.toLocaleString(
							'vi-VN',
						)}đ). Bạn nên điều chỉnh lịch trình hoặc tăng giới hạn ngân sách.`}
						type='error'
						showIcon
						icon={<ExclamationCircleOutlined />}
						className={styles.budgetAlert}
					/>
				)}
			</Card>
		);
	};

	const renderBudgetBreakdown = () => {
		const totalBudget = calculateTotalBudget();

		// Ensure each category has at least a minimum value for display
		const ensureMinimumValue = (value: number) => (value < 0.01 ? 0.01 : value);

		const chartData: ChartDataItem[] = [
			{
				type: 'Ăn uống',
				value: ensureMinimumValue(trip.budget.food),
				percent: calculateBudgetPercentage('food'),
			},
			{
				type: 'Lưu trú',
				value: ensureMinimumValue(trip.budget.accommodation),
				percent: calculateBudgetPercentage('accommodation'),
			},
			{
				type: 'Di chuyển',
				value: ensureMinimumValue(trip.budget.transportation),
				percent: calculateBudgetPercentage('transportation'),
			},
			{
				type: 'Hoạt động',
				value: ensureMinimumValue(trip.budget.activities),
				percent: calculateBudgetPercentage('activities'),
			},
			{
				type: 'Khác',
				value: ensureMinimumValue(trip.budget.other),
				percent: calculateBudgetPercentage('other'),
			},
		];

		const columns = [
			{
				title: 'Hạng mục',
				dataIndex: 'type',
				key: 'type',
			},
			{
				title: 'Chi phí (VNĐ)',
				dataIndex: 'value',
				key: 'value',
				render: (value: number) => value.toLocaleString('vi-VN'),
			},
			{
				title: 'Tỷ lệ',
				dataIndex: 'percent',
				key: 'percent',
				render: (percent: number) => `${percent}%`,
			},
			{
				title: 'Trạng thái',
				key: 'status',
				render: (_: unknown, record: ChartDataItem) => {
					const category =
						record.type === 'Ăn uống'
							? 'food'
							: record.type === 'Lưu trú'
							? 'accommodation'
							: record.type === 'Di chuyển'
							? 'transportation'
							: record.type === 'Hoạt động'
							? 'activities'
							: 'other';

					const color = getBudgetStatusColor(category as keyof typeof trip.budget);

					return <Tag color={color}>{color === 'green' ? 'Bình thường' : color === 'orange' ? 'Lưu ý' : 'Cao'}</Tag>;
				},
			},
		];

		return (
			<Card title='Phân bổ ngân sách' className={styles.breakdownCard}>
				<Tabs defaultActiveKey='chart'>
					<TabPane tab='Biểu đồ' key='chart'>
						<Row>
							<Col xs={24} md={12}>
								<div className={styles.chartContainer}>
									{totalBudget > 0 ? (
										<>
											<div className={styles.totalBudgetDisplay}>
												<div className={styles.totalBudgetLabel}>Tổng chi phí</div>
												<div className={styles.totalBudgetValue}>{totalBudget.toLocaleString('vi-VN')}đ</div>
											</div>
											<DonutChart
												xAxis={chartData.map((item) => item.type)}
												yAxis={[chartData.map((item) => item.value)]}
												yLabel={chartData.map((item) => item.type)}
												height={300}
												showTotal={true}
												formatY={(val) => val.toLocaleString('vi-VN') + 'đ'}
												otherOptions={{
													plotOptions: {
														pie: {
															donut: {
																size: '70%',
																labels: {
																	show: true,
																	total: {
																		show: true,
																		showAlways: true,
																		label: 'Tổng chi phí',
																		formatter: () => totalBudget.toLocaleString('vi-VN') + 'đ',
																	},
																},
															},
														},
													},
													legend: {
														position: 'bottom',
													},
													dataLabels: {
														enabled: false,
													},
												}}
											/>
										</>
									) : (
										<Empty description='Chưa có dữ liệu chi phí' />
									)}
								</div>
							</Col>
							<Col xs={24} md={12}>
								<div className={styles.breakdownList}>
									{chartData.map((item) => (
										<div key={item.type} className={styles.breakdownItem}>
											<div className={styles.breakdownHeader}>
												<span className={styles.breakdownTitle}>{item.type}</span>
												<span className={styles.breakdownPercent}>{item.percent}%</span>
											</div>
											<div className={styles.breakdownValue}>{item.value.toLocaleString('vi-VN')}đ</div>
											<Progress
												percent={item.percent}
												showInfo={false}
												status={
													item.type === 'Ăn uống'
														? getBudgetStatusColor('food') === 'red'
															? 'exception'
															: 'normal'
														: item.type === 'Lưu trú'
														? getBudgetStatusColor('accommodation') === 'red'
															? 'exception'
															: 'normal'
														: item.type === 'Di chuyển'
														? getBudgetStatusColor('transportation') === 'red'
															? 'exception'
															: 'normal'
														: item.type === 'Hoạt động'
														? getBudgetStatusColor('activities') === 'red'
															? 'exception'
															: 'normal'
														: getBudgetStatusColor('other') === 'red'
														? 'exception'
														: 'normal'
												}
												strokeColor={
													item.type === 'Ăn uống'
														? getBudgetStatusColor('food') === 'orange'
															? '#faad14'
															: undefined
														: item.type === 'Lưu trú'
														? getBudgetStatusColor('accommodation') === 'orange'
															? '#faad14'
															: undefined
														: item.type === 'Di chuyển'
														? getBudgetStatusColor('transportation') === 'orange'
															? '#faad14'
															: undefined
														: item.type === 'Hoạt động'
														? getBudgetStatusColor('activities') === 'orange'
															? '#faad14'
															: undefined
														: getBudgetStatusColor('other') === 'orange'
														? '#faad14'
														: undefined
												}
											/>
										</div>
									))}
								</div>
							</Col>
						</Row>
					</TabPane>
					<TabPane tab='Bảng' key='table'>
						<Table dataSource={chartData} columns={columns} pagination={false} rowKey='type' />
					</TabPane>
				</Tabs>
			</Card>
		);
	};

	const renderTips = () => {
		const totalBudget = calculateTotalBudget();
		const tips = [];

		// General tip
		tips.push(
			<Paragraph key='general'>
				Tổng chi phí dự kiến cho chuyến đi của bạn là <Text strong>{totalBudget.toLocaleString('vi-VN')}đ</Text> cho{' '}
				{trip.selectedDestinations.length} điểm đến.
			</Paragraph>,
		);

		// Over budget tip
		if (isOverBudget) {
			tips.push(
				<Paragraph key='overbudget'>
					<Text type='danger'>
						Bạn đang vượt ngân sách {(totalBudget - trip.budgetLimit).toLocaleString('vi-VN')}đ. Hãy cân nhắc giảm bớt
						điểm đến hoặc tăng giới hạn ngân sách.
					</Text>
				</Paragraph>,
			);
		}

		// Category-specific tips
		const highestCategory = Object.entries(trip.budget).reduce(
			(highest, [category, amount]) => (amount > highest.amount ? { category, amount } : highest),
			{ category: '', amount: 0 },
		);

		if (highestCategory.amount > 0) {
			let categoryName = '';
			switch (highestCategory.category) {
				case 'food':
					categoryName = 'ăn uống';
					break;
				case 'accommodation':
					categoryName = 'lưu trú';
					break;
				case 'transportation':
					categoryName = 'di chuyển';
					break;
				case 'activities':
					categoryName = 'hoạt động';
					break;
				case 'other':
					categoryName = 'chi phí khác';
					break;
			}

			tips.push(
				<Paragraph key='highest'>
					Chi phí cao nhất của bạn là <Text strong>{categoryName}</Text> với{' '}
					<Text strong>{highestCategory.amount.toLocaleString('vi-VN')}đ</Text> (
					{calculateBudgetPercentage(highestCategory.category as keyof typeof trip.budget)}% tổng chi phí).
				</Paragraph>,
			);

			// Suggestion based on highest category
			if (isOverBudget) {
				tips.push(
					<Paragraph key='suggestion'>
						Để tiết kiệm chi phí, bạn có thể cân nhắc chọn những điểm đến có chi phí {categoryName} thấp hơn.
					</Paragraph>,
				);
			}
		}

		return (
			<Card title='Gợi ý tiết kiệm' className={styles.tipsCard}>
				{tips}
			</Card>
		);
	};

	const renderDestinationBudget = () => {
		const destinations: DestinationBudget[] = trip.selectedDestinations
			.map((item) => {
				const destination = trip.destinations.find((d) => d.id === item.destinationId);
				if (!destination) return null;

				const total = destination.foodCost + destination.accommodationCost + destination.transportationCost;
				// Activities and other costs are calculated the same as in the model
				const activitiesCost = total * 0.1;
				const otherCost = total * 0.05;
				const grandTotal = total + activitiesCost + otherCost;

				return {
					id: destination.id,
					name: destination.name,
					location: destination.location,
					food: destination.foodCost,
					accommodation: destination.accommodationCost,
					transportation: destination.transportationCost,
					activities: activitiesCost,
					other: otherCost,
					total: grandTotal,
					day: item.day,
					order: item.order,
				};
			})
			.filter((item): item is DestinationBudget => item !== null);

		// Sort by day and order
		destinations.sort((a, b) => {
			if (a.day === b.day) {
				return a.order - b.order;
			}
			return a.day - b.day;
		});

		const columns = [
			{
				title: 'Điểm đến',
				dataIndex: 'name',
				key: 'name',
				render: (name: string, record: DestinationBudget) => (
					<div>
						<div>{name}</div>
						<div className={styles.locationText}>{record.location}</div>
					</div>
				),
			},
			{
				title: 'Ngày',
				dataIndex: 'day',
				key: 'day',
				render: (day: number) => `Ngày ${day}`,
			},
			{
				title: 'Ăn uống',
				dataIndex: 'food',
				key: 'food',
				render: (value: number) => value.toLocaleString('vi-VN') + 'đ',
			},
			{
				title: 'Lưu trú',
				dataIndex: 'accommodation',
				key: 'accommodation',
				render: (value: number) => value.toLocaleString('vi-VN') + 'đ',
			},
			{
				title: 'Di chuyển',
				dataIndex: 'transportation',
				key: 'transportation',
				render: (value: number) => value.toLocaleString('vi-VN') + 'đ',
			},
			{
				title: 'Tổng cộng',
				dataIndex: 'total',
				key: 'total',
				render: (value: number) => <Text strong>{value.toLocaleString('vi-VN')}đ</Text>,
			},
		];

		return (
			<Card title='Chi phí theo điểm đến' className={styles.destinationsCard}>
				<Table
					dataSource={destinations}
					columns={columns}
					pagination={false}
					rowKey='id'
					summary={(pageData) => {
						let totalFood = 0;
						let totalAccommodation = 0;
						let totalTransportation = 0;
						let grandTotal = 0;

						pageData.forEach(({ food, accommodation, transportation, total }) => {
							totalFood += food;
							totalAccommodation += accommodation;
							totalTransportation += transportation;
							grandTotal += total;
						});

						return (
							<Table.Summary fixed>
								<Table.Summary.Row>
									<Table.Summary.Cell index={0} colSpan={2}>
										<Text strong>Tổng cộng</Text>
									</Table.Summary.Cell>
									<Table.Summary.Cell index={2}>
										<Text strong>{totalFood.toLocaleString('vi-VN')}đ</Text>
									</Table.Summary.Cell>
									<Table.Summary.Cell index={3}>
										<Text strong>{totalAccommodation.toLocaleString('vi-VN')}đ</Text>
									</Table.Summary.Cell>
									<Table.Summary.Cell index={4}>
										<Text strong>{totalTransportation.toLocaleString('vi-VN')}đ</Text>
									</Table.Summary.Cell>
									<Table.Summary.Cell index={5}>
										<Text strong type={isOverBudget ? 'danger' : 'success'}>
											{grandTotal.toLocaleString('vi-VN')}đ
										</Text>
									</Table.Summary.Cell>
								</Table.Summary.Row>
							</Table.Summary>
						);
					}}
				/>
			</Card>
		);
	};

	// Hàm trở về trang lịch trình
	const goBackToItinerary = () => {
		history.push('/du-lich/TaoDuLich', { from: 'NganSach' });
	};

	return (
		<PageContainer
			title='Quản lý ngân sách du lịch'
			content='Theo dõi và kiểm soát chi phí cho chuyến đi của bạn'
			extra={[
				<Button key='back' icon={<ArrowLeftOutlined />} onClick={goBackToItinerary}>
					Quay lại lịch trình
				</Button>,
			]}
		>
			<Spin spinning={loading} indicator={<LoadingOutlined />}>
				<div className={styles.container}>
					{!trip.currentItineraryId ? (
						<Card>
							<Empty
								description='Vui lòng chọn hoặc tạo một lịch trình trước khi quản lý ngân sách'
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							>
								<Button type='primary' onClick={goBackToItinerary}>
									Tạo lịch trình mới
								</Button>
							</Empty>
						</Card>
					) : (
						<Row gutter={[24, 24]}>
							<Col xs={24}>{renderBudgetSummary()}</Col>
							<Col xs={24}>{renderBudgetBreakdown()}</Col>
							<Col xs={24}>{renderDestinationBudget()}</Col>
							<Col xs={24}>{renderTips()}</Col>
						</Row>
					)}
				</div>
			</Spin>
		</PageContainer>
	);
};

export default connect(({ trip, loading }: { trip: TripState; loading: { effects: Record<string, boolean> } }) => ({
	trip,
	loading: !!(
		loading.effects['trip/updateBudget'] ||
		loading.effects['trip/setBudgetLimit'] ||
		loading.effects['trip/saveBudgetToApi'] ||
		loading.effects['trip/fetchBudgetFromApi']
	),
}))(NganSach);
