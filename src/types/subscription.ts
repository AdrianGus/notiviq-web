export type Subscription = {
  id: string;
  campaignId?: string;
  accountId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
  locale?: string;
  tags?: string[];
  lastSeenAt?: string;
  createdAt?: string;
}