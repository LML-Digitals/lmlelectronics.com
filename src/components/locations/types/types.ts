export type DayHours = {
  open: string;
  close: string;
  isClosed: boolean;
};

export type WeeklyHours = {
  [key: string]: DayHours;
};

export interface SocialMediaLink {
  platform: string;
  link: string;
  icon: string;
}

export type SocialMediaLinks = SocialMediaLink[];

export type ImageUpload = {
  url: string;
  file?: File;
  isNew?: boolean;
};

export interface Listing {
  name: string;
  link: string;
  icon: string;
}
