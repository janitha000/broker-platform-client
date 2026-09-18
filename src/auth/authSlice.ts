import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  beginLogin,
  beginLogout,
  getMe,
  registerTenant,
  type AuthUser,
} from "../api/identity";

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
};

const initialState: AuthState = {
  user: null,
  ready: false,
};

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async () => {
    return await getMe();
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (input: { name: string; email: string; password: string }) => {
    const user = await registerTenant(input.name, input.email, input.password);
    beginLogin();
    return user;
  },
);

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { dispatch }) => {
    dispatch(sessionCleared());
    beginLogout();
  },
);

export const sessionUnauthorized = createAsyncThunk(
  "auth/sessionUnauthorized",
  async (_, { dispatch }) => {
    dispatch(sessionCleared());
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionCleared(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.ready = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.ready = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { sessionCleared } = authSlice.actions;

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectReady = (state: { auth: AuthState }) => state.auth.ready;

export default authSlice.reducer;
