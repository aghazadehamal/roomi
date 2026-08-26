import { z } from "zod";

export const profileIdSchema = z.string().uuid();

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ad ən azı 2 simvol olmalıdır.")
    .max(40, "Ad 40 simvoldan uzun ola bilməz."),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
