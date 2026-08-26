import { z } from "zod";

export const NEW_CONVERSATION_DAILY_CAP = 5;

export const startConversationSchema = z.object({
  listingId: z.string().uuid(),
});

export const markConversationReadSchema = z.object({
  conversationId: z.string().uuid(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, "Mesaj boş ola bilməz.").max(2000),
});
