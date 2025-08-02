import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("Cleaning database...");

  // Delete in order to respect foreign key constraints
  // First delete dependent records before their parents
  // await prisma.inventoryStockLevel.deleteMany({});
  // await prisma.inventoryVariation.deleteMany({});
  // await prisma.inventoryItem.deleteMany({});

  // For category hierarchy, we need to handle the self-referential relationship
  // First, find all subcategories (categories with parentId)
  // const subcategories = await prisma.inventoryItemCategory.findMany({
  //   where: {
  //     parentId: { not: null },
  //   },
  // });

  // // Delete subcategories first
  // for (const category of subcategories) {
  //   await prisma.inventoryItemCategory.delete({
  //     where: { id: category.id },
  //   });
  // }

  // // Now delete remaining parent categories
  // await prisma.inventoryItemCategory.deleteMany({
  //   where: {
  //     parentId: null,
  //   },
  // });

  // await prisma.vendor.deleteMany({});
  // await prisma.storeLocation.deleteMany({});

  console.log("Database cleaned successfully");
}

async function main() {
  console.log("Starting inventory seed...");

  // Clean database before seeding
  await cleanDatabase();

  // Create store locations first
  // const storeLocations = await createStoreLocations();
  const storeLocations = await prisma.storeLocation.findMany();

  // Create categories
  const categories = await createCategories();

  // Create vendors
  const vendors = await createVendors();

  // Create inventory items with variations
  await createInventoryItems(categories, vendors, storeLocations);

  console.log("Inventory seed completed successfully");
}

// Define interfaces for our entities
interface StoreLocation {
  id: number; // Changed from string to number to match schema
}

interface Category {
  id: string;
}

interface Vendor {
  id: number; // Changed from string to number to match schema
}

interface CategoryCollection {
  phoneCategory: Category;
  accessoryCategory: Category;
  partCategory: Category;
  iPhoneCategory: Category;
  androidCategory: Category;
  casesCategory: Category;
  screensCategory: Category;
  batteriesCategory: Category;
}

