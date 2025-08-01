export const ItemsCategory = [
   {
      itemsCategoryId: 1,
      name: 'Parts',
      image: '/parts/test.jpg',
   },
   {
      itemsCategoryId: 2,
      name: 'Equipments',
      image: '/equipments/test.jpg',
   },
   {
      itemsCategoryId: 3,
      name: 'Accessories',
      image: '/accessories/test.jpg',
   },
   {
      itemsCategoryId: 4,
      name: 'Devices',
      image: '/devices/test.jpg',
   },
];

export const ItemsSubCategory = [
   // Parts Subcategories
   { itemsSubCategoryId: 1, name: 'Screen', categoryId: 1 },
   { itemsSubCategoryId: 2, name: 'Back Glass', categoryId: 1 },
   { itemsSubCategoryId: 3, name: 'Battery', categoryId: 1 },
   { itemsSubCategoryId: 4, name: 'Charging Port', categoryId: 1 },
   { itemsSubCategoryId: 5, name: 'Back Camera', categoryId: 1 },
   { itemsSubCategoryId: 6, name: 'Front Camera', categoryId: 1 },
   { itemsSubCategoryId: 7, name: 'Back Camera Lens', categoryId: 1 },
   { itemsSubCategoryId: 8, name: 'Loudspeaker', categoryId: 1 },
   { itemsSubCategoryId: 9, name: 'Earpiece', categoryId: 1 },
   { itemsSubCategoryId: 10, name: 'Proximity Sensor', categoryId: 1 },
   { itemsSubCategoryId: 11, name: 'Taptic Engine', categoryId: 1 },

   // Equipments Subcategories
   { itemsSubCategoryId: 12, name: 'Tools', categoryId: 2 },
   { itemsSubCategoryId: 13, name: 'Supplies', categoryId: 2 },

   // Accessories Subcategories
   { itemsSubCategoryId: 14, name: 'Cases', categoryId: 3 },
   { itemsSubCategoryId: 15, name: 'Chargers', categoryId: 3 },
   { itemsSubCategoryId: 16, name: 'Screen Protectors', categoryId: 3 },

   // Devices Subcategories
   { itemsSubCategoryId: 17, name: 'Phone', categoryId: 4 },
   { itemsSubCategoryId: 18, name: 'Tablet', categoryId: 4 },
   { itemsSubCategoryId: 19, name: 'Laptop', categoryId: 4 },
   { itemsSubCategoryId: 20, name: 'Watch', categoryId: 4 },
   { itemsSubCategoryId: 21, name: 'Computer', categoryId: 4 },
];

export const Vendor = [
   { vendorId: 1, name: 'TechParts Co.' },
   { vendorId: 2, name: 'ScreenGuard Inc.' },
   { vendorId: 3, name: 'Logitech Official' },
   { vendorId: 4, name: 'Apple Store' },
];

export const InventoryItemBrand = [
   {
      brandInventoryId: 1,
      brandInventoryName: 'Apple',
      description: 'This is Apple Brand',
   },
   {
      brandInventoryId: 2,
      brandInventoryName: 'Samsung',
      description: 'This is Samsung Brand',
   },
   {
      brandInventoryId: 3,
      brandInventoryName: 'Logitech',
      description: 'This is Logitech Brand',
   },
];

export const InventoryItem = [
   {
      inventoryItemId: 1,
      name: 'iPhone 11 LCD Screen Replacement Aftermarket AM',
      description: 'Replacement screen for iPhone 11',
      brandId: 1,
      image: '/iphone11/test.jpg',
      itemsCategoryId: 1, // Parts
      vendorId: 1, // TechParts Co.
      itemsSubCategoryId: 1, // Screen
   },
   {
      inventoryItemId: 2,
      name: 'Samsung Galaxy S20 Ultra Screen Protector',
      description:
         'Tempered glass screen protector for Samsung Galaxy S20 Ultra',
      brandId: 2,
      image: '/samsungs20ultra/test.jpg',
      itemsCategoryId: 3, // Accessories
      vendorId: 2, // ScreenGuard Inc.
      itemsSubCategoryId: 16, // Screen Protectors
   },
   {
      inventoryItemId: 3,
      name: 'Logitech G502 HERO Gaming Mouse',
      description:
         'Wired gaming mouse with customizable RGB lighting and 11 programmable buttons',
      brandId: 3,
      image: '/logitechg502/test.jpg',
      itemsCategoryId: 2, // Equipments
      vendorId: 3, // Logitech Official
      itemsSubCategoryId: 12, // Tools
   },
   {
      inventoryItemId: 4,
      name: 'Apple AirPods Pro',
      description: 'Wireless Bluetooth earbuds with active noise cancellation',
      brandId: 1,
      image: '/appleairpods/test.jpg',
      itemsCategoryId: 4, // Devices
      vendorId: 4, // Apple Store
      itemsSubCategoryId: 20, // Watch
   },
];

