import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyProfile, saveMyProfile } from "../store/features/profile/profileSlice";
import { getRole } from "../features/dashboard/routes/roles";

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

  useEffect(() => {
    if (token) dispatch(fetchMyProfile());
  }, [dispatch, token]);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || "", phoneNumber: profile.phoneNumber || "", address: profile.address || "" });
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
          {displayUser?.profileImage ? <img src={displayUser.profileImage} alt="Profile" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/25" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f3d7a1] text-xl font-semibold text-[#123d30]">{initials}</div>}
          <div className="flex-1"><p className="text-xl font-semibold">{displayUser?.name || "Your account"}</p><p className="mt-1 text-sm text-white/65">{displayUser?.email || ""}</p></div>
          <span className="rounded-full border border-[#f3d7a1]/30 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#f3d7a1]">{roleLabel} account</span>
        </div>
      </div>

      <div className="p-6 sm:p-9">
        {loading && !profile ? <div className="py-10 text-center text-sm text-[#798078]">Loading your profile…</div> : <>
          {error && <div role="alert" className="mb-5 rounded-xl border border-[#f1d3cc] bg-[#fff3f0] px-4 py-3 text-sm text-[#9a493b]">{error}</div>}
          {saved && <div role="status" className="mb-5 rounded-xl border border-[#d6e7d7] bg-[#f0f8f0] px-4 py-3 text-sm text-[#34704d]">Your profile has been updated.</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-semibold text-[#244638]">Personal information</h2><p className="mt-1 text-xs text-[#858c84]">Your email is used for sign in and cannot be changed here.</p></div>{!editing && <button type="button" onClick={() => { setSaved(false); setEditing(true); }} className="rounded-full border border-[#d9e2d5] px-4 py-2 text-xs font-semibold text-[#337153] hover:bg-[#f3f8f3]">Edit profile</button>}</div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="name" value={editing ? form.name : displayUser?.name} onChange={onChange} editing={editing} required />
              <Field label="Email address" name="email" value={displayUser?.email} editing={false} type="email" />
              <Field label="Phone number" name="phoneNumber" value={editing ? form.phoneNumber : displayUser?.phoneNumber} onChange={onChange} editing={editing} type="tel" />
              <div className="sm:col-span-2"><Field label="Delivery address" name="address" value={editing ? form.address : displayUser?.address} onChange={onChange} editing={editing} /></div>
            </div>
            {editing && <div className="mt-7 flex flex-wrap gap-3"><button type="submit" disabled={saving} className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#1d4d3e] disabled:cursor-wait disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button><button type="button" onClick={() => { setEditing(false); setForm({ name: profile?.name || "", phoneNumber: profile?.phoneNumber || "", address: profile?.address || "" }); }} className="rounded-full border border-[#e5dfd4] px-5 py-3 text-xs font-semibold text-[#687269]">Cancel</button></div>}
          </form>
          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ece4] pt-6"><div><p className="text-sm font-semibold text-[#244638]">Want another meal?</p><p className="mt-1 text-xs text-[#858c84]">Browse the menu and find a new favourite.</p></div><Link to="/menu" className="rounded-full bg-[#f3d7a1] px-4 py-2.5 text-xs font-semibold text-[#123d30] hover:bg-[#efc77e]">Explore menu →</Link></div>
        </>}
      </div>
    </section>
  </main>;
}
