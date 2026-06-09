import axiosInstance, { fetcher, endpoints } from "../utils/axios";
import useSWR, { mutate } from "swr";

export const swrFetcher = (url) => fetcher(url);

// ── Category API ──

export const fetchCategories = (params = {}) =>
  fetcher([endpoints.category, { params }]);

export const createCategory = (data) =>
  axiosInstance.post(endpoints.category, data).then((r) => r.data);

export const updateCategory = (id, data) =>
  axiosInstance.patch(`${endpoints.category}${id}/`, data).then((r) => r.data);

export const deleteCategory = (id) =>
  axiosInstance.delete(`${endpoints.category}${id}/`).then((r) => r.data);

// SWR key builder for categories list (used for mutate)
export const categoriesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.category}?${qs}` : endpoints.category;
};

// ── Product API ──

export const fetchProducts = (params = {}) =>
  fetcher([endpoints.products, { params }]);

export const createProduct = (data) =>
  axiosInstance.post(endpoints.productPost, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateProduct = (id, data) =>
  axiosInstance.patch(`${endpoints.products}${id}/`, data).then((r) => r.data);

export const deleteProduct = (id) =>
  axiosInstance.delete(`${endpoints.products}${id}/`).then((r) => r.data);

// ── Dashboard API ──

export const fetchDashboardSalesSummary = (params = {}) =>
  fetcher([endpoints.dashboard.salesSummary, { params }]);

// ── Branch / Company API ──

export const fetchAccessibleBranches = () =>
  fetcher(endpoints.accessibleBranches);

export const fetchCompanyStructure = (companyId) =>
  fetcher(endpoints.companyStructure(companyId));

// ── Auth ──

export const loginUser = (username, password) =>
  axiosInstance.post(endpoints.auth.login, { username, password }).then((r) => r.data);

export const fetchProfile = () => fetcher(endpoints.auth.profile);
