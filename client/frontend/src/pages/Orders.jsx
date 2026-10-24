import { useCallback, useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContextContext";
import Title from "../components/Title";
import { apiClient, getApiErrorMessage } from "../lib/apiClient";
import { useSelector } from "react-redux";

const Orders = () => {
  const { currency, navigate } = useContext(ShopContext);
  const token = useSelector((state) => state.auth.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/v1/orders/me");
      setOrders(response.data.data || []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load your orders."));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  return <div className="min-h-[60vh] border-t pt-12 pb-20">
    <div className="flex flex-wrap items-end justify-between gap-4"><div className="text-2xl"><Title text1="MY" text2="ORDERS"/><p className="mt-2 text-sm text-[#798078]">Track the progress of your recent orders.</p></div><button onClick={loadOrders} disabled={loading} className="rounded-full border border-[#d9e2d5] px-4 py-2 text-xs font-semibold text-[#31594b] disabled:opacity-50">{loading ? "Refreshing…" : "Refresh orders"}</button></div>
    {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading ? <p className="mt-8 text-sm text-gray-500">Loading your orders…</p> : orders.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[#d9e2d5] bg-white p-10 text-center"><p className="font-semibold text-[#244638]">No orders yet</p><p className="mt-2 text-sm text-[#798078]">Your orders will appear here after checkout.</p><button onClick={() => navigate("/menu")} className="mt-5 rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white">Browse menu</button></div> : <div className="mt-7 space-y-4">{orders.map((order) => <article key={order._id} className="overflow-hidden rounded-2xl border border-[#e8ddc8] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece4] bg-[#fbfaf7] px-5 py-4"><div><p className="text-sm font-semibold text-[#244638]">{order.restaurant?.name || "Restaurant order"}</p><p className="mt-1 text-xs text-[#858c84]">Order #{order._id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleString()}</p></div><span className="rounded-full bg-[#e8f3e9] px-3 py-1.5 text-[10px] font-semibold capitalize text-[#34704d]">{order.status?.replaceAll("_", " ").toLowerCase()}</span></div><div className="divide-y divide-[#f4f0e8] px-5">{order.items.map((item) => <div key={item.foodItem} className="flex items-center justify-between gap-4 py-3 text-sm"><div><p className="font-medium text-[#344a3d]">{item.name}</p><p className="mt-1 text-xs text-[#858c84]">Qty {item.quantity} · {currency}{item.unitPrice} each</p></div><p className="font-semibold text-[#344a3d]">{currency}{(item.quantity * item.unitPrice).toFixed(2)}</p></div>)}</div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ece4] px-5 py-4 text-xs"><p className="text-[#798078]">Cash on delivery · {order.deliveryAddress?.city}</p><p className="font-semibold text-[#183a30]">Total {currency}{order.total?.toFixed(2)}</p></div></article>)}</div>}
  </div>;
};
export default Orders;
