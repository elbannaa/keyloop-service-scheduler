import React, { useEffect, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchUsers, toggleUserStatus } from '@/store/usersSlice';
import { 
  Table, 
  Input, 
  Button, 
  Badge, 
  Select, 
  Space, 
  Dropdown, 
  Typography, 
  Card,
  Row,
  Col,
  theme,
  message,
  Alert
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SearchOutlined, 
  UserAddOutlined, 
  ReloadOutlined, 
  MoreOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { CreateUserDialog } from '@/components/forms/CreateUserDialog';
import { EditUserDialog } from '@/components/forms/EditUserDialog';
import type { UserData } from '@/store/usersSlice';
import debounce from 'lodash.debounce';
import { Role } from '@/constants/role';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading, error } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { token } = theme.useToken();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const debouncedFetch = useCallback(
    debounce((query: { search?: string; role?: string }) => {
      dispatch(fetchUsers(query));
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    const filters = {
      search: search || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
    };
    debouncedFetch(filters);
  }, [search, roleFilter, debouncedFetch]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await dispatch(toggleUserStatus({ id, currentStatus })).unwrap();
      message.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (err: any) {
      message.error(err || 'Failed to update user status');
    }
  };

  if (currentUser?.role !== Role.ADMIN) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <SafetyCertificateOutlined style={{ fontSize: 64, color: token.colorError, opacity: 0.5, marginBottom: 24 }} />
        <Title level={2}>Access Denied</Title>
        <Paragraph type="secondary" style={{ maxWidth: 480, margin: '0 auto' }}>
          Only system administrators have permission to manage users.
          Please contact your administrator if you believe this is an error.
        </Paragraph>
      </div>
    );
  }

  const columns: ColumnsType<UserData> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 13 }}>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }} className="md:hidden">{record.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
      render: (email) => <Text style={{ fontSize: 13 }}>{email}</Text>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Badge 
          status={role === 'ADMIN' ? 'processing' : 'default'} 
          text={<Text style={{ fontSize: 13 }}>{role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}</Text>} 
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Badge 
          color={isActive ? token.colorPrimary : token.colorError} 
          text={<Text style={{ fontSize: 13 }}>{isActive ? 'Active' : 'Inactive'}</Text>} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Edit User',
                icon: <EditOutlined />,
                onClick: () => setEditingUser(record),
              },
              {
                key: 'status',
                label: record.isActive ? 'Deactivate' : 'Activate',
                icon: record.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
                danger: record.isActive,
                onClick: () => handleToggleStatus(record.id, record.isActive),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={token.paddingLG} style={{ width: '100%', paddingBottom: token.paddingLG }}>
      {/* Header & Filters */}
      <Card bordered={false} styles={{ body: { padding: token.padding } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={12} lg={14}>
            <Input
              placeholder="Search by name or email..."
              prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select 
              value={roleFilter} 
              onChange={setRoleFilter} 
              style={{ width: '100%' }}
              placeholder="All Roles"
            >
              <Option value="all">All Roles</Option>
              <Option value="ADMIN">Admin</Option>
              <Option value="MANAGER">Manager</Option>
              <Option value="USER">User</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6} lg={5}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                icon={<ReloadOutlined spin={loading} />} 
                onClick={() => dispatch(fetchUsers({ search, role: roleFilter === 'all' ? undefined : roleFilter }))} 
              />
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                onClick={() => setIsCreateOpen(true)}
                style={{ fontWeight: 500 }}
              >
                Create User
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
        />
      )}

      {/* Table */}
      <Card bordered={false} styles={{ body: { padding: 0 } }} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', borderRadius: token.borderRadiusLG }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: false,
            hideOnSinglePage: true,
            style: { paddingRight: 16 }
          }}
          locale={{ emptyText: 'No users found matching your filters.' }}
        />
      </Card>

      {/* Dialogs */}
      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />
    </Space>
  );
};

export default UsersPage;
