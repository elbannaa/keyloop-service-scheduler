import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTechnicians,
  removeTechnician,
  fetchVehicles,
  removeVehicle,
} from '@/store/dealershipsSlice';
import {
  Modal,
  Tabs,
  Table,
  Button,
  Badge,
  Space,
  Typography,
  Popconfirm,
  message,
} from 'antd';
import {
  DeleteOutlined,
  UserAddOutlined,
  CarOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { AddTechnicianDialog } from '@/components/forms/AddTechnicianDialog';
import { AddVehicleDialog } from '@/components/forms/AddVehicleDialog';

const { Text } = Typography;

interface ManageResourcesDialogProps {
  dealershipId: string;
  dealershipName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageResourcesDialog: React.FC<ManageResourcesDialogProps> = ({
  dealershipId,
  dealershipName,
  open,
  onOpenChange,
}) => {
  const dispatch = useAppDispatch();
  const { technicians, vehicles, subResourceLoading } = useAppSelector((state) => state.dealerships);
  const [activeTab, setActiveTab] = useState('1');
  const [isAddTechOpen, setIsAddTechOpen] = useState(false);
  const [isAddVehOpen, setIsAddVehOpen] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchTechnicians(dealershipId));
      dispatch(fetchVehicles(dealershipId));
    }
  }, [open, dealershipId, dispatch]);

  const handleRemoveTech = async (techId: string) => {
    try {
      await dispatch(removeTechnician({ id: dealershipId, technicianId: techId })).unwrap();
      message.success('Technician removed successfully');
    } catch (err: any) {
      message.error(err || 'Failed to remove technician');
    }
  };

  const handleRemoveVeh = async (vehId: string) => {
    try {
      await dispatch(removeVehicle({ id: dealershipId, vehicleId: vehId })).unwrap();
      message.success('Vehicle removed successfully');
    } catch (err: any) {
      message.error(err || 'Failed to remove vehicle');
    }
  };

  const techColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'default'}
          text={isActive ? 'Active' : 'Away'}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Popconfirm
          title="Remove technician"
          description="Are you sure you want to remove this technician?"
          onConfirm={() => handleRemoveTech(record.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];

  const vehicleColumns = [
    {
      title: 'Make / Model',
      key: 'makeModel',
      render: (_: any, record: any) => (
        <Text strong style={{ fontSize: 13 }}>{record.make} {record.model}</Text>
      ),
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      render: (year: number) => <Text type="secondary">{year}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Popconfirm
          title="Remove vehicle"
          description="Are you sure you want to remove this vehicle?"
          onConfirm={() => handleRemoveVeh(record.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];

  const items = [
    {
      key: '1',
      label: (
        <span>
          <UserAddOutlined />
          Technicians ({technicians.length})
        </span>
      ),
      children: (
        <Space orientation="vertical" style={{ width: '100%' }} size={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Staff Roster
            </Text>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsAddTechOpen(true)}
            >
              Add Technician
            </Button>
          </div>
          <Table
            columns={techColumns}
            dataSource={technicians}
            rowKey="id"
            loading={subResourceLoading && technicians.length === 0}
            pagination={false}
            size="middle"
          />
        </Space>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <CarOutlined />
          Service Vehicles ({vehicles.length})
        </span>
      ),
      children: (
        <Space orientation="vertical" style={{ width: '100%' }} size={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fleet Management
            </Text>
            <Button
              type="primary"
              icon={<CarOutlined />}
              onClick={() => setIsAddVehOpen(true)}
            >
              Add Vehicle
            </Button>
          </div>
          <Table
            columns={vehicleColumns}
            dataSource={vehicles}
            rowKey="id"
            loading={subResourceLoading && vehicles.length === 0}
            pagination={false}
            size="middle"
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: 18 }}>Manage {dealershipName}</Text>
          </Space>
        }
        open={open}
        onCancel={() => onOpenChange(false)}
        footer={null}
        width={750}
        destroyOnHidden
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          style={{ marginTop: 16 }}
        />
      </Modal>

      <AddTechnicianDialog
        dealershipId={dealershipId}
        open={isAddTechOpen}
        onOpenChange={setIsAddTechOpen}
      />
      <AddVehicleDialog
        dealershipId={dealershipId}
        open={isAddVehOpen}
        onOpenChange={setIsAddVehOpen}
      />
    </>
  );
};
