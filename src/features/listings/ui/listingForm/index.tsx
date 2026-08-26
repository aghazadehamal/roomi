"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createListing, updateListing } from "@/features/listings/actions";
import { MAX_LISTING_PHOTOS } from "@/features/listings/helpers/listingPhoto";
import { uploadListingPhotos } from "@/features/listings/helpers/uploadListingPhotos";
import {
  feedTabForListingType,
  listingTypeForFeedTab,
} from "@/features/listings/helpers/newListing";
import {
  FeedTab,
  LISTING_TYPE_LABELS,
  ListingType,
  OFFER_TYPES,
  SEEK_TYPES,
  listingShowsGender,
  listingShowsPhotos,
  listingShowsRooms,
} from "@/features/listings/model";
import { BAKU_DISTRICTS, ANY_DISTRICT, listingFormSchema, type ListingFormValues } from "@/features/listings/schema";
import { ListingPhotoPicker } from "@/features/listings/ui/listingPhotoPicker";
import { cn } from "@/lib/utils";

import type { ListingFormProps } from "./type";

const fieldClass =
  "h-12 w-full rounded-xl border border-input bg-card px-4 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const selectClass = cn(fieldClass, "appearance-none px-6 py-3 pr-12");

const TITLE_PLACEHOLDER: Record<ListingType, string> = {
  [ListingType.HomeOffer]: "Məs: Yasamalda 2 otaqlı ev",
  [ListingType.RoomOffer]: "Məs: Yasamalda otaq kirayə verilir",
  [ListingType.HomeSeek]: "Məs: Yasamalda 2 otaqlı ev axtarıram",
  [ListingType.RoommateSeek]: "Məs: Yasamalda otaq yoldaşı axtarıram",
};

const BODY_PLACEHOLDER: Record<ListingType, string> = {
  [ListingType.HomeOffer]: "Evi, məhəlləni, şərtləri yaz. Telefon və Instagram yazma.",
  [ListingType.RoomOffer]: "Otağı, evi və şərtləri yaz. Telefon və Instagram yazma.",
  [ListingType.HomeSeek]: "Nə axtardığını və şərtləri yaz. Telefon və Instagram yazma.",
  [ListingType.RoommateSeek]: "Özünü və kimi axtardığını yaz. Telefon və Instagram yazma.",
};

