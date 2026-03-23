import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSchedule } from '@/store/appointmentsSlice';
import { fetchDealerships } from '@/store/dealershipsSlice';
import {
  Card,
  Select,
  Button,
  Typography,
  Space,
  Row,
  Col,
  DatePicker,
  Calendar,
  theme,
  Badge
} from 'antd';
import {
  BuildOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DATE_DISPLAY_FORMAT, TIME_DISPLAY_FORMAT } from '@/constants';
import { fetchAllAppointments } from '@/store/appointmentsSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const SchedulePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: dealerships } = useAppSelector((state) => state.dealerships);
  const { schedule, appointments, loading: scheduleLoading } = useAppSelector((state) => state.appointments);
  const { token } = theme.useToken();

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedDealershipId, setSelectedDealershipId] = useState<string>('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'SCHEDULED': return 'processing';
      case 'COMPLETED': return 'success';
      case 'CANCELED': return 'error';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

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

      // Fetch appointments for the entire month to show in calendar
      const startOfMonth = selectedDate.startOf('month').format('YYYY-MM-DD');
      const endOfMonth = selectedDate.endOf('month').format('YYYY-MM-DD');
      dispatch(fetchAllAppointments({
        dealershipId: selectedDealershipId,
        startDate: startOfMonth,
        endDate: endOfMonth
      }));
    }
  }, [dispatch, selectedDealershipId, selectedDate]);

  const dateCellRender = (value: Dayjs) => {
    const isCurrentMonth = value.month() === selectedDate.month();
    if (!isCurrentMonth) return null;

    const dateStr = value.format('YYYY-MM-DD');
    const dayAppointments = appointments.filter(app =>
      dayjs(app.startTime).format('YYYY-MM-DD') === dateStr &&
      app.status !== 'CANCELED' &&
      app.status !== 'REJECTED'
    );

    if (dayAppointments.length === 0) return null;

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayAppointments.slice(0, 3).map((app: any) => (
          <li key={app.id}>
            <Badge
              status={getStatusColor(app.status) as any}
              text={<span style={{ fontSize: 10 }}>{dayjs(app.startTime).format(TIME_DISPLAY_FORMAT)} {app.serviceType.split('_')[0]}</span>}
            />
          </li>
        ))}
        {dayAppointments.length > 3 && (
          <li style={{ fontSize: 10, color: token.colorTextSecondary }}>
            + {dayAppointments.length - 3} more
          </li>
        )}
      </ul>
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
    <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%', paddingBottom: token.paddingLG }}>
      {/* Header & Subtitle */}
      <div style={{ padding: `0 ${token.paddingXS}px` }}>
        <Title level={2} style={{ margin: 0 }}>Schedule</Title>
        <Text type="secondary">Manage appointments and technician availability</Text>
      </div>

      {/* Filters bar */}
      <Card variant="borderless" styles={{ body: { padding: token.padding } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              allowClear={false}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={10}>
            <Select
              value={selectedDealershipId}
              onChange={setSelectedDealershipId}
              style={{ width: '100%' }}
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
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Row gutter={[token.paddingLG, token.paddingLG]}>
        <Col xs={24} lg={16}>
          <Card
            variant="borderless"
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
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Appointments for {selectedDate.format(DATE_DISPLAY_FORMAT)}</span>
              </Space>
            }
            variant="borderless"
            style={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: token.borderRadiusLG }}
            loading={scheduleLoading}
          >
            {schedule.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">No technicians assigned</Text>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {schedule.map(tech => (
                  <div key={tech.id}>
                    <Title level={5} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserOutlined style={{ fontSize: 14, color: token.colorPrimary }} />
                      {tech.name}
                      <Badge count={tech.appointments.length} style={{ backgroundColor: token.colorFillSecondary, color: token.colorTextSecondary, boxShadow: 'none' }} />
                    </Title>

                    {tech.appointments.length === 0 ? (
                      <div style={{ padding: '8px 16px', backgroundColor: token.colorFillAlter, borderRadius: 8 }}>
                        <Text type="secondary" italic style={{ fontSize: 13 }}>No bookings today</Text>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {tech.appointments.map(app => (
                          <Card
                            key={app.id}
                            size="small"
                            style={{
                              borderLeft: `4px solid ${token.colorPrimary}`,
                              backgroundColor: token.colorBgContainer
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <Text strong style={{ display: 'block' }}>{app.serviceType.replace(/_/g, ' ')}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                                  {dayjs(app.startTime).format(TIME_DISPLAY_FORMAT)} - {dayjs(app.endTime).format(TIME_DISPLAY_FORMAT)}
                                </Text>
                                <div style={{ marginTop: 4 }}>
                                  <Text style={{ fontSize: 13 }}>
                                    <UserOutlined style={{ marginRight: 4 }} />
                                    {app.customerName}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default SchedulePage;
