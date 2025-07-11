export type CustomBundleRepairType = {
  id: string;
  name: string;
  type: 'repair' | 'product';
  price: number;
  category: string;
  rating: number;
  reviewCount: number;
  estimatedTime?: string;
};
