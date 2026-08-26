export type Profile = {
  id: string;
  name: string;
  city: string;
  createdAt: string;
};

export function profileDisplayName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "İstifadəçi";
}

export function profileInitials(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "?";
  }
  return trimmed.slice(0, 1).toLocaleUpperCase("az-AZ");
}
