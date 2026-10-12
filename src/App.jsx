import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import NotFound from "./pages/not-found/NotFound";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import PublicRoute from "./custom/PublicRoute";
import PrivateRoute from "./custom/PrivateRoute";
import CircularLoader from "./custom/CircularLoader";
import ResetPassword from "./pages/reset-password/ResetPassword";
const Profile = lazy(() => import("./pages/profile/Profile"));
const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/login/Login"));
const SignUp = lazy(() => import("./pages/signup/SignUp"));
const ForgotPassword = lazy(() => import("./pages/forgotpassword/ForgotPassword"));
const ChangePassword = lazy(() => import("./pages/changepassword/ChangePassword"));
const ClinicDashboard = lazy(() => import("./pages/clinic/ClinicDashboard"));

function Layout({ children }) {
  return (
    <>
      <header >
        <Navbar />
      </header>
      <div className="mt-5">
      {children}
      </div>
      <footer>
        <Footer />
      </footer>

    </>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Layout>
        <Suspense fallback={<CircularLoader />}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/reset-password/:reset-token" element={<ResetPassword />} />

            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/clinic" element={<ClinicDashboard />} />
              {/* <Route path="/my-posts" element={<MyPosts />} />
              <Route path="/create-post" element={<CreatePost />} /> */}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}



export default App;
