import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dealershipsReducer from './dealershipsSlice';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dealerships: dealershipsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
