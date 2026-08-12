"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BottomNavigation from "./BottomNavigation";
import type { NavigationDestination } from "./BottomNavigation";
import SiteHeader from "./SiteHeader";
import { ROUTE_START_EVENT } from "./SafeLink";

type NavigationUser = { displayName: string; email: string; authMethod: "chatgpt" | "demo" };
type NotificationSummary = { unreadMessages: number; pendingViewings: number; total: number };
type NavigationContextValue = { user: NavigationUser | null | undefined };
type ProgressState = "idle" | "loading" | "complete";
type RouteDirection = "idle" | "forward" | "back" | "fade";

const EMPTY_NOTIFICATIONS: NotificationSummary = { unreadMessages: 0, pendingViewings: 0, total: 0 };
const NavigationContext = createContext<NavigationContextValue>({ user: undefined });
const DESTINATION_ORDER: Record<NavigationDestination, number> = {
  find: 0,
  publish: 1,
  market: 2,
  messages: 3,
  profile: 3,
};

function destinationFromPath(pathname: string): NavigationDestination {
  if (pathname.startsWith("/publish")) return "publish";
  if (pathname.startsWith("/market")) return "market";
  if (pathname.startsWith("/messages")) return "messages";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/login")) return "profile";
  return "find";
}

function destinationFromHref(href: string): NavigationDestination {
  const url = new URL(href, "https://zuji.local");
  if (url.pathname.startsWith("/login")) {
    const returnTo = url.searchParams.get("return_to");
    if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
      return destinationFromPath(new URL(returnTo, url.origin).pathname);
    }
  }
  return destinationFromPath(url.pathname);
}

function routeDirectionBetween(fromHref: string, toHref: string): Exclude<RouteDirection, "idle"> {
  const from = new URL(fromHref, "https://zuji.local");
  const to = new URL(toHref, from.origin);
  const destinationDelta = DESTINATION_ORDER[destinationFromHref(to.href)] - DESTINATION_ORDER[destinationFromHref(from.href)];
  if (destinationDelta > 0) return "forward";
  if (destinationDelta < 0) return "back";

  const fromDepth = from.pathname.split("/").filter(Boolean).length;
  const toDepth = to.pathname.split("/").filter(Boolean).length;
  if (toDepth > fromDepth) return "forward";
  if (toDepth < fromDepth) return "back";
  return "fade";
}

export function useNavigationSession() {
  return useContext(NavigationContext);
}

