import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleLogout } from "../../utils/handleLogout";

import { IconButton, Badge } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const menuItamListClass =
  "block px-4 py-[.5rem] text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none text-decoration-none";

export default function Navbar() {
  const messageCount=3
  const { user, token } = useSelector((state) => state.user);
  const [navigation, setNavigation] = useState([
    { name: "Home", href: "/", current: false },
  ]);

  const [showNavbar, setShowNavbar] = useState(true); 
  const [lastScrollY, setLastScrollY] = useState(0); 

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Update the active tab based on the current route
    const links = [{ name: "Home", href: "/" }];
    if (user && token) links.push({ name: "Clinic", href: "/clinic" });
    setNavigation(links.map((item) => ({
        ...item,
        current: item.href === location.pathname,
      })));
  }, [location.pathname, user, token]); // Run this effect whenever auth or route changes

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down and past a threshold
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  //Logout
  const handleUserLogout = () => handleLogout(dispatch, navigate);

  return (
    <Disclosure
      as="nav"
      style={{ backgroundColor: "#087f78" }}
      // className="bg-gray-800 fixed top-0 w-full gredient z-10 transition-transform duration-300"
      className={`fixed top-0 w-full z-20 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              <XMarkIcon className="hidden h-6 w-6" aria-hidden="true" />
            </DisclosureButton>
          </div>

          {/* Logo */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            {/* <div className="flex shrink-0 items-center hidden md:block">
              <img
                className="h-8 w-auto mx-3"
                src="../../../logo-tra2.png"
                // src="https://img.icons8.com/color/48/monzo.png"
                alt="Your Company"
              />
            </div> */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    style={{ textDecoration: "none" }}
                    className={`${
                      item.current
                        ? "text-white rounded-none border-bottom"
                        : "text-gray-300 hover:text-white"
                    } rounded-md px-1 py-1 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Notification & User Menu */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {user && token ? (
              <div className="flex items-center gap-3">
                
                <Link
                  to="/clinic"
                  style={{ textDecoration: "none" }}
                  className={`${
                    location.pathname === "/clinic"
                      ? "text-white border-b-2 border-white" // Active state styles
                      : "text-gray-300 hover:text-white hover:border-white"
                  } px-2 py-2 text-sm font-medium transition-all duration-300`}
                >
                  Clinic
                </Link>

                <Menu as="div" className="relative mr-3" title={user.fullname}>
                  <MenuButton className="relative flex rounded-full bg-gray-800 text-sm outline-none ring-2 ring-white ring-offset-2 ring-offset-gray-800">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt="profilePic"
                      src={user?.profile?.profilePhoto}
                      className="size-8 rounded-full"
                    />
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    <MenuItem>
                      <Link to={"/profile"} className={menuItamListClass}>
                        Profile
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link
                        to={"/change-password"}
                        className={menuItamListClass}
                      >
                        Change Password
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link
                        onClick={handleUserLogout}
                        className={menuItamListClass}
                      >
                        Log out
                      </Link>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            ) : (
              <Menu as="div" className="mr-1 d-flex">
                <span
                  className={`text-sm font-medium p-1 ${
                    location.pathname === "/login"
                      ? "text-white rounded-none border-bottom"
                      : "text-gray-200 hover:text-gray-400 hover:text-white"
                  } hover:cursor-pointer`}
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
                <span className="text-gray-200 text-sm py-1 font-medium">
                  /
                </span>
                <span
                  className={`text-sm font-medium p-1 ${
                    location.pathname === "/signup"
                      ? "text-white rounded-none border-bottom"
                      : "text-gray-200 hover:text-gray-400 hover:text-white"
                  } hover:cursor-pointer`}
                  onClick={() => navigate("/signup")}
                >
                  SignUp
                </span>
              </Menu>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={
                item.name === "Home"
                  ? "/"
                  : item.name === "Create Book"
                  ? "/CreateBook"
                  : item.href
              }
              className={classNames(
                item.current
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium text-decoration-none"
              )}
              aria-current={item.current ? "page" : undefined}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
