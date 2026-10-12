import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Optional for debugging
import { store, persistor } from './app/store.js'; // Named import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create a QueryClient instance
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
                    <App />
                    <ToastContainer position="top-right" newestOnTop />
                <ReactQueryDevtools initialIsOpen={false} /> {/* Optional */}
            </QueryClientProvider>
        </PersistGate>
    </Provider>
);
