import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/usersSlice';
import type { UserData } from '@/store/usersSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        role: user.role,
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await dispatch(updateUser({ id: user.id, data: formData })).unwrap();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-xs font-semibold">Email (Read-only)</Label>
            <Input id="edit-email" value={user?.email || ''} readOnly className="bg-muted text-xs h-8" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-xs font-semibold">Full Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
              required
              className="text-xs h-8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role" className="text-xs font-semibold">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger id="edit-role" className="text-xs h-8">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN" className="text-xs">Admin</SelectItem>
                <SelectItem value="MANAGER" className="text-xs">Manager</SelectItem>
                <SelectItem value="USER" className="text-xs">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="text-xs h-8">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs h-8">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
