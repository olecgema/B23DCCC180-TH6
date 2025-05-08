import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Row, Col, Rate, Card, Select, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import rules from '@/utils/rules';
import UploadFile from '@/components/Upload/UploadFile';

interface IFormProps {
  title?: string;
}

const FormDiemDen: React.FC<IFormProps> = (props) => {
  const { title = 'điểm đến' } = props;
  const [form] = Form.useForm();
  const { 
    record, 
    edit, 
    formSubmiting, 
    createModel, 
    updateModel, 
    getModel, 
    setVisible 
  } = useModel('destination.destination');

  useEffect(() => {
    if (edit && record) {
      form.setFieldsValue({
        ...record,
      });
    }
  }, [edit, record, form]);

  const onFinish = async (values: DiemDen.IDestination) => {
    try {
      if (edit && record?.id) {
        await updateModel(record.id, values, () => {
          getModel();
          setVisible(false);
        });
      } else {
        await createModel(values, () => {
          getModel();
          setVisible(false);
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Card title={(edit ? 'Chỉnh sửa ' : 'Thêm mới ') + title.toLowerCase()}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Tên điểm đến"
              rules={[...rules.required, ...rules.text]}
            >
              <Input placeholder="Nhập tên điểm đến" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="averageRating"
              label="Đánh giá trung bình"
              rules={[...rules.required]}
              initialValue={0}
            >
              <Rate allowHalf allowClear={false} />
            </Form.Item>
          </Col>

          {/* Thêm trường location */}
          <Col xs={24} md={12}>
            <Form.Item
              name="location"
              label="Vị trí"
              rules={[...rules.required]}
            >
              <Input placeholder="Nhập vị trí" />
            </Form.Item>
          </Col>

          {/* Thêm trường type */}
          <Col xs={24} md={12}>
            <Form.Item
              name="type"
              label="Loại điểm đến"
              rules={[...rules.required]}
              initialValue="city"
            >
              <Select>
                <Select.Option value="beach">Bãi biển</Select.Option>
                <Select.Option value="mountain">Núi</Select.Option>
                <Select.Option value="city">Thành phố</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[...rules.required]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Nhập mô tả chi tiết về điểm đến" 
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="visitDuration"
              label="Thời gian tham quan (giờ)"
              rules={[...rules.required]}
              initialValue={1}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                placeholder="Nhập thời gian tham quan"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="foodCost"
              label="Chi phí ăn uống (VNĐ)"
              rules={[...rules.required]}
              initialValue={0}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsedValue = parseFloat(value?.replace(/[^\d.-]/g, '') || '0');
                  return isNaN(parsedValue) ? 0 : (parsedValue as 0);
                }}
                placeholder="Nhập chi phí ăn uống"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="accommodationCost"
              label="Chi phí lưu trú (VNĐ)"
              rules={[...rules.required]}
              initialValue={0}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                    const parsedValue = parseFloat(value?.replace(/[^\d.-]/g, '') || '0');
                    return isNaN(parsedValue) ? 0 : (parsedValue as 0);
                }}
                placeholder="Nhập chi phí lưu trú"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="transportationCost"
              label="Chi phí di chuyển (VNĐ)"
              rules={[...rules.required]}
              initialValue={0}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                    const parsedValue = parseFloat(value?.replace(/[^\d.-]/g, '') || '0');
                    return isNaN(parsedValue) ? 0 : (parsedValue as 0);
                }}
                placeholder="Nhập chi phí di chuyển"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="imageUrl"
              label="URL hình ảnh"
              rules={[...rules.required]}
            >
              <Input 
                placeholder="Nhập URL hình ảnh (https://...)" 
                addonAfter={
                  <Tooltip title="Xem trước">
                    <Button 
                      type="link" 
                      icon={<EyeOutlined />} 
                      onClick={() => {
                        const url = form.getFieldValue('imageUrl');
                        if (url) window.open(url);
                      }}
                    />
                  </Tooltip>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="form-footer">
          <Button loading={formSubmiting} htmlType="submit" type="primary">
            {!edit ? 'Thêm mới' : 'Lưu lại'}
          </Button>
          <Button onClick={() => setVisible(false)}>Hủy</Button>
        </div>
      </Form>
    </Card>
  );
};

export default FormDiemDen;
