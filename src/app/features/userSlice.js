import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logIn, logOut, phoneLoginApi, updateProfile } from "../../services/api";
import { toast } from "react-toastify";
import storage from "redux-persist/lib/storage";  // Import the storage module

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await logIn(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed.");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) {
        throw new Error("Token not found.");
      }

      const response = await logOut(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Logout failed.");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/update-profile",
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) {
        throw new Error("Token not found. Please log in again.");
      }

      const response = await updateProfile(formData, token);
      toast.success(response.message || 'Profile updated!', { autoClose: 2000 });
      return response;
    } catch (error) {
    toast.error(error.message || 'Error in profile updated!', { autoClose: 2000 });
      return rejectWithValue(error.message || "Profile update failed.");
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    },
    updateIsEmailVerified(state, action) {
      if (state.user) {
        state.user.isEmailVerified = action.payload;
      }
    }
    
  },
  extraReducers: (builder) => {
    builder
      // User Login Reducers
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.user.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout Reducers
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});


export const { setCredentials, clearCredentials, updateIsEmailVerified } = userSlice.actions;

// Configuration for redux-persist
import { persistReducer } from "redux-persist";
const persistConfig = {
  key: "user",  // Key for persist
  storage,       // Use localStorage as storage
  whitelist: ["user", "token"], // Specify which fields to persist
};

export const persistedUserReducer = persistReducer(persistConfig, userSlice.reducer);

export default userSlice.reducer;
