import { z } from "zod";

import { PROFANITY_ERROR, containsProfanity } from "@/features/moderation/helpers/profanity";

export const startConversationSchema = z.object({
  listingId: z.string().uuid(),
});

export const markConversationReadSchema = z.object({
  conversationId: z.string().uuid(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(1, "Mesaj boş ola bilməz.")
    .max(2000)
    .refine((value) => !containsProfanity(value), PROFANITY_ERROR),
});