export const Variation = [
   {
      variationId: 1,
      sku: 'IPHONE-11-SCREEN-AFTERMARKET-AM-RED',
      inventoryItemId: 1,
      image: '/iphone11red/test.jpg',
      name: 'iPhone 11 Screen Red',
   },
   {
      variationId: 2,
      sku: 'IPHONE-11-SCREEN-AFTERMARKET-AM-BLUE',
      inventoryItemId: 1,
      image: '/iphone11blue/test.jpg',
      name: 'iPhone 11 Screen Blue',
   },
   {
      variationId: 3,
      sku: 'SAMSUNG-S20ULTRA-SCREEN-PROTECTOR-GLASS',
      inventoryItemId: 2,
      image: '/samsungs20ultraglass/test.jpg',
      name: 'Samsung S20 Ultra Glass',
   },
   {
      variationId: 4,
      sku: 'SAMSUNG-S20ULTRA-SCREEN-PROTECTOR-PLASTIC',
      inventoryItemId: 2,
      image: '/samsungs20ultraplastic/test.jpg',
      name: 'Samsung S20 Ultra Plastic',
   },
   {
      variationId: 5,
      sku: 'LOGITECH-G502-HERO-WIRED',
      inventoryItemId: 3,
      image: '/logitechg502wired/test.jpg',
      name: 'Logitech G502 HERO Wired',
   },
   {
      variationId: 6,
      sku: 'LOGITECH-G502-HERO-WIRELESS',
      inventoryItemId: 3,
      image: '/logitechg502wireless/test.jpg',
      name: 'Logitech G502 HERO Wireless',
   },
   {
      variationId: 7,
      sku: 'APPLE-AIRPODS-PRO-WHITE',
      inventoryItemId: 4,
      image: '/appleairpodswhite/test.jpg',
      name: 'Apple AirPods Pro White',
   },
];

export const Location = [
   {
      locationId: 1,
      name: 'Warehouse A',
      description: 'Main warehouse for storing inventory items.',
   },
   {
      locationId: 2,
      name: 'Retail Store 1',
      description: 'Retail store located in downtown.',
   },
   {
      locationId: 3,
      name: 'Warehouse B',
      description: 'Overflow warehouse for additional storage.',
   },
   {
      locationId: 4,
      name: 'Retail Store 2',
      description: 'Second retail store in the suburbs.',
   },
   {
      locationId: 5,
      name: 'Warehouse C',
      description: 'Third warehouse for more inventory.',
   },
   {
      locationId: 6,
      name: 'Retail Store 3',
      description: 'Third retail store in the city center.',
   },
   {
      locationId: 7,
      name: 'Warehouse D',
      description: 'Fourth warehouse for high-value items.',
   },
];

export const VariationOnLocation = [
   {
      variationOnLocationId: 1,
      variationId: 1,
      locationId: 1,
      stock: 10,
   },
   {
      variationOnLocationId: 2,
      variationId: 2,
      locationId: 2,
      stock: 5,
   },
   {
      variationOnLocationId: 3,
      variationId: 3,
      locationId: 3,
      stock: 7,
   },
   {
      variationOnLocationId: 4,
      variationId: 4,
      locationId: 4,
      stock: 8,
   },
   {
      variationOnLocationId: 5,
      variationId: 5,
      locationId: 5,
      stock: 6,
   },
   {
      variationOnLocationId: 6,
      variationId: 6,
      locationId: 6,
      stock: 9,
   },
   {
      variationOnLocationId: 7,
      variationId: 7,
      locationId: 7,
      stock: 15,
   },
];

export const ItemReturns = [
   {
      stockReturnId: 1,
      inventoryItemId: 1,
      variationId: 1,
      locationId: 2,
      reason: 'Defective',
      returnedAt: new Date('2024-06-01T10:00:00Z'),
      status: 'Processed',
      request: 'Refund',
      result: 'Approved',
      returningParty: 'Customer',
   },
   {
      stockReturnId: 2,
      inventoryItemId: 2,
      variationId: 3,
      locationId: 1,
      reason: 'Wrong item',
      returnedAt: new Date('2024-06-02T11:00:00Z'),
      status: 'Pending',
      request: 'Exchange',
      result: 'Pending',
      returningParty: 'Customer',
   },
   {
      stockReturnId: 3,
      inventoryItemId: 3,
      variationId: 5,
      locationId: 4,
      reason: 'No longer needed',
      returnedAt: new Date('2024-06-03T12:00:00Z'),
      status: 'Rejected',
      request: 'Refund',
      result: 'Rejected',
      returningParty: 'Customer',
   },
];