async function createStoreLocations(): Promise<StoreLocation[]> {
  console.log("Creating store locations...");

  const locations = await Promise.all([
    prisma.storeLocation.create({
      data: {
        name: "Seattle",
        slug: "seattlevvv",
        address: "123 Main St, Seattle, WA 98101",
        phone: "206-555-1234",
        email: "main@lmlrepair.com",
        description: "Our flagship store in downtown Seattle",
        hours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed",
        },
        isActive: true,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "South Seattle",
        slug: "south-siaaade",
        address: "456 South Ave, Seattle, WA 98108",
        phone: "206-555-5678",
        email: "south@lmlrepair.com",
        description: "Our south Seattle location",
        hours: {
          monday: "10:00 AM - 7:00 PM",
          tuesday: "10:00 AM - 7:00 PM",
          wednesday: "10:00 AM - 7:00 PM",
          thursday: "10:00 AM - 7:00 PM",
          friday: "10:00 AM - 7:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed",
        },
        isActive: true,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "North Seattle",
        slug: "north-sidcce",
        address: "456 North Ave, Seattle, WA 98108",
        phone: "206-555-5678",
        email: "north@lmlrepair.com",
        description: "Our north Seattle location",
        hours: {
          monday: "10:00 AM - 7:00 PM",
          tuesday: "10:00 AM - 7:00 PM",
          wednesday: "10:00 AM - 7:00 PM",
          thursday: "10:00 AM - 7:00 PM",
          friday: "10:00 AM - 7:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed",
        },
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${locations.length} store locations`);
  return locations;
}

async function createCategories(): Promise<CategoryCollection> {
  console.log("Creating inventory categories...");

  // Create parent categories
  const phoneCategory = await prisma.inventoryItemCategory.create({
    data: {
      name: "Phones",
      visible: true,
      image: "/images/categories/phones.jpg",
      description: "Smartphones and mobile devices",
    },
  });

  const accessoryCategory = await prisma.inventoryItemCategory.create({
    data: {
      name: "Accessories",
      visible: true,
      image: "/images/categories/accessories.jpg",
      description: "Device accessories and add-ons",
    },
  });

  const partCategory = await prisma.inventoryItemCategory.create({
    data: {
      name: "Repair Parts",
      visible: true,
      image: "/images/categories/parts.jpg",
      description: "Components and parts for device repairs",
    },
  });

  // Create subcategories
  const iPhoneCategory = await prisma.inventoryItemCategory.create({
    data: {
      name: "iPhone",
      visible: true,
      parentId: phoneCategory.id,
      image: "/images/categories/iphone.jpg",
      description: "Apple iPhone devices",
    },
  });

  const androidCategory = await prisma.inventoryItemCategory.create({
    data: {
      name: "Android",
      visible: true,
      parentId: phoneCategory.id,
      image: "/images/categories/android.jpg",
      description: "Android smartphones",
    },
  });

  const casesCategory = await prisma.inventoryItemCategory.create({
    data: {
      name: "Cases",
      visible: true,
      parentId: accessoryCategory.id,
      image: "/images/categories/cases.jpg",
      description: "Protective cases for devices",
    },
  });

  const screensCategory = await prisma.inventoryItemCategory.create({
    data: {
      name: "Screens",
      visible: true,
      parentId: partCategory.id,
      image: "/images/categories/screens.jpg",
      description: "Replacement screens and displays",
    },
  });

  const batteriesCategory = await prisma.inventoryItemCategory.create({
    data: {
      name: "Batteries",
      visible: true,
      parentId: partCategory.id,
      image: "/images/categories/batteries.jpg",
      description: "Replacement batteries for devices",
    },
  });

  console.log("Categories created successfully");

  return {
    phoneCategory,
    accessoryCategory,
    partCategory,
    iPhoneCategory,
    androidCategory,
    casesCategory,
    screensCategory,
    batteriesCategory,
  };
}

async function createVendors(): Promise<Vendor[]> {
  console.log("Creating vendors...");

  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: "Apple Parts Inc.",
        contactName: "John Apple",
        contactEmail: "john@appleparts.com",
        contactPhone: "415-555-7890",
        address: "1 Apple Way, Cupertino, CA",
        website: "www.appleparts.com",
        leadTime: 5,
        rating: 4.8,
        notes: "Premium supplier for Apple parts",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Android Supply Co.",
        contactName: "Andy Droid",
        contactEmail: "andy@androidsupply.com",
        contactPhone: "650-555-1234",
        address: "100 Robot Road, Mountain View, CA",
        website: "www.androidsupply.com",
        leadTime: 7,
        rating: 4.5,
        notes: "Reliable source for Android components",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "AccessoryWorld",
        contactName: "Alicia Wilson",
        contactEmail: "alicia@accessoryworld.com",
        contactPhone: "206-555-9876",
        address: "200 Case Court, Seattle, WA",
        website: "www.accessoryworld.com",
        leadTime: 3,
        rating: 4.2,
        notes: "Great for bulk accessories",
      },
    }),
  ]);

  console.log(`Created ${vendors.length} vendors`);
  return vendors;
}

async function createInventoryItems(
  categories: CategoryCollection,
  vendors: Vendor[],
  storeLocations: StoreLocation[]
): Promise<void> {
  console.log("Creating inventory items and variations...");

  // iPhone 13 Screen
  const iPhoneScreen = await prisma.inventoryItem.create({
    data: {
      name: "iPhone 13 Screen Assembly",
      description:
        "Complete screen assembly for iPhone 13 including LCD and digitizer",
      image: "/images/inventory/iphone-13-screen.jpg",
      categories: {
        connect: [
          { id: categories.screensCategory.id },
          { id: categories.iPhoneCategory.id },
        ],
      },
      supplierId: vendors[0].id,
      variations: {
        create: [
          {
            sku: "IP13-SCRN-BLK",
            name: "iPhone 13 Screen - Black",
            image: "/images/inventory/iphone-13-screen-black.jpg",
            raw: 65.0,
            tax: 5.85,
            shipping: 2.5,
            totalCost: 73.35,
            markup: 35,
            sellingPrice: 99.0,
            profit: 25.65,
            visible: true,
            stockLevels: {
              create: [
                {
                  locationId: storeLocations[0].id,
                  stock: 15,
                  purchaseCost: 73.35,
                },
                {
                  locationId: storeLocations[1].id,
                  stock: 8,
                  purchaseCost: 73.35,
                },
              ],
            },
          },
          {
            sku: "IP13-SCRN-WHT",
            name: "iPhone 13 Screen - White",
            image: "/images/inventory/iphone-13-screen-white.jpg",
            raw: 65.0,
            tax: 5.85,
            shipping: 2.5,
            totalCost: 73.35,
            markup: 35,
            sellingPrice: 99.0,
            profit: 25.65,
            visible: true,
            stockLevels: {
              create: [
                {
                  locationId: storeLocations[0].id,
                  stock: 12,
                  purchaseCost: 73.35,
                },
                {
                  locationId: storeLocations[1].id,
                  stock: 6,
                  purchaseCost: 73.35,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Samsung Galaxy Battery
  const samsungBattery = await prisma.inventoryItem.create({
    data: {
      name: "Samsung Galaxy S21 Battery",
      description: "Replacement battery for Samsung Galaxy S21",
      image: "/images/inventory/samsung-battery.jpg",
      categories: {
        connect: [
          { id: categories.batteriesCategory.id },
          { id: categories.androidCategory.id },
        ],
      },
      supplierId: vendors[1].id,
      variations: {
        create: [
          {
            sku: "SAM-S21-BAT",
            name: "Standard Capacity Battery",
            image: "/images/inventory/samsung-battery-standard.jpg",
            raw: 25.0,
            tax: 2.25,
            shipping: 1.5,
            totalCost: 28.75,
            markup: 40,
            sellingPrice: 39.99,
            profit: 11.24,
            visible: true,
            stockLevels: {
              create: [
                {
                  locationId: storeLocations[0].id,
                  stock: 20,
                  purchaseCost: 28.75,
                },
                {
                  locationId: storeLocations[1].id,
                  stock: 15,
                  purchaseCost: 28.75,
                },
              ],
            },
          },
          {
            sku: "SAM-S21-BAT-HC",
            name: "High Capacity Battery",
            image: "/images/inventory/samsung-battery-highcap.jpg",
            raw: 35.0,
            tax: 3.15,
            shipping: 1.5,
            totalCost: 39.65,
            markup: 40,
            sellingPrice: 54.99,
            profit: 15.34,
            visible: true,
            stockLevels: {
              create: [
                {
                  locationId: storeLocations[0].id,
                  stock: 10,
                  purchaseCost: 39.65,
                },
                {
                  locationId: storeLocations[1].id,
                  stock: 5,
                  purchaseCost: 39.65,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Phone Case
  const phoneCase = await prisma.inventoryItem.create({
    data: {
      name: "Premium Phone Case",
      description: "High-quality protective case for smartphones",
      image: "/images/inventory/phone-case.jpg",
      categories: {
        connect: [
          { id: categories.casesCategory.id },
          { id: categories.accessoryCategory.id },
        ],
      },
      supplierId: vendors[2].id,
      variations: {
        create: [
          {
            sku: "CASE-IP13-BLK",
            name: "iPhone 13 Case - Black",
            image: "/images/inventory/iphone-case-black.jpg",
            raw: 8.0,
            tax: 0.72,
            shipping: 0.5,
            totalCost: 9.22,
            markup: 120,
            sellingPrice: 19.99,
            profit: 10.77,
            visible: true,
            stockLevels: {
              create: [
                {
                  locationId: storeLocations[0].id,
                  stock: 25,
                  purchaseCost: 9.22,
                },
                {
                  locationId: storeLocations[1].id,
                  stock: 20,
                  purchaseCost: 9.22,
                },
              ],
            },
          },
          {
            sku: "CASE-IP13-RED",
            name: "iPhone 13 Case - Red",
            image: "/images/inventory/iphone-case-red.jpg",
            raw: 8.0,
            tax: 0.72,
            shipping: 0.5,
            totalCost: 9.22,
            markup: 120,
            sellingPrice: 19.99,
            profit: 10.77,
            visible: true,
            stockLevels: {
              create: [
                {
                  locationId: storeLocations[0].id,
                  stock: 15,
                  purchaseCost: 9.22,
                },
                {
                  locationId: storeLocations[1].id,
                  stock: 12,
                  purchaseCost: 9.22,
                },
              ],
            },
          },
          {
            sku: "CASE-SAM-S21-BLK",
            name: "Samsung S21 Case - Black",
            image: "/images/inventory/samsung-case-black.jpg",
            raw: 8.0,
            tax: 0.72,
            shipping: 0.5,
            totalCost: 9.22,
            markup: 120,
            sellingPrice: 19.99,
            profit: 10.77,
            visible: true,
            stockLevels: {
              create: [
                {
                  locationId: storeLocations[0].id,
                  stock: 18,
                  purchaseCost: 9.22,
                },
                {
                  locationId: storeLocations[1].id,
                  stock: 10,
                  purchaseCost: 9.22,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Created inventory items and variations successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
