import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRole } from "./roles";
export default function RoleRoute({ allowed, children }) { const { token, currentUser, sessionStatus } = useSelector((state) => state.auth); if (sessionStatus === "loading") return <div className="grid min-h-[50vh] place-items-center text-sm text-[#798078]">Restoring your session…</div>; if (!token) return <Navigate to="/login" replace />; const role = getRole(currentUser); return allowed.includes(role) ? children : <Navigate to={role === "customer" ? "/" : "/dashboard/" + (role === "superAdmin" ? "super-admin" : role)} replace />; }
