import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addTechnician } from '@/store/dealershipsSlice';
import { Modal, Form, Input, message } from 'antd';

interface AddTechnicianDialogProps {
  dealershipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTechnicianDialog: React.FC<AddTechnicianDialogProps> = ({ dealershipId, open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { name: string }) => {
    setLoading(true);
    try {
      await dispatch(addTechnician({ id: dealershipId, data: values })).unwrap();
      message.success('Technician added successfully');
      onOpenChange(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err || 'Failed to add technician');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Technician"
      open={open}
      onOk={() => form.submit()}
      onCancel={() => onOpenChange(false)}
      confirmLoading={loading}
      okText="Add Technician"
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
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Please input technician name!' }]}
        >
          <Input placeholder="Alice Smith" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
