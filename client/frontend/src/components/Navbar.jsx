import React, {
  useRef,
  useContext,
  useEffect,
  useState,
} from "react";

import { assets } from "../assets/assets";

import {
  Link,
  NavLink,
} from "react-router-dom";

import { ShopContext } from "../context/ShopContextContext";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/features/auth/authSlice";
import { getRole } from "../features/dashboard/routes/roles";
import { toast } from "react-toastify";
import { getCurrentLocation, getReadableAddress } from "../lib/location";

const Navbar = () => {
  const [visible, setVisible] =
    useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const {
    search,
    setSearch,
    getCartCount,
    navigate,
    setCartItems,
    deliveryLocation,
    setDeliveryLocation,
  } = useContext(ShopContext);
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  const profileMenuRef = useRef(null);
  const role = getRole(currentUser);
  const dashboardPath = role === "superAdmin"
    ? "/dashboard/super-admin"
    : role === "admin"
      ? "/dashboard/admin"
      : role === "restaurant"
        ? "/dashboard/restaurant"
        : null;
  const roleLabel = role === "superAdmin" ? "Super admin" : role === "admin" ? "Operations admin" : role === "restaurant" ? "Restaurant partner" : "Customer";
  const savedAddress = currentUser?.address?.trim();
  const locationSubtitle = deliveryLocation.coordinates
    ? deliveryLocation.address || `${deliveryLocation.coordinates.latitude.toFixed(5)}, ${deliveryLocation.coordinates.longitude.toFixed(5)}`
    : deliveryLocation.address || "Gurugram, Haryana, India";

  useEffect(() => {
    const coordinates = deliveryLocation.coordinates;
    const hasCoordinateAddress = /^-?\d+\.\d{3,},\s*-?\d+\.\d{3,}$/.test(deliveryLocation.address || "");
    if (!coordinates || (deliveryLocation.address && !hasCoordinateAddress)) {
      return undefined;
    }

    let isActive = true;
    getReadableAddress(coordinates)
      .then((address) => {
        if (!isActive || !address) return;
        setDeliveryLocation((current) => (
          current.coordinates?.latitude === coordinates.latitude &&
          current.coordinates?.longitude === coordinates.longitude
            ? { ...current, address }
            : current
        ));
      })
      .catch((error) => {
        console.error("Reverse geocoding failed:", error);
      });

    return () => {
      isActive = false;
    };
  }, [deliveryLocation.address, deliveryLocation.coordinates, setDeliveryLocation]);

  useEffect(() => {
    if (!isLocationPickerOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsLocationPickerOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isLocationPickerOpen]);

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    const closeProfileMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (event.key === "Escape") setIsProfileMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeProfileMenu);
    document.addEventListener("keydown", closeProfileMenu);
    return () => {
      document.removeEventListener("pointerdown", closeProfileMenu);
      document.removeEventListener("keydown", closeProfileMenu);
    };
  }, [isProfileMenuOpen]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    dispatch(logoutUser(token));
    setCartItems({});

    navigate("/login");
  };

  // =====================================================
  // CART COUNT
  // =====================================================

  const cartCount = getCartCount();

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    navigate("/menu");
  };

  const selectLocation = (label, address = label, coordinates = null) => {
    setDeliveryLocation({ label, address, coordinates });
    setLocationSearch("");
    setIsLocationPickerOpen(false);
  };

  const locateMe = async () => {
    setIsLocating(true);
    try {
      const coordinates = await getCurrentLocation();
      const address = `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;
      selectLocation("Current location", address, coordinates);
      toast.success("Current location selected.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLocating(false);
    }
  };

  const applySearchLocation = (event) => {
    event.preventDefault();
    const address = locationSearch.trim();
    if (!address) return;
    selectLocation(address, address);
  };

  return (
    <>
      {/* =================================================
          STICKY NAVBAR
      ================================================== */}

      <header className="sticky top-0 z-[1000] w-full border-b border-[#d9c9ab] bg-[#f4ebdc]/90 shadow-[0_8px_30px_-18px_rgba(18,61,48,0.35)] backdrop-blur-xl">

        <div className="flex items-center justify-between py-3 px-2 sm:px-8 font-medium">

          {/* =================================================
              LOGO
          ================================================== */}

          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="ZaykaNest home"
          >
            <img
              src="/logo.png"
              alt="ZaykaNest"
              className="h-11 w-11 rounded-full object-cover sm:h-14 sm:w-14 ring-2 ring-[#123d30]"
            />
            <span className="hidden font-serif text-xl font-bold tracking-tight text-[#1a4f41] sm:inline sm:text-2xl">
              ZaykaNest
            </span>
          </Link>

          {/* =================================================
              DESKTOP MENU
          ================================================== */}

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#2f5d51] bg-[#123d30]/80 p-1.5 text-sm text-[#f3d7a1] shadow-inner">

            <NavLink
              to="/"
              className={({ isActive }) => `rounded-full px-4 py-2 font-semibold transition ${isActive ? "bg-[#f3d7a1] text-[#123d30] shadow-sm" : "text-[#fffaf2]/90 hover:bg-white/10 hover:text-white"}`}
            >
              HOME
            </NavLink>

            <NavLink
              to="/menu"
              className={({ isActive }) => `rounded-full px-4 py-2 font-semibold transition ${isActive ? "bg-[#f3d7a1] text-[#123d30] shadow-sm" : "text-[#fffaf2]/90 hover:bg-white/10 hover:text-white"}`}
            >
              MENU
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => `rounded-full px-4 py-2 font-semibold transition ${isActive ? "bg-[#f3d7a1] text-[#123d30] shadow-sm" : "text-[#fffaf2]/90 hover:bg-white/10 hover:text-white"}`}
            >
              ABOUT
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) => `rounded-full px-4 py-2 font-semibold transition ${isActive ? "bg-[#f3d7a1] text-[#123d30] shadow-sm" : "text-[#fffaf2]/90 hover:bg-white/10 hover:text-white"}`}
            >
              CONTACT
            </NavLink>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================== */}

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              className="hidden max-w-52 items-start gap-2 text-left text-[#123d30] lg:flex"
              aria-label={`Delivery location: ${deliveryLocation.label}. Change location`}
            >
              <span aria-hidden="true" className="mt-0.5 text-base">⌖</span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-semibold">
                  {deliveryLocation.label}
                  <span aria-hidden="true">⌄</span>
                </span>
                <span className="block truncate text-[10px] font-normal text-[#52665d]">
                  {locationSubtitle}
                </span>
              </span>
            </button>

            {/* SEARCH */}

            <label className="hidden items-center gap-2 rounded-full border border-[#d9c9ab] bg-[#f7f1e7] px-3 py-2 md:flex">
              <img className="h-4 w-4" src={assets.search_icon} alt="" />
              <input
                value={search}
                onChange={handleSearchChange}
                className="w-28 bg-transparent text-sm text-[#123d30] outline-none placeholder:text-[#5d7a70] lg:w-40"
                placeholder="Search dishes"
                aria-label="Search dishes"
              />
            </label>

            <button
              type="button"
              onClick={() => navigate("/menu")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2f5d51] bg-[#f3d7a1] text-[#123d30] transition hover:scale-105 hover:bg-[#efc77e] md:hidden"
              aria-label="Search menu"
            >
              <img className="h-5 w-5" src={assets.search_icon} alt="" />
            </button>

            {/* =================================================
                PROFILE
            ================================================== */}

            {token && currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c9ab] bg-[#f7f1e7] text-[#123d30] transition hover:scale-105 hover:bg-[#f0e0c7]"
                  aria-label="Profile menu"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  <img className="h-5 w-5" src={assets.profile_icon} alt="" />
                </button>

                {isProfileMenuOpen && (
                <div className="absolute right-0 z-[1100] pt-3">

                  <div role="menu" className="flex w-56 flex-col gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-gray-500 shadow-xl">

                    <div className="mb-1 border-b border-gray-100 pb-2">
                      <p className="truncate text-sm font-semibold text-[#244638]">{currentUser?.name || "Your account"}</p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#a1783c]">{roleLabel} account</p>
                    </div>

                    {dashboardPath && <button type="button" role="menuitem" onClick={() => { setIsProfileMenuOpen(false); navigate(dashboardPath); }} className="text-left font-semibold text-[#31594b] transition-colors hover:text-black">Dashboard</button>}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setIsProfileMenuOpen(false); navigate("/my-profile"); }}
                      className="text-left transition-colors hover:text-black"
                    >
                      My Profile
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setIsProfileMenuOpen(false); navigate("/orders"); }}
                      className="text-left transition-colors hover:text-black"
                    >
                      Orders
                    </button>

                    {role === "customer" && <button type="button" role="menuitem" onClick={() => { setIsProfileMenuOpen(false); navigate("/partner/apply"); }} className="text-left transition-colors hover:text-black">Become a restaurant partner</button>}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setIsProfileMenuOpen(false); logout(); }}
                      className="text-left transition-colors hover:text-black"
                    >
                      Logout
                    </button>

                  </div>

                </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full border border-[#2f5d51] bg-[#123d30] px-4 py-2 text-sm font-semibold text-[#f3d7a1] transition hover:bg-[#1d4d3e]"
              >
                Login
              </Link>
            )}

            {/* =================================================
                CART
            ================================================== */}

            <Link
              to="/cart"
              className="relative inline-flex rounded-full bg-[#f7f1e7] p-2 border border-[#d9c9ab]"
            >

              <img
                src={assets.cart_icon}
                className="w-5 min-w-5 hover:scale-110 transition-transform"
                alt="Cart"
              />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-2
                    -bottom-2
                    min-w-[18px]
                    h-[18px]
                    px-1
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-black
                    text-white
                    text-[9px]
                    font-bold
                  "
                >
                  {cartCount}
                </span>
              )}

            </Link>

            {/* =================================================
                MOBILE MENU BUTTON
            ================================================== */}

            <img
              onClick={() =>
                setVisible(true)
              }
              className="h-10 w-10 cursor-pointer rounded-full border border-[#d9c9ab] bg-[#f7f1e7] p-2.5 transition hover:bg-[#f0e0c7] sm:hidden"
              src={assets.menu_icon}
              alt="Menu"
            />

          </div>

        </div>

        <div className="border-t border-[#d9c9ab]/70 px-4 py-2 sm:px-8 lg:hidden">
          <button
            type="button"
            onClick={() => setIsLocationPickerOpen(true)}
            className="flex w-full items-start gap-2 text-left text-[#123d30]"
            aria-label={`Delivery location: ${deliveryLocation.label}. Change location`}
          >
            <span aria-hidden="true" className="mt-0.5 text-base">⌖</span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-xs font-semibold">
                {deliveryLocation.label}
                <span aria-hidden="true">⌄</span>
              </span>
              <span className="block truncate text-[10px] font-normal text-[#52665d]">
                {locationSubtitle}
              </span>
            </span>
          </button>
        </div>

      </header>

      {/* =================================================
          MOBILE SIDEBAR
      ================================================== */}

      {visible && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setVisible(false)}
          className="fixed inset-0 z-[1900] bg-[#0d2d22]/35 backdrop-blur-sm sm:hidden"
        />
      )}

      <div
        className={`
          fixed
          top-0
          right-0
          bottom-0
          z-[2000]
          bg-gradient-to-b
          from-[#fffdf8]
          to-[#e8f0e9]
          shadow-[0_0_55px_rgba(18,61,48,0.22)]
          transform
          transition-transform
          duration-300
          ${visible
            ? "translate-x-0 w-full sm:w-80"
            : "translate-x-full w-full sm:w-80"
          }
        `}
        style={{
          maxWidth: "100%",
        }}
      >

        <div className="flex flex-col text-[#123d30] h-full">

          {/* BACK BUTTON */}

          <div className="flex items-center justify-between gap-4 border-b border-[#d9c9ab] bg-[#f7f1e7]/90 p-4">

            <Link
              to="/"
              onClick={() => setVisible(false)}
              className="flex items-center gap-2"
              aria-label="ZaykaNest home"
            >
              <img
                src="/logo.png"
                alt="ZaykaNest"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-serif text-lg font-bold text-[#123d30]">
                ZaykaNest
              </span>
            </Link>

            <button
              onClick={() =>
                setVisible(false)
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9c9ab] bg-[#f7f1e7] text-sm text-[#123d30] transition hover:bg-[#f0e0c7]"
            >

              <img
                src={
                  assets.dropdown_icon
                }
                alt="Back"
                className="h-4 w-4 rotate-180"
              />

            </button>

          </div>

          {/* MOBILE NAV */}

          <nav className="flex-1 space-y-2 overflow-auto p-4">

            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              className="w-full rounded-2xl border border-[#d9c9ab] bg-white/80 px-5 py-4 text-left"
            >
              <span className="block text-xs font-bold uppercase tracking-wide text-[#52665d]">
                Current location
              </span>
              <span className="mt-1 block truncate text-sm font-semibold">
                {deliveryLocation.label}
              </span>
              <span className="mt-0.5 block truncate text-xs font-normal text-[#798078]">
                {locationSubtitle}
              </span>
            </button>

            <NavLink
              onClick={() =>
                setVisible(false)
              }
              className={({ isActive }) => `block rounded-2xl px-5 py-4 text-sm font-bold tracking-wide transition ${isActive ? "bg-[#123d30] text-[#f7f1e7] shadow-lg" : "bg-white/70 text-[#123d30] hover:bg-[#f0e0c7]"}`}
              to="/"
            >
              HOME
            </NavLink>

            <NavLink
              onClick={() =>
                setVisible(false)
              }
              className={({ isActive }) => `block rounded-2xl px-5 py-4 text-sm font-bold tracking-wide transition ${isActive ? "bg-[#123d30] text-[#f7f1e7] shadow-lg" : "bg-white/70 text-[#123d30] hover:bg-[#f0e0c7]"}`}
              to="/menu"
            >
              MENU
            </NavLink>

            <NavLink
              onClick={() =>
                setVisible(false)
              }
              className={({ isActive }) => `block rounded-2xl px-5 py-4 text-sm font-bold tracking-wide transition ${isActive ? "bg-[#123d30] text-[#f7f1e7] shadow-lg" : "bg-white/70 text-[#123d30] hover:bg-[#f0e0c7]"}`}
              to="/about"
            >
              ABOUT
            </NavLink>

            <NavLink
              onClick={() =>
                setVisible(false)
              }
              className={({ isActive }) => `block rounded-2xl px-5 py-4 text-sm font-bold tracking-wide transition ${isActive ? "bg-[#123d30] text-[#f7f1e7] shadow-lg" : "bg-white/70 text-[#123d30] hover:bg-[#f0e0c7]"}`}
              to="/contact"
            >
              CONTACT
            </NavLink>

            {token && currentUser ? (
              <>
                {dashboardPath && <NavLink
                  onClick={() => setVisible(false)}
                  className={({ isActive }) => `block rounded-2xl px-5 py-4 text-sm font-bold tracking-wide transition ${isActive ? "bg-[#123d30] text-[#f7f1e7] shadow-lg" : "bg-white/70 text-[#123d30] hover:bg-[#f0e0c7]"}`}
                  to={dashboardPath}
                >
                  DASHBOARD
                </NavLink>}
                <NavLink
                  onClick={() => setVisible(false)}
                  className={({ isActive }) => `block rounded-2xl px-5 py-4 text-sm font-bold tracking-wide transition ${isActive ? "bg-[#123d30] text-[#f7f1e7] shadow-lg" : "bg-white/70 text-[#123d30] hover:bg-[#f0e0c7]"}`}
                  to="/my-profile"
                >
                  MY PROFILE
                </NavLink>
              </>
            ) : (
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) => `block rounded-2xl px-5 py-4 text-sm font-bold tracking-wide transition ${isActive ? "bg-[#123d30] text-[#f7f1e7] shadow-lg" : "bg-white/70 text-[#123d30] hover:bg-[#f0e0c7]"}`}
                to="/login"
              >
                LOGIN
              </NavLink>
            )}

            {/* MOBILE CART */}

            <NavLink
              onClick={() =>
                setVisible(false)
              }
              className={({ isActive }) => `flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-bold tracking-wide transition ${isActive ? "bg-[#123d30] text-[#f7f1e7] shadow-lg" : "bg-white/70 text-[#123d30] hover:bg-[#f0e0c7]"}`}
              to="/cart"
            >

              <span>
                CART
              </span>

              {cartCount > 0 && (
                <span className="bg-black text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}

            </NavLink>

          </nav>

        </div>

      </div>

      {isLocationPickerOpen && (
        <div
          className="fixed inset-0 z-[4000] flex items-center justify-center bg-[#26121a]/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLocationPickerOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-picker-title"
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="location-picker-title" className="text-lg font-bold text-[#202124]">
                Select Location
              </h2>
              <button
                type="button"
                onClick={() => setIsLocationPickerOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#f5f6f7] text-xl text-[#65717c]"
                aria-label="Close location picker"
              >
                ×
              </button>
            </div>

            <form onSubmit={applySearchLocation} className="mt-4 flex gap-2 rounded-xl bg-[#f6f7f8] px-4 py-3 shadow-sm">
              <span aria-hidden="true" className="text-lg text-[#8492a0]">⌕</span>
              <input
                autoFocus
                value={locationSearch}
                onChange={(event) => setLocationSearch(event.target.value)}
                placeholder="Search for area, street name..."
                aria-label="Search for an area or street"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#82909f]"
              />
              {locationSearch.trim() && (
                <button type="submit" className="shrink-0 text-xs font-semibold text-[#7d2946]">
                  Use address
                </button>
              )}
            </form>

            {locationSearch.trim() && (
              <button
                type="button"
                onClick={applySearchLocation}
                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-[#344054] hover:bg-[#f8f3f4]"
              >
                Use “{locationSearch.trim()}”
              </button>
            )}

            <button
              type="button"
              onClick={() => selectLocation(
                "Gurugram Cyber City",
                "Cyber City, Gurugram, Haryana, India",
              )}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-[#faf7f8]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f5eaee] text-lg text-[#7d2946]" aria-hidden="true">
                ⌖
              </span>
              <span>
                <span className="block text-sm font-bold text-[#202124]">Gurugram Cyber City</span>
                <span className="mt-0.5 block text-xs text-[#8492a0]">Cyber City, Gurugram, Haryana, India</span>
              </span>
            </button>

            <button
              type="button"
              onClick={locateMe}
              disabled={isLocating}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-[#faf7f8] disabled:cursor-wait disabled:opacity-60"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f5eaee] text-lg text-[#7d2946]" aria-hidden="true">
                ⊙
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-[#202124]">{isLocating ? "Finding your location…" : "Use current location"}</span>
                <span className="mt-0.5 block text-xs text-[#8492a0]">Allow your browser to access your location</span>
              </span>
              <span aria-hidden="true" className="text-lg text-[#a1aab4]">{isLocating ? "…" : "›"}</span>
            </button>

            <div className="mt-2 border-t border-[#edf0f2] pt-5 text-center">
              {token && currentUser ? (
                savedAddress ? (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8492a0]">Saved address</p>
                    <button
                      type="button"
                      onClick={() => selectLocation(savedAddress, savedAddress)}
                      className="mx-auto max-w-full rounded-xl px-4 py-3 text-sm font-medium text-[#344054] hover:bg-[#f6f7f8]"
                    >
                      {savedAddress}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-[#667085]">You have no saved delivery address yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLocationPickerOpen(false);
                        setVisible(false);
                        navigate("/my-profile");
                      }}
                      className="mt-3 rounded-lg bg-[#7d2946] px-6 py-3 text-sm font-semibold text-white"
                    >
                      Add address to profile
                    </button>
                  </>
                )
              ) : (
                <>
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f6f7f8] text-xl text-[#98a2b3]" aria-hidden="true">
                    ♙
                  </span>
                  <p className="mt-4 text-sm text-[#667085]">
                    Log in to view your saved addresses
                    <br />
                    and speed up checkout.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocationPickerOpen(false);
                      setVisible(false);
                      navigate("/login");
                    }}
                    className="mt-4 rounded-lg bg-[#7d2946] px-8 py-3 text-sm font-semibold text-white shadow-sm"
                  >
                    Log In
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default Navbar;
