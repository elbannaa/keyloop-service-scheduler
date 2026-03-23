import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllAppointments, updateAppointment, cancelAppointment } from '@/store/appointmentsSlice';
import { fetchDealerships } from '@/store/dealershipsSlice';
import {
  Table,
  Tag,
  Space,
  Button,
  Typography,
  Card,
  Select,
  DatePicker,
  message,
  theme,
  Row,
  Col
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Role } from '@/constants/role';
import { DATE_DISPLAY_FORMAT, TIME_DISPLAY_FORMAT } from '@/constants';
import AppointmentDetailModal from '@/components/appointments/AppointmentDetailModal';

const { Title, Text } = Typography;
const { Option } = Select;

const AppointmentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { appointments, loading } = useAppSelector((state) => state.appointments);
  const { data: dealerships } = useAppSelector((state) => state.dealerships);
  const { user } = useAppSelector((state) => state.auth);
  const { token } = theme.useToken();

  const [filters, setFilters] = useState({
    dealershipId: undefined as string | undefined,
    status: undefined as string | undefined,
    date: undefined as string | undefined,
  });

  const [detailModal, setDetailModal] = useState<{
    visible: boolean;
    appointment: any | null;
  }>({
    visible: false,
    appointment: null,
  });

  useEffect(() => {
    dispatch(fetchDealerships());
    dispatch(fetchAllAppointments());
  }, [dispatch]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    dispatch(fetchAllAppointments(newFilters));
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await dispatch(updateAppointment({ id, data })).unwrap();
      message.success('Appointment updated successfully');
      setDetailModal({ visible: false, appointment: null });
      dispatch(fetchAllAppointments(filters));
    } catch (err: any) {
      message.error(err || 'Failed to update');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await dispatch(cancelAppointment(id)).unwrap();
      message.success('Appointment canceled successfully');
      setDetailModal({ visible: false, appointment: null });
      dispatch(fetchAllAppointments(filters));
    } catch (err: any) {
      message.error(err || 'Failed to cancel appointment');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING': return <Tag color="orange">PENDING</Tag>;
      case 'SCHEDULED': return <Tag color="green">SCHEDULED</Tag>;
      case 'COMPLETED': return <Tag color="blue">COMPLETED</Tag>;
      case 'CANCELED': return <Tag color="red">CANCELED</Tag>;
      case 'REJECTED': return <Tag color="volcano">REJECTED</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <Text style={{ fontSize: 12, textTransform: 'uppercase' }}>{text.split('-')[0].toUpperCase()}</Text>
      )
    },
    {
      title: 'Service Type',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (text: string) => (
        <Text style={{ fontSize: 12 }}>{text.replace(/_/g, ' ')}</Text>
      ),
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      render: (_: any, record: any) => (
        <Space orientation="vertical" size={0}>
          <Text>{dayjs(record.startTime).format(DATE_DISPLAY_FORMAT)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(record.startTime).format(TIME_DISPLAY_FORMAT)} - {dayjs(record.endTime).format(TIME_DISPLAY_FORMAT)}</Text>
        </Space>
      ),
    },
    ...(user?.role !== Role.USER ? [{
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: any) => (
        <Space orientation="vertical" size={0}>
          <Text>{record.customerName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.customerEmail}</Text>
        </Space>
      ),
    }] : []),
    {
      title: 'Dealership',
      dataIndex: ['dealership', 'name'],
      key: 'dealership',
      render: (text: string) => (
        <Space>{text}</Space>
      ),
    },
    {
      title: 'Technician',
      dataIndex: ['technician', 'name'],
      key: 'technician',
      render: (text: string) => (
        <Space>{text}</Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setDetailModal({ visible: true, appointment: record });
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%', paddingBottom: token.paddingLG }}>
      {/* Header section */}
      <div style={{ padding: `0 ${token.paddingXS}px` }}>
        <Title level={2} style={{ margin: 0 }}>Appointments</Title>
        <Text type="secondary">
          {user?.role === Role.USER
            ? 'Your scheduled vehicle services'
            : 'Manage all dealership service bookings'}
        </Text>
      </div>

      {/* Filters card */}
      <Card variant="borderless" styles={{ body: { padding: token.padding } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle">
          {user?.role !== Role.USER && (
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="All Dealerships"
                style={{ width: '100%' }}
                allowClear
                onChange={(val) => handleFilterChange('dealershipId', val)}
              >
                {dealerships.map(d => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>
            </Col>
          )}
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="All Statuses"
              style={{ width: '100%' }}
              allowClear
              onChange={(val) => handleFilterChange('status', val)}
            >
              <Option value="PENDING">Pending</Option>
              <Option value="SCHEDULED">Scheduled</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CANCELED">Canceled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DatePicker
              style={{ width: '100%' }}
              onChange={(date) => handleFilterChange('date', date?.format(DATE_DISPLAY_FORMAT))}
              placeholder="Select Date"
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<SearchOutlined />}
              type="primary"
              block
              onClick={() => dispatch(fetchAllAppointments(filters))}
            >
              Filter
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table card */}
      <Card variant="borderless" styles={{ body: { padding: 0 } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', borderRadius: token.borderRadiusLG }}>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            hideOnSinglePage: true,
            style: { paddingRight: 16 }
          }}
          locale={{ emptyText: 'No appointments found matching your filters.' }}
        />
      </Card>

      <AppointmentDetailModal
        visible={detailModal.visible}
        appointment={detailModal.appointment}
        onCancel={() => setDetailModal({ visible: false, appointment: null })}
        onUpdate={handleUpdate}
        onCancelAppointment={handleCancelAppointment}
        userRole={user?.role}
      />
    </Space>
  );
};

export default AppointmentsPage;
