export type ListingStatus = "pending_review" | "published" | "rejected";

export type ApiListing = {
  id: string;
  publisherId: string;
  title: string;
  city: string;
  district: string;
  community: string;
  monthlyRentCents: number;
  availableFrom: string;
  leaseEndsAt?: string;
  description?: string;
  status?: ListingStatus;
  imageUrls?: string[];
};

export type ListingView = ApiListing & {
  price: number;
  images: string[];
  image: string;
};

