export type ApiListing = {
  id: string;
  publisherId: string;
  title: string;
  district: string;
  community: string;
  monthlyRentCents: number;
  availableFrom: string;
  leaseEndsAt?: string;
  description?: string;
  status?: "pending_review" | "published" | "rejected";
  imageUrls?: string[];
};

export type ListingView = ApiListing & {
  price: number;
  image: string;
  images: string[];
};

export const houseImages = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1723810391398-79b45005e61c?auto=format&fit=crop&w=1400&q=82",
];

export function toListingView(item: ApiListing, index = 0): ListingView {
  const offset = Math.abs(index) % houseImages.length;
  const uploadedImages = item.imageUrls?.filter(Boolean) || [];
  const images = uploadedImages.length ? uploadedImages : houseImages.map((_, imageIndex) => houseImages[(offset + imageIndex) % houseImages.length]);
  return {
    ...item,
    price: item.monthlyRentCents / 100,
    image: images[0],
    images,
  };
}
