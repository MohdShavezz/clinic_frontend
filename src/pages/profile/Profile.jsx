import React, { useRef, useState } from "react";
import Avatar from "react-avatar-edit";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../../app/features/userSlice";
import VerifyEmailPopup from "../../custom/VerifyEmailPopup";
import { dataURItoBlob } from "../../utils/dataURItoBlob";
import { handleLogout } from "../../utils/handleLogout";
// import { sendEmailOtpApi } from '../../services/api';

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const updating = useSelector((st) => st.user.loading);
  const [emailVerificationModalOpen, setEmailVerificationModalOpen] =
    useState(false);
  const {
    street = "",
    city = "",
    state = "",
    postalCode = "",
    country = "",
  } = useSelector((state) => state.user.user?.address || {});
  const [imgUpload, setImageUpload] = useState(null);
  const fileRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [cropPreview, setCropPreview] = useState(null); // Stores the cropped image preview
  const [isEditing, setIsEditing] = useState(false);

  const [isEditable, setIsEditable] = useState({
    username: false,
    address: {
      street: false,
      city: false,
      state: false,
      postalCode: false,
      country: false,
    },
  });
  const isAnyFieldEditable = () => {
    // Check if any field in isEditable is true
    return (
      isEditable.username || Object.values(isEditable.address).includes(true)
    );
  };
  const [formValues, setFormValues] = useState({
    username: user?.fullname || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    address: {
      street: street || "",
      city: city || "",
      state: state || "",
      postalCode: postalCode || "",
      country: country || "",
    },
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onCrop = (preview) => {
    setCropPreview(preview);
  };

  const onClose = () => {
    setCropPreview(null);
    setIsEditing(false);
  };

  const handleFileChange = (file) => {
    setImageUpload(file);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const [field, subField] = id.split(".");

    if (subField) {
      setFormValues({
        ...formValues,
        [field]: { ...formValues[field], [subField]: value },
      });
    } else {
      setFormValues({ ...formValues, [id]: value });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (formValues.phone && !/^\d{10}$/.test(formValues.phone)) {
      errors.phone = "Phone number must be exactly 10 digits";
    }
    if (
      formValues.address.postalCode &&
      !/^\d{5,6}$/.test(formValues.address.postalCode)
    ) {
      errors.postalCode = "Postal code must be 5-6 digits";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserLogout = () => handleLogout(dispatch, navigate);

  const handleUpdate = (e) => {
    e.preventDefault();
    setIsEditing(false);
    if (validateForm()) {
      const formData = new FormData();

      if (formValues.username) {
        formData.append("fullname", formValues.username);
      }

      if (formValues.address) {
        const { street, city, state, postalCode, country } = formValues.address;

        if (street) formData.append("address[street]", street);
        if (city) formData.append("address[city]", city);
        if (state) formData.append("address[state]", state);
        if (postalCode) formData.append("address[postalCode]", postalCode);
        if (country) formData.append("address[country]", country);
      }
      dispatch(updateUserProfile(formData));
      setIsEditable({
        username: false,
        address: {
          street: false,
          city: false,
          state: false,
          postalCode: false,
          country: false,
        },
      });
    } else {
      console.error("Form validation failed");
    }
  };

  const toggleEdit = (field, subField) => {
    if (subField) {
      setIsEditable((prev) => ({
        ...prev,
        [field]: { ...prev[field], [subField]: !prev[field][subField] },
      }));
    } else {
      setIsEditable((prev) => ({ ...prev, [field]: !prev[field] }));
    }
  };

  const handleFileUpload = () => {
    if (cropPreview) {
      const blob = dataURItoBlob(cropPreview);
      const formData = new FormData();
      const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
      formData.append("file", blob, `profile.${extension}`);
      dispatch(updateUserProfile(formData));
    }
    setIsEditing(false); // Stop editing mode after file upload
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <form className="flex flex-col gap-2 mt-2" onSubmit={handleUpdate}>
        <div className="m-auto">
          <img
            onClick={() => setIsEditing(true)}
            src={cropPreview || user?.profile?.profilePhoto}
            alt="profile"
            className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          />
        </div>
        {isEditing && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: ".3rem",
            }}
          >
            <Avatar
              width={260}
              height={140}
              onCrop={onCrop}
              onClose={onClose}
              src={selectedImage}
              onBeforeFileLoad={(elem) => {
                const file = elem.target.files[0];
                if (file && file.size > 71680) {
                  alert("File is too big!");
                  elem.target.value = "";
                } else if (file) {
                  handleFileChange(file);
                }
              }}
            />
            <button
              onClick={() => {
                if (cropPreview) {
                  handleFileUpload(); // Call handleFileUpload when cropPreview is true
                } else {
                  setIsEditing(false); // Just stop editing when cropPreview is false
                }
              }}
              className="bg-indigo-600 shadow-sm hover:bg-indigo-500 text-white text-sm rounded-sm p-1 px-4"
            >
              {cropPreview ? "Done" : "Back"}
            </button>
          </div>
        )}

        <div className="relative">
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={formValues.username}
            readOnly={!isEditable.username}
            onChange={handleInputChange}
            className="border p-2 rounded-lg text-sm w-full"
            style={{
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.border = "none")}
            // onBlur={(e) => (e.target.style.border = '1px solid #ccc')}
          />
          <i
            className={`fa fa-pencil absolute right-3 top-8 cursor-pointer ${
              isEditable.username ? "text-primary" : ""
            }`}
            onClick={() => toggleEdit("username")}
          ></i>
        </div>

        {!user?.isPhoneVerified && (
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formValues.email}
              readOnly
              className="border p-2 rounded-lg text-sm w-full"
              style={{
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.border = "none")}
            />
            {user.isEmailVerified ? (
              <i className="fa fa-check-circle text-success absolute right-3 bottom-3 cursor-pointer"></i>
            ) : (
              <i
                title="Register your email!!!"
                className={`fa fa-plus-circle text-danger absolute right-3 bottom-3 cursor-pointer`}
                onClick={async () => {
                  setEmailVerificationModalOpen(true);
                  // await sendEmailOtpApi(user.email)
                }}
              ></i>
            )}
          </div>
        )}
      

        {errors.phone && <p className="text-red-700 text-sm">{errors.phone}</p>}

        <div className="relative">
          <label className="block text-sm font-medium text-center mt-1">
            Address
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["street", "city", "state", "postalCode", "country"].map(
              (field, index) => (
                <div
                  key={field}
                  className={`relative ${
                    index === 0 ? "col-span-1 sm:col-span-2 mb-[-6px]" : ""
                  }`}
                >
                  <label
                    htmlFor={`address.${field}`}
                    className="block text-sm font-medium capitalize"
                  >
                    {field}
                  </label>
                  <input
                    type="text"
                    id={`address.${field}`}
                    value={formValues.address[field]}
                    readOnly={!isEditable.address[field]}
                    onChange={handleInputChange}
                    className="border p-2 rounded-lg text-sm w-full"
                    style={{
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.border = "none")}
                  />
                  <i
                    className={`fa fa-pencil absolute right-3 top-8 cursor-pointer ${
                      isEditable.address[field] ? "text-primary" : ""
                    }`}
                    onClick={() => toggleEdit("address", field)}
                  ></i>
                  {errors[field] && (
                    <p className="text-red-700 text-sm">{errors[field]}</p>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <button
          type="submit"
          className={`bg-indigo-600 shadow-sm text-white rounded-lg p-1 mt-2 uppercase ${
            !isAnyFieldEditable() || updating
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-indigo-500"
          }`}
          disabled={!isAnyFieldEditable() || updating} // Disable button if no field is editable or if updating
        >
          {updating ? "Updating..." : "Update"}
        </button>
      </form>
      <VerifyEmailPopup
        open={emailVerificationModalOpen}
        onClose={() => setEmailVerificationModalOpen(false)}
        email={user.email}
      />

      <div className="flex justify-between my-3">
        <span className="text-red-700 cursor-pointer text-sm/6">
          Delete account
        </span>
        <span
          onClick={handleUserLogout}
          className="text-red-700 cursor-pointer text-sm/6"
        >
          Log out
        </span>
      </div>
    </div>
  );
};

export default Profile;