export default function NavigationShell({ children, initialUser }: { children: ReactNode; initialUser: NavigationUser | null }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const currentDestination = useMemo(() => {
    if (pathname.startsWith("/login")) {
      const returnTo = searchParams.get("return_to");
      if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return destinationFromPath(new URL(returnTo, "https://zuji.local").pathname);
    }
    return destinationFromPath(pathname);
  }, [pathname, searchParams]);
  const [user] = useState<NavigationUser | null>(initialUser);
  const [notifications, setNotifications] = useState<NotificationSummary>(EMPTY_NOTIFICATIONS);
  const [pendingDestination, setPendingDestination] = useState<NavigationDestination | null>(null);
  const [progress, setProgress] = useState<ProgressState>("idle");
  const [routeDirection, setRouteDirection] = useState<RouteDirection>("idle");
  const [animateArrivedRoute, setAnimateArrivedRoute] = useState(false);
  const navigationPending = useRef(false);
  const settledHref = useRef(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
  const finishTimer = useRef<number | null>(null);
  const stallTimer = useRef<number | null>(null);
  const animationTimer = useRef<number | null>(null);

  const finishNavigation = useCallback(() => {
    navigationPending.current = false;
    setPendingDestination(null);
    document.documentElement.classList.remove("zuji-route-changing");
    if (stallTimer.current !== null) window.clearTimeout(stallTimer.current);
    if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
    if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
    setProgress("complete");
    finishTimer.current = window.setTimeout(() => setProgress("idle"), 180);
    animationTimer.current = window.setTimeout(() => {
      setAnimateArrivedRoute(false);
      setRouteDirection("idle");
    }, 340);
  }, []);

  const loadNotifications = useCallback(() => {
    if (!user) {
      setNotifications(EMPTY_NOTIFICATIONS);
      return;
    }
    fetch("/api/notifications", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: Partial<NotificationSummary>) => setNotifications({
        unreadMessages: payload.unreadMessages || 0,
        pendingViewings: payload.pendingViewings || 0,
        total: payload.total || 0,
      }))
      .catch(() => setNotifications(EMPTY_NOTIFICATIONS));
  }, [user]);

  useEffect(() => {
    const initialTimer = window.setTimeout(loadNotifications, 0);
    if (!user) return () => window.clearTimeout(initialTimer);
    window.addEventListener("focus", loadNotifications);
    window.addEventListener("zuji:notifications-changed", loadNotifications);
    return () => {
      window.clearTimeout(initialTimer);
      window.removeEventListener("focus", loadNotifications);
      window.removeEventListener("zuji:notifications-changed", loadNotifications);
    };
  }, [loadNotifications, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (navigationPending.current) {
        settledHref.current = `${window.location.pathname}${window.location.search}`;
        setAnimateArrivedRoute(true);
        finishNavigation();
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [currentDestination, finishNavigation, routeKey]);

  useEffect(() => {
    const prepareNavigation = (href: string, fromHref = window.location.href) => {
      navigationPending.current = true;
      setAnimateArrivedRoute(false);
      setRouteDirection(routeDirectionBetween(fromHref, href));
      setPendingDestination(destinationFromHref(href));
      setProgress("loading");
      document.documentElement.classList.add("zuji-route-changing");
      if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
      if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
      if (stallTimer.current !== null) window.clearTimeout(stallTimer.current);
      stallTimer.current = window.setTimeout(finishNavigation, 8000);
    };
    const startNavigation = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href;
      if (!href) return;
      prepareNavigation(href);
    };
    const syncHistoryNavigation = () => {
      prepareNavigation(window.location.href, settledHref.current);
    };
    const handlePlainInternalLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
      const destination = new URL(target.href, window.location.href);
      const current = new URL(window.location.href);
      if (destination.origin !== current.origin || destination.pathname.startsWith("/api/") || destination.pathname.startsWith("/signin-with-chatgpt") || destination.pathname.startsWith("/signout-with-chatgpt")) return;
      if (destination.pathname === current.pathname && destination.search === current.search) return;
      window.dispatchEvent(new CustomEvent(ROUTE_START_EVENT, { detail: { href: destination.href } }));
      if (!globalThis.crypto?.subtle) return;
      event.preventDefault();
      router.push(`${destination.pathname}${destination.search}${destination.hash}`);
    };
    window.addEventListener(ROUTE_START_EVENT, startNavigation);
    window.addEventListener("popstate", syncHistoryNavigation);
    document.addEventListener("click", handlePlainInternalLink);
    return () => {
      window.removeEventListener(ROUTE_START_EVENT, startNavigation);
      window.removeEventListener("popstate", syncHistoryNavigation);
      document.removeEventListener("click", handlePlainInternalLink);
      document.documentElement.classList.remove("zuji-route-changing");
      if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
      if (stallTimer.current !== null) window.clearTimeout(stallTimer.current);
      if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
    };
  }, [finishNavigation, router]);

  const activeDestination = pendingDestination || currentDestination;
  const showSiteHeader = !pathname.startsWith("/login");
  const headerTheme = pathname === "/" ? "zuji-find-page" : "zuji-black-yellow-theme";
  const contextValue = useMemo(() => ({ user }), [user]);
  const userName = user?.displayName || null;
  const routeAnimationClass = animateArrivedRoute && routeDirection !== "idle" ? `route-${routeDirection}` : "";

  return <NavigationContext.Provider value={contextValue}>
    <div className={`zuji-route-progress ${progress}`} aria-hidden="true"><i /></div>
    {showSiteHeader && <div className={`zuji-navigation-theme ${headerTheme}`}><SiteHeader active={activeDestination} userName={userName} authMethod={user?.authMethod || null} notifications={notifications} /></div>}
    <div className={`zuji-route-content ${showSiteHeader ? "has-site-header" : ""} ${routeAnimationClass}`}>{children}</div>
    <BottomNavigation active={activeDestination} userName={userName} unreadMessages={user ? notifications.unreadMessages : 0} />
  </NavigationContext.Provider>;
}
