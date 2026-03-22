import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDealerships, fetchVehicles } from '@/store/dealershipsSlice';
import {
  fetchAvailability,
  createAppointment,
  ServiceType,
  type ServiceTypeType,
  clearBookingState
} from '@/store/appointmentsSlice';
import {
  Card,
  Button,
  Input,
  Select,
  Table,
  Badge,
  Steps,
  Typography,
  Space,
  Row,
  Col,
  DatePicker,
  Result,
  theme,
  Empty,
  message,
  Alert
} from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  RightOutlined,
  BuildOutlined,
  InfoCircleOutlined,
  CarOutlined,
  MailOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { DealershipData as Dealership } from '@/store/dealershipsSlice';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const BookingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { data: dealerships } = useAppSelector((state) => state.dealerships);
  const { availableSlots, loading: slotsLoading, bookingLoading, lastBooking, error } = useAppSelector((state) => state.appointments);
  const { token } = theme.useToken();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<{
    serviceType: ServiceTypeType | '';
    date: string | undefined;
    customerName: string;
    customerEmail: string;
    vehicleInfo: string;
    vehicleId?: string;
  }>({
    serviceType: '' as ServiceTypeType | '',
    date: dayjs().format('YYYY-MM-DD'),
    customerName: '',
    customerEmail: '',
    vehicleInfo: '',
    vehicleId: undefined,
  });

  const [selectedDealershipId, setSelectedDealershipId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDealerships());

    // Pre-populate if coming from DealershipsPage
    if (location.state?.dealershipId) {
      setSelectedDealershipId(location.state.dealershipId);
      setCurrentStep(0); // Ensure we are on first step or skip to first step with dealership selected
    }
  }, [dispatch, location.state]);

  useEffect(() => {
    if (selectedDealershipId) {
      dispatch(fetchVehicles(selectedDealershipId));
    }
  }, [selectedDealershipId, dispatch]);

  const handleCheckAvailability = () => {
    if (selectedDealershipId && formData.serviceType && formData.date) {
      dispatch(fetchAvailability({
        dealershipId: selectedDealershipId,
        serviceType: formData.serviceType as ServiceTypeType,
        date: formData.date
      }));
      setSelectedSlot(null);
    }
  };

  const handleBooking = async () => {
    if (!selectedDealershipId || !formData.serviceType || !selectedSlot) return;

    try {
      await dispatch(createAppointment({
        dealershipId: selectedDealershipId,
        serviceType: formData.serviceType,
        startTime: selectedSlot,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        vehicleInfo: formData.vehicleInfo,
        vehicleId: formData.vehicleId,
      })).unwrap();
      setCurrentStep(3);
    } catch (err: any) {
      message.error(err || 'Failed to create appointment');
    }
  };

  const resetBooking = () => {
    setCurrentStep(0);
    setFormData({
      serviceType: '',
      date: dayjs().format('YYYY-MM-DD'),
      customerName: '',
      customerEmail: '',
      vehicleInfo: '',
    });
    setSelectedDealershipId(null);
    setSelectedSlot(null);
    dispatch(clearBookingState());
  };

  const getServiceLabel = (type: ServiceTypeType) => {
    switch (type) {
      case ServiceType.NEW_CAR_CONSULTATION: return 'New Car Consultation';
      case ServiceType.VEHICLE_REPAIR: return 'Vehicle Repair';
      case ServiceType.VEHICLE_MAINTENANCE: return 'Vehicle Maintenance';
      default: return '';
    }
  };

  const columns: ColumnsType<Dealership> = [
    {
      title: 'Dealership',
      key: 'dealership',
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.address}</Text>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button
          type={selectedDealershipId === record.id ? 'primary' : 'default'}
          onClick={() => setSelectedDealershipId(record.id)}
        >
          {selectedDealershipId === record.id ? 'Selected' : 'Select'}
        </Button>
      ),
    },
  ];

  const steps = [
    { title: 'Details', icon: <InfoCircleOutlined /> },
    { title: 'Location', icon: <BuildOutlined /> },
    { title: 'Confirm', icon: <CheckCircleOutlined /> },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: token.paddingLG }}>
      <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ marginBottom: token.paddingXS, fontWeight: 800 }}>Book a Service</Title>
          <Text type="secondary">Find a dealership and schedule your appointment in minutes.</Text>
        </div>

        {currentStep < 3 && (
          <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
            <Steps
              size="small"
              current={currentStep}
              items={steps}
              style={{ marginBottom: token.paddingXL }}
            />
          </div>
        )}

        <Row gutter={[token.paddingLG, token.paddingLG]}>
          <Col xs={24} lg={currentStep === 3 ? 24 : 16}>
            {currentStep === 0 && (
              <Card
                title={<Space><InfoCircleOutlined /> Appointment Details</Space>}
                bordered={false}
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: token.borderRadiusLG }}
              >
                <Space orientation="vertical" size={token.paddingMD} style={{ width: '100%' }}>
                  <Row gutter={token.paddingMD}>
                    <Col span={12}>
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 12 }}>Service Type</Text>
                        <Select
                          style={{ width: '100%' }}
                          placeholder="Select type..."
                          value={formData.serviceType || undefined}
                          onChange={(val) => setFormData({ ...formData, serviceType: val })}
                        >
                          {selectedDealershipId ? (
                            dealerships.find(d => d.id === selectedDealershipId)?.supportedServices.map(s => (
                              <Option key={s} value={s}>{getServiceLabel(s as ServiceTypeType)}</Option>
                            ))
                          ) : (
                            <>
                              <Option value={ServiceType.NEW_CAR_CONSULTATION}>New Car Consultation</Option>
                              <Option value={ServiceType.VEHICLE_REPAIR} >Vehicle Repair</Option>
                              <Option value={ServiceType.VEHICLE_MAINTENANCE}>Vehicle Maintenance</Option>
                            </>
                          )}
                        </Select>
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 12 }}>Preferred Date</Text>
                        <DatePicker
                          style={{ width: '100%' }}
                          value={formData.date ? dayjs(formData.date) : null}
                          onChange={(date) => setFormData({ ...formData, date: date?.format('YYYY-MM-DD') })}
                          disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                      </Space>
                    </Col>
                  </Row>

                  <Row gutter={token.paddingMD}>
                    <Col span={12}>
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 12 }}>Full Name</Text>
                        <Input
                          prefix={<UserOutlined style={{ color: token.colorTextPlaceholder }} />}
                          placeholder="John Doe"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        />
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 12 }}>Email Address</Text>
                        <Input
                          prefix={<MailOutlined style={{ color: token.colorTextPlaceholder }} />}
                          type="email"
                          placeholder="john@example.com"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        />
                      </Space>
                    </Col>
                  </Row>

                  <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: 12 }}>Vehicle Info / Notes</Text>
                    <Input
                      prefix={<CarOutlined style={{ color: token.colorTextPlaceholder }} />}
                      placeholder="e.g. 2022 Toyota Camry - Oil Change"
                      value={formData.vehicleInfo}
                      onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
                    />
                  </Space>

                  {(formData.serviceType === ServiceType.VEHICLE_REPAIR || formData.serviceType === ServiceType.VEHICLE_MAINTENANCE) && (
                    <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                      <Text strong style={{ fontSize: 12 }}>Target Vehicle (Optional)</Text>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Select a vehicle if available in our system..."
                        allowClear
                        value={formData.vehicleId}
                        onChange={(val) => setFormData({ ...formData, vehicleId: val })}
                      >
                        {useAppSelector(state => state.dealerships.vehicles).map(v => (
                          <Option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</Option>
                        ))}
                      </Select>
                    </Space>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: token.paddingXS }}>
                    <Button
                      type="primary"
                      onClick={() => setCurrentStep(1)}
                      disabled={!formData.serviceType || !formData.customerName || !formData.customerEmail}
                      icon={<RightOutlined />}
                      iconPlacement="end"
                    >
                      Continue
                    </Button>
                  </div>
                </Space>
              </Card>
            )}

            {currentStep === 1 && (
              <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
                <Card
                  title={<Space><BuildOutlined /> Select Dealership</Space>}
                  bordered={false}
                  styles={{ body: { padding: 0 } }}
                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: token.borderRadiusLG, overflow: 'hidden' }}
                >
                  <Table
                    columns={columns}
                    dataSource={dealerships}
                    rowKey="id"
                    pagination={false}
                    locale={{ emptyText: <Empty description="No active dealerships found." /> }}
                    onRow={(record) => ({
                      onClick: () => setSelectedDealershipId(record.id),
                      style: { cursor: 'pointer', backgroundColor: selectedDealershipId === record.id ? token.colorPrimaryBg : undefined }
                    })}
                  />
                </Card>

                {selectedDealershipId && (
                  <Card
                    title={<Space><ClockCircleOutlined /> Pick a Time Slot</Space>}
                    bordered={false}
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: token.borderRadiusLG }}
                  >
                    {slotsLoading ? (
                      <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <Text type="secondary">Loading available times...</Text>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <Alert
                        message="No slots available"
                        description="Please try another date or location."
                        type="warning"
                        showIcon
                      />
                    ) : (
                      <>
                        <div style={{ marginBottom: token.paddingMD, display: 'flex', justifyContent: 'center' }}>
                          <Button
                            onClick={handleCheckAvailability}
                            loading={slotsLoading}
                            type="dashed"
                          >
                            Check Available Slots
                          </Button>
                        </div>
                        {availableSlots.length > 0 && (
                          <Row gutter={[token.paddingSM, token.paddingSM]}>
                            {availableSlots.map((slot) => (
                              <Col key={slot} xs={8} sm={6} md={4}>
                                <Button
                                  block
                                  type={selectedSlot === slot ? 'primary' : 'default'}
                                  onClick={() => setSelectedSlot(slot)}
                                >
                                  {dayjs(slot).format('HH:mm')}
                                </Button>
                              </Col>
                            ))}
                          </Row>
                        )}
                        {availableSlots.length === 0 && !slotsLoading && (
                          <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <Text type="secondary">Click check button to see availability</Text>
                          </div>
                        )}
                      </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: token.paddingLG }}>
                      <Button onClick={() => setCurrentStep(0)}>Back</Button>
                      <Button
                        type="primary"
                        disabled={!selectedSlot || slotsLoading}
                        onClick={() => setCurrentStep(2)}
                      >
                        Next Step
                      </Button>
                    </div>
                  </Card>
                )}
              </Space>
            )}

            {currentStep === 2 && (
              <Card
                bordered={false}
                styles={{ header: { backgroundColor: token.colorPrimaryBg, borderBottom: `1px solid ${token.colorPrimaryBorder}` } }}
                title={<Title level={4} style={{ margin: 0 }}>Confirm Your Booking</Title>}
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1)', borderRadius: token.borderRadiusLG, overflow: 'hidden' }}
              >
                <div style={{ paddingBottom: token.paddingLG }}>
                  <Text type="secondary">Review the details before finalizing.</Text>
                </div>

                <Row gutter={[token.paddingLG, token.paddingMD]}>
                  <Col xs={24} md={12}>
                    <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary" strong style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Dealership</Text>
                        <div style={{ marginTop: token.paddingXS }}>
                          <Title level={5} style={{ margin: 0 }}>{dealerships.find(d => d.id === selectedDealershipId)?.name}</Title>
                          <Text type="secondary" style={{ fontSize: 13 }}>{dealerships.find(d => d.id === selectedDealershipId)?.address}</Text>
                        </div>
                      </div>

                      <div>
                        <Text type="secondary" strong style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Schedule</Text>
                        <div style={{ marginTop: token.paddingXS }}>
                          <Title level={5} style={{ margin: 0 }}>{dayjs(selectedSlot!).format('dddd, MMMM D, YYYY')}</Title>
                          <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>{dayjs(selectedSlot!).format('h:mm A')}</Title>
                        </div>
                      </div>
                    </Space>
                  </Col>

                  <Col xs={24} md={12}>
                    <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary" strong style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Service</Text>
                        <div style={{ marginTop: token.paddingXS }}>
                          <Badge
                            color={token.colorPrimary}
                            text={<Text strong>{getServiceLabel(formData.serviceType as ServiceTypeType)}</Text>}
                            style={{ marginBottom: token.paddingXS }}
                          />
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>{formData.vehicleInfo || 'No notes provided'}</Text>
                        </div>
                      </div>

                      <div>
                        <Text type="secondary" strong style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Customer</Text>
                        <div style={{ marginTop: token.paddingXS }}>
                          <Title level={5} style={{ margin: 0 }}>{formData.customerName}</Title>
                          <Text type="secondary" style={{ fontSize: 13 }}>{formData.customerEmail}</Text>
                        </div>
                      </div>
                    </Space>
                  </Col>
                </Row>

                {error && (
                  <Alert message={error} type="error" showIcon style={{ marginTop: token.paddingLG }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: token.paddingLG }}>
                  <Button onClick={() => setCurrentStep(1)}>Back</Button>
                  <Button
                    type="primary"
                    loading={bookingLoading}
                    onClick={handleBooking}
                    style={{ paddingLeft: token.paddingXL, paddingRight: token.paddingXL }}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </Card>
            )}

            {currentStep === 3 && lastBooking && (
              <Result
                status="success"
                title={<Title level={2}>Success!</Title>}
                subTitle="Your appointment has been scheduled and assigned."
                extra={[
                  <Button type="primary" key="again" onClick={resetBooking}>
                    Make Another Booking
                  </Button>
                ]}
              >
                <div style={{ maxWidth: 400, margin: '0 auto' }}>
                  <Card bordered style={{ textAlign: 'left', borderRadius: token.borderRadiusLG, backgroundColor: token.colorBgLayout }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: token.paddingMD, paddingBottom: token.paddingXS, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                      <Text type="secondary" strong style={{ fontSize: 10, textTransform: 'uppercase' }}>Booking ID</Text>
                      <Text strong style={{ fontFamily: 'monospace' }}>{lastBooking.id.split('-')[0].toUpperCase()}</Text>
                    </div>
                    <Space orientation="vertical" size={token.paddingSM} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>Technician</Text>
                        <Text strong style={{ fontSize: 13 }}>Assigned Automatically</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>Date</Text>
                        <Text strong style={{ fontSize: 13 }}>{dayjs(lastBooking.startTime).format('MMM D, YYYY')}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>Time</Text>
                        <Text strong style={{ fontSize: 13, color: token.colorPrimary }}>{dayjs(lastBooking.startTime).format('h:mm A')}</Text>
                      </div>
                    </Space>
                  </Card>
                </div>
              </Result>
            )}
          </Col>

          {currentStep < 3 && (
            <Col xs={24} lg={8}>
              <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
                <Card title={<Text strong type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Need Assistance?</Text>} bordered={false}>
                  <Space orientation="vertical" size={token.paddingMD}>
                    <div>
                      <Text strong style={{ fontSize: 13 }}>Service Types</Text>
                      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                        We offer three distinct service types tailored to your needs, from simple consultations to full vehicle maintenance.
                      </Paragraph>
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 13 }}>Dynamic Scheduling</Text>
                      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                        Our system automatically finds the best technician for your request based on real-time availability.
                      </Paragraph>
                    </div>
                    <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: token.paddingMD }}>
                      <Text type="secondary" style={{ fontSize: 10 }}>Keyloop Unified Scheduler v1.0</Text>
                    </div>
                  </Space>
                </Card>

                {currentStep < 2 && (
                  <Card bordered={false} style={{ backgroundColor: token.colorPrimaryBg, border: `1px solid ${token.colorPrimaryBorder}` }}>
                    <Space align="start">
                      <InfoCircleOutlined style={{ color: token.colorPrimary, marginTop: 4 }} />
                      <div>
                        <Text strong style={{ fontSize: 13 }}>Quick Tip</Text>
                        <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                          You can book for any day between 8:00 AM and 6:00 PM. Weekends may have limited availability.
                        </Paragraph>
                      </div>
                    </Space>
                  </Card>
                )}
              </Space>
            </Col>
          )}
        </Row>
      </Space>
    </div>
  );
};

export default BookingPage;
