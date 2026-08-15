import type { ApiListing, ListingView } from "@/types/listing";

const fallbackImages = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
];

let apiBase = __ZUJI_API_BASE_URL__.replace(/\/$/, "");
// #ifdef H5
apiBase = "";
// #endif

export const API_BASE_URL = apiBase;

export function absoluteAssetUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function toListingView(listing: ApiListing, index = 0): ListingView {
  const uploaded = (listing.imageUrls || []).filter(Boolean).map(absoluteAssetUrl);
  const images = uploaded.length ? uploaded : fallbackImages.map((_, imageIndex) => fallbackImages[(index + imageIndex) % fallbackImages.length]);
  return {
    ...listing,
    price: listing.monthlyRentCents / 100,
    images,
    image: images[0],
  };
}

function request<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${path}`,
      method: "GET",
      timeout: 10000,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data as T);
          return;
        }
        const data = response.data as { error?: string } | undefined;
        reject(new Error(data?.error || `请求失败（${response.statusCode}）`));
      },
      fail(error) {
        reject(new Error(error.errMsg || "网络连接失败"));
      },
    });
  });
}

export async function fetchListings(city = "全国") {
  const query = city && city !== "全国" ? `?city=${encodeURIComponent(city)}` : "";
  const payload = await request<{ listings?: ApiListing[]; error?: string }>(`/api/listings${query}`);
  return (payload.listings || []).map(toListingView);
}

export async function fetchListing(id: string) {
  const payload = await request<{ listing?: ApiListing; error?: string }>(`/api/listings/${encodeURIComponent(id)}`);
  if (!payload.listing) throw new Error(payload.error || "房源不存在或已下架");
  return toListingView(payload.listing);
}

export async function locateCity(latitude: number, longitude: number) {
  const payload = await request<{ city?: string | null }>(`/api/location?lat=${latitude}&lng=${longitude}`);
  return payload.city || null;
}
