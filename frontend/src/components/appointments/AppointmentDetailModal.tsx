import React, { useState, useEffect } from 'react';
import {
  Modal,
  Space,
  Card,
  Typography,
  Tag,
  Select,
  Button,
  Popconfirm
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Role } from '@/constants/role';
import { DATE_TIME_DISPLAY_FORMAT, TIME_DISPLAY_FORMAT } from '@/constants';

const { Text } = Typography;
const { Option } = Select;

interface AppointmentDetailModalProps {
  visible: boolean;
  appointment: any | null;
  onCancel: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  onCancelAppointment: (id: string) => Promise<void>;
  userRole?: string;
}

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

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  visible,
  appointment,
  onCancel,
  onUpdate,
  onCancelAppointment,
  userRole,
}) => {
  const [selectedTech, setSelectedTech] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (appointment) {
      setSelectedTech(appointment.technicianId);
    }
  }, [appointment]);

  if (!appointment) return null;

  const isManagerOrAdmin = userRole === Role.MANAGER || userRole === Role.ADMIN;

  return (
    <Modal
      title="Appointment Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%', paddingTop: 16 }}>
        <Card type="inner" title="Service Information">
          <Space orientation="vertical">
            <Text><strong>Type:</strong> {appointment.serviceType.replace(/_/g, ' ')}</Text>
            <Text><strong>Status:</strong> {getStatusTag(appointment.status)}</Text>
            <Text><strong>Time:</strong> {dayjs(appointment.startTime).format(DATE_TIME_DISPLAY_FORMAT)} - {dayjs(appointment.endTime).format(TIME_DISPLAY_FORMAT)}</Text>
          </Space>
        </Card>

        <Card type="inner" title="Customer & Vehicle">
          <Space orientation="vertical">
            <Text><strong>Name:</strong> {appointment.customerName}</Text>
            <Text><strong>Email:</strong> {appointment.customerEmail}</Text>
            <Text><strong>Vehicle:</strong> {appointment.vehicleInfo || 'N/A'}</Text>
          </Space>
        </Card>

        {
          appointment.dealership && (
            <Card type="inner" title="Dealership & Resource">
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Text><strong>Dealership:</strong> {appointment.dealership.name}</Text>
                {isManagerOrAdmin ? (
                  <div style={{ marginTop: 8 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Assign Technician:</Text>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Select Technician"
                      value={selectedTech}
                      onChange={(val) => setSelectedTech(val)}
                    >
                      {appointment.dealership.technicians?.map((t: any) => (
                        <Option key={t.id} value={t.id}>{t.name}</Option>
                      )) || (
                          <Option key={appointment.technician.id} value={appointment.technician.id}>
                            {appointment.technician.name}
                          </Option>
                        )}
                    </Select>
                  </div>
                ) : (
                  <Text><strong>Technician:</strong> {appointment.technician.name}</Text>
                )}
              </Space>
            </Card>
          )
        }
        {isManagerOrAdmin && appointment.status === 'PENDING' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button
              icon={<CloseOutlined />}
              danger
              onClick={() => onUpdate(appointment.id, { status: 'REJECTED' })}
            >
              Reject
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onUpdate(appointment.id, {
                status: 'SCHEDULED',
                technicianId: selectedTech
              })}
            >
              Approve & Assign
            </Button>
          </div>
        )}

        {isManagerOrAdmin && appointment.status === 'SCHEDULED' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button
              type="primary"
              onClick={() => onUpdate(appointment.id, {
                technicianId: selectedTech
              })}
              disabled={selectedTech === appointment.technicianId}
            >
              Update Technician
            </Button>
          </div>
        )}
        {userRole === Role.USER && (appointment.status === 'PENDING' || appointment.status === 'SCHEDULED') && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Popconfirm
              title="Cancel Appointment"
              description="Are you sure you want to cancel this appointment?"
              onConfirm={() => onCancelAppointment(appointment.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<CloseOutlined />}
              >
                Cancel Appointment
              </Button>
            </Popconfirm>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default AppointmentDetailModal;
