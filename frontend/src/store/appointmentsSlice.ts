import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const ServiceType = {
  NEW_CAR_CONSULTATION: 'NEW_CAR_CONSULTATION',
  VEHICLE_REPAIR: 'VEHICLE_REPAIR',
  VEHICLE_MAINTENANCE: 'VEHICLE_MAINTENANCE',
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
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'REJECTED';
}

export interface TechnicianWithAppointments {
  id: string;
  name: string;
  appointments: Appointment[];
}

interface AppointmentsState {
  availableSlots: string[];
  loading: boolean;
  error: string | null;
  bookingLoading: boolean;
  lastBooking: Appointment | null;
  schedule: TechnicianWithAppointments[];
  appointments: Appointment[];
}

const initialState: AppointmentsState = {
  availableSlots: [],
  loading: false,
  error: null,
  bookingLoading: false,
  lastBooking: null,
  schedule: [],
  appointments: [],
};

export const fetchAvailability = createAsyncThunk(
  'appointments/fetchAvailability',
  async ({ dealershipId, serviceType, date }: { dealershipId: string; serviceType: ServiceTypeType; date: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/appointments/availability`, {
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
  async (data: {
    dealershipId: string;
    serviceType: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerEmail: string;
    vehicleInfo?: string;
    vehicleId?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/appointments`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Booking failed');
    }
  }
);

export const fetchSchedule = createAsyncThunk(
  'appointments/fetchSchedule',
  async ({ dealershipId, date }: { dealershipId: string; date: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/appointments/schedule`, {
        params: { dealershipId, date },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedule');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

export const fetchAllAppointments = createAsyncThunk(
  'appointments/fetchAllAppointments',
  async (filters: { dealershipId?: string; status?: string; date?: string; startDate?: string; endDate?: string } | void, { rejectWithValue }) => {
    try {
      const response = await api.get(`/appointments`, {
        params: filters || {},
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/appointments/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const checkAvailability = createAsyncThunk(
  'appointments/checkAvailability',
  async ({ dealershipId, startTime, endTime }: { dealershipId: string; startTime: string; endTime: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/appointments/check-availability`, {
        params: { dealershipId, startTime, endTime },
      });
      return response.data.data.available;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check availability');
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
      })
      .addCase(fetchSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule = action.payload;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkAvailability.pending, (state) => {
        state.bookingLoading = true;
        state.error = null;
      })
      .addCase(checkAvailability.fulfilled, (state) => {
        state.bookingLoading = false;
      })
      .addCase(checkAvailability.rejected, (state, action) => {
        state.bookingLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAllAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = state.appointments.map(app => 
          app.id === action.payload.id ? action.payload : app
        );
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.schedule = state.schedule.map(tech => ({
          ...tech,
          appointments: tech.appointments.filter(app => app.id !== action.payload)
        }));
      });
  },
});

export const { clearBookingState } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
