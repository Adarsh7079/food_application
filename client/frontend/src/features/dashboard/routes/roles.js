export function getRole(user) {
  const roles = (user?.roles || (user?.role ? [user.role] : []))
    .map((role) => role.toLowerCase().replaceAll("_", ""));
  if (roles.includes("superadmin")) return "superAdmin";
  if (roles.includes("restaurant")) return "restaurant";
  if (roles.includes("admin")) return "admin";
  return "customer";
}
