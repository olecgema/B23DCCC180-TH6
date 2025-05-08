export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/QuanTri',
		name: 'Quản trị',
		component: './QuanTri',
		icon: 'SettingOutlined',
	},
	{
		path: '/TrangChu2',
		name: 'Trang chủ',
		icon: 'HomeOutlined',
		component: './TrangChu2',
	},

	// DU LICH ROUTES
	{
		name: 'Du lịch',
		path: '/du-lich',
		icon: 'CompassOutlined',
		routes: [
			{
				name: 'Tạo lịch trình',
				path: '/du-lich/TaoDuLich',
				component: './TaoDuLich',
				icon: 'CalendarOutlined',
			},
			{
				name: 'Quản lý ngân sách',
				path: '/du-lich/NganSach',
				component: './NganSach',
				icon: 'DollarOutlined',
			},
		],
	},
	

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