export const Comment = [
   {
      commentId: 1,
      stockReturnId: 1,
      text: 'Screen was cracked on arrival.',
      createdAt: new Date('2024-05-27T10:05:00Z'),
   },
   {
      commentId: 2,
      stockReturnId: 1,
      text: 'Customer requested a refund.',
      createdAt: new Date('2024-05-27T10:10:00Z'),
   },
   {
      commentId: 3,
      stockReturnId: 2,
      text: 'Customer returned due to personal preference.',
      createdAt: new Date('2024-05-25T15:35:00Z'),
   },
   {
      commentId: 4,
      stockReturnId: 2,
      text: 'Issued store credit.',
      createdAt: new Date('2024-05-25T15:40:00Z'),
   },
   {
      commentId: 5,
      stockReturnId: 3,
      text: 'Customer decided they no longer wanted the item.',
      createdAt: new Date('2024-05-26T12:50:00Z'),
   },
   {
      commentId: 6,
      stockReturnId: 3,
      text: 'Processing refund request.',
      createdAt: new Date('2024-05-26T12:55:00Z'),
   },
];

export const InternalTransfers = [
   {
      internalTransferId: 1,
      inventoryItemId: 1,
      variationId: 1,
      quantity: 1,
      fromLocationId: 1,
      toLocationId: 2,
      transferDate: new Date('2024-05-20T09:00:00Z'),
      status: 'Completed',
   },
   {
      internalTransferId: 2,
      inventoryItemId: 3,
      variationId: 5,
      quantity: 1,
      fromLocationId: 3,
      toLocationId: 4,
      transferDate: new Date('2024-05-21T10:00:00Z'),
      status: 'Pending',
   },
   {
      internalTransferId: 3,
      inventoryItemId: 2,
      variationId: 3,
      quantity: 2,
      fromLocationId: 2,
      toLocationId: 1,
      transferDate: new Date('2024-05-22T11:00:00Z'),
      status: 'Pending',
   },
   {
      internalTransferId: 4,
      inventoryItemId: 4,
      variationId: 7,
      quantity: 5,
      fromLocationId: 4,
      toLocationId: 3,
      transferDate: new Date('2024-05-23T12:00:00Z'),
      status: 'In Transit',
   },
];

export const Sale = [
   {
      saleId: 1,
      inventoryItemId: 1, // iPhone 11 LCD Screen Replacement Aftermarket AM
      quantity: 2,
      revenue: 50, // Assuming $25 per screen
      saleDate: new Date('2024-05-28T09:15:00Z'),
   },
   {
      saleId: 2,
      inventoryItemId: 3, // Logitech G502 HERO Gaming Mouse
      quantity: 1,
      revenue: 60, // Assuming $60 per mouse
      saleDate: new Date('2024-05-28T12:30:00Z'),
   },
   {
      saleId: 3,
      inventoryItemId: 4, // Apple AirPods Pro
      quantity: 2,
      revenue: 400, // Assuming $200 per AirPods Pro
      saleDate: new Date('2024-05-28T14:45:00Z'),
   },
];

export const InventoryAge = [
   {
      inventoryAgeId: 1,
      inventoryItemId: 1, // iPhone 11 LCD Screen Replacement Aftermarket AM
      arrivalDate: new Date('2024-04-15T00:00:00Z'), // Arrival date of the item in inventory
   },
   {
      inventoryAgeId: 2,
      inventoryItemId: 2, // Samsung Galaxy S20 Ultra Screen Protector
      arrivalDate: new Date('2024-04-20T00:00:00Z'), // Arrival date of the item in inventory
   },
   {
      inventoryAgeId: 3,
      inventoryItemId: 3, // Logitech G502 HERO Gaming Mouse
      arrivalDate: new Date('2024-04-25T00:00:00Z'), // Arrival date of the item in inventory
   },
   {
      inventoryAgeId: 4,
      inventoryItemId: 4, // Apple AirPods Pro
      arrivalDate: new Date('2024-05-01T00:00:00Z'), // Arrival date of the item in inventory
   },
];

export const LowStockAlert = [
   {
      lowStockAlertId: 1,
      inventoryItemId: 1, // iPhone 11 LCD Screen Replacement Aftermarket AM
      threshold: 5, // Low stock threshold for the item
   },
   {
      lowStockAlertId: 2,
      inventoryItemId: 2, // Samsung Galaxy S20 Ultra Screen Protector
      threshold: 3, // Low stock threshold for the item
   },
   {
      lowStockAlertId: 3,
      inventoryItemId: 3, // Logitech G502 HERO Gaming Mouse
      threshold: 2, // Low stock threshold for the item
   },
   {
      lowStockAlertId: 4,
      inventoryItemId: 4, // Apple AirPods Pro
      threshold: 10, // Low stock threshold for the item
   },
];
