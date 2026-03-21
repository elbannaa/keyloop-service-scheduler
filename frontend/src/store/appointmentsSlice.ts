import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const ServiceType = {
  SALES_CONSULTATION: 'SALES_CONSULTATION',
  DETAILED_CONSULTATION: 'DETAILED_CONSULTATION',
  REPAIR_MAINTENANCE: 'REPAIR_MAINTENANCE',
} as const;

export type ServiceTypeType = typeof ServiceType[keyof typeof ServiceType];

export interface Appointment {
  id: string;
  serviceType: ServiceTypeType;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  vehicleInfo?: string;
  dealershipId: string;
  technicianId: string;
  vehicleId?: string;
}

interface AppointmentsState {
  availableSlots: string[];
  loading: boolean;
  error: string | null;
  bookingLoading: boolean;
  lastBooking: Appointment | null;
}

const initialState: AppointmentsState = {
  availableSlots: [],
  loading: false,
  error: null,
  bookingLoading: false,
  lastBooking: null,
};

export const fetchAvailability = createAsyncThunk(
  'appointments/fetchAvailability',
  async ({ dealershipId, serviceType, date }: { dealershipId: string; serviceType: ServiceTypeType; date: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/appointments/availability`, {
        params: { dealershipId, serviceType, date },
      });
      return response.data.data.slots;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch slots');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/appointments`, data);
      return response.data.data.appointment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Booking failed');
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearBookingState: (state) => {
      state.lastBooking = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAppointment.pending, (state) => {
        state.bookingLoading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.lastBooking = action.payload;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.bookingLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBookingState } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
