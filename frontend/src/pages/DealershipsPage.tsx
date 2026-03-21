import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchDealerships, toggleDealershipStatus, updateDealership } from '@/store/dealershipsSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Building2,
  MapPin,
  Edit,
  Check,
  X,
  Settings2,
  ToggleLeft,
  User,
} from 'lucide-react';
import { CreateDealershipDialog } from '@/components/forms/CreateDealershipDialog';
import { ManageResourcesDialog } from '@/components/forms/ManageResourcesDialog';
import { AssignManagerDialog } from '@/components/forms/AssignManagerDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import debounce from 'lodash.debounce';
import { cn } from "@/lib/utils";
import { Role } from '@/constants/role';

const DealershipsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: dealerships, loading, error } = useAppSelector((state) => state.dealerships);
  const { user } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [manageResource, setManageResource] = useState<{ id: string, name: string } | null>(null);
  const [assignManagerModal, setAssignManagerModal] = useState<{ id: string; name: string; managerId: string | null } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', address: '' });

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
    setEditForm({ name: d.name, address: d.address });
  };

  const handleSaveEdit = async (id: string) => {
    await dispatch(updateDealership({ id, data: editForm })).unwrap();
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full space-y-6">
          {/* Search Bar */}
          <div className="flex items-center gap-2 justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-9 pr-8 h-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
                <Building2 className="h-5 w-5" />
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button className="hover:cursor-pointer h-8 w-8" variant="outline" size="icon" onClick={() => dispatch(fetchDealerships({ search }))} disabled={loading}>
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
              </Button>
              {user?.role === Role.ADMIN && (
                <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 h-8 text-xs">
                  <Plus className="h-3 w-3" />
                  <span>Add Dealership</span>
                </Button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold tracking-wider">Dealership</TableHead>
                  <TableHead className="hidden md:table-cell text-xs font-semibold tracking-wider">Location</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider">Manager</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wider">Status</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs font-semibold tracking-wider">Resources</TableHead>
                  {canManage && <TableHead className="text-right text-xs font-semibold tracking-wider">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealerships.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5 : 4} className="h-32 text-center text-muted-foreground">
                      No dealerships found matching your search.
                    </TableCell>
                  </TableRow>
                )}
                {dealerships.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/30">
                    <TableCell>
                      {editingId === d.id ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="h-8 max-w-[200px] md:text-xs"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-foreground text-xs">{d.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {editingId === d.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="h-8 text-xs md:text-xs"
                            placeholder="Address"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col text-xs">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{d.address}</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium">{d.manager?.name || 'Unassigned'}</span>
                        {d.manager?.email && <span className="text-xs text-muted-foreground">{d.manager.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.isActive ? 'default' : 'destructive'} className="text-xs rounded-full">
                        {d.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span title="Technicians">👥 {d._count?.technicians || 0}</span>
                        <span title="Vehicles">🚗 {d._count?.vehicles || 0}</span>
                      </div>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        {editingId === d.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => handleSaveEdit(d.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleStartEdit(d)} className="flex items-center gap-2 text-xs">
                                <Edit className="h-3 w-3" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setManageResource({ id: d.id, name: d.name })} className="flex items-center gap-2 text-xs">
                                <Settings2 className="h-3 w-3" /> Manage Resources
                              </DropdownMenuItem>
                              {user?.role === Role.ADMIN && (
                                <DropdownMenuItem onClick={() => setAssignManagerModal({ id: d.id, name: d.name, managerId: d.managerId })} className="flex items-center gap-2 text-xs">
                                  <User className="h-3 w-3" /> Assign Manager
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => dispatch(toggleDealershipStatus({ id: d.id, currentStatus: d.isActive }))} className="flex items-center gap-2 text-xs">
                                <ToggleLeft className="h-3 w-3" /> {d.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
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
    </div>
  );
};

export default DealershipsPage;
