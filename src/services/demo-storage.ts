import type {
  Conversation,
  DemoFavorite,
  DemoMessage,
  PublishDraft,
  PublishEvidence,
  PublishedListing,
  ViewingRecord,
} from "@/types/demo";

const KEYS = {
  account: "zuji-demo-phone",
  accounts: "zuji-demo-accounts",
  city: "zuji-city",
  listings: "zuji-demo-listings",
  publishDraft: "zuji-publish-draft",
  publishEvidence: "zuji-publish-evidence",
} as const;

function readArray<T>(key: string): T[] {
  const value = uni.getStorageSync(key);
  return Array.isArray(value) ? value : [];
}

function writeArray<T>(key: string, value: T[]) {
  uni.setStorageSync(key, value);
}

function accountKey(namespace: string, account: string) {
  return `zuji-${namespace}:${account}`;
}

export function getDemoAccount() {
  return String(uni.getStorageSync(KEYS.account) || "");
}

export function setDemoAccount(account: string) {
  uni.setStorageSync(KEYS.account, account.trim());
}

export function clearDemoAccount() {
  uni.removeStorageSync(KEYS.account);
}

export function registerDemoAccount(account: string) {
  const accounts = readArray<string>(KEYS.accounts);
  const normalized = account.trim();
  if (normalized && !accounts.includes(normalized)) writeArray(KEYS.accounts, [...accounts, normalized]);
  setDemoAccount(normalized);
}

export function setCurrentCity(city: string) {
  uni.setStorageSync(KEYS.city, city);
}

export function isIdentityVerified(account = getDemoAccount()) {
  return Boolean(account && uni.getStorageSync(accountKey("real-name", account)) === "verified");
}

export function setIdentityVerified(account = getDemoAccount()) {
  if (account) uni.setStorageSync(accountKey("real-name", account), "verified");
}

export function getFavorites(account = getDemoAccount()) {
  return account ? readArray<DemoFavorite>(accountKey("favorites", account)) : [];
}

export function saveFavorites(favorites: DemoFavorite[], account = getDemoAccount()) {
  if (account) writeArray(accountKey("favorites", account), favorites);
}

export function getPublishedListings(account?: string) {
  const listings = readArray<PublishedListing>(KEYS.listings);
  return account === undefined ? listings : listings.filter((item) => item.publisherPhone === account);
}

export function addPublishedListing(listing: PublishedListing) {
  writeArray(KEYS.listings, [listing, ...getPublishedListings()].slice(0, 30));
}

export function getPublishDraft(): PublishDraft | null {
  const value = uni.getStorageSync(KEYS.publishDraft) as PublishDraft | undefined;
  return value && typeof value === "object" && value.title
    ? { ...value, images: Array.isArray(value.images) ? value.images : [] }
    : null;
}

export function savePublishDraft(draft: PublishDraft) {
  uni.setStorageSync(KEYS.publishDraft, draft);
}

export function clearPublishDraft() {
  uni.removeStorageSync(KEYS.publishDraft);
}

export function getPublishEvidence(): PublishEvidence {
  const value = uni.getStorageSync(KEYS.publishEvidence) as Partial<PublishEvidence> | undefined;
  const payments = value?.payments;
  return {
    contract: value?.contract?.path ? value.contract : null,
    payments: Array.isArray(payments) ? payments.filter((file) => file?.path).slice(0, 6) : [],
    updatedAt: value?.updatedAt,
  };
}

export function savePublishEvidence(evidence: PublishEvidence) {
  uni.setStorageSync(KEYS.publishEvidence, evidence);
}

export function clearPublishEvidence() {
  uni.removeStorageSync(KEYS.publishEvidence);
}

export function getViewings(account = getDemoAccount()) {
  return account ? readArray<ViewingRecord>(accountKey("viewings", account)) : [];
}

export function saveViewings(viewings: ViewingRecord[], account = getDemoAccount()) {
  if (account) writeArray(accountKey("viewings", account), viewings);
}

export function getConversations(account = getDemoAccount()) {
  return account ? readArray<Conversation>(accountKey("conversations", account)) : [];
}

export function saveConversations(conversations: Conversation[], account = getDemoAccount()) {
  if (account) writeArray(accountKey("conversations", account), conversations.slice(0, 30));
}

export function getMessages(listingId: string, account = getDemoAccount()) {
  return account ? readArray<DemoMessage>(accountKey(`messages:${account}`, listingId)) : [];
}

export function saveMessages(listingId: string, messages: DemoMessage[], account = getDemoAccount()) {
  if (!account) return false;
  try {
    writeArray(accountKey(`messages:${account}`, listingId), messages);
    return true;
  } catch {
    return false;
  }
}