export function ListingForm({
  isAuthenticated,
  listingId,
  defaultValues,
  tab: tabProp,
  loginNext = "/listings/new",
}: ListingFormProps) {
  const router = useRouter();
  const isEdit = Boolean(listingId);
  const tab =
    tabProp ??
    feedTabForListingType(defaultValues?.type ?? ListingType.HomeOffer);
  const types = tab === FeedTab.Seek ? SEEK_TYPES : OFFER_TYPES;
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: defaultValues ?? {
      type: listingTypeForFeedTab(tab),
      title: "",
      body: "",
      city: "Bakı",
      district: "Yasamal",
      price: 500,
      rooms: 2,
      genderPref: "any",
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border md:p-10">
        <p className="text-lg text-muted-foreground">
          Elan yerləşdirmək üçün hesab lazımdır. Nömrə elanda görünməyəcək.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(loginNext)}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}
        >
          Giriş / Qeydiyyat
        </Link>
      </div>
    );
  }

  const selectedType = form.watch("type");
  const price = form.watch("price");
  const rooms = form.watch("rooms");
  const seekType = SEEK_TYPES.includes(selectedType);
  const anyPrice = seekType && price <= 0;
  const anyRooms = selectedType === ListingType.HomeSeek && rooms <= 0;

  async function onSubmit(values: ListingFormValues) {
    setError(null);
    const result = listingId
      ? await updateListing(listingId, values)
      : await createListing(values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!listingId && photos.length > 0 && listingShowsPhotos(values.type)) {
      const uploaded = await uploadListingPhotos(result.id, photos, 0);
      if ("error" in uploaded) {
        setError(uploaded.error);
        router.push(`/listings/${result.id}`);
        router.refresh();
        return;
      }
    }
    router.push(`/listings/${result.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5 rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border md:p-10"
    >
      <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-medium">Elan növü</legend>
        {types.map((type) => (
          <button
            key={type}
            type="button"
            className={cn(
              "rounded-2xl px-4 py-3 text-left text-sm font-medium ring-1 transition-colors",
              selectedType === type
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-secondary text-secondary-foreground ring-border",
            )}
            onClick={() => {
              form.setValue("type", type);
              if (!listingShowsGender(type)) {
                form.setValue("genderPref", "any");
              }
              if (!listingShowsRooms(type)) {
                form.setValue("rooms", 1);
              } else if (type !== ListingType.HomeSeek && form.getValues("rooms") <= 0) {
                form.setValue("rooms", 2);
              }
              if (!SEEK_TYPES.includes(type)) {
                if (form.getValues("district") === ANY_DISTRICT) {
                  form.setValue("district", "Yasamal");
                }
                if (form.getValues("price") <= 0) {
                  form.setValue("price", 500);
                }
              }
            }}
          >
            {LISTING_TYPE_LABELS[type]}
          </button>
        ))}
      </fieldset>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Başlıq
        <Input
          placeholder={TITLE_PLACEHOLDER[selectedType]}
          aria-invalid={Boolean(form.formState.errors.title)}
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <span className="font-normal text-destructive">
            {form.formState.errors.title.message}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Təsvir
        <textarea
          rows={5}
          placeholder={BODY_PLACEHOLDER[selectedType]}
          className={cn(fieldClass, "h-auto min-h-32 py-3")}
          aria-invalid={Boolean(form.formState.errors.body)}
          {...form.register("body")}
        />
        {form.formState.errors.body ? (
          <span className="font-normal text-destructive">
            {form.formState.errors.body.message}
          </span>
        ) : null}
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Rayon
          <select className={selectClass} {...form.register("district")}>
            {seekType ? (
              <option value={ANY_DISTRICT}>{ANY_DISTRICT}</option>
            ) : null}
            {BAKU_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2 text-sm font-medium">
          {tab === FeedTab.Seek ? "Büdcə (AZN)" : "Qiymət (AZN)"}
          {anyPrice ? (
            <input type="hidden" {...form.register("price", { valueAsNumber: true })} />
          ) : (
            <Input type="number" min={1} step={1} {...form.register("price", { valueAsNumber: true })} />
          )}
          {seekType ? (
            <label className="flex items-center gap-2 font-normal text-muted-foreground">
              <input
                type="checkbox"
                checked={anyPrice}
                onChange={(event) => {
                  form.setValue("price", event.target.checked ? 0 : 500, {
                    shouldValidate: true,
                  });
                }}
              />
              Fərqi yoxdur
            </label>
          ) : null}
        </div>
        {listingShowsRooms(selectedType) ? (
          <div className="flex flex-col gap-2 text-sm font-medium">
            Otaq sayı
            {anyRooms ? (
              <input type="hidden" {...form.register("rooms", { valueAsNumber: true })} />
            ) : (
              <Input
                type="number"
                min={1}
                max={20}
                step={1}
                {...form.register("rooms", { valueAsNumber: true })}
              />
            )}
            {selectedType === ListingType.HomeSeek ? (
              <label className="flex items-center gap-2 font-normal text-muted-foreground">
                <input
                  type="checkbox"
                  checked={anyRooms}
                  onChange={(event) => {
                    form.setValue("rooms", event.target.checked ? 0 : 2, {
                      shouldValidate: true,
                    });
                  }}
                />
                Fərqi yoxdur
              </label>
            ) : null}
          </div>
        ) : (
          <input type="hidden" {...form.register("rooms", { valueAsNumber: true })} />
        )}
        {listingShowsGender(selectedType) ? (
          <label className="flex flex-col gap-2 text-sm font-medium">
            {selectedType === ListingType.RoommateSeek ? "Yoldaş" : "Kimə"}
            <select className={selectClass} {...form.register("genderPref")}>
              <option value="any">Fərqi yoxdur</option>
              <option value="female">Yalnız qadın</option>
              <option value="male">Yalnız kişi</option>
            </select>
          </label>
        ) : (
          <input type="hidden" {...form.register("genderPref")} />
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Şəhər: Bakı. Küçə və telefon elanda görünməyəcək.
      </p>

      {listingShowsPhotos(selectedType) && !isEdit ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Şəkillər</p>
          <ListingPhotoPicker files={photos} maxCount={MAX_LISTING_PHOTOS} onChange={setPhotos} />
        </div>
      ) : listingShowsPhotos(selectedType) && isEdit ? (
        <p className="text-sm text-muted-foreground">
          Şəkilləri elanın səhifəsindən əlavə edə bilərsən.
        </p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? isEdit
            ? "Yadda saxlanır…"
            : "Yerləşdirilir…"
          : isEdit
            ? "Dəyişiklikləri saxla"
            : "Elanı yerləşdir"}
      </Button>
    </form>
  );
}
