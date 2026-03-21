import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addVehicle } from '@/store/dealershipsSlice';
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

interface AddVehicleDialogProps {
  dealershipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddVehicleDialog: React.FC<AddVehicleDialogProps> = ({ dealershipId, open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ make: '', model: '', year: new Date().getFullYear() });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) {
      newErrors.year = 'Year is required';
    } else if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Invalid year';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await dispatch(addVehicle({ id: dealershipId, data: formData })).unwrap();
      onOpenChange(false);
      setFormData({ make: '', model: '', year: new Date().getFullYear() });
    } catch (err: any) {
      setErrors({ submit: err || 'Failed to add vehicle' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veh-make" className="text-xs font-semibold">Make</Label>
              <Input
                id="veh-make"
                placeholder="Toyota"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className={cn("text-xs h-8", errors.make ? 'border-destructive' : '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veh-model" className="text-xs font-semibold">Model</Label>
              <Input
                id="veh-model"
                placeholder="Camry"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className={cn("text-xs h-8", errors.model ? 'border-destructive' : '')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="veh-year" className="text-xs font-semibold">Year</Label>
            <Input
              id="veh-year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
              className={cn("text-xs h-8", errors.year ? 'border-destructive' : '')}
            />
            {errors.year && <p className="text-[10px] text-destructive">{errors.year}</p>}
          </div>

          {errors.submit && (
            <p className="text-[10px] text-destructive bg-destructive/10 p-2 rounded">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="text-xs h-8" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-xs h-8">
              {loading ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
