import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { createUser } from '@/store/usersSlice';
import { Modal, Form, Input, Select, message, theme } from 'antd';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit();
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await dispatch(createUser(values)).unwrap();
      message.success('User created successfully');
      onOpenChange(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const { token } = theme.useToken();

  return (
    <Modal
      title="Create New User"
      open={open}
      onOk={handleOk}
      onCancel={() => onOpenChange(false)}
      confirmLoading={loading}
      okText="Create User"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ role: 'USER' }}
        requiredMark={false}
        style={{ marginTop: token.paddingLG }}
      >
        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Please input full name!' }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: 'Please input email address!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input placeholder="john@example.com" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Please select a role!' }]}
        >
          <Select options={[
            { value: 'USER', label: 'User' },
            { value: 'MANAGER', label: 'Manager' },
            { value: 'ADMIN', label: 'Admin' }
          ]} />
        </Form.Item>

        <Form.Item
          label="Password (Optional)"
          name="password"
          rules={[{ min: 6, message: 'Password must be at least 6 characters!' }]}
        >
          <Input.Password placeholder="Leave blank for default" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
