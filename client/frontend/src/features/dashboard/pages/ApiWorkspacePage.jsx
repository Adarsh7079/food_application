import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiClient as axios, getApiErrorMessage } from "../../../lib/apiClient";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PageHeading, SectionCard, StatusPill } from "../components/DashboardUI";

const requestConfig = (token) => ({ headers: { Authorization: "Bearer " + token } });
const titles = { approvals: "Restaurant applications", restaurants: "Restaurant partners", orders: "Orders", menu: "Menu & availability", profile: "Restaurant profile", categories: "Menu categories" };

export default function ApiWorkspacePage({ role, section }) {
  const token = useSelector((state) => state.auth.token);
  const [rows, setRows] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", category: "", image: "", foodType: "VEG" });
  const [categoryName, setCategoryName] = useState("");

  const reportError = useCallback((requestError, fallback) => {
    const message = getApiErrorMessage(requestError, fallback);
    setError(message);
    toast.error(message);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      if (role === "restaurant") {
        const response = await axios.get("/api/v1/restaurants/me", requestConfig(token));
        const owned = response.data.data || [];
        const selected = owned[0] || null;
        setRestaurant(selected);
        if (selected && section === "menu") {
          const [itemsResponse, categoryResponse] = await Promise.all([
            axios.get("/api/v1/restaurants/" + selected._id + "/products", requestConfig(token)),
            axios.get("/api/v1/categories"),
          ]);
          setRows(itemsResponse.data.data || []); setCategories(categoryResponse.data.data || []);
        } else if (selected && section === "orders") {
          const ordersResponse = await axios.get("/api/v1/orders/restaurants/" + selected._id, requestConfig(token));
          setRows(ordersResponse.data.data || []);
        }
      } else if (section === "orders" && role === "admin") {
        const response = await axios.get("/api/v1/admin/orders", requestConfig(token));
        setRows(response.data.data || []);
      } else if (section === "categories") {
        const response = await axios.get("/api/v1/categories");
        setRows(response.data.data || []);
      } else if (section === "approvals") {
        const response = await axios.get("/api/v1/admin/restaurants", { ...requestConfig(token), params: { approvalStatus: "PENDING" } });
        setRows(response.data.data || []);
      } else if (section === "restaurants") {
        const response = await axios.get("/api/v1/admin/restaurants", requestConfig(token));
        setRows(response.data.data || []);
      }
    } catch (requestError) {
      reportError(requestError, "Could not load this workspace data.");
    } finally { setLoading(false); }
  }, [reportError, role, section, token]);

  useEffect(() => { load(); }, [load]);

  const review = async (item, approvalStatus) => {
    setSaving(true); setError(""); setNotice("");
    try {
      const body = approvalStatus === "REJECTED" ? { approvalStatus, rejectionReason: "The application needs more information before approval." } : { approvalStatus };
      const response = await axios.patch("/api/v1/admin/restaurants/" + item._id + "/approval", body, requestConfig(token));
      setNotice(response.data.message || (item.name + " was reviewed."));
      setRows((current) => current.filter((entry) => entry._id !== item._id));
    } catch (requestError) { reportError(requestError, "Could not update this application."); }
    finally { setSaving(false); }
  };

  const setSuspension = async (item, suspend) => {
    setSaving(true); setError("");
    try {
      const body = suspend ? { isSuspended: true, reason: "Temporarily suspended by platform administration." } : { isSuspended: false };
      await axios.patch("/api/v1/admin/restaurants/" + item._id + "/suspension", body, requestConfig(token));
      await load(); setNotice(suspend ? "Restaurant suspended." : "Restaurant returned to pending review.");
    } catch (requestError) { reportError(requestError, "Could not update restaurant status."); }
    finally { setSaving(false); }
  };

  const setAvailability = async (item) => {
    try {
      await axios.patch("/api/v1/restaurants/" + restaurant._id + "/products/" + item._id + "/availability", { restaurantId: restaurant._id, isAvailable: !item.isAvailable }, requestConfig(token));
      setRows((current) => current.map((entry) => entry._id === item._id ? { ...entry, isAvailable: !entry.isAvailable } : entry));
    } catch (requestError) { reportError(requestError, "Could not update dish availability."); }
  };

  const submitProduct = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...productForm, price: Number(productForm.price), category: productForm.category, image: productForm.image || null };
      const response = await axios.post("/api/v1/restaurants/" + restaurant._id + "/products", payload, requestConfig(token));
      setRows((current) => [response.data.data, ...current]); setShowAdd(false); setNotice("Dish added to your menu.");
    } catch (requestError) { reportError(requestError, "Could not add this dish."); }
    finally { setSaving(false); }
  };

  const changeOrderStatus = async (order, status) => {
    try {
      const response = await axios.patch("/api/v1/orders/restaurants/" + restaurant._id + "/" + order._id + "/status", { status, ...(status === "CANCELLED" ? { cancellationReason: "Cancelled by restaurant." } : {}) }, requestConfig(token));
      setRows((current) => current.map((entry) => entry._id === order._id ? response.data.data : entry));
    } catch (requestError) { reportError(requestError, "Could not update this order."); }
  };

  const saveRestaurant = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      restaurantId: restaurant._id,
      name: form.get("name"), description: form.get("description"), contactPhone: form.get("contactPhone") || null,
      address: { street: form.get("street"), city: form.get("city"), state: form.get("state"), postalCode: form.get("postalCode"), country: form.get("country") },
    };
    try {
      const response = await axios.patch("/api/v1/restaurants/me", payload, requestConfig(token));
      setRestaurant(response.data.data); setNotice(response.data.message || "Restaurant profile saved.");
    } catch (requestError) { reportError(requestError, "Could not save the restaurant profile."); }
    finally { setSaving(false); }
  };

  const submitCategory = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await axios.post("/api/v1/admin/categories", { name: categoryName }, requestConfig(token));
      setRows((current) => [...current, response.data.data].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName(""); setNotice("Category created.");
    } catch (requestError) { reportError(requestError, "Could not create the category."); }
    finally { setSaving(false); }
  };

  const heading = <PageHeading eyebrow={role === "superAdmin" ? "Platform control" : role === "restaurant" ? "Restaurant workspace" : "Operations"} title={titles[section] || "Workspace"} description={section === "approvals" ? "Review restaurant applications and decide which partners join the marketplace." : section === "menu" ? "Manage dishes and their availability in your live menu." : section === "profile" ? "Edit the restaurant information shown to customers." : section === "orders" ? "Review order activity and update fulfilment status." : "Manage marketplace partners using live platform data."} action={section === "menu" && restaurant ? <button onClick={() => setShowAdd((open) => !open)} className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white">{showAdd ? "Close form" : "+ Add a dish"}</button> : null} />;

  return <>{heading}{notice && <p role="status" className="mb-4 rounded-xl bg-[#e8f3e9] p-3 text-sm text-[#34704d]">{notice}</p>}{error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading ? <p className="py-10 text-sm text-[#798078]">Loading live data…</p> : <>
    {role === "restaurant" && !restaurant && <section className="rounded-2xl border border-dashed border-[#d9e2d5] bg-white p-8"><h2 className="font-semibold text-[#244638]">No restaurant linked to this account</h2><p className="mt-2 text-sm text-[#798078]">Submit a restaurant application to start the approval process.</p><Link className="mt-4 inline-block rounded-full bg-[#123d30] px-4 py-2 text-xs font-semibold text-white" to="/partner/apply">Apply to join</Link></section>}

    {section === "approvals" && <SectionCard title="Pending applications" caption={`${rows.length} application${rows.length === 1 ? "" : "s"} awaiting review`}><div className="divide-y divide-[#f0ece4]">{rows.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold text-[#244638]">{item.name}</p><p className="mt-1 font-mono text-xs font-semibold tracking-wide text-[#31594b]">Restaurant No. {String(item.restaurantNumber).padStart(6, "0")}</p><p className="mt-1 break-all font-mono text-[10px] text-[#92968f]">Record ID: {item._id}</p><p className="mt-1 text-xs text-[#798078]">{item.address?.city}, {item.address?.state} · {item.owner?.name || "Owner"}</p><p className="mt-1 text-xs text-[#92968f]">Submitted {new Date(item.createdAt).toLocaleDateString()}</p></div><div className="flex gap-2"><button disabled={saving} onClick={() => review(item, "REJECTED")} className="rounded-full border border-[#e7dcd6] px-4 py-2 text-xs font-semibold text-[#9a493b]">Reject</button><button disabled={saving} onClick={() => review(item, "APPROVED")} className="rounded-full bg-[#123d30] px-4 py-2 text-xs font-semibold text-white">Approve</button></div></div>)}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">No pending restaurant applications.</p>}</div></SectionCard>}

    {section === "restaurants" && <SectionCard title="Restaurants" caption={`${rows.length} partner accounts`}><div className="divide-y divide-[#f0ece4]">{rows.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold text-[#244638]">{item.name}</p>{role === "superAdmin" && <><p className="mt-1 font-mono text-xs font-semibold tracking-wide text-[#31594b]">Restaurant No. {String(item.restaurantNumber).padStart(6, "0")}</p><p className="mt-1 break-all font-mono text-[10px] text-[#92968f]">Record ID: {item._id}</p></>}<p className="mt-1 text-xs text-[#798078]">{item.address?.city}, {item.address?.state} · {item.owner?.name || "Owner"}</p></div><div className="flex items-center gap-3"><StatusPill color={item.approvalStatus === "APPROVED" ? "green" : item.approvalStatus === "PENDING" ? "amber" : "gray"}>{item.approvalStatus?.toLowerCase()}</StatusPill><StatusPill color={item.operationalStatus === "ACTIVE" ? "green" : "gray"}>{item.operationalStatus?.toLowerCase()}</StatusPill>{role === "superAdmin" && <button disabled={saving} onClick={() => setSuspension(item, item.approvalStatus !== "SUSPENDED")} className="text-xs font-semibold text-[#9a493b]">{item.approvalStatus === "SUSPENDED" ? "Unsuspend" : "Suspend"}</button>}</div></div>)}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">No restaurants found.</p>}</div></SectionCard>}

    {section === "categories" && <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><SectionCard title="Add a category" caption="Categories are used to organize restaurant menu items"><form onSubmit={submitCategory} className="p-5"><label className="text-xs font-semibold text-[#687269]">Category name<input required minLength={2} maxLength={60} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm" placeholder="For example, Main course"/></label><button disabled={saving} className="mt-4 rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Create category"}</button></form></SectionCard><SectionCard title="Active categories" caption={`${rows.length} categories available to restaurants`}><div className="divide-y divide-[#f0ece4]">{rows.map((category) => <div key={category._id} className="flex items-center justify-between p-4"><p className="text-sm font-medium text-[#244638]">{category.name}</p><StatusPill>Active</StatusPill></div>)}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">Create the first category to enable restaurant menu setup.</p>}</div></SectionCard></div>}

    {section === "menu" && restaurant && <>{showAdd && <SectionCard title="Add a menu item"><form onSubmit={submitProduct} className="grid gap-3 p-5 sm:grid-cols-2"><input required minLength={2} placeholder="Dish name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="rounded-xl border p-3 text-sm"/><input required type="number" min="1" step="0.01" placeholder="Price (₹)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="rounded-xl border p-3 text-sm"/><select required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="">Select category</option>{categories.map((category) => <option value={category._id} key={category._id}>{category.name}</option>)}</select><select value={productForm.foodType} onChange={(e) => setProductForm({ ...productForm, foodType: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="VEG">Vegetarian</option><option value="NON_VEG">Non vegetarian</option><option value="EGG">Egg</option></select><input placeholder="Image URL (optional)" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="rounded-xl border p-3 text-sm sm:col-span-2"/><textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="rounded-xl border p-3 text-sm sm:col-span-2"/><button disabled={saving || categories.length === 0} className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50">{categories.length ? (saving ? "Saving…" : "Add dish") : "Add categories before creating dishes"}</button></form></SectionCard>}<SectionCard title="Menu items" caption={`${rows.length} items`}><div className="divide-y divide-[#f0ece4]">{rows.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold text-[#244638]">{item.name}</p><p className="mt-1 text-xs text-[#798078]">{item.category?.name || "Menu item"} · ₹{item.price}</p></div><button onClick={() => setAvailability(item)}><StatusPill color={item.isAvailable ? "green" : "gray"}>{item.isAvailable ? "Available" : "Paused"}</StatusPill></button></div>)}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">No menu items yet. Add a category and then create your first dish.</p>}</div></SectionCard></>}

    {section === "profile" && restaurant && <SectionCard title="Restaurant details" caption="Updates to the name or address may require renewed admin approval"><form onSubmit={saveRestaurant} className="grid gap-4 p-5 sm:grid-cols-2"><label className="text-xs text-[#687269]">Name<input name="name" required defaultValue={restaurant.name} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs text-[#687269]">Contact phone<input name="contactPhone" defaultValue={restaurant.contactPhone || ""} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs text-[#687269] sm:col-span-2">Description<textarea name="description" defaultValue={restaurant.description || ""} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label>{["street", "city", "state", "postalCode", "country"].map((field) => <label key={field} className="text-xs capitalize text-[#687269]">{field}<input name={field} required defaultValue={restaurant.address?.[field] || ""} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label>)}<button disabled={saving} className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white">{saving ? "Saving…" : "Save restaurant details"}</button></form></SectionCard>}

    {section === "orders" && <SectionCard title={role === "restaurant" ? "Restaurant orders" : "Marketplace orders"} caption={`${rows.length} recent orders`}><div className="divide-y divide-[#f0ece4]">{rows.map((order) => <div key={order._id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold text-[#244638]">#{order._id.slice(-8).toUpperCase()} · {order.restaurant?.name || order.customer?.name || "Order"}</p><p className="mt-1 text-xs text-[#798078]">{order.items?.length || 0} items · ₹{order.total?.toFixed(2)} · {new Date(order.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-3"><StatusPill color={order.status === "DELIVERED" ? "green" : order.status === "CANCELLED" ? "red" : "blue"}>{order.status?.toLowerCase().replaceAll("_", " ")}</StatusPill>{role === "restaurant" && <select aria-label="Update order status" value={order.status} onChange={(e) => changeOrderStatus(order, e.target.value)} className="rounded-lg border px-3 py-2 text-xs"><option value="PLACED">Placed</option><option value="CONFIRMED">Confirmed</option><option value="PREPARING">Preparing</option><option value="OUT_FOR_DELIVERY">Out for delivery</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select>}</div></div>)}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">No orders found.</p>}</div></SectionCard>}
  </>}</>;
}
