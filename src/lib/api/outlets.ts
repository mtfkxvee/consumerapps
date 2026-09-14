import { apiRequest, isApiConfigured, resolveImageUrl } from "./client";
import { mockOutlets } from "../mock-data";
import type { Outlet } from "../types";

export async function getOutlets(): Promise<Outlet[]> {
  if (!isApiConfigured()) return mockOutlets;
  const outlets = await apiRequest<Outlet[]>("/api/mobile/outlets");
  return outlets.map((o) => ({ ...o, image: o.image ? resolveImageUrl(o.image) : o.image }));
}
