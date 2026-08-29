export type ListingFormPhoto = {
  id: string;
  url: string;
};

export type ListingFormPhotosProps = {
  listingId: string;
  photos: ListingFormPhoto[];
  onPhotosChange: (photos: ListingFormPhoto[]) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
};
