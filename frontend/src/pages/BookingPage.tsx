import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDealerships, fetchVehicles } from '@/store/dealershipsSlice';
import {
  createAppointment,
  clearBookingState,
  checkAvailability
} from '@/store/appointmentsSlice';
import {
  SERVICE_TYPE,
  SERVICE_TYPE_LABELS,
} from '@/constants/business';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Steps,
  Typography,
  Space,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Result,
  theme,
  message,
  Alert
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  RightOutlined,
  InfoCircleOutlined,
  CarOutlined,
  MailOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { DATE_TIME_DISPLAY_FORMAT } from '@/constants';

const { Title, Text } = Typography;

const BookingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { data: dealerships, vehicles } = useAppSelector((state) => state.dealerships);
  const { bookingLoading, lastBooking, error } = useAppSelector((state) => state.appointments);
  const { user } = useAppSelector((state) => state.auth);
  const { token } = theme.useToken();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<{
    serviceType: string;
    startTime: string | undefined;
    endTime: string | undefined;
    customerName: string;
    customerEmail: string;
    vehicleInfo: string;
    vehicleId?: string;
  }>({
    serviceType: '',
    startTime: undefined,
    endTime: undefined,
    customerName: '',
    customerEmail: '',
    vehicleInfo: '',
    vehicleId: undefined,
  });

  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [startTimeOnly, setStartTimeOnly] = useState<dayjs.Dayjs | null>(null);
  const [endTimeOnly, setEndTimeOnly] = useState<dayjs.Dayjs | null>(null);
  const [selectedDealershipId, setSelectedDealershipId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDealerships());

    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name,
        customerEmail: user.email,
      }));
    }

    if (location.state?.dealershipId) {
      setSelectedDealershipId(location.state.dealershipId);
    }
  }, [dispatch, location.state, user]);

  useEffect(() => {
    if (selectedDealershipId) {
      dispatch(fetchVehicles(selectedDealershipId));
    }
  }, [selectedDealershipId, dispatch]);

  const isValidOrder = formData.startTime && formData.endTime ? dayjs(formData.endTime).isAfter(dayjs(formData.startTime)) : true;
  const isValidDuration = formData.startTime && formData.endTime ? dayjs(formData.endTime).diff(dayjs(formData.startTime), 'hour', true) <= 4 : true;
  const isFutureTime = formData.startTime ? dayjs(formData.startTime).isAfter(dayjs()) : true;

  const handleBooking = async () => {
    if (!selectedDealershipId || !formData.serviceType) return;

    try {
      await dispatch(createAppointment({
        dealershipId: selectedDealershipId,
        serviceType: formData.serviceType,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        vehicleInfo: formData.vehicleInfo,
        vehicleId: formData.vehicleId,
      })).unwrap();
      setCurrentStep(2); // Success step
    } catch (err: any) {
      message.error(err || 'Failed to create appointment');
    }
  };

  const handleContinue = async () => {
    if (!selectedDealershipId || !formData.startTime || !formData.endTime) return;

    try {
      const isAvailable = await dispatch(checkAvailability({
        dealershipId: selectedDealershipId,
        startTime: formData.startTime,
        endTime: formData.endTime,
      })).unwrap();

      if (isAvailable) {
        setCurrentStep(1);
      } else {
        message.warning('The selected time slot is no longer available. Please choose another time.');
      }
    } catch (err: any) {
      message.error(err || 'Failed to check availability');
    }
  };

  const resetBooking = () => {
    setCurrentStep(0);
    setFormData({
      serviceType: '',
      startTime: undefined,
      endTime: undefined,
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      vehicleInfo: '',
      vehicleId: undefined,
    });
    setSelectedDealershipId(null);
    setSelectedDate(null);
    setStartTimeOnly(null);
    setEndTimeOnly(null);
    dispatch(clearBookingState());
  };

  const steps = [
    { title: 'Details', icon: <InfoCircleOutlined /> },
    { title: 'Confirm', icon: <CheckCircleOutlined /> },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: token.paddingLG }}>
      <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ marginBottom: token.paddingXS, fontWeight: 800 }}>Book a Service</Title>
          <Text type="secondary">Follow the steps below to schedule your appointment.</Text>
        </div>

        {currentStep < 2 && (
          <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
            <Steps
              size="small"
              current={currentStep}
              items={steps}
            />
          </div>
        )}

        <Row justify="center">
          <Col xs={24} lg={20} xl={16}>
            {currentStep === 0 && (
              <Card
                bordered={false}
                styles={{ header: { backgroundColor: token.colorPrimaryBg, borderBottom: `1px solid ${token.colorPrimaryBorder}` } }}
                title={<Title level={4} style={{ margin: 0 }}>Appointment Details</Title>}
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1)', borderRadius: token.borderRadiusLG, overflow: 'hidden' }}
              >
                <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
                  <Row gutter={token.paddingMD}>
                    <Col span={12}>
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 12 }}>Full Name</Text>
                        <Input
                          prefix={<UserOutlined style={{ color: token.colorTextPlaceholder }} />}
                          disabled
                          value={formData.customerName}
                        />
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 12 }}>Email Address</Text>
                        <Input
                          prefix={<MailOutlined style={{ color: token.colorTextPlaceholder }} />}
                          disabled
                          value={formData.customerEmail}
                        />
                      </Space>
                    </Col>
                  </Row>

                  <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: 12 }}>Dealership</Text>
                    <Select
                      showSearch
                      placeholder="Search and select a dealership"
                      style={{ width: '100%' }}
                      optionFilterProp="label"
                      value={selectedDealershipId}
                      onChange={(val) => {
                        setSelectedDealershipId(val);
                        setFormData(prev => ({ ...prev, vehicleId: undefined }));
                      }}
                      options={dealerships.map(d => ({
                        value: d.id,
                        label: d.name,
                      }))}
                    />
                  </Space>

                  <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: 12 }}>What service do you need?</Text>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Please select a service type..."
                      value={formData.serviceType || undefined}
                      onChange={(val) => setFormData({ ...formData, serviceType: val })}
                      options={Object.values(SERVICE_TYPE).map(type => ({
                        value: type,
                        label: SERVICE_TYPE_LABELS[type as keyof typeof SERVICE_TYPE_LABELS],
                      }))}
                    />
                  </Space>

                  <Row gutter={token.paddingMD}>
                    <Col span={24}>
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 12 }}>Booking Date</Text>
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder="Select appointment date"
                          value={selectedDate}
                          onChange={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              const newStart = date.hour(startTimeOnly?.hour() || 8).minute(startTimeOnly?.minute() || 0).second(0).millisecond(0).toISOString();
                              const newEnd = date.hour(endTimeOnly?.hour() || 9).minute(endTimeOnly?.minute() || 0).second(0).millisecond(0).toISOString();
                              setFormData({ ...formData, startTime: newStart, endTime: newEnd });
                            } else {
                              setFormData({ ...formData, startTime: undefined, endTime: undefined });
                            }
                          }}
                          disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                      </Space>
                    </Col>
                  </Row>

                  <Row gutter={token.paddingMD}>
                    <Col span={12}>
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 12 }}>Start Time</Text>
                        <TimePicker
                          style={{ width: '100%', borderColor: !isFutureTime ? token.colorError : undefined }}
                          format="HH:mm"
                          minuteStep={15}
                          value={startTimeOnly}
                          onChange={(time) => {
                            setStartTimeOnly(time);
                            if (time && selectedDate) {
                              const newStart = selectedDate.hour(time.hour()).minute(time.minute()).second(0).millisecond(0).toISOString();
                              setFormData({ ...formData, startTime: newStart });
                            } else {
                              setFormData({ ...formData, startTime: undefined });
                            }
                          }}
                        />
                        {!isFutureTime && <Text type="danger" style={{ fontSize: 11 }}>Time must be in the future</Text>}
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong style={{ fontSize: 12 }}>End Time</Text>
                        <TimePicker
                          style={{ width: '100%', borderColor: (!isValidOrder || !isValidDuration) ? token.colorError : undefined }}
                          format="HH:mm"
                          minuteStep={15}
                          value={endTimeOnly}
                          onChange={(time) => {
                            setEndTimeOnly(time);
                            if (time && selectedDate) {
                              const newEnd = selectedDate.hour(time.hour()).minute(time.minute()).second(0).millisecond(0).toISOString();
                              setFormData({ ...formData, endTime: newEnd });
                            } else {
                              setFormData({ ...formData, endTime: undefined });
                            }
                          }}
                        />
                        {!isValidOrder && <Text type="danger" style={{ fontSize: 11 }}>Must be after start time</Text>}
                        {isValidOrder && !isValidDuration && <Text type="danger" style={{ fontSize: 11 }}>Duration cannot exceed 4h</Text>}
                      </Space>
                    </Col>
                  </Row>

                  <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: 12 }}>Vehicle (Optional)</Text>
                    <Select
                      style={{ width: '100%' }}
                      placeholder={selectedDealershipId ? "Select a vehicle..." : "Please select a dealership first"}
                      allowClear
                      disabled={!selectedDealershipId}
                      value={formData.vehicleId}
                      onChange={(val) => setFormData({ ...formData, vehicleId: val })}
                      options={vehicles.map(v => ({
                        value: v.id,
                        label: `${v.year} ${v.make} ${v.model}`,
                      }))}
                    />
                  </Space>

                  <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: 12 }}>Notes</Text>
                    <Input
                      prefix={<CarOutlined style={{ color: token.colorTextPlaceholder }} />}
                      placeholder="e.g. Oil change requirement, special requests..."
                      value={formData.vehicleInfo}
                      onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
                    />
                  </Space>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: token.paddingXS }}>
                    <Button
                      type="primary"
                      onClick={handleContinue}
                      loading={bookingLoading}
                      disabled={
                        !formData.serviceType ||
                        !selectedDealershipId ||
                        !formData.startTime ||
                        !formData.endTime ||
                        !isFutureTime ||
                        !isValidOrder ||
                        !isValidDuration
                      }
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
                          <Title level={5} style={{ margin: 0 }}>{dayjs(formData.startTime).format('dddd, MMMM D, YYYY')}</Title>
                          <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>
                            {dayjs(formData.startTime).format('h:mm A')} - {dayjs(formData.endTime).format('h:mm A')}
                          </Title>
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
                            text={<Text strong>{SERVICE_TYPE_LABELS[formData.serviceType as keyof typeof SERVICE_TYPE_LABELS]}</Text>}
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
                  <Button onClick={() => setCurrentStep(0)}>Back</Button>
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

            {currentStep === 2 && lastBooking && (
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
                        <Text type="secondary" style={{ fontSize: 13 }}>Dealership</Text>
                        <Text strong style={{ fontSize: 13 }}>{dealerships.find(d => d.id === lastBooking.dealershipId)?.name}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>Date</Text>
                        <Text strong style={{ fontSize: 13 }}>{dayjs(lastBooking.startTime).format(DATE_TIME_DISPLAY_FORMAT)}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>Time</Text>
                        <Text strong style={{ fontSize: 13, color: token.colorPrimary }}>
                          {dayjs(lastBooking.startTime).format('h:mm A')} - {dayjs(lastBooking.endTime).format('h:mm A')}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </div>
              </Result>
            )}
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default BookingPage;
