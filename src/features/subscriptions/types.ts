import type { Subscription, NewSubscription } from "../../core/database/schema";

export type { Subscription, NewSubscription };

export type SubscriptionStatus = Subscription["status"];
export type BillingCycle = Subscription["billingCycle"];

export type SubscriptionFormInput = Omit<
  NewSubscription,
  "id" | "createdAt" | "status"
> & {
  status?: SubscriptionStatus;
};
