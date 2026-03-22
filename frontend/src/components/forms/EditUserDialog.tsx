import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/usersSlice';
import type { UserData } from '@/store/usersSlice';
import { Modal, Form, Input, Select, message, theme } from 'antd';

interface EditUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        name: user.name,
        role: user.role,
      });
    }
  }, [user, open, form]);

  const handleOk = () => {
    form.submit();
  };

  const onFinish = async (values: any) => {
    if (!user) return;
    setLoading(true);
    try {
      await dispatch(updateUser({ id: user.id, data: values })).unwrap();
      message.success('User updated successfully');
      onOpenChange(false);
    } catch (err: any) {
      message.error(err || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

    const { token } = theme.useToken();
  
    return (
      <Modal
        title="Edit User"
        open={open}
        onOk={handleOk}
        onCancel={() => onOpenChange(false)}
        confirmLoading={loading}
        okText="Save Changes"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          style={{ marginTop: token.paddingLG }}
        >
        <Form.Item label="Email (Read-only)">
          <Input value={user?.email || ''} disabled />
        </Form.Item>

        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Please input full name!' }]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Please select a role!' }]}
        >
          <Select>
            <Select.Option value="ADMIN">Admin</Select.Option>
            <Select.Option value="MANAGER">Manager</Select.Option>
            <Select.Option value="USER">User</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
