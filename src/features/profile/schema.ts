import { z } from "zod";

import { CONTACT_INFO_ERROR, containsContactInfo } from "@/features/moderation/helpers/contactInfo";
import { profanityIssue } from "@/features/moderation/schema";

export const profileIdSchema = z.string().uuid();

export const profileFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Ad ən azı 2 simvol olmalıdır.")
      .max(40, "Ad 40 simvoldan uzun ola bilməz."),
  })
  .superRefine((data, ctx) => {
    if (containsContactInfo(data.name)) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: CONTACT_INFO_ERROR,
      });
    }

    const profanity = profanityIssue(data.name, ["name"]);
    if (profanity) {
      ctx.addIssue(profanity);
    }
  });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
