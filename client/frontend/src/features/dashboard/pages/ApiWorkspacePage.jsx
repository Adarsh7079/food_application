import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiClient as axios, getApiErrorMessage } from "../../../lib/apiClient";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PageHeading, SectionCard, StatusPill } from "../components/DashboardUI";
import { deleteUploadedImage, uploadImage } from "../../../lib/imageUpload";

const requestConfig = (token) => ({ headers: { Authorization: "Bearer " + token } });
const titles = { approvals: "Restaurant applications", restaurants: "Restaurant partners", users: "User accounts", orders: "Orders", menu: "Menu & availability", profile: "Restaurant profile", categories: "Menu categories" };

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
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userPageCount, setUserPageCount] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [expandedUserId, setExpandedUserId] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);

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
      } else if (section === "users" && role === "superAdmin") {
        const response = await axios.get("/api/v1/admin/users", {
          ...requestConfig(token),
          params: { page: userPage, limit: 25, ...(userSearch ? { search: userSearch } : {}) },
        });
        setRows(response.data.data.users || []);
        setUserPageCount(response.data.data.pagination.totalPages || 1);
        setExpandedUserId("");
        setExpandedUser(null);
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
  }, [reportError, role, section, token, userPage, userSearch]);

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
    const uploadedImages = [];
    try {
      for (const file of productImageFiles.slice(0, 8)) {
        uploadedImages.push(await uploadImage(file, { scope: "product", restaurantId: restaurant._id, token }));
      }
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        category: productForm.category,
        images: uploadedImages,
        image: uploadedImages[0]?.url || productForm.image || null,
        imagePublicId: uploadedImages[0]?.publicId || null,
      };
      const response = await axios.post("/api/v1/restaurants/" + restaurant._id + "/products", payload, requestConfig(token));
      setRows((current) => [response.data.data, ...current]);
      setShowAdd(false);
      setProductImageFiles([]);
      setProductForm({ name: "", description: "", price: "", category: "", image: "", foodType: "VEG" });
      setNotice("Dish added to your menu.");
    } catch (requestError) {
      await Promise.allSettled(uploadedImages.map((image) => deleteUploadedImage({ publicId: image.publicId, scope: "product", restaurantId: restaurant._id, token })));
      reportError(requestError, "Could not add this dish.");
    } finally { setSaving(false); }
  };

  const updateProductImages = async (item, file = null, removePublicId = null) => {
    setSaving(true); setError("");
    let uploaded;
    try {
      const currentImages = item.images?.length
        ? item.images
        : item.image ? [{ url: item.image, publicId: item.imagePublicId }] : [];
      if (file) {
        if (currentImages.length >= 8) throw new Error("A dish can have up to 8 photos.");
        uploaded = await uploadImage(file, { scope: "product", restaurantId: restaurant._id, token });
      }
      const nextImages = file
        ? [...currentImages.filter((image) => image.publicId), { url: uploaded.url, publicId: uploaded.publicId }]
        : currentImages.filter((image) => image.publicId !== removePublicId);
      const response = await axios.patch(
        `/api/v1/restaurants/${restaurant._id}/products/${item._id}/images`,
        { images: nextImages },
        requestConfig(token),
      );
      setRows((current) => current.map((entry) => entry._id === item._id ? response.data.data : entry));
      setNotice(file ? "Menu photo added." : "Menu photo removed.");
    } catch (requestError) {
      if (uploaded) await Promise.allSettled([deleteUploadedImage({ publicId: uploaded.publicId, scope: "product", restaurantId: restaurant._id, token })]);
      reportError(requestError, "Could not update this dish photo.");
    } finally { setSaving(false); }
  };

  const toggleUserDetails = async (user) => {
    if (expandedUserId === user._id) {
      setExpandedUserId("");
      setExpandedUser(null);
      return;
    }
    setExpandedUserId(user._id);
    setExpandedUser(null);
    try {
      const response = await axios.get(`/api/v1/admin/users/${user._id}`, requestConfig(token));
      setExpandedUser(response.data.data);
    } catch (requestError) {
      reportError(requestError, "Could not load user details.");
      setExpandedUserId("");
    }
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

    {section === "restaurants" && <SectionCard title="Restaurants" caption={`${rows.length} partner accounts`}><div className="divide-y divide-[#f0ece4]">{rows.map((item) => <div key={item._id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold text-[#244638]">{item.name}</p>{role === "superAdmin" && <><p className="mt-1 font-mono text-xs font-semibold tracking-wide text-[#31594b]">Restaurant No. {String(item.restaurantNumber).padStart(6, "0")}</p><p className="mt-1 break-all font-mono text-[10px] text-[#92968f]">Record ID: {item._id}</p></>}<p className="mt-1 text-xs text-[#798078]">{item.address?.city}, {item.address?.state} · {item.owner?.name || "Owner"}</p></div><div className="flex items-center gap-3"><StatusPill color={item.approvalStatus === "APPROVED" ? "green" : item.approvalStatus === "PENDING" ? "amber" : "gray"}>{item.approvalStatus?.toLowerCase()}</StatusPill><StatusPill color={item.operationalStatus === "ACTIVE" ? "green" : "gray"}>{item.operationalStatus?.toLowerCase()}</StatusPill>{role === "superAdmin" && <button disabled={saving} onClick={() => setSuspension(item, item.approvalStatus !== "SUSPENDED")} className="text-xs font-semibold text-[#9a493b]">{item.approvalStatus === "SUSPENDED" ? "Unsuspend" : "Suspend"}</button>}</div></div>{role === "superAdmin" && <details className="mt-4 text-xs text-[#52665d]"><summary className="cursor-pointer font-semibold text-[#337153]">View full restaurant details</summary><div className="mt-3 grid gap-2 rounded-xl bg-[#fbfaf7] p-4 sm:grid-cols-2"><p><b>Description:</b> {item.description || "Not provided"}</p><p><b>Owner email:</b> {item.owner?.email || "Not available"}</p><p><b>Contact:</b> {item.contactPhone || "Not provided"}</p><p><b>Address:</b> {["street", "city", "state", "postalCode", "country"].map((key) => item.address?.[key]).filter(Boolean).join(", ") || "Not provided"}</p><p><b>Approval:</b> {item.approvalStatus}{item.rejectionReason ? ` · ${item.rejectionReason}` : ""}</p><p><b>Operations:</b> {item.operationalStatus}{item.suspensionReason ? ` · ${item.suspensionReason}` : ""}</p><p><b>Coordinates:</b> {item.location?.latitude ?? "—"}, {item.location?.longitude ?? "—"}</p><p><b>Created:</b> {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</p>{item.logo && <a className="font-semibold text-[#337153] underline" href={item.logo} target="_blank" rel="noreferrer">Restaurant logo</a>}{item.coverImage && <a className="font-semibold text-[#337153] underline" href={item.coverImage} target="_blank" rel="noreferrer">Cover image</a>}</div></details>}</div>)}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">No restaurants found.</p>}</div></SectionCard>}

    {section === "users" && <SectionCard title="User accounts" caption="Private account details are visible only to super admins"><form onSubmit={(event) => { event.preventDefault(); setUserPage(1); setUserSearch(event.currentTarget.search.value.trim()); }} className="flex flex-wrap gap-2 border-b border-[#f0ece4] p-5"><input name="search" defaultValue={userSearch} placeholder="Search name, email, or phone" className="min-w-[220px] flex-1 rounded-xl border p-3 text-sm"/><button className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white">Search</button></form><div className="divide-y divide-[#f0ece4]">{rows.map((item) => <div key={item._id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3">{item.profileImage ? <img src={item.profileImage} alt="" className="h-11 w-11 rounded-full object-cover"/> : <div className="grid h-11 w-11 place-items-center rounded-full bg-[#e8f0e9] text-sm font-bold text-[#24503f]">{item.name?.slice(0, 1)}</div>}<div><p className="font-semibold text-[#244638]">{item.name}</p><p className="mt-1 text-xs text-[#798078]">{item.email}</p></div></div><button type="button" onClick={() => toggleUserDetails(item)} className="text-xs font-semibold text-[#337153]">{expandedUserId === item._id ? "Hide details" : "View details"}</button></div>{expandedUserId === item._id && (expandedUser ? <div className="mt-4 grid gap-2 rounded-xl bg-[#fbfaf7] p-4 text-xs text-[#52665d] sm:grid-cols-2"><p><b>Phone:</b> {expandedUser.phoneNumber || "Not provided"}</p><p><b>Address:</b> {expandedUser.address || "Not provided"}</p><p><b>Roles:</b> {expandedUser.roles?.join(", ") || "—"}</p><p><b>Account status:</b> {expandedUser.userStatus || "—"}</p><p><b>Email verified:</b> {expandedUser.emailVerifiedAt ? new Date(expandedUser.emailVerifiedAt).toLocaleString() : "No"}</p><p><b>Location analytics consent:</b> {expandedUser.locationAnalyticsConsent === null ? "Not set" : expandedUser.locationAnalyticsConsent ? "Allowed" : "Denied"}</p><p><b>Created:</b> {expandedUser.createdAt ? new Date(expandedUser.createdAt).toLocaleString() : "—"}</p><p><b>Updated:</b> {expandedUser.updatedAt ? new Date(expandedUser.updatedAt).toLocaleString() : "—"}</p></div> : <p className="mt-3 text-xs text-[#798078]">Loading account details…</p>)}</div>)}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">No user accounts found.</p>}</div><div className="flex items-center justify-between p-4 text-xs text-[#52665d]"><span>Page {userPage} of {userPageCount}</span><div className="flex gap-2"><button type="button" disabled={userPage <= 1} onClick={() => setUserPage((page) => page - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={userPage >= userPageCount} onClick={() => setUserPage((page) => page + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div></div></SectionCard>}

    {section === "categories" && <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><SectionCard title="Add a category" caption="Categories are used to organize restaurant menu items"><form onSubmit={submitCategory} className="p-5"><label className="text-xs font-semibold text-[#687269]">Category name<input required minLength={2} maxLength={60} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm" placeholder="For example, Main course"/></label><button disabled={saving} className="mt-4 rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Create category"}</button></form></SectionCard><SectionCard title="Active categories" caption={`${rows.length} categories available to restaurants`}><div className="divide-y divide-[#f0ece4]">{rows.map((category) => <div key={category._id} className="flex items-center justify-between p-4"><p className="text-sm font-medium text-[#244638]">{category.name}</p><StatusPill>Active</StatusPill></div>)}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">Create the first category to enable restaurant menu setup.</p>}</div></SectionCard></div>}

    {section === "menu" && restaurant && <>{showAdd && <SectionCard title="Add a menu item"><form onSubmit={submitProduct} className="grid gap-3 p-5 sm:grid-cols-2"><input required minLength={2} placeholder="Dish name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="rounded-xl border p-3 text-sm"/><input required type="number" min="1" step="0.01" placeholder="Price (₹)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="rounded-xl border p-3 text-sm"/><select required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="">Select category</option>{categories.map((category) => <option value={category._id} key={category._id}>{category.name}</option>)}</select><select value={productForm.foodType} onChange={(e) => setProductForm({ ...productForm, foodType: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="VEG">Vegetarian</option><option value="NON_VEG">Non vegetarian</option><option value="EGG">Egg</option></select><label className="rounded-xl border p-3 text-sm text-[#52665d] sm:col-span-2">Food photos (optional, up to 8)<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => setProductImageFiles(Array.from(event.target.files || []).slice(0, 8))} className="mt-2 block w-full text-xs"/></label><textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="rounded-xl border p-3 text-sm sm:col-span-2"/><button disabled={saving || categories.length === 0} className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50">{categories.length ? (saving ? "Saving…" : "Add dish") : "Add categories before creating dishes"}</button></form></SectionCard>}<SectionCard title="Menu items" caption={`${rows.length} items`}><div className="divide-y divide-[#f0ece4]">{rows.map((item) => { const gallery = item.images?.length ? item.images : item.image ? [{ url: item.image, publicId: item.imagePublicId }] : []; return <div key={item._id} className="flex flex-wrap items-start justify-between gap-4 p-5"><div className="min-w-40 flex-1"><p className="font-semibold text-[#244638]">{item.name}</p><p className="mt-1 text-xs text-[#798078]">{item.category?.name || "Menu item"} · ₹{item.price}</p><div className="mt-3 flex flex-wrap gap-2">{gallery.map((photo, index) => <div key={photo.publicId || photo.url} className="relative"><img src={photo.url} alt={`${item.name} ${index + 1}`} className="h-16 w-16 rounded-xl object-cover"/><button type="button" disabled={saving} onClick={() => updateProductImages(item, null, photo.publicId)} className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-red-600 text-xs text-white" aria-label={`Remove photo ${index + 1}`}>×</button></div>)}</div><label className="mt-3 block text-xs font-semibold text-[#337153]">{gallery.length ? "Add another photo" : "Add photos"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving || gallery.length >= 8} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) updateProductImages(item, file); }} className="mt-1 block w-full text-xs"/></label>{gallery.length >= 8 && <p className="mt-1 text-xs text-[#798078]">Maximum 8 photos reached.</p>}</div><button onClick={() => setAvailability(item)}><StatusPill color={item.isAvailable ? "green" : "gray"}>{item.isAvailable ? "Available" : "Paused"}</StatusPill></button></div>; })}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">No menu items yet. Add a category and then create your first dish.</p>}</div></SectionCard></>}

    {section === "profile" && restaurant && <SectionCard title="Restaurant details" caption="Updates to the name or address may require renewed admin approval"><form onSubmit={saveRestaurant} className="grid gap-4 p-5 sm:grid-cols-2"><label className="text-xs text-[#687269]">Name<input name="name" required defaultValue={restaurant.name} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs text-[#687269]">Contact phone<input name="contactPhone" defaultValue={restaurant.contactPhone || ""} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label><label className="text-xs text-[#687269] sm:col-span-2">Description<textarea name="description" defaultValue={restaurant.description || ""} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label>{["street", "city", "state", "postalCode", "country"].map((field) => <label key={field} className="text-xs capitalize text-[#687269]">{field}<input name={field} required defaultValue={restaurant.address?.[field] || ""} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label>)}<button disabled={saving} className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white">{saving ? "Saving…" : "Save restaurant details"}</button></form></SectionCard>}

    {section === "orders" && <SectionCard title={role === "restaurant" ? "Restaurant orders" : "Marketplace orders"} caption={`${rows.length} recent orders`}><div className="divide-y divide-[#f0ece4]">{rows.map((order) => <div key={order._id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold text-[#244638]">#{order._id.slice(-8).toUpperCase()} · {order.restaurant?.name || order.customer?.name || "Order"}</p><p className="mt-1 text-xs text-[#798078]">{order.items?.length || 0} items · ₹{order.total?.toFixed(2)} · {new Date(order.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-3"><StatusPill color={order.status === "DELIVERED" ? "green" : order.status === "CANCELLED" ? "red" : "blue"}>{order.status?.toLowerCase().replaceAll("_", " ")}</StatusPill>{role === "restaurant" && <select aria-label="Update order status" value={order.status} onChange={(e) => changeOrderStatus(order, e.target.value)} className="rounded-lg border px-3 py-2 text-xs"><option value="PLACED">Placed</option><option value="CONFIRMED">Confirmed</option><option value="PREPARING">Preparing</option><option value="OUT_FOR_DELIVERY">Out for delivery</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select>}</div></div>)}{rows.length === 0 && <p className="p-8 text-sm text-[#798078]">No orders found.</p>}</div></SectionCard>}
  </>}</>;
}
