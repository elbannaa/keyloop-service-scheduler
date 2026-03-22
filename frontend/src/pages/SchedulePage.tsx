import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSchedule, createAppointment } from '@/store/appointmentsSlice';
import { fetchDealerships } from '@/store/dealershipsSlice';
import { 
  Card, 
  Select, 
  Button, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Calendar,
  message,
  theme,
  Badge
} from 'antd';
import { 
  ClockCircleOutlined, 
  BuildOutlined, 
  LeftOutlined, 
  RightOutlined, 
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const SchedulePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: dealerships } = useAppSelector((state) => state.dealerships);
  const { token } = theme.useToken();

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedDealershipId, setSelectedDealershipId] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchDealerships());
  }, [dispatch]);

  useEffect(() => {
    if (dealerships.length > 0 && !selectedDealershipId) {
      setSelectedDealershipId(dealerships[0].id);
    }
  }, [dealerships, selectedDealershipId]);

  useEffect(() => {
    if (selectedDealershipId && selectedDate) {
      dispatch(fetchSchedule({
        dealershipId: selectedDealershipId,
        date: selectedDate.format('YYYY-MM-DD')
      }));
    }
  }, [dispatch, selectedDealershipId, selectedDate]);

  const handleCreate = async (values: any) => {
    if (!selectedDealershipId) return;

    setIsCreating(true);
    try {
      await dispatch(createAppointment({
        dealershipId: selectedDealershipId,
        serviceType: values.serviceType,
        startTime: values.startTime.toISOString(),
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        vehicleInfo: values.vehicleInfo,
      })).unwrap();

      message.success('Appointment created successfully');
      setIsAddDialogOpen(false);
      form.resetFields();

      // Refresh schedule if the new appointment is on the selected date
      if (values.startTime.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')) {
        dispatch(fetchSchedule({
          dealershipId: selectedDealershipId,
          date: selectedDate.format('YYYY-MM-DD')
        }));
      }
    } catch (err: any) {
      message.error(err || 'Failed to create appointment');
    } finally {
      setIsCreating(false);
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const isWeekend = value.day() === 0 || value.day() === 6;
    const isCurrentMonth = value.month() === selectedDate.month();
    
    if (!isCurrentMonth) return null;

    return (
      <div style={{ textAlign: 'right', padding: '4px' }}>
        <Text type="secondary" style={{ fontSize: 10, opacity: 0.7 }}>
          {isWeekend ? "$120" : "$100"}
        </Text>
      </div>
    );
  };

  const headerRender = ({ value, onChange }: { value: Dayjs, onChange: (date: Dayjs) => void }) => {
    return (
      <div style={{ padding: 16, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ClockCircleOutlined style={{ color: token.colorPrimary }} />
              <Title level={5} style={{ margin: 0 }}>
                {value.format('MMMM YYYY')}
              </Title>
            </Space>
          </Col>
          <Col>
            <Space size={4}>
              <Button 
                type="text" 
                icon={<LeftOutlined />} 
                onClick={() => onChange(value.subtract(1, 'month'))} 
              />
              <Button 
                type="text" 
                icon={<RightOutlined />} 
                onClick={() => onChange(value.add(1, 'month'))} 
              />
              <Button 
                size="small" 
                onClick={() => onChange(dayjs())}
                style={{ marginLeft: 8 }}
              >
                Today
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', paddingBottom: token.paddingLG }}>
      <Space direction="vertical" size={token.paddingLG} style={{ width: '100%' }}>
        {/* Top Bar */}
        <Row justify="space-between" align="middle" gutter={[token.paddingMD, token.paddingMD]}>
          <Col xs={24} md={18}>
            <Space wrap size={token.paddingSM}>
              <DatePicker 
                value={selectedDate} 
                onChange={(date) => date && setSelectedDate(date)} 
                allowClear={false}
              />
              <Select 
                value={selectedDealershipId} 
                onChange={setSelectedDealershipId} 
                style={{ width: 220 }}
                placeholder="Select dealership"
              >
                {dealerships.map((d) => (
                  <Option key={d.id} value={d.id}>
                    <Space>
                      <BuildOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
                      {d.name}
                    </Space>
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Appointment
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Main Content */}
        <Card 
          bordered={false} 
          styles={{ body: { padding: 0 } }} 
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: token.borderRadiusLG, overflow: 'hidden' }}
        >
          <Calendar 
            fullscreen={true}
            value={selectedDate}
            onSelect={setSelectedDate}
            headerRender={headerRender}
            cellRender={dateCellRender}
          />

          <div style={{ 
            padding: `${token.paddingMD}px ${token.paddingLG}px`, 
            borderTop: `1px solid ${token.colorBorderSecondary}`, 
            backgroundColor: token.colorBgContainer,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: token.paddingLG
          }}>
            <Space size={token.paddingXS}>
              <Badge color={token.colorPrimary} />
              <Text type="secondary" strong style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Detailed</Text>
            </Space>
            <Space size={token.paddingXS}>
              <Badge color="#f59e0b" />
              <Text type="secondary" strong style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Maintenance</Text>
            </Space>
            <Space size={token.paddingXS}>
              <Badge color="#3b82f6" />
              <Text type="secondary" strong style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Sales</Text>
            </Space>
          </div>
        </Card>
      </Space>

      {/* Add Appointment Modal */}
      <Modal
        title="Quick Appointment"
        open={isAddDialogOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsAddDialogOpen(false)}
        confirmLoading={isCreating}
        okText="Create"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ 
            serviceType: 'SALES_CONSULTATION',
            startTime: dayjs()
          }}
          requiredMark={false}
          style={{ marginTop: token.paddingLG }}
        >
          <Form.Item
            label="Customer Name"
            name="customerName"
            rules={[{ required: true, message: 'Please input customer name!' }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>

          <Form.Item
            label="Customer Email"
            name="customerEmail"
            rules={[
              { required: true, message: 'Please input customer email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter customer email" />
          </Form.Item>

          <Form.Item
            label="Service Type"
            name="serviceType"
            rules={[{ required: true, message: 'Please select a service type!' }]}
          >
            <Select>
              <Option value="SALES_CONSULTATION">Sales Consultation</Option>
              <Option value="DETAILED_CONSULTATION">Detailed Consultation</Option>
              <Option value="REPAIR_MAINTENANCE">Repair / Maintenance</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Date & Time"
            name="startTime"
            rules={[{ required: true, message: 'Please select date and time!' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Vehicle Info / Notes" name="vehicleInfo">
            <Input.TextArea placeholder="Enter any additional information" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SchedulePage;
