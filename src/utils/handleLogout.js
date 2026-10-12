import { toast } from "react-toastify";
import { logoutUser } from "../app/features/userSlice";

export const handleLogout = async (dispatch, navigate) => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      // localStorage.removeItem("persist:root");
      navigate("/login"); 
    } else {
      toast.error(result.payload || "Logout failed. Please try again.");
    }
  };