import { z } from "zod";

import { ListingType } from "@/features/listings/model";

export const LISTING_TTL_DAYS = 21;

export const listingIdSchema = z.object({
  listingId: z.string().uuid(),
});

export const listingPhotoIdSchema = z.object({
  listingId: z.string().uuid(),
  photoId: z.string().uuid(),
});

export const BAKU_DISTRICTS = [
  "Binəqədi",
  "Qaradağ",
  "Xəzər",
  "Xətai",
  "Nərimanov",
  "Nəsimi",
  "Nizami",
  "Pirallahı",
  "Sabunçu",
  "Səbail",
  "Suraxanı",
  "Yasamal",
] as const;

export const ANY_DISTRICT = "Fərqi yoxdur";

export const LISTING_DISTRICTS = [...BAKU_DISTRICTS, ANY_DISTRICT] as const;

export const listingFormSchema = z
  .object({
    type: z.enum([
      ListingType.HomeOffer,
      ListingType.RoomOffer,
      ListingType.HomeSeek,
      ListingType.RoommateSeek,
    ]),
    title: z.string().trim().min(8, "Başlıq ən azı 8 simvol olmalıdır.").max(80),
    body: z
      .string()
      .trim()
      .min(20, "Təsvir ən azı 20 simvol olmalıdır.")
      .max(2000),
    city: z.literal("Bakı"),
    district: z.enum(LISTING_DISTRICTS),
    price: z.number().int().min(0).max(100_000),
    rooms: z.number().int().min(0).max(20),
    genderPref: z.enum(["any", "female", "male"]),
    housingKind: z.enum(["apartment", "house", "any"]),
  })
  .superRefine((data, ctx) => {
    const seek =
      data.type === ListingType.HomeSeek || data.type === ListingType.RoommateSeek;
    const offer =
      data.type === ListingType.HomeOffer || data.type === ListingType.RoomOffer;

    if (data.type === ListingType.RoommateSeek && data.housingKind !== "any") {
      ctx.addIssue({
        code: "custom",
        path: ["housingKind"],
        message: "Otaq yoldaşı elanında ev növü lazım deyil.",
      });
    }

    if (offer && data.housingKind === "any") {
      ctx.addIssue({
        code: "custom",
        path: ["housingKind"],
        message: "Ev növünü seç: bina və ya həyət.",
      });
    }

    if (seek) {
      return;
    }
    if (data.district === ANY_DISTRICT) {
      ctx.addIssue({
        code: "custom",
        path: ["district"],
        message: "Rayon seç.",
      });
    }
    if (data.price < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Qiymət 1 AZN-dən az ola bilməz.",
      });
    }
    if (data.rooms < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["rooms"],
        message: "Otaq sayı seç.",
      });
    }
  });

export type ListingFormValues = z.infer<typeof listingFormSchema>;
