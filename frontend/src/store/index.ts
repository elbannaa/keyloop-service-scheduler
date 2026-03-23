import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/authSlice';
import dealershipsReducer from '@/store/dealershipsSlice';
import usersReducer from '@/store/usersSlice';
import appointmentsReducer from '@/store/appointmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dealerships: dealershipsReducer,
    users: usersReducer,
    appointments: appointmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
