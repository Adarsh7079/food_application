import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { apiClient, getApiErrorMessage } from "../../../lib/apiClient";
import { SectionCard } from "./DashboardUI";
import "leaflet/dist/leaflet.css";

const toDateInput = (date) => date.toISOString().slice(0, 10);
const initialFrom = toDateInput(new Date(Date.now() - 29 * 86400000));
const initialTo = toDateInput(new Date());

function FitMapToData({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }
    map.fitBounds(points, { padding: [28, 28], maxZoom: 12 });
  }, [map, points]);

  return null;
}

export default function LocationAnalyticsPanel() {
  const token = useSelector((state) => state.auth.token);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/v1/analytics/location-activity", {
        params: { from, to, search },
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load location analytics."));
    } finally {
      setLoading(false);
    }
  }, [from, to, search, token]);

  useEffect(() => {
    load();
  }, [load]);

  const points = useMemo(() => [
    ...(analytics?.loginLocations || []).map((item) => [item.latitude, item.longitude]),
    ...(analytics?.restaurantLocations || []).map((item) => [item.latitude, item.longitude]),
  ], [analytics]);

  const maxDailyCount = Math.max(
    1,
    ...(analytics?.dailyActivity || []).map((item) => item.loginCount),
  );

  const applySearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <SectionCard
      title="Location analytics"
      caption="Opted-in customer login activity and restaurant locations"
      action={<button type="button" onClick={load} disabled={loading} className="text-xs font-semibold text-[#337153] disabled:opacity-50">{loading ? "Loading…" : "Refresh"}</button>}
    >
      <div className="space-y-4 p-4 sm:p-5">
        <form onSubmit={applySearch} className="grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
          <label className="text-xs font-semibold text-[#52665d]">
            From
            <input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#e8ddc8] bg-white px-3 py-2 text-sm text-[#244638]" />
          </label>
          <label className="text-xs font-semibold text-[#52665d]">
            To
            <input type="date" value={to} min={from} max={initialTo} onChange={(event) => setTo(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#e8ddc8] bg-white px-3 py-2 text-sm text-[#244638]" />
          </label>
          <label className="text-xs font-semibold text-[#52665d]">
            Search area or restaurant
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Approximate coordinates or restaurant name" className="mt-1 block w-full rounded-lg border border-[#e8ddc8] bg-white px-3 py-2 text-sm text-[#244638]" />
          </label>
          <button type="submit" className="self-end rounded-lg bg-[#123d30] px-4 py-2.5 text-sm font-semibold text-white">Filter</button>
        </form>

        <p className="text-xs leading-5 text-[#798078]">
          Login locations are approximate (~1 km cells). Areas with fewer than {analytics?.privacyThreshold || 5} login events are hidden. Restaurant partners can view the same aggregate customer activity. Restaurant addresses are geocoded from the saved business address.
        </p>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="h-[360px] overflow-hidden rounded-2xl border border-[#e8ddc8] bg-[#f4ebdc] sm:h-[440px]">
          <MapContainer center={[22.5, 79]} zoom={5} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitMapToData points={points} />
            {(analytics?.loginLocations || []).map((item) => (
              <CircleMarker
                key={`login-${item.latitude}-${item.longitude}`}
                center={[item.latitude, item.longitude]}
                radius={Math.min(18, 7 + Math.log2(item.loginCount))}
                pathOptions={{ color: "#9a702d", fillColor: "#d9a74a", fillOpacity: 0.72, weight: 2 }}
              >
                <Popup>{item.loginCount} opted-in login events in this approximate area</Popup>
              </CircleMarker>
            ))}
            {(analytics?.restaurantLocations || []).map((item) => (
              <CircleMarker
                key={`restaurant-${item.id}`}
                center={[item.latitude, item.longitude]}
                radius={8}
                pathOptions={{ color: "#123d30", fillColor: "#2d6756", fillOpacity: 0.9, weight: 2 }}
              >
                <Popup>{item.name}{item.city ? ` · ${item.city}` : ""}</Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-[#52665d]">
          <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#d9a74a]" />Approximate login activity</span>
          <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#2d6756]" />Restaurant</span>
        </div>

        <section aria-label="Daily login activity" className="rounded-xl bg-[#fbfaf7] p-4">
          <h3 className="text-sm font-semibold text-[#244638]">Login events by day</h3>
          {loading ? (
            <p className="mt-3 text-xs text-[#798078]">Loading activity…</p>
          ) : analytics?.dailyActivity?.length ? (
            <div className="mt-4 flex h-36 items-end gap-1 overflow-x-auto border-b border-[#d9c9ab] pb-1">
              {analytics.dailyActivity.map((item) => (
                <div key={item.date} className="group relative flex h-full min-w-5 flex-1 flex-col items-center justify-end">
                  <span className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-[#123d30] px-2 py-1 text-[10px] text-white group-hover:block">
                    {item.date}: {item.loginCount}
                  </span>
                  <div
                    className="w-full min-w-3 rounded-t bg-[#d9a74a]"
                    style={{ height: `${Math.max(5, item.loginCount / maxDailyCount * 100)}%` }}
                    title={`${item.date}: ${item.loginCount} login events`}
                  />
                  <span className="mt-1 text-[8px] text-[#798078]">{item.date.slice(8)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-[#798078]">No areas meet the minimum privacy threshold for this date range.</p>
          )}
        </section>
      </div>
    </SectionCard>
  );
}
