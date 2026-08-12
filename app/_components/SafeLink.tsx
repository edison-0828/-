"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

type SafeLinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string };

/**
 * Vinext's RSC navigation hash uses Web Crypto. Mobile simulators commonly
 * open the LAN dev server over plain HTTP, where crypto.subtle is unavailable.
 * Keep client navigation where it is supported and fall back to a normal page
 * load only in that constrained environment.
 */
export default function SafeLink({ href, onClick, ...props }: SafeLinkProps) {
  return <NextLink
    {...props}
    href={href}
    onClick={(event) => {
      onClick?.(event);
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || event.currentTarget.target === "_blank"
        || event.currentTarget.hasAttribute("download")
        || globalThis.crypto?.subtle
      ) return;

      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      event.preventDefault();
      window.location.assign(destination.href);
    }}
  />;
}
