import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { createDealership } from '@/store/dealershipsSlice';
import { Modal, Form, Input, message, Select } from 'antd';
import { ServiceType } from '@/store/appointmentsSlice';

interface CreateDealershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDealershipDialog: React.FC<CreateDealershipDialogProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { name: string; address: string; supportedServices: string[] }) => {
    setLoading(true);
    try {
      await dispatch(createDealership(values)).unwrap();
      message.success('Dealership created successfully');
      onOpenChange(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err || 'Failed to create dealership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Dealership"
      open={open}
      onOk={() => form.submit()}
      onCancel={() => onOpenChange(false)}
      confirmLoading={loading}
      okText="Add Dealership"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="Dealership Name"
          name="name"
          rules={[{ required: true, message: 'Please input dealership name!' }]}
        >
          <Input placeholder="Keyloop City Center" />
        </Form.Item>

        <Form.Item
          label="Location Address"
          name="address"
          rules={[{ required: true, message: 'Please input location address!' }]}
        >
          <Input placeholder="123 Main St, London" />
        </Form.Item>

        <Form.Item
          label="Supported Services"
          name="supportedServices"
          initialValue={[
            ServiceType.NEW_CAR_CONSULTATION,
            ServiceType.VEHICLE_REPAIR,
            ServiceType.VEHICLE_MAINTENANCE
          ]}
        >
          <Select mode="multiple" placeholder="Select supported services">
            <Select.Option value={ServiceType.NEW_CAR_CONSULTATION}>New Car Consultation</Select.Option>
            <Select.Option value={ServiceType.VEHICLE_REPAIR}>Vehicle Repair</Select.Option>
            <Select.Option value={ServiceType.VEHICLE_MAINTENANCE}>Vehicle Maintenance</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
