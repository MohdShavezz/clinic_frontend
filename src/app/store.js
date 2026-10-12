import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { persistedUserReducer } from "../app/features/userSlice"; // Import persisted reducer

const persistConfig = {
  key: "user",
  storage,
  whitelist: ["user", "token"],
};

const store = configureStore({
  reducer: {
    user: persistReducer(persistConfig, persistedUserReducer),
  },
  devTools: true,
  // Disable serializability check for persist actions
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these actions from redux-persist
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
