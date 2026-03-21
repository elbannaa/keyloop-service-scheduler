import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import { API_ROUTES, Messages } from '@/constants';

export interface DealershipData {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  isActive: boolean;
  managerId: string | null;
  _count?: {
    technicians: number;
    vehicles: number;
  };
}

interface DealershipsState {
  data: DealershipData[];
  loading: boolean;
  error: string | null;
}

const initialState: DealershipsState = {
  data: [],
  loading: false,
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
  async (data: { name: string; address: string; phone?: string }, { rejectWithValue, dispatch }) => {
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
    { id, data }: { id: string; data: { name: string; address: string; phone: string } },
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
      });
  },
});

export default dealershipsSlice.reducer;
