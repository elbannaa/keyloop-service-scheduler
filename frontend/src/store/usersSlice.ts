import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import { API_ROUTES, Messages } from '@/constants';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersState {
  data: UserData[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (filters: { search?: string; role?: string } | undefined, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role) params.append('role', filters.role);

      const response = await api.get(`${API_ROUTES.USERS}?${params.toString()}`);
      // result.data contains the array from usersService.listUsers
      return response.data?.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || Messages.FETCH_USERS_ERROR
      );
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (data: { name: string; email: string; role: string; password?: string }, { rejectWithValue, dispatch }) => {
    try {
      // Backend expects: email, password, name, role
      const payload = { ...data, password: data.password || 'Temporary123!' };
      await api.post(API_ROUTES.USERS, payload);
      dispatch(fetchUsers());
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || Messages.UPDATE_ERROR
      );
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'users/toggleStatus',
  async (
    { id, currentStatus }: { id: string; currentStatus: boolean },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await api.patch(`${API_ROUTES.USERS}/${id}/status`, { isActive: !currentStatus });
      dispatch(fetchUsers());
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || Messages.UPDATE_STATUS_ERROR
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async (
    { id, data }: { id: string; data: { name?: string; role?: string } },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await api.patch(`${API_ROUTES.USERS}/${id}`, data);
      dispatch(fetchUsers());
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || Messages.UPDATE_ERROR
      );
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || Messages.GENERIC_ERROR;
      });
  },
});

export default usersSlice.reducer;
