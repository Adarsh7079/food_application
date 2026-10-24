import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShopContext } from "../context/ShopContextContext";
import { submitRestaurantApplication } from "../store/features/restaurant/restaurantSlice";

export default function PartnerApplication() {
  const dispatch = useDispatch();
  const { navigate } = useContext(ShopContext);
  const { submitting, error, application } = useSelector((state) => state.restaurant);
  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await dispatch(submitRestaurantApplication({
      name: form.get("name"), description: form.get("description"), contactPhone: form.get("contactPhone") || undefined,
      address: { street: form.get("street"), city: form.get("city"), state: form.get("state"), postalCode: form.get("postalCode"), country: form.get("country") },
    }));
    if (submitRestaurantApplication.fulfilled.match(result)) navigate("/dashboard/restaurant");
  };
  return <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-12 sm:px-8"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b47a2f]">Restaurant partners</p><h1 className="prata-regular mt-2 text-3xl text-[#173b30]">Bring your kitchen to ZaykaNest</h1><p className="mt-2 text-sm text-[#798078]">Submit your restaurant details. A super admin will review the application before it can accept orders.</p>{application && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">Application submitted. Approval status: {application.approvalStatus}.</p>}{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}<form onSubmit={submit} className="mt-7 grid gap-4 rounded-2xl border border-[#e8ddc8] bg-white p-6 sm:grid-cols-2"><label className="text-xs font-semibold text-[#627168]">Restaurant name<input required minLength={2} name="name" className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs font-semibold text-[#627168]">Contact phone<input name="contactPhone" type="tel" pattern="\+?[1-9]\d{7,14}" className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs font-semibold text-[#627168] sm:col-span-2">Description<textarea name="description" maxLength={1000} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs font-semibold text-[#627168] sm:col-span-2">Street address<input required name="street" minLength={2} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs font-semibold text-[#627168]">City<input required name="city" minLength={2} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs font-semibold text-[#627168]">State<input required name="state" minLength={2} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs font-semibold text-[#627168]">Postal code<input required name="postalCode" minLength={3} maxLength={12} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs font-semibold text-[#627168]">Country<input required name="country" defaultValue="India" minLength={2} maxLength={60} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><p className="text-xs leading-5 text-[#858c84] sm:col-span-2">You need to sign in and verify your email before submitting. Your restaurant starts in pending approval and offline status.</p><button disabled={submitting} className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white disabled:opacity-60 sm:col-span-2">{submitting ? "Submitting application…" : "Submit for review"}</button></form></main>;
}
