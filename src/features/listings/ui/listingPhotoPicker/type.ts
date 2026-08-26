export type ListingPhotoPickerProps = {
  files: File[];
  maxCount: number;
  onChange: (files: File[]) => void;
};
