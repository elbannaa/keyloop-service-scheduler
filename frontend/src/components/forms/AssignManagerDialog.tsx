import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers } from '@/store/usersSlice';
import { assignManager } from '@/store/dealershipsSlice';
import { Modal, Select, Typography, Space, message } from 'antd';
import { Role } from '@/constants/role';

const { Text } = Typography;

interface AssignManagerDialogProps {
  dealershipId: string | null;
  dealershipName: string | null;
  currentManagerId: string | null;
  onClose: () => void;
}

export const AssignManagerDialog: React.FC<AssignManagerDialogProps> = ({
  dealershipId,
  dealershipName,
  currentManagerId,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { data: users, loading: usersLoading } = useAppSelector((state) => state.users);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (dealershipId) {
      dispatch(fetchUsers({ role: Role.MANAGER }));
      setSelectedManagerId(currentManagerId || '');
    }
  }, [dealershipId, currentManagerId, dispatch]);

  const handleAssign = async () => {
    if (dealershipId && selectedManagerId) {
      setSubmitting(true);
      try {
        await dispatch(assignManager({ id: dealershipId, managerId: selectedManagerId })).unwrap();
        message.success('Manager assigned successfully');
        onClose();
      } catch (err: any) {
        message.error(err || 'Failed to assign manager');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <Modal
      title="Assign Manager"
      open={!!dealershipId}
      onOk={handleAssign}
      onCancel={onClose}
      confirmLoading={submitting}
      okText="Assign Manager"
      okButtonProps={{ disabled: !selectedManagerId || usersLoading }}
      destroyOnClose
    >
      <Space direction="vertical" size={24} style={{ width: '100%', marginTop: 24 }}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text strong style={{ fontSize: 12 }}>Dealership</Text>
          <div style={{ padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4, fontSize: 13 }}>
            {dealershipName}
          </div>
        </Space>

        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text strong style={{ fontSize: 12 }}>Select Manager</Text>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a manager"
            loading={usersLoading}
            value={selectedManagerId || undefined}
            onChange={setSelectedManagerId}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={users.map(user => ({
              value: user.id,
              label: `${user.name} (${user.email})`,
            }))}
          />
        </Space>
      </Space>
    </Modal>
  );
};
