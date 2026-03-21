import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTechnicians,
  removeTechnician,
  fetchVehicles,
  removeVehicle,
} from '@/store/dealershipsSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Car, Loader2, Info } from 'lucide-react';
import { AddTechnicianDialog } from './AddTechnicianDialog';
import { AddVehicleDialog } from './AddVehicleDialog';

interface ManageResourcesDialogProps {
  dealershipId: string;
  dealershipName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageResourcesDialog: React.FC<ManageResourcesDialogProps> = ({
  dealershipId,
  dealershipName,
  open,
  onOpenChange,
}) => {
  const dispatch = useAppDispatch();
  const { technicians, vehicles, subResourceLoading } = useAppSelector((state) => state.dealerships);
  const [activeTab, setActiveTab] = useState('technicians');
  const [isAddTechOpen, setIsAddTechOpen] = useState(false);
  const [isAddVehOpen, setIsAddVehOpen] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchTechnicians(dealershipId));
      dispatch(fetchVehicles(dealershipId));
    }
  }, [open, dealershipId, dispatch]);

  const handleRemoveTech = (techId: string) => {
    if (confirm('Are you sure you want to remove this technician?')) {
      dispatch(removeTechnician({ id: dealershipId, technicianId: techId }));
    }
  };

  const handleRemoveVeh = (vehId: string) => {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      dispatch(removeVehicle({ id: dealershipId, vehicleId: vehId }));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Info className="h-4 w-4 text-primary" />
              Manage {dealershipName}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col mt-4">
            <div className="px-6 border-b border-border">
              <TabsList className="grid h-8 w-full grid-cols-2">
                <TabsTrigger value="technicians" className="flex items-center gap-2 text-xs">
                  Technicians ({technicians.length})
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="flex items-center gap-2 text-xs">
                  Service Vehicles ({vehicles.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-6 pt-4">
              <TabsContent value="technicians" className="m-0 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Staff Roster
                  </h3>
                  <Button size="sm" onClick={() => setIsAddTechOpen(true)} className="gap-2 text-xs h-8">
                    <UserPlus className="h-3 w-3" /> Add Technician
                  </Button>
                </div>

                <div className="rounded-md border border-border bg-card">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-xs font-semibold tracking-wider">Name</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider">Status</TableHead>
                        <TableHead className="text-right text-xs font-semibold tracking-wider">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subResourceLoading && technicians.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ) : technicians.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                            No technicians assigned to this location.
                          </TableCell>
                        </TableRow>
                      ) : (
                        technicians.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium text-xs">{t.name}</TableCell>
                            <TableCell>
                              <Badge variant={t.isActive ? "default" : "secondary"} className="text-[10px] uppercase rounded-full">
                                {t.isActive ? "Active" : "Away"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveTech(t.id)} className="h-8 w-8 text-destructive hover:text-white hover:bg-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="vehicles" className="m-0 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Fleet Management
                  </h3>
                  <Button size="sm" onClick={() => setIsAddVehOpen(true)} className="gap-2 text-xs h-8">
                    <Car className="h-3 w-3" /> Add Vehicle
                  </Button>
                </div>

                <div className="rounded-md border border-border bg-card">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-xs font-semibold tracking-wider">Make / Model</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider">Year</TableHead>
                        <TableHead className="text-right text-xs font-semibold tracking-wider">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subResourceLoading && vehicles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ) : vehicles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center text-muted-foreground italic">
                            No service vehicles available at this center.
                          </TableCell>
                        </TableRow>
                      ) : (
                        vehicles.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell className="font-medium text-xs">{v.make} {v.model}</TableCell>
                            <TableCell className="text-muted-foreground text-[10px]">{v.year}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveVeh(v.id)} className="h-8 w-8 text-destructive hover:text-white hover:bg-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AddTechnicianDialog
        dealershipId={dealershipId}
        open={isAddTechOpen}
        onOpenChange={setIsAddTechOpen}
      />
      <AddVehicleDialog
        dealershipId={dealershipId}
        open={isAddVehOpen}
        onOpenChange={setIsAddVehOpen}
      />
    </>
  );
};
