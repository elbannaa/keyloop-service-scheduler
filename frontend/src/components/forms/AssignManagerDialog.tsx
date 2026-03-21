import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers } from '@/store/usersSlice';
import { assignManager } from '@/store/dealershipsSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Role } from '@/constants/role';
import { Label } from '@/components/ui/label';

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

  useEffect(() => {
    if (dealershipId) {
      dispatch(fetchUsers({ role: Role.MANAGER }));
      setSelectedManagerId(currentManagerId || '');
    }
  }, [dealershipId, currentManagerId, dispatch]);

  const handleAssign = async () => {
    if (dealershipId && selectedManagerId) {
      await dispatch(assignManager({ id: dealershipId, managerId: selectedManagerId }));
      onClose();
    }
  };

  return (
    <Dialog open={!!dealershipId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Manager</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Dealership</Label>
            <div className="text-xs font-medium text-muted-foreground bg-muted p-2 rounded-md">
              {dealershipName}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Select Manager</Label>
            <Select
              value={selectedManagerId}
              onValueChange={setSelectedManagerId}
              disabled={usersLoading}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Search or select manager..." />
              </SelectTrigger>
              <SelectContent>
                {users.length === 0 ? (
                  <div className="p-2 text-xs text-muted-foreground">No managers found</div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="text-xs">
                      {user.name} ({user.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="text-xs h-8" onClick={onClose}>
            Cancel
          </Button>
          <Button className="text-xs h-8" onClick={handleAssign} disabled={!selectedManagerId || usersLoading}>
            Assign Manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
