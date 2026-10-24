import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiClient as axios, getApiErrorMessage } from "../../../lib/apiClient";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { PageHeading, SectionCard, StatCard, StatusPill } from "../components/DashboardUI";

const authConfig = (token) => ({ headers: { Authorization: "Bearer " + token } });

export default function ApiDashboardHome({ role }) {
  const token = useSelector((state) => state.auth.token);
  const [restaurant, setRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reportError = useCallback((requestError, fallback) => {
    const message = getApiErrorMessage(requestError, fallback);
    setError(message);
    toast.error(message);
  }, []);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (role === "restaurant") {
        const response = await axios.get("/api/v1/restaurants/me", authConfig(token));
        const owned = response.data.data || [];
        setRestaurant(owned[0] || null);
        if (owned[0]) {
          const [orderResponse, productResponse] = await Promise.all([
            axios.get("/api/v1/orders/restaurants/" + owned[0]._id, authConfig(token)),
            axios.get("/api/v1/restaurants/" + owned[0]._id + "/products", authConfig(token)),
          ]);
          setOrders(orderResponse.data.data || []); setProducts(productResponse.data.data || []);
        }
      } else {
        const requests = [
          axios.get("/api/v1/admin/restaurants", authConfig(token)),
          axios.get("/api/v1/admin/orders", authConfig(token)),
        ];
        const [restaurantResponse, orderResponse] = await Promise.all(requests);
        const allRestaurants = restaurantResponse.data.data || [];
        setRestaurants(allRestaurants);
        setOrders(orderResponse.data.data || []);
      }
    } catch (requestError) { reportError(requestError, "Could not load dashboard data."); }
    finally { setLoading(false); }
  }, [reportError, role, token]);
  useEffect(() => { load(); }, [load]);

  const toggleRestaurant = async () => {
    if (!restaurant) return;
    try {
      const operationalStatus = restaurant.operationalStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await axios.patch("/api/v1/restaurants/" + restaurant._id + "/operational-status", { operationalStatus }, authConfig(token));
      setRestaurant((current) => ({ ...current, ...response.data.data }));
    } catch (requestError) { reportError(requestError, "Could not update restaurant availability."); }
  };

  if (loading) return <div className="py-12 text-sm text-[#798078]">Loading live dashboard…</div>;
  const recentOrders = orders.slice(0, 5);
  if (role === "restaurant" && !restaurant) return <><PageHeading eyebrow="Restaurant workspace" title="Your restaurant workspace" description="Manage your partner account after submitting your restaurant application."/><div className="rounded-2xl border border-dashed border-[#d9e2d5] bg-white p-8"><p className="font-semibold text-[#244638]">No restaurant application found</p><Link to="/partner/apply" className="mt-4 inline-block rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white">Apply to join</Link></div></>;

  if (role === "restaurant") return <><PageHeading eyebrow="Restaurant workspace" title={restaurant.name} description={`${restaurant.address?.city || "Restaurant partner"} · ${restaurant.approvalStatus?.toLowerCase()} approval status`} action={<Link to="/dashboard/restaurant/orders" className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white">View orders →</Link>}/><div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e8ddc8] bg-white p-4"><div><p className="text-sm font-semibold text-[#244638]">Restaurant availability</p><p className="mt-1 text-xs text-[#798078]">{restaurant.approvalStatus === "APPROVED" ? (restaurant.operationalStatus === "ACTIVE" ? "Currently accepting orders" : "Currently not accepting orders") : "Restaurant must be approved before going live"}</p></div><button disabled={restaurant.approvalStatus !== "APPROVED"} onClick={toggleRestaurant} className="rounded-full bg-[#123d30] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">{restaurant.operationalStatus === "ACTIVE" ? "Pause orders" : "Go online"}</button></div><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Orders" value={orders.length} note="All restaurant orders" icon="▤"/><StatCard label="Active menu items" value={products.filter((product) => product.isAvailable).length} note={`${products.length} total items`} icon="◉"/><StatCard label="Approval status" value={restaurant.approvalStatus} note={restaurant.operationalStatus} icon="⌂" tone="gold"/></div><div className="mt-6"><OrderList orders={recentOrders} restaurantMode /></div></>;

  const pending = restaurants.filter((item) => item.approvalStatus === "PENDING").length;
  const pendingRestaurants = restaurants.filter((item) => item.approvalStatus === "PENDING");
  const liveCount = restaurants.filter((item) => item.operationalStatus === "ACTIVE").length;
  const visibleRestaurants = role === "superAdmin" ? pendingRestaurants : restaurants;
  return <><PageHeading eyebrow={role === "superAdmin" ? "Platform control" : "Operations"} title={role === "superAdmin" ? "Platform overview" : "Operations overview"} description="Live overview from restaurant, approval, and order records." action={<Link to={role === "superAdmin" ? "/dashboard/super-admin/approvals" : "/dashboard/admin/restaurants"} className="rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white">{role === "superAdmin" ? "Review applications" : "Manage restaurants"} →</Link>}/>{error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label={role === "superAdmin" ? "Pending applications" : "Restaurants"} value={role === "superAdmin" ? pending : restaurants.length} note="Live from the platform API" icon="⌂" tone="gold"/><StatCard label="Live restaurants" value={liveCount} note="Currently accepting orders" icon="◉"/><StatCard label="Orders" value={orders.length} note="Recent order records" icon="▤"/><StatCard label="Delivered" value={orders.filter((order) => order.status === "DELIVERED").length} note="Completed orders" icon="✓"/></div><div className="mt-6 grid gap-6 xl:grid-cols-2"><SectionCard title="Recent orders" caption="Latest marketplace activity" action={<Link to="/dashboard/admin/orders" className="text-xs font-semibold text-[#337153]">View orders →</Link>}><OrderList orders={recentOrders}/></SectionCard><SectionCard title={role === "superAdmin" ? "Pending applications" : "Restaurant partners"} caption={role === "superAdmin" ? `${pending} application${pending === 1 ? "" : "s"} awaiting review` : "Current records from the admin API"} action={<Link to={role === "superAdmin" ? "/dashboard/super-admin/approvals" : "/dashboard/admin/restaurants"} className="text-xs font-semibold text-[#337153]">{role === "superAdmin" ? "Review all →" : "View all →"}</Link>}><div className="divide-y divide-[#f0ece4]">{visibleRestaurants.slice(0, 5).map((item) => <div key={item._id} className="flex items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-medium text-[#294839]">{item.name}</p>{role === "superAdmin" && <p className="mt-1 font-mono text-[10px] font-semibold tracking-wide text-[#31594b]">Restaurant No. {String(item.restaurantNumber).padStart(6, "0")}</p>}<p className="mt-1 text-xs text-[#818980]">{item.address?.city || ""}</p></div><StatusPill color={item.approvalStatus === "APPROVED" ? "green" : item.approvalStatus === "PENDING" ? "amber" : "gray"}>{item.approvalStatus?.toLowerCase()}</StatusPill></div>)}{visibleRestaurants.length === 0 && <p className="p-5 text-sm text-[#798078]">{role === "superAdmin" ? "No restaurant applications are waiting for approval." : "No restaurants to show."}</p>}</div></SectionCard></div></>;
}

function OrderList({ orders, restaurantMode = false }) {
  if (!orders.length) return <p className="p-5 text-sm text-[#798078]">No orders found.</p>;
  return <div className="divide-y divide-[#f0ece4]">{orders.map((order) => <div key={order._id} className="flex items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-semibold text-[#294839]">#{order._id.slice(-8).toUpperCase()} · {restaurantMode ? order.customer?.name || "Customer" : order.restaurant?.name || "Restaurant"}</p><p className="mt-1 text-xs text-[#818980]">{order.items?.length || 0} items · ₹{order.total?.toFixed(2)}</p></div><StatusPill color={order.status === "DELIVERED" ? "green" : order.status === "CANCELLED" ? "red" : "blue"}>{order.status?.toLowerCase().replaceAll("_", " ")}</StatusPill></div>)}</div>;
}
