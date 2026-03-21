import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { createUser } from '@/store/usersSlice';
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
import { cn } from '@/lib/utils';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await dispatch(createUser(formData)).unwrap();
      onOpenChange(false);
      setFormData({ name: '', email: '', role: 'USER', password: '' });
    } catch (err: any) {
      setErrors({ submit: err || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name" className="text-xs font-semibold">Full Name</Label>
            <Input
              id="create-name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn("text-xs h-8", errors.name ? 'border-destructive' : '')}
            />
            {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email" className="text-xs font-semibold">Email Address</Label>
            <Input
              id="create-email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={cn("text-xs h-8", errors.email ? 'border-destructive' : '')}
            />
            {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-role" className="text-xs font-semibold">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(val) => setFormData({ ...formData, role: val })}
            >
              <SelectTrigger id="create-role" className="text-xs h-8">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER" className="text-xs">User</SelectItem>
                <SelectItem value="MANAGER" className="text-xs">Manager</SelectItem>
                <SelectItem value="ADMIN" className="text-xs">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div className="space-y-2">
            <Label htmlFor="create-password" className="text-xs font-semibold">Password (Optional)</Label>
            <Input
              id="create-password"
              type="password"
              placeholder="Leave blank for default"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={cn("text-xs h-8", errors.password ? 'border-destructive' : '')}
            />
            {errors.password && <p className="text-[10px] text-destructive">{errors.password}</p>}
          </div>

          {errors.submit && (
            <p className="text-[10px] text-destructive bg-destructive/10 p-2 rounded">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="text-xs h-8" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs h-8">
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
