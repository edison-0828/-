export type DemoFavorite = {
  id: string;
  title: string;
  city: string;
  district: string;
  community: string;
  price: number;
  availableFrom: string;
  image: string;
  savedAt?: number;
};

export type PublishDraft = {
  title: string;
  city: string;
  district: string;
  community: string;
  rent: string;
  availableFrom: string;
  leaseEndsAt: string;
  description?: string;
  images: string[];
  updatedAt?: number;
};

export type EvidenceFile = {
  name: string;
  path: string;
  size: number;
  format: "image" | "pdf";
};

export type PublishEvidence = {
  contract: EvidenceFile | null;
  payments: EvidenceFile[];
  updatedAt?: number;
};

export type PublishedListingStatus = "pending_review" | "published" | "rejected" | "closed";

export type PublishedListing = {
  id: string;
  publisherPhone: string;
  title: string;
  city: string;
  district: string;
  community: string;
  rent: string;
  availableFrom: string;
  leaseEndsAt: string;
  description?: string;
  cover: string;
  contractName: string;
  paymentCount: number;
  status: PublishedListingStatus;
  createdAt: number;
};

export type ViewingRecord = {
  id: string;
  listingId: string;
  listingTitle: string;
  date: string;
  time: string;
  note: string;
  status: "pending" | "confirmed" | "rejected" | "rescheduled" | "cancelled";
  createdAt?: number;
};

export type Conversation = {
  listingId: string;
  title: string;
  location: string;
  image: string;
  lastMessage: string;
  updatedAt: number;
  unread?: number;
};

export type DemoMessage = {
  id: string;
  body: string;
  from: "me" | "publisher";
  createdAt: number;
  status?: "sending" | "sent" | "failed";
};
