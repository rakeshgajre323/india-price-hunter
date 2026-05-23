// Server-only helpers for the click/event tracking pipeline.
// Privacy stance:
//  - No invasive fingerprinting (no canvas/font/audio probing).
//  - IPs are stored only as a salted SHA-256 hash so we can do basic
//    bot/abuse aggregation without retaining raw addresses.
//  - Anonymous visitors get a random opaque session id stored in an
//    httpOnly cookie. It cannot be linked to any external identity.
import { createHash } from "crypto";

export const ANON_COOKIE = "qc_sid";
export const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Conservative crawler regex. Keep it cheap — this runs on every redirect.
const BOT_UA =
  /(bot|crawler|spider|crawling|slurp|facebookexternalhit|preview|monitor|curl|wget|headlesschrome|phantomjs|axios\/|python-requests|httpclient|httpx|go-http-client)/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return true; // missing UA → treat as bot
  return BOT_UA.test(ua);
}

export function deviceTypeFromUA(ua: string | null | undefined): string {
  if (!ua) return "unknown";
  if (isBotUserAgent(ua)) return "bot";
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(s)) return "tablet";
  if (/mobi|iphone|android.*mobile|phone/.test(s)) return "mobile";
  return "desktop";
}

export function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

export function buildAnonCookie(sid: string): string {
  return [
    `${ANON_COOKIE}=${encodeURIComponent(sid)}`,
    "Path=/",
    `Max-Age=${ANON_COOKIE_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
  ].join("; ");
}

export function getClientIp(request: Request): string | null {
  // Cloudflare / standard proxy headers.
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.ANALYTICS_IP_SALT || "qc-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export type EventType =
  | "affiliate_click"
  | "outbound_redirect"
  | "product_view"
  | "basket_compare"
  | "alert_created";