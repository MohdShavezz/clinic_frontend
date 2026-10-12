import { useState } from "react";

function PasswordInput({ value, onChange, placeholder = "Enter password", ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="mt-2 relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full rounded-md border-0 py-2 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
        {...props}
      />
      <i
        className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"} absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500`}
        onClick={togglePasswordVisibility}
      ></i>
    </div>
  );
}

export default PasswordInput;
