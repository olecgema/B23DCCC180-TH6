import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { Card, Modal, Space, Input, Button, Tabs, Popconfirm, Tag, Select } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import ButtonExtend from '@/components/Table/ButtonExtend';
import TableBase from '@/components/Table';
import FormDiemDen from './Form';
import CardView from './CardView';
import moment from 'moment';
import type { IColumn } from '@/components/Table/typing';
import './index.less';

const DiemDen = () => {
  const { 
    loading,
    danhSach: initialDanhSach,
    record,
    setRecord,
    getModel,
    deleteModel,
    viewMode,
    setViewMode,
    visible,
    setVisible,
    edit,
    setEdit,
    formSubmiting
  } = useModel('destination.destination');

  const [danhSach, setDanhSach] = useState<DiemDen.IDestination[]>(initialDanhSach || []);
  const [searchType, setSearchType] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getModel();
        setDanhSach(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    setDanhSach(initialDanhSach || []);
  }, [initialDanhSach]);

  const handleEdit = (rec: DiemDen.IDestination) => {
    if (!rec) {
      console.error('Record is undefined');
      return;
    }
    setRecord(rec);
    setEdit(true);
    setVisible(true);
  };

  const handleAdd = () => {
    setRecord({} as DiemDen.IDestination);
    setEdit(false);
    setVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteModel(id, getModel);
    } catch (error) {
      console.error('Error deleting destination:', error);
    }
  };

  const handleSearch = (value: string) => {
    if (!value && !searchType) {
      // Reset to original data if no search term and no type filter
      setDanhSach(initialDanhSach || []);
      return;
    }
    
    let filteredData = initialDanhSach || [];
    
    // Apply text search if provided
    if (value) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase()) ||
        item.location.toLowerCase().includes(value.toLowerCase())
      );
    }
    
    // Apply type filter if selected
    if (searchType) {
      filteredData = filteredData.filter(item => item.type === searchType);
    }
    
    setDanhSach(filteredData);
  };

  const handleTypeChange = (value: string) => {
    setSearchType(value);
    
    if (!value) {
      // Reset to show all data or maintain text search
      handleSearch('');
      return;
    }
    
    // Apply both filters
    const filteredData = (initialDanhSach || []).filter(
      item => item.type === value
    );
    setDanhSach(filteredData);
  };

  const getTypeTag = (type: string) => {
    switch (type) {
      case 'beach':
        return <Tag color="blue">Bãi biển</Tag>;
      case 'mountain':
        return <Tag color="green">Núi</Tag>;
      case 'city':
        return <Tag color="orange">Thành phố</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const columns: IColumn<DiemDen.IDestination>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      align: 'center',
      width: 60,
    },
    {
      title: 'Tên điểm đến',
      dataIndex: 'name',
      width: 180,
      filterType: 'string',
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      width: 150,
      filterType: 'string',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 120,
      filterType: 'select',
      filterData: [
        { value: 'beach', label: 'Bãi biển' },
        { value: 'mountain', label: 'Núi' },
        { value: 'city', label: 'Thành phố' },
      ],
      render: (type) => getTypeTag(type)
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      width: 250,
      filterType: 'string',
      render: (val) => val ? (val.length > 100 ? val.slice(0, 100) + '...' : val) : '--'
    },
    {
      title: 'Thời gian tham quan',
      dataIndex: 'visitDuration',
      align: 'center',
      width: 120,
      render: (val) => `${val} giờ`
    },
    {
      title: 'Đánh giá TB',
      dataIndex: 'averageRating',
      align: 'center',
      width: 120
    },
    {
      title: 'Chi phí ăn uống',
      dataIndex: 'foodCost',
      align: 'right',
      width: 150,
      render: (val) => val?.toLocaleString('vi-VN') + ' VNĐ'
    },
    {
      title: 'Chi phí lưu trú',
      dataIndex: 'accommodationCost',
      align: 'right',
      width: 150,
      render: (val) => val?.toLocaleString('vi-VN') + ' VNĐ'
    },
    {
      title: 'Chi phí di chuyển',
      dataIndex: 'transportationCost',
      align: 'right',
      width: 150,
      render: (val) => val?.toLocaleString('vi-VN') + ' VNĐ'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      align: 'center',
      width: 150,
      render: (val) => val ? moment(val).format('HH:mm DD/MM/YYYY') : '--'
    },
    {
      title: 'Thao tác',
      align: 'center',
      width: 120,
      fixed: 'right',
      render: (_, item) => (
        <Space>
          <ButtonExtend
            tooltip="Chỉnh sửa"
            onClick={() => handleEdit(item)}
            type="link"
            icon={<EditOutlined />}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(item.id!)}
            okText="Có"
            cancelText="Không"
          >
            <ButtonExtend
              tooltip="Xóa"
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Card
        title="Quản lý điểm đến"
        extra={
          <Space>
            <Space>
              <Input.Search
                placeholder="Tìm kiếm điểm đến"
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select
                placeholder="Loại điểm đến"
                style={{ width: 150 }}
                allowClear
                onChange={handleTypeChange}
              >
                <Select.Option value="beach">Bãi biển</Select.Option>
                <Select.Option value="mountain">Núi</Select.Option>
                <Select.Option value="city">Thành phố</Select.Option>
              </Select>
            </Space>
            <Button.Group>
              <Button
                type={viewMode === 'card' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('card')}
              >
                Thẻ
              </Button>
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode('table')}
              >
                Bảng
              </Button>
            </Button.Group>
            <ButtonExtend
              onClick={handleAdd}
              icon={<PlusCircleOutlined />}
              type="primary"
            >
              Thêm mới
            </ButtonExtend>
          </Space>
        }
      >
        {viewMode === 'card' ? (
          <CardView
            dataSource={danhSach || []}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <TableBase
            modelName="destination.destination"
            columns={columns}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1800 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total: number) => `Tổng số: ${total}`,
            }}
            buttons={{ create: false }}
          />
        )}
      </Card>

      <Modal
        visible={visible}
        title={null}
        footer={null}
        onCancel={() => setVisible(false)}
        width={800}
        destroyOnClose
        bodyStyle={{ padding: 0 }}
        className="modal-destination"
      >
        <FormDiemDen />
      </Modal>
    </>
  );
};

export default DiemDen;
