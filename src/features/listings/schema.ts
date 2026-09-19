import { z } from "zod";

import { contactInfoIssue, profanityIssue } from "@/features/moderation/schema";
import { ListingType } from "@/features/listings/model";
import {
  ANY_DISTRICT,
  ANY_METRO,
  AZ_CITIES,
  BAKU_CITY,
  BAKU_DISTRICTS,
  BAKU_METRO_STATIONS,
  isBakuCity,
  LISTING_DISTRICTS,
  LISTING_METROS,
} from "@/features/listings/model/locations";

export const LISTING_TTL_DAYS = 21;

/** Müvəqqəti: 21 gün sonra avtomatik arxiv söndürülüb. Əl ilə arxiv qalır. */
export const AUTO_ARCHIVE_EXPIRED_LISTINGS = false;

export const listingIdSchema = z.object({
  listingId: z.string().uuid(),
});

export const listingPhotoIdSchema = z.object({
  listingId: z.string().uuid(),
  photoId: z.string().uuid(),
});

export {
  ANY_DISTRICT,
  ANY_METRO,
  AZ_CITIES,
  BAKU_CITY,
  BAKU_DISTRICTS,
  BAKU_METRO_STATIONS,
  LISTING_DISTRICTS,
  LISTING_METROS,
};

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
    city: z.enum(AZ_CITIES),
    district: z
      .string()
      .trim()
      .max(80, "Ünvan ən çoxu 80 simvol ola bilər."),
    metro: z.enum(LISTING_METROS),
    price: z.number().int().min(0).max(100_000),
    rooms: z.number().int().min(0).max(20),
    genderPref: z.enum(["any", "female", "male", "family"]),
    housingKind: z.enum(["apartment", "house", "any"]),
    buildingAge: z.enum(["old", "new", "any"]),
    rentalTerm: z.enum(["daily", "long_term"]),
    floor: z.number().int().min(0).max(50),
    buildingFloors: z.number().int().min(0).max(50),
    areaSqm: z.number().int().min(0).max(10_000),
  })
  .superRefine((data, ctx) => {
    const seek =
      data.type === ListingType.HomeSeek || data.type === ListingType.RoommateSeek;
    const offer =
      data.type === ListingType.HomeOffer || data.type === ListingType.RoomOffer;

    if (data.type === ListingType.RoommateSeek && data.genderPref === "any") {
      ctx.addIssue({
        code: "custom",
        path: ["genderPref"],
        message: "Yoldaş seç: qadın, kişi və ya ailə.",
      });
    }

    if (data.type === ListingType.HomeSeek && data.genderPref === "any") {
      ctx.addIssue({
        code: "custom",
        path: ["genderPref"],
        message: "Kim olduğunu seç: qadın, kişi və ya ailə.",
      });
    }

    if (data.type === ListingType.RoommateSeek && data.rentalTerm !== "long_term") {
      ctx.addIssue({
        code: "custom",
        path: ["rentalTerm"],
        message: "Otaq yoldaşı elanında müddət seçilmir.",
      });
    }

    if (
      (offer || data.type === ListingType.RoommateSeek) &&
      data.housingKind === "any"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["housingKind"],
        message: "Ev növünü seç: bina və ya həyət.",
      });
    }

    if (
      (offer || data.type === ListingType.RoommateSeek) &&
      data.buildingAge === "any"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["buildingAge"],
        message: "Tikili növünü seç: köhnə və ya yeni.",
      });
    }

    if (data.type === ListingType.RoommateSeek) {
      if (data.price < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["price"],
          message: "Büdcəni yaz.",
        });
      }
      if (data.floor < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["floor"],
          message:
            data.housingKind === "house" ? "Mərtəbə sayını yaz." : "Mərtəbəni yaz.",
        });
      }
      if (data.areaSqm < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["areaSqm"],
          message: "Sahəni yaz (m²).",
        });
      }
    }

    if (
      data.housingKind === "apartment" &&
      (offer || data.type === ListingType.RoommateSeek)
    ) {
      if (data.buildingFloors < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["buildingFloors"],
          message: "Binanın ümumi mərtəbə sayını yaz.",
        });
      } else if (data.floor > data.buildingFloors) {
        ctx.addIssue({
          code: "custom",
          path: ["floor"],
          message: "Mərtəbə binanın ümumi mərtəbəsindən çox ola bilməz.",
        });
      }
    }

    if (isBakuCity(data.city)) {
      if (!(LISTING_DISTRICTS as readonly string[]).includes(data.district)) {
        ctx.addIssue({
          code: "custom",
          path: ["district"],
          message: "Bakı rayonunu seç.",
        });
      }
    } else {
      if (data.district.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["district"],
          message: "Ünvanı yaz (məhəllə və ya ərazi).",
        });
      } else {
        const districtContact = contactInfoIssue(data.district, ["district"]);
        if (districtContact) {
          ctx.addIssue(districtContact);
        }
        const districtProfanity = profanityIssue(data.district, ["district"]);
        if (districtProfanity) {
          ctx.addIssue(districtProfanity);
        }
      }

      if (data.metro !== ANY_METRO) {
        ctx.addIssue({
          code: "custom",
          path: ["metro"],
          message: "Bakıdan kənar şəhərlərdə metro seçilmir.",
        });
      }
    }

    const titleIssue = contactInfoIssue(data.title, ["title"]);
    if (titleIssue) {
      ctx.addIssue(titleIssue);
    }

    const bodyIssue = contactInfoIssue(data.body, ["body"]);
    if (bodyIssue) {
      ctx.addIssue(bodyIssue);
    }

    const titleProfanity = profanityIssue(data.title, ["title"]);
    if (titleProfanity) {
      ctx.addIssue(titleProfanity);
    }

    const bodyProfanity = profanityIssue(data.body, ["body"]);
    if (bodyProfanity) {
      ctx.addIssue(bodyProfanity);
    }

    if (seek) {
      return;
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
    if (data.floor < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["floor"],
        message:
          data.housingKind === "house" ? "Mərtəbə sayını yaz." : "Mərtəbəni yaz.",
      });
    }
    if (data.areaSqm < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["areaSqm"],
        message: "Sahəni yaz (m²).",
      });
    }
  });

export type ListingFormValues = z.infer<typeof listingFormSchema>;
