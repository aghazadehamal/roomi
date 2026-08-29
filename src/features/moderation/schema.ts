import { z } from "zod";

import { CONTACT_INFO_ERROR, containsContactInfo } from "@/features/moderation/helpers/contactInfo";

export const REPORT_REASONS = [
  "spam",
  "contact_info",
  "inappropriate",
  "scam",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: "Spam / reklam",
  contact_info: "Telefon və ya Instagram",
  inappropriate: "Uyğunsuz məzmun",
  scam: "Fırıldaq / şübhəli",
  other: "Digər",
};

export const blockUserSchema = z.object({
  blockedId: z.string().uuid(),
});

export const reportSchema = z
  .object({
    listingId: z.string().uuid().optional(),
    conversationId: z.string().uuid().optional(),
    reason: z.enum(REPORT_REASONS),
    body: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.listingId && !data.conversationId) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Şikayət üçün elan və ya söhbət lazımdır.",
      });
    }
  });

export function contactInfoIssue(text: string, path: (string | number)[]) {
  if (containsContactInfo(text)) {
    return {
      code: "custom" as const,
      path,
      message: CONTACT_INFO_ERROR,
    };
  }
  return null;
}
