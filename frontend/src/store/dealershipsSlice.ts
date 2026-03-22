import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import { API_ROUTES, Messages } from '@/constants';

export interface DealershipData {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  managerId: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  supportedServices: string[];
  _count?: {
    technicians: number;
    vehicles: number;
  };
}

export interface TechnicianData {
  id: string;
  name: string;
  isActive: boolean;
  dealershipId: string;
}

export interface VehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  dealershipId: string;
}

interface DealershipsState {
  data: DealershipData[];
  technicians: TechnicianData[];
  vehicles: VehicleData[];
  loading: boolean;
  subResourceLoading: boolean;
  error: string | null;
}

const initialState: DealershipsState = {
  data: [],
  technicians: [],
  vehicles: [],
  loading: false,
  subResourceLoading: false,
  error: null,
};

export const fetchDealerships = createAsyncThunk(
  'dealerships/fetchAll',
  async (filters: { search?: string; vehicleMake?: string } | undefined, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.vehicleMake) params.append('vehicleMake', filters.vehicleMake);

      const response = await api.get(`${API_ROUTES.DEALERSHIPS}?${params.toString()}`);
      return response.data?.data?.dealerships || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || Messages.FETCH_DEALERSHIPS_ERROR
      );
    }
  }
);

export const createDealership = createAsyncThunk(
  'dealerships/create',
  async (data: { name: string; address: string; supportedServices?: string[] }, { rejectWithValue, dispatch }) => {
    try {
      await api.post(API_ROUTES.DEALERSHIPS, data);
      dispatch(fetchDealerships());
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || Messages.UPDATE_ERROR
      );
    }
  }
);

export const toggleDealershipStatus = createAsyncThunk(
  'dealerships/toggleStatus',
  async (
    { id, currentStatus }: { id: string; currentStatus: boolean },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await api.patch(`${API_ROUTES.DEALERSHIPS}/${id}/status`, { isActive: !currentStatus });
      dispatch(fetchDealerships());
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || Messages.UPDATE_STATUS_ERROR
      );
    }
  }
);

export const updateDealership = createAsyncThunk(
  'dealerships/update',
  async (
    { id, data }: { id: string; data: { name?: string; address?: string; supportedServices?: string[] } },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await api.patch(`${API_ROUTES.DEALERSHIPS}/${id}`, data);
      dispatch(fetchDealerships());
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || Messages.UPDATE_ERROR
      );
    }
  }
);

export const assignManager = createAsyncThunk(
  'dealerships/assignManager',
  async (
    { id, managerId }: { id: string; managerId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await api.patch(`${API_ROUTES.DEALERSHIPS}/${id}/manager`, { managerId });
      dispatch(fetchDealerships());
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to assign manager'
      );
    }
  }
);

export const fetchTechnicians = createAsyncThunk(
  'dealerships/fetchTechnicians',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_ROUTES.DEALERSHIPS}/${id}/technicians`);
      return response.data?.data?.technicians || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch technicians');
    }
  }
);

export const addTechnician = createAsyncThunk(
  'dealerships/addTechnician',
  async ({ id, data }: { id: string; data: { name: string } }, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`${API_ROUTES.DEALERSHIPS}/${id}/technicians`, data);
      dispatch(fetchTechnicians(id));
      dispatch(fetchDealerships());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add technician');
    }
  }
);

export const removeTechnician = createAsyncThunk(
  'dealerships/removeTechnician',
  async ({ id, technicianId }: { id: string; technicianId: string }, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`${API_ROUTES.DEALERSHIPS}/${id}/technicians/${technicianId}`);
      dispatch(fetchTechnicians(id));
      dispatch(fetchDealerships());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove technician');
    }
  }
);

export const fetchVehicles = createAsyncThunk(
  'dealerships/fetchVehicles',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_ROUTES.DEALERSHIPS}/${id}/vehicles`);
      return response.data?.data?.vehicles || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
);

export const addVehicle = createAsyncThunk(
  'dealerships/addVehicle',
  async ({ id, data }: { id: string; data: { make: string; model: string; year: number } }, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`${API_ROUTES.DEALERSHIPS}/${id}/vehicles`, data);
      dispatch(fetchVehicles(id));
      dispatch(fetchDealerships());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add vehicle');
    }
  }
);

export const removeVehicle = createAsyncThunk(
  'dealerships/removeVehicle',
  async ({ id, vehicleId }: { id: string; vehicleId: string }, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`${API_ROUTES.DEALERSHIPS}/${id}/vehicles/${vehicleId}`);
      dispatch(fetchVehicles(id));
      dispatch(fetchDealerships());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove vehicle');
    }
  }
);

const dealershipsSlice = createSlice({
  name: 'dealerships',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDealerships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealerships.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDealerships.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || Messages.GENERIC_ERROR;
      })
      .addCase(fetchTechnicians.pending, (state) => {
        state.subResourceLoading = true;
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.subResourceLoading = false;
        state.technicians = action.payload;
      })
      .addCase(fetchTechnicians.rejected, (state) => {
        state.subResourceLoading = false;
      })
      .addCase(fetchVehicles.pending, (state) => {
        state.subResourceLoading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.subResourceLoading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state) => {
        state.subResourceLoading = false;
      });
  },
});

export default dealershipsSlice.reducer;
