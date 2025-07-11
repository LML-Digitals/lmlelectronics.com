export type CategoryWithChildrenAndVariations = {
  id: string;
  name: string;
  image: string;
  parentId: string | null;
  visible: boolean;
  children: CategoryWithChildrenAndVariations[];
  items: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    variations: {
      id: string;
      name: string;
      sku: string;
      shipping: number;
      tax: number;
      markup: number;
      image: string | null;
      sellingPrice: number;
      visible: boolean;
    }[];
  }[];
};
