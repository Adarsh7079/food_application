import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyProfile, saveMyProfile } from "../store/features/profile/profileSlice";
import { locationAnalyticsConsentUpdated } from "../store/features/auth/authSlice";
import { getRole } from "../features/dashboard/routes/roles";
import { apiClient, getApiErrorMessage } from "../lib/apiClient";
import { deleteUploadedImage, uploadImage } from "../lib/imageUpload";

const Field = ({ label, name, value, onChange, editing, type = "text", required = false }) => (
  <label className="block text-xs font-semibold text-[#627168]">
    {label}
    {editing ? (
      <input name={name} type={type} value={value} onChange={onChange} required={required}
        className="mt-2 w-full rounded-xl border border-[#e5dfd4] bg-white px-4 py-3 text-sm font-normal text-[#244638] outline-none transition focus:border-[#7fa58b] focus:ring-2 focus:ring-[#dbe9dd]" />
    ) : (
      <span className="mt-2 block min-h-11 rounded-xl bg-[#f8f7f3] px-4 py-3 text-sm font-normal text-[#33483c]">{value || "Not added yet"}</span>
    )}
  </label>
);

export default function MyProfile() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const authUser = useSelector((state) => state.auth.currentUser);
  const { data: profile, loading, saving, error } = useSelector((state) => state.profile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phoneNumber: "", address: "" });
  const [saved, setSaved] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [locationConsent, setLocationConsent] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);
  const [imageError, setImageError] = useState("");
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (token) dispatch(fetchMyProfile());
  }, [dispatch, token]);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || "", phoneNumber: profile.phoneNumber || "", address: profile.address || "" });
      setLocationConsent(profile.locationAnalyticsConsent === true);
    }
  }, [profile]);

  const onChange = (event) => {
    setSaved(false);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const updates = { name: form.name.trim(), address: form.address.trim() || null };
    if (form.phoneNumber.trim()) updates.phoneNumber = form.phoneNumber.trim();
    const result = await dispatch(saveMyProfile(updates));
    if (saveMyProfile.fulfilled.match(result)) {
      setEditing(false);
      setSaved(true);
    }
  };

  const updateLocationConsent = async (consent) => {
    setConsentSaving(true);
    setConsentError("");
    try {
      await apiClient.patch("/api/v1/user/me/location-consent", { consent });
      setLocationConsent(consent);
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...authUser, locationAnalyticsConsent: consent }),
      );
      dispatch(locationAnalyticsConsentUpdated(consent));
      setSaved(true);
    } catch (requestError) {
      setConsentError(getApiErrorMessage(requestError, "Could not update your location preference."));
    } finally {
      setConsentSaving(false);
    }
  };

  const updateProfileImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageSaving(true);
    setImageError("");
    let uploadedImage;
    try {
      uploadedImage = await uploadImage(file, { scope: "profile", token });
      await dispatch(saveMyProfile({
        profileImage: uploadedImage.url,
        profileImagePublicId: uploadedImage.publicId,
      })).unwrap();
      setSaved(true);
    } catch (requestError) {
      if (uploadedImage) {
        try {
          const currentProfile = await dispatch(fetchMyProfile()).unwrap();
          if (currentProfile.profileImagePublicId === uploadedImage.publicId) {
            setImageError(getApiErrorMessage(requestError, "Could not update your profile photo."));
            return;
          }
          await deleteUploadedImage({ publicId: uploadedImage.publicId, scope: "profile", token });
        } catch (cleanupError) {
          setImageError(`${getApiErrorMessage(requestError, "Could not update your profile photo.")} The new upload could not be removed: ${getApiErrorMessage(cleanupError, "Cloudinary deletion failed.")}`);
          setImageSaving(false);
          return;
        }
      }
      setImageError(getApiErrorMessage(requestError, "Could not update your profile photo."));
    } finally {
      setImageSaving(false);
    }
  };

  const removeProfileImage = async () => {
    setImageSaving(true);
    setImageError("");
    try {
      await dispatch(saveMyProfile({ profileImage: null, profileImagePublicId: null })).unwrap();
      setSaved(true);
    } catch (requestError) {
      setImageError(getApiErrorMessage(requestError, "Could not remove your profile photo."));
    } finally {
      setImageSaving(false);
    }
  };

  const displayUser = profile || authUser;
  const initials = (displayUser?.name || "Customer").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = getRole(displayUser) === "customer" ? "Customer" : getRole(displayUser);

  return <main className="mx-auto min-h-[65vh] max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#b47a2f]">Your account</p><h1 className="prata-regular text-3xl text-[#173b30] sm:text-4xl">My profile</h1><p className="mt-2 text-sm text-[#798078]">Keep your details up to date for a smoother ordering experience.</p></div>
      <Link to="/orders" className="rounded-full border border-[#cfd9ca] bg-white px-4 py-2.5 text-xs font-semibold text-[#31594b] transition hover:bg-[#f2f7f1]">View my orders →</Link>
    </div>

    <section className="overflow-hidden rounded-3xl border border-[#e8ddc8] bg-white shadow-[0_18px_50px_-36px_rgba(15,45,34,.35)]">
      <div className="bg-[#123d30] px-6 py-7 text-white sm:px-9">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative h-20 w-20">
            {displayUser?.profileImage ? <img src={displayUser.profileImage} alt="Profile" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/25" /> : <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#f3d7a1] text-xl font-semibold text-[#123d30]">{initials}</div>}
            {imageSaving && <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[#123d30]/80" role="status" aria-label="Updating profile photo">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            </div>}
            <button type="button" title={displayUser?.profileImage ? "Update or delete profile photo" : "Add profile photo"} aria-label={displayUser?.profileImage ? "Update or delete profile photo" : "Add profile photo"} disabled={imageSaving} onClick={() => displayUser?.profileImage ? setPhotoMenuOpen((open) => !open) : photoInputRef.current?.click()} className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full border-2 border-[#123d30] bg-white text-[#123d30] shadow-md transition hover:bg-[#f3d7a1] disabled:opacity-50">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m14.7 5.3 4 4M4 20l4.8-1 10.5-10.5a2.8 2.8 0 0 0-4-4L4.8 15 4 20Z" /></svg>
            </button>
            {photoMenuOpen && <div className="absolute left-full top-3 z-20 ml-3 w-36 overflow-hidden rounded-xl border border-[#d9e2d5] bg-white py-1 text-xs shadow-xl">
              <button type="button" onClick={() => { setPhotoMenuOpen(false); photoInputRef.current?.click(); }} className="block w-full px-4 py-2 text-left font-semibold text-[#337153] hover:bg-[#f3f8f3]">Update photo</button>
              <button type="button" onClick={() => { setPhotoMenuOpen(false); removeProfileImage(); }} className="block w-full px-4 py-2 text-left font-semibold text-[#9a493b] hover:bg-red-50">Delete photo</button>
            </div>}
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" disabled={imageSaving} onChange={updateProfileImage} className="sr-only" />
          </div>
          <div className="flex-1"><p className="text-xl font-semibold">{displayUser?.name || "Your account"}</p><p className="mt-1 text-sm text-white/65">{displayUser?.email || ""}</p></div>
          <span className="rounded-full border border-[#f3d7a1]/30 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#f3d7a1]">{roleLabel} account</span>
        </div>
      </div>

      <div className="p-6 sm:p-9">
        {loading && !profile ? <div className="py-10 text-center text-sm text-[#798078]">Loading your profile…</div> : <>
          {error && <div role="alert" className="mb-5 rounded-xl border border-[#f1d3cc] bg-[#fff3f0] px-4 py-3 text-sm text-[#9a493b]">{error}</div>}
          {imageError && <div role="alert" className="mb-5 rounded-xl border border-[#f1d3cc] bg-[#fff3f0] px-4 py-3 text-sm text-[#9a493b]">{imageError}</div>}
          {saved && <div role="status" className="mb-5 rounded-xl border border-[#d6e7d7] bg-[#f0f8f0] px-4 py-3 text-sm text-[#34704d]">Your profile has been updated.</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-5">
              <span className="text-xs text-[#858c84]">JPEG, PNG, or WebP · up to 5 MB</span>
            </div>
            <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-semibold text-[#244638]">Personal information</h2><p className="mt-1 text-xs text-[#858c84]">Your email is used for sign in and cannot be changed here.</p></div>{!editing && <button type="button" onClick={() => { setSaved(false); setEditing(true); }} className="rounded-full border border-[#d9e2d5] px-4 py-2 text-xs font-semibold text-[#337153] hover:bg-[#f3f8f3]">Edit profile</button>}</div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="name" value={editing ? form.name : displayUser?.name} onChange={onChange} editing={editing} required />
              <Field label="Email address" name="email" value={displayUser?.email} editing={false} type="email" />
              <Field label="Phone number" name="phoneNumber" value={editing ? form.phoneNumber : displayUser?.phoneNumber} onChange={onChange} editing={editing} type="tel" />
              <div className="sm:col-span-2"><Field label="Delivery address" name="address" value={editing ? form.address : displayUser?.address} onChange={onChange} editing={editing} /></div>
            </div>
            {editing && <div className="mt-7 flex flex-wrap gap-3"><button type="submit" disabled={saving} className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#1d4d3e] disabled:cursor-wait disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button><button type="button" onClick={() => { setEditing(false); setForm({ name: profile?.name || "", phoneNumber: profile?.phoneNumber || "", address: profile?.address || "" }); }} className="rounded-full border border-[#e5dfd4] px-5 py-3 text-xs font-semibold text-[#687269]">Cancel</button></div>}
          </form>
          {displayUser?.roles?.includes("CUSTOMER") && (
            <section className="mt-8 border-t border-[#f0ece4] pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-xl">
                  <h2 className="text-sm font-semibold text-[#244638]">Approximate login location</h2>
                  <p className="mt-1 text-xs leading-5 text-[#858c84]">
                    {locationConsent
                      ? "Location sharing is on. Only daily login counts for roughly 1 km areas are retained; your name and exact GPS are not stored. Turning this off stops future collection, but existing aggregate counts remain."
                      : "If enabled, your browser may share approximate location after sign-in. Restaurant partners and platform admins can see area-level counts."}
                  </p>
                  {consentError && <p role="alert" className="mt-2 text-xs text-red-700">{consentError}</p>}
                </div>
                <button
                  type="button"
                  disabled={consentSaving || loading}
                  onClick={() => updateLocationConsent(!locationConsent)}
                  className="rounded-full border border-[#d9e2d5] px-4 py-2.5 text-xs font-semibold text-[#31594b] disabled:opacity-50"
                >
                  {consentSaving ? "Saving…" : locationConsent ? "Turn off" : "Allow"}
                </button>
              </div>
            </section>
          )}
          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ece4] pt-6"><div><p className="text-sm font-semibold text-[#244638]">Want another meal?</p><p className="mt-1 text-xs text-[#858c84]">Browse the menu and find a new favourite.</p></div><Link to="/menu" className="rounded-full bg-[#f3d7a1] px-4 py-2.5 text-xs font-semibold text-[#123d30] hover:bg-[#efc77e]">Explore menu →</Link></div>
        </>}
      </div>
    </section>
  </main>;
}
