import React, { useEffect, useState, useCallback } from 'react';
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
  Phone,
  Edit,
  Check,
  X,
  Settings2,
  ToggleLeft,
} from 'lucide-react';
import { CreateDealershipDialog } from '@/components/forms/CreateDealershipDialog';
import { ManageResourcesDialog } from '@/components/forms/ManageResourcesDialog';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', address: '', phone: '' });

  const canManage = user?.role === Role.ADMIN || user?.role === 'MANAGER';

  const debouncedFetch = useCallback(
    debounce((query: { search?: string }) => {
      dispatch(fetchDealerships(query));
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    debouncedFetch({ search: search || undefined });
  }, [search, debouncedFetch]);

  const handleStartEdit = (d: any) => {
    setEditingId(d.id);
    setEditForm({ name: d.name, address: d.address, phone: d.phone || '' });
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
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or street address..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
                <Building2 className="h-5 w-5" />
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => dispatch(fetchDealerships({ search }))} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
              {user?.role === Role.ADMIN && (
                <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
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
                  <TableHead>Dealership</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Resources</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
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
                          className="h-8 max-w-[200px]"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-foreground">{d.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {editingId === d.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="h-8 text-xs"
                            placeholder="Address"
                          />
                          <Input
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="h-8 text-xs"
                            placeholder="Phone"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{d.address}</span>
                          </div>
                          {d.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{d.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.isActive ? 'default' : 'destructive'} className="uppercase text-[10px]">
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
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleStartEdit(d)} className="flex items-center gap-2">
                                <Edit className="h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setManageResource({ id: d.id, name: d.name })} className="flex items-center gap-2">
                                <Settings2 className="h-4 w-4" /> Manage Resources
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => dispatch(toggleDealershipStatus({ id: d.id, currentStatus: d.isActive }))} className="flex items-center gap-2">
                                <ToggleLeft className="h-4 w-4" /> {d.isActive ? 'Deactivate' : 'Activate'}
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
    </div>
  );
};

export default DealershipsPage;
