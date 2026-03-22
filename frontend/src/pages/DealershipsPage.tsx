import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchDealerships, toggleDealershipStatus, updateDealership, fetchVehicles } from '@/store/dealershipsSlice';
import {
  Table,
  Input,
  Button,
  Badge,
  Dropdown,
  Typography,
  Space,
  message,
  Row,
  Col,
  Tooltip,
  theme as antdTheme,
  Tag,
  Select
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  MoreOutlined,
  EnvironmentOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
  UserOutlined,
  RetweetOutlined,
  GlobalOutlined,
  CarOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CreateDealershipDialog } from '@/components/forms/CreateDealershipDialog';
import { ManageResourcesDialog } from '@/components/forms/ManageResourcesDialog';
import { AssignManagerDialog } from '@/components/forms/AssignManagerDialog';
import debounce from 'lodash.debounce';
import { Role } from '@/constants/role';

const { Text } = Typography;

const DealershipsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: dealerships, loading, error, vehicles, subResourceLoading } = useAppSelector((state) => state.dealerships);
  const { user } = useAppSelector((state) => state.auth);
  const { token } = antdTheme.useToken();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [manageResource, setManageResource] = useState<{ id: string, name: string } | null>(null);
  const [assignManagerModal, setAssignManagerModal] = useState<{ id: string; name: string; managerId: string | null } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', address: '', supportedServices: [] as string[] });

  const canManage = user?.role === Role.ADMIN || user?.role === 'MANAGER';

  const debouncedFetch = useMemo(
    () => debounce((query: { search?: string }) => {
      dispatch(fetchDealerships(query));
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    debouncedFetch({ search: search || undefined });
    return () => debouncedFetch.cancel();
  }, [search, debouncedFetch]);

  const handleStartEdit = (d: any) => {
    setEditingId(d.id);
    setEditForm({ name: d.name, address: d.address, supportedServices: d.supportedServices || [] });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await dispatch(updateDealership({ id, data: editForm })).unwrap();
      message.success('Dealership updated successfully');
      setEditingId(null);
    } catch (err: any) {
      message.error(err || 'Failed to update dealership');
    }
  };

  const columns = [
    {
      title: 'Dealership',
      key: 'name',
      render: (_: any, d: any) => (
        editingId === d.id ? (
          <Input
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            size="small"
          />
        ) : (
          <Text strong style={{ fontSize: 13 }}>{d.name}</Text>
        )
      ),
    },
    {
      title: 'Location',
      key: 'address',
      responsive: ['md' as const],
      render: (_: any, d: any) => (
        editingId === d.id ? (
          <Input
            value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            placeholder="Address"
            size="small"
          />
        ) : (
          <Space size={4}>
            <EnvironmentOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{d.address}</Text>
          </Space>
        )
      ),
    },
    {
      title: 'Manager',
      key: 'manager',
      render: (_: any, d: any) => (
        <Space orientation="vertical" size={0}>
          <Text strong style={{ fontSize: 12 }}>{d.manager?.name || 'Unassigned'}</Text>
          {d.manager?.email && <Text type="secondary" style={{ fontSize: 11 }}>{d.manager.email}</Text>}
        </Space>
      ),
    },
    {
      title: 'Supported Services',
      key: 'supportedServices',
      responsive: ['lg' as const],
      render: (_: any, d: any) => (
        editingId === d.id ? (
          <Select
            mode="multiple"
            size="small"
            style={{ width: '100%' }}
            value={editForm.supportedServices}
            onChange={(val: string[]) => setEditForm({ ...editForm, supportedServices: val })}
          >
            <Select.Option value="NEW_CAR_CONSULTATION">New Car Consultation</Select.Option>
            <Select.Option value="VEHICLE_REPAIR">Vehicle Repair</Select.Option>
            <Select.Option value="VEHICLE_MAINTENANCE">Vehicle Maintenance</Select.Option>
          </Select>
        ) : (
          <Space size={[0, 4]} wrap>
            {d.supportedServices?.map((s: string) => (
              <Tag key={s} color="blue" style={{ fontSize: 10 }}>
                {s.replace(/_/g, ' ')}
              </Tag>
            ))}
          </Space>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? 'Active' : 'Inactive'}
          style={{ fontSize: 12 }}
        />
      ),
    },
    {
      title: 'Resources',
      key: 'resources',
      responsive: ['lg' as const],
      render: (_: any, d: any) => (
        <Space size={12}>
          <Tooltip title="Technicians">
            <Space size={4}>
              <UserOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
              <Text type="secondary" style={{ fontSize: 12 }}>{d._count?.technicians || 0}</Text>
            </Space>
          </Tooltip>
          <Tooltip title="Vehicles">
            <Space size={4}>
              <CarOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
              <Text type="secondary" style={{ fontSize: 12 }}>{d._count?.vehicles || 0}</Text>
            </Space>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, d: any) => {
        if (user?.role === Role.USER) {
          return (
            <Button
              type="primary"
              size="small"
              icon={<PhoneOutlined />}
              onClick={() => navigate('/booking', { state: { dealershipId: d.id, dealershipName: d.name } })}
            >
              Contact
            </Button>
          );
        }

        if (!canManage) return null;

        if (editingId === d.id) {
          return (
            <Space>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: token.colorSuccess }}
                onClick={() => handleSaveEdit(d.id)}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                danger
                onClick={() => setEditingId(null)}
              />
            </Space>
          );
        }

        const menuItems = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit Details',
            onClick: () => handleStartEdit(d),
          },
          {
            key: 'resources',
            icon: <SettingOutlined />,
            label: 'Manage Resources',
            onClick: () => setManageResource({ id: d.id, name: d.name }),
          },
          ...(user?.role === Role.ADMIN ? [{
            key: 'assign',
            icon: <UserOutlined />,
            label: 'Assign Manager',
            onClick: () => setAssignManagerModal({ id: d.id, name: d.name, managerId: d.managerId }),
          }] : []),
          {
            key: 'status',
            icon: <RetweetOutlined />,
            label: d.isActive ? 'Deactivate' : 'Activate',
            onClick: () => dispatch(toggleDealershipStatus({ id: d.id, currentStatus: d.isActive })),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const expandedRowRender = () => {
    const vehicleColumns = [
      { title: 'Make', dataIndex: 'make', key: 'make' },
      { title: 'Model', dataIndex: 'model', key: 'model' },
      { title: 'Year', dataIndex: 'year', key: 'year' },
    ];

    return (
      <Table
        columns={vehicleColumns}
        dataSource={vehicles}
        pagination={false}
        loading={subResourceLoading}
        size="small"
        rowKey="id"
      />
    );
  };

  return (
    <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%', paddingBottom: token.paddingLG }}>
      <Row gutter={[token.paddingMD, token.paddingMD]} align="middle" justify="space-between">
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Search dealerships..."
            prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Col>
        <Col>
          <Space>
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={() => dispatch(fetchDealerships({ search }))}
                disabled={loading}
              />
            </Tooltip>
            {user?.role === Role.ADMIN && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateOpen(true)}
              >
                Add Dealership
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {error && (
        <div style={{
          padding: `${token.paddingSM}px ${token.paddingMD}px`,
          backgroundColor: token.colorErrorBg,
          border: `1px solid ${token.colorErrorBorder}`,
          borderRadius: token.borderRadius,
          display: 'flex',
          alignItems: 'center',
          gap: token.paddingSM
        }}>
          <GlobalOutlined style={{ color: token.colorError }} />
          <Text strong style={{ color: token.colorError }}>{error}</Text>
        </div>
      )}

      <div style={{
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden'
      }}>
        <Table
          columns={columns}
          dataSource={dealerships}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender,
            onExpand: (expanded, record) => {
              if (expanded) {
                dispatch(fetchVehicles(record.id));
              }
            },
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            hideOnSinglePage: true
          }}
          locale={{
            emptyText: 'No dealerships found matching your search.'
          }}
        />
      </div>

      <CreateDealershipDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {manageResource && (
        <ManageResourcesDialog
          open={!!manageResource}
          onOpenChange={(open) => !open && setManageResource(null)}
          dealershipId={manageResource.id}
          dealershipName={manageResource.name}
        />
      )}

      {assignManagerModal && (
        <AssignManagerDialog
          dealershipId={assignManagerModal?.id || null}
          dealershipName={assignManagerModal?.name || null}
          currentManagerId={assignManagerModal?.managerId || null}
          onClose={() => setAssignManagerModal(null)}
        />
      )}
    </Space>
  );
};

export default DealershipsPage;
