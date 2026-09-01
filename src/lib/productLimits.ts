/** Boş və ya 0 = limitsiz. Gələcəkdə məs: PRODUCT_MAX_ACTIVE_LISTINGS=1 */
const DEFAULT_MAX_ACTIVE_LISTINGS: number | null = null;

/** Boş və ya 0 = limitsiz. Gələcəkdə məs: PRODUCT_NEW_CHATS_PER_DAY=5 */
const DEFAULT_NEW_CHATS_PER_DAY: number | null = null;

function parseLimit(value: string | undefined, fallback: number | null): number | null {
  if (value === undefined) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "0") {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function maxActiveListingsPerUser(): number | null {
  return parseLimit(process.env.PRODUCT_MAX_ACTIVE_LISTINGS, DEFAULT_MAX_ACTIVE_LISTINGS);
}

export function isActiveListingLimitEnabled(): boolean {
  return maxActiveListingsPerUser() !== null;
}

export function newConversationsDailyCap(): number | null {
  return parseLimit(process.env.PRODUCT_NEW_CHATS_PER_DAY, DEFAULT_NEW_CHATS_PER_DAY);
}

export function isNewConversationDailyCapEnabled(): boolean {
  return newConversationsDailyCap() !== null;
}
