import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { createDealership } from '@/store/dealershipsSlice';
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
import { cn } from '@/lib/utils';

interface CreateDealershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDealershipDialog: React.FC<CreateDealershipDialogProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await dispatch(createDealership(formData)).unwrap();
      onOpenChange(false);
      setFormData({ name: '', address: '' });
    } catch (err: any) {
      setErrors({ submit: err || 'Failed to create dealership' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Dealership</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dl-name" className="text-xs font-semibold">Dealership Name</Label>
            <Input
              id="dl-name"
              placeholder="Keyloop City Center"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn("text-xs h-8", errors.name ? 'border-destructive' : '')}
            />
            {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dl-address" className="text-xs font-semibold">Location Address</Label>
            <Input
              id="dl-address"
              placeholder="123 Main St, London"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={cn("text-xs h-8", errors.address ? 'border-destructive' : '')}
            />
            {errors.address && <p className="text-[10px] text-destructive">{errors.address}</p>}
          </div>


          {errors.submit && (
            <p className="text-[10px] text-destructive bg-destructive/10 p-2 rounded">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="text-xs h-8" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs h-8">
              {loading ? 'Adding...' : 'Add Dealership'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
