import type { Item } from '@/models/item';
import imageNotAvailable from '@/assets/imageNotAvailable.jpg';

const apiBase = import.meta.env.VITE_IMAGE_URL as string;

export const getItemImage = (item: Item | null): string => {
  if (!item) return '';
  if (!item.imageUrl) return imageNotAvailable;
  return `${apiBase}/${item.category}/${item.imageUrl}`;
};
