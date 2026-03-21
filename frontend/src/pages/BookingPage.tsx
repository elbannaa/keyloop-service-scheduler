import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDealerships } from '@/store/dealershipsSlice';
import { fetchAvailability, createAppointment, ServiceType, type ServiceTypeType, clearBookingState } from '@/store/appointmentsSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, ChevronRight, Building2, Info } from 'lucide-react';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

// We'll use a simple date input for now, but in a real app would use a DatePicker
const BookingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: dealerships } = useAppSelector((state) => state.dealerships);
  const { availableSlots, loading: slotsLoading, bookingLoading, lastBooking, error } = useAppSelector((state) => state.appointments);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: '' as ServiceTypeType | '',
    date: dayjs().format('YYYY-MM-DD'),
    customerName: '',
    customerEmail: '',
    vehicleInfo: '',
  });

  const [selectedDealershipId, setSelectedDealershipId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDealerships());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDealershipId && formData.serviceType && formData.date) {
      dispatch(fetchAvailability({
        dealershipId: selectedDealershipId,
        serviceType: formData.serviceType as ServiceTypeType,
        date: formData.date
      }));
      setSelectedSlot(null);
    }
  }, [selectedDealershipId, formData.serviceType, formData.date, dispatch]);

  const handleBooking = async () => {
    if (!selectedDealershipId || !formData.serviceType || !selectedSlot) return;

    await dispatch(createAppointment({
      dealershipId: selectedDealershipId,
      serviceType: formData.serviceType,
      startTime: selectedSlot,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      vehicleInfo: formData.vehicleInfo,
    }));
    setStep(4);
  };

  const resetBooking = () => {
    setStep(1);
    setFormData({
      serviceType: '',
      date: dayjs().format('YYYY-MM-DD'),
      customerName: '',
      customerEmail: '',
      vehicleInfo: '',
    });
    setSelectedDealershipId(null);
    setSelectedSlot(null);
    dispatch(clearBookingState());
  };

  const getServiceLabel = (type: ServiceTypeType) => {
    switch (type) {
      case ServiceType.SALES_CONSULTATION: return 'Sales Consultation';
      case ServiceType.DETAILED_CONSULTATION: return 'Detailed Consultation';
      case ServiceType.REPAIR_MAINTENANCE: return 'Repair / Maintenance';
      default: return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Book a Service</h1>
        <p className="text-muted-foreground">Find a dealership and schedule your appointment in minutes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step Indicator */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative px-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center gap-2 z-10">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300",
                  step >= num ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-background border-muted text-muted-foreground"
                )}>
                  {step > num ? <CheckCircle2 className="h-6 w-6" /> : num}
                </div>
                <span className={cn("text-xs font-semibold", step >= num ? "text-primary" : "text-muted-foreground")}>
                  {num === 1 ? 'Details' : num === 2 ? 'Dealership' : 'Confirm'}
                </span>
              </div>
            ))}
            <div className="absolute top-5 left-8 right-8 h-[2px] bg-muted -z-0">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Tell us what you need and when.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType" className="text-xs font-semibold">Service Type</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(val) => setFormData({ ...formData, serviceType: val as ServiceTypeType })}
                    >
                      <SelectTrigger id="serviceType" className="text-xs h-8">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ServiceType.SALES_CONSULTATION} className="text-xs">Sales Consultation</SelectItem>
                        <SelectItem value={ServiceType.DETAILED_CONSULTATION} className="text-xs">Detailed Consultation</SelectItem>
                        <SelectItem value={ServiceType.REPAIR_MAINTENANCE} className="text-xs">Repair / Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-xs font-semibold">Preferred Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        type="date"
                        id="date"
                        className="pl-9 text-xs h-8"
                        min={dayjs().format('YYYY-MM-DD')}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
                    <Input id="name" placeholder="John Doe" className="text-xs h-8" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" className="text-xs h-8" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} />
                  </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="vehicle" className="text-xs font-semibold">Vehicle Info / Notes</Label>
                  <Input id="vehicle" placeholder="e.g. 2022 Toyota Camry - Oil Change" className="text-xs h-8" value={formData.vehicleInfo} onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  disabled={!formData.serviceType || !formData.customerName || !formData.customerEmail}
                  onClick={() => setStep(2)}
                  className="gap-2 text-xs h-8"
                >
                  Continue <ChevronRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle>Select Dealership</CardTitle>
                  <CardDescription>Available locations based on your requirements.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-semibold tracking-wider">Location</TableHead>
                        <TableHead className="text-right text-xs font-semibold tracking-wider">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dealerships.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                            No active dealerships found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        dealerships.map((d) => (
                          <TableRow
                            key={d.id}
                            className={cn(
                              "cursor-pointer transition-colors",
                              selectedDealershipId === d.id ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/50"
                            )}
                            onClick={() => setSelectedDealershipId(d.id)}
                          >
                            <TableCell>
                              <div className="font-semibold">{d.name}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">{d.address}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant={selectedDealershipId === d.id ? 'default' : 'outline'}
                                size="sm"
                              >
                                {selectedDealershipId === d.id ? 'Selected' : 'Select'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {selectedDealershipId && (
                <Card className="border-border shadow-md animate-in slide-in-from-top duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Pick a Time Slot
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {slotsLoading ? (
                      <div className="flex items-center justify-center h-24 text-muted-foreground">
                        Loading available times...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        No slots available for this date. Please try another date or location.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedSlot === slot ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {dayjs(slot).format('HH:mm')}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-muted pt-6">
                    <Button variant="ghost" className="text-xs h-8" onClick={() => setStep(1)}>Back</Button>
                    <Button
                      disabled={!selectedSlot || bookingLoading}
                      className="text-xs h-8"
                      onClick={() => setStep(3)}
                    >
                      Next Step
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}

          {step === 3 && (
            <Card className="border-primary/20 shadow-xl overflow-hidden">
              <div className="bg-primary/5 p-6 border-b border-primary/10">
                <CardTitle className="text-xl">Confirm Your Booking</CardTitle>
                <CardDescription>Review the details before finalizing.</CardDescription>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-3 w-3" /> Dealership
                    </h4>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">{dealerships.find(d => d.id === selectedDealershipId)?.name}</p>
                      <p className="text-xs text-muted-foreground">{dealerships.find(d => d.id === selectedDealershipId)?.address}</p>
                    </div>

                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-6 flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3" /> Schedule
                    </h4>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">{dayjs(selectedSlot!).format('dddd, MMMM D, YYYY')}</p>
                      <p className="text-primary font-bold text-sm">{dayjs(selectedSlot!).format('h:mm A')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Info className="h-3 w-3" /> Service
                    </h4>
                    <div className="space-y-1">
                      <Badge variant="secondary" className="mb-1 text-[10px] h-4 rounded-full">{getServiceLabel(formData.serviceType as ServiceTypeType)}</Badge>
                      <p className="text-xs text-muted-foreground">{formData.vehicleInfo || 'No notes provided'}</p>
                    </div>

                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-6 flex items-center gap-2">
                      <User className="h-3 w-3" /> Customer
                    </h4>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">{formData.customerName}</p>
                      <p className="text-xs text-muted-foreground">{formData.customerEmail}</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/30 p-6 border-t border-border">
                <Button variant="ghost" className="text-xs h-8" onClick={() => setStep(2)}>Back</Button>
                <Button
                  className="px-8 text-xs h-8"
                  disabled={bookingLoading}
                  onClick={handleBooking}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 4 && lastBooking && (
            <Card className="border-primary shadow-2xl overflow-hidden py-12 text-center animate-in zoom-in-95 duration-500">
              <CardContent className="space-y-6">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-black">Success!</CardTitle>
                  <CardDescription className="text-base">Your appointment has been scheduled and assigned.</CardDescription>
                </div>

                <div className="max-w-md mx-auto bg-muted/30 rounded-xl p-4 text-left border border-border">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Booking ID</span>
                    <span className="text-xs font-mono">{lastBooking.id.split('-')[0].toUpperCase()}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Technician</span>
                      <span className="font-semibold text-foreground">Assigned Automatically</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-semibold text-foreground">{dayjs(lastBooking.startTime).format('MMM D, YYYY')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-semibold text-primary">{dayjs(lastBooking.startTime).format('h:mm A')}</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" onClick={resetBooking} className="mt-8">
                  Make Another Booking
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Need Assistance?</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-4">
              <div>
                <h4 className="font-bold text-foreground">Service Types</h4>
                <p className="text-muted-foreground mt-1 text-[10px] md:text-xs">We offer three distinct service types tailored to your needs, from simple consultations to full vehicle maintenance.</p>
              </div>
              <div>
                <h4 className="font-bold text-foreground">Dynamic Scheduling</h4>
                <p className="text-muted-foreground mt-1 text-[10px] md:text-xs">Our system automatically finds the best technician for your request based on real-time availability.</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="font-medium text-[10px] text-primary">Keyloop Unified Scheduler v1.0</p>
              </div>
            </CardContent>
          </Card>

          {step < 3 && (
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 flex items-start gap-4">
              <Info className="h-6 w-6 text-primary shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold">Quick Tip</p>
                <p className="text-xs text-muted-foreground italic">You can book for any day between 8:00 AM and 6:00 PM. Weekends may have limited availability.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
