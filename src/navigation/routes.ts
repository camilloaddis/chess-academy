export type Route =
  | { page: "home" | "path" | "review" }
  | { page: "lesson" | "complete"; id: string };
export function readRoute(): Route {
  const [page, id] = location.hash.slice(1).split("/");
  if ((page === "lesson" || page === "complete") && id) return { page, id };
  if (page === "path" || page === "review") return { page };
  return { page: "home" };
}
export function navigate(route: Route) {
  location.hash = route.page + ("id" in route ? "/" + route.id : "");
}
