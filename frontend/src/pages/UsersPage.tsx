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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import debounce from 'lodash.debounce';
import { cn } from "@/lib/utils";

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading, error } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  if (currentUser?.role !== 'ADMIN') {
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
      <div className="border-b border-border bg-card px-4 py-8 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">System Users</h1>
            <p className="text-muted-foreground">Manage accounts, roles, and system access.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => dispatch(fetchUsers({ search, role: roleFilter === 'all' ? undefined : roleFilter }))} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
              <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
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
                  <TableHead className="w-[200px]">User</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-xs border border-border">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground leading-none">{u.name}</span>
                          <span className="text-[10px] md:hidden text-muted-foreground mt-1 truncate max-w-[120px]">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col text-sm">
                        <span className="text-foreground">{u.email}</span>
                        {u.phone && <span className="text-muted-foreground text-xs">{u.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'ADMIN' ? 'default' : u.role === 'MANAGER' ? 'secondary' : 'outline'} className="font-bold tracking-tight">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", u.isActive ? "bg-primary" : "bg-destructive")} />
                        <span className={cn("text-xs font-medium", u.isActive ? "text-primary" : "text-destructive")}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
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
                          <DropdownMenuItem onClick={() => handleToggleStatus(u.id, u.isActive)}>
                            {u.isActive ? 'Deactivate User' : 'Activate User'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
};

export default UsersPage;
