import React, { useEffect, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchUsers, toggleUserStatus } from '@/store/usersSlice';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, RefreshCw, MoreVertical, Shield } from 'lucide-react';
import { CreateUserDialog } from '@/components/forms/CreateUserDialog';
import { EditUserDialog } from '@/components/forms/EditUserDialog';
import type { UserData } from '@/store/usersSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import debounce from 'lodash.debounce';
import { cn } from "@/lib/utils";
import { Role } from '@/constants/role';

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading, error } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);

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

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    dispatch(toggleUserStatus({ id, currentStatus }));
  };

  if (currentUser?.role !== Role.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
        <Shield className="w-16 h-16 text-destructive/50" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground max-w-md">
          Only system administrators have permission to manage users.
          Please contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      <div className="mx-auto w-full space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 text-xs h-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Roles</SelectItem>
                <SelectItem value="ADMIN" className="text-xs">Admin</SelectItem>
                <SelectItem value="MANAGER" className="text-xs">Manager</SelectItem>
                <SelectItem value="USER" className="text-xs">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => dispatch(fetchUsers({ search, role: roleFilter === 'all' ? undefined : roleFilter }))} disabled={loading}>
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 text-xs h-8">
              <UserPlus className="h-3 w-3" />
              <span>Create User</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Table Container */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px] text-xs font-semibold tracking-wider">User</TableHead>
                <TableHead className="hidden md:table-cell text-xs font-semibold tracking-wider">Email</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider">Role</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider">Status</TableHead>
                <TableHead className="hidden lg:table-cell text-xs font-semibold tracking-wider">Joined</TableHead>
                <TableHead className="text-right text-xs font-semibold tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No users found matching your filters.
                  </TableCell>
                </TableRow>
              )}
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="leading-none text-xs">{u.name}</span>
                      <span className="text-[10px] md:hidden text-muted-foreground mt-1 truncate max-w-[120px]">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-foreground text-xs">{u.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary' className="text-xs rounded-full">
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "default" : "destructive"} className="text-xs rounded-full">
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="text-xs" onClick={() => setEditingUser(u)}>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs" onClick={() => handleToggleStatus(u.id, u.isActive)}>
                          {u.isActive ? <span className="text-destructive">Deactivate User</span> : <span className="text-green-500">Activate User</span>}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />
    </div>
  );
};

export default UsersPage;
