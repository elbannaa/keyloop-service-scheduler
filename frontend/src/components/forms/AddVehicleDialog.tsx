import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addVehicle } from '@/store/dealershipsSlice';
import { Modal, Form, Input, InputNumber, message, Row, Col } from 'antd';

interface AddVehicleDialogProps {
  dealershipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddVehicleDialog: React.FC<AddVehicleDialogProps> = ({ dealershipId, open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { make: string; model: string; year: number }) => {
    setLoading(true);
    try {
      await dispatch(addVehicle({ id: dealershipId, data: values })).unwrap();
      message.success('Vehicle added successfully');
      onOpenChange(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Vehicle"
      open={open}
      onOk={() => form.submit()}
      onCancel={() => onOpenChange(false)}
      confirmLoading={loading}
      okText="Add Vehicle"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ year: new Date().getFullYear() }}
        requiredMark={false}
        style={{ marginTop: 24 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Make"
              name="make"
              rules={[{ required: true, message: 'Please input vehicle make!' }]}
            >
              <Input placeholder="Toyota" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Model"
              name="model"
              rules={[{ required: true, message: 'Please input vehicle model!' }]}
            >
              <Input placeholder="Camry" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Year"
          name="year"
          rules={[
            { required: true, message: 'Please input vehicle year!' },
            { type: 'number', min: 1900, max: new Date().getFullYear() + 1, message: 'Invalid year!' }
          ]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="2022" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
