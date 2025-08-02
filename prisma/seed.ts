import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  ItemsCategory,
  ItemsSubCategory,
  InventoryItem,
  InventoryItemBrand,
  Vendor,
  Variation,
  Location,
  VariationOnLocation,
  ItemReturns,
  Comment,
  InternalTransfers,
  Sale,
  InventoryAge,
  LowStockAlert,
} from "./inventoryItems";

const prisma = new PrismaClient();

async function cleanDatabase() {
  // First, delete all child links (links with parentId)
  // await prisma.$executeRaw`DELETE FROM SitemapLink WHERE parentId IS NOT NULL;`;

  // Then delete remaining links
  // await prisma.$executeRaw`DELETE FROM SitemapLink WHERE parentId IS NULL;`;

  // Delete other entities
  // Delete all existing records in reverse order of dependencies
  await prisma.deviceConditionImage.deleteMany({});
  await prisma.deviceCondition.deleteMany({});
  await prisma.repairDevice.deleteMany({});
  await prisma.ticket.deleteMany({});
  // await prisma.customer.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.repairOption.deleteMany({});
  await prisma.repairType.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.series.deleteMany({});
  await prisma.model.deleteMany({});
  await prisma.deviceType.deleteMany({});
  await prisma.diagnosticQuestion.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.variationOnLocation.deleteMany({});
  await prisma.inventoryStockLevel.deleteMany({});
  await prisma.inventoryVariation.deleteMany({});

  // For inventory categories, we need to delete child categories first
  // Get all subcategories (categories with parentId)
  const subcategories = await prisma.inventoryItemCategory.findMany({
    where: {
      parentId: {
        not: null,
      },
    },
  });

  // Delete each subcategory
  for (const subcategory of subcategories) {
    await prisma.inventoryItemCategory.delete({
      where: {
        id: subcategory.id,
      },
    });
  }

  // Now delete all remaining categories
  await prisma.inventoryItemCategory.deleteMany({});

  await prisma.inventoryItem.deleteMany({});
  await prisma.storeLocation.deleteMany({});
  await prisma.vendor.deleteMany({});
}

// Function to seed inventory items data from inventoryItems.ts
async function seedInventoryItems() {
  console.log("Seeding inventory items data...");

  // 1. Create store locations
  console.log("Creating store locations...");
  const locationMap = new Map();

  for (const location of Location) {
    const createdLocation = await prisma.storeLocation.create({
      data: {
        name: location.name,
        address: `123 ${location.name} St`,
        phone: "123-456-7890",
        email: `${location.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
        description: location.description,
        hours: JSON.stringify({
          monday: "9:00 AM - 5:00 PM",
          tuesday: "9:00 AM - 5:00 PM",
          wednesday: "9:00 AM - 5:00 PM",
          thursday: "9:00 AM - 5:00 PM",
          friday: "9:00 AM - 5:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed",
        }),
        slug: location.name.toLowerCase().replace(/\s+/g, "-"),
      },
    });
    locationMap.set(location.locationId, createdLocation.id);
    console.log(`Created location: ${location.name}`);
  }

  // 2. Create vendors
  console.log("Creating vendors...");
  const vendorMap = new Map();

  for (const vendor of Vendor) {
    const createdVendor = await prisma.vendor.create({
      data: {
        name: vendor.name,
        contactName: `${vendor.name} Contact`,
        contactEmail: `contact@${vendor.name
          .toLowerCase()
          .replace(/\s+/g, "")}.com`,
        contactPhone: "123-456-7890",
        website: `https://${vendor.name.toLowerCase().replace(/\s+/g, "")}.com`,
      },
    });
    vendorMap.set(vendor.vendorId, createdVendor.id);
    console.log(`Created vendor: ${vendor.name}`);
  }

  // 3. Create inventory item categories
  console.log("Creating inventory item categories...");
  const categoryMap = new Map();

  for (const category of ItemsCategory) {
    const createdCategory = await prisma.inventoryItemCategory.create({
      data: {
        name: category.name,
        image: category.image,
        description: `Category for ${category.name}`,
        visible: true,
      },
    });
    categoryMap.set(category.itemsCategoryId, createdCategory.id);
    console.log(`Created category: ${category.name}`);
  }

  // 4. Create inventory subcategories
  console.log("Creating inventory subcategories...");
  const subcategoryMap = new Map();

  for (const subcategory of ItemsSubCategory) {
    const parentCategoryId = categoryMap.get(subcategory.categoryId);

    if (parentCategoryId) {
      const createdSubcategory = await prisma.inventoryItemCategory.create({
        data: {
          name: subcategory.name,
          image: `/subcategories/${subcategory.name
            .toLowerCase()
            .replace(/\s+/g, "-")}.jpg`,
          description: `Subcategory for ${subcategory.name}`,
          visible: true,
          parentId: parentCategoryId,
        },
      });
      subcategoryMap.set(subcategory.itemsSubCategoryId, createdSubcategory.id);
      console.log(`Created subcategory: ${subcategory.name}`);
    }
  }

  // 5. Create inventory items
  console.log("Creating inventory items...");
  const itemMap = new Map();

  for (const item of InventoryItem) {
    const categoryId = subcategoryMap.get(item.itemsSubCategoryId);
    const vendorId = vendorMap.get(item.vendorId);

    if (categoryId && vendorId) {
      const createdItem = await prisma.inventoryItem.create({
        data: {
          name: item.name,
          description: item.description,
          image: item.image,
          supplierId: vendorId,
          categories: {
            connect: [{ id: categoryId }],
          },
        },
      });
      itemMap.set(item.inventoryItemId, createdItem.id);
      console.log(`Created inventory item: ${item.name}`);
    }
  }

  // 6. Create variations
  console.log("Creating inventory variations...");
  const variationMap = new Map();

  for (const variation of Variation) {
    const itemId = itemMap.get(variation.inventoryItemId);

    if (itemId) {
      const markup = Math.floor(Math.random() * 100) + 20; // Random markup between 20% and 120%
      const raw = Math.floor(Math.random() * 50) + 10; // Random base cost between $10 and $60
      const tax = raw * 0.1; // 10% tax
      const shipping = Math.floor(Math.random() * 10) + 1; // Random shipping between $1 and $11
      const totalCost = raw + tax + shipping;
      const profit = (totalCost * markup) / 100;
      const sellingPrice = totalCost + profit;

      const createdVariation = await prisma.inventoryVariation.create({
        data: {
          sku: variation.sku,
          name: variation.name,
          image: variation.image,
          raw: raw,
          tax: tax,
          shipping: shipping,
          totalCost: totalCost,
          markup: markup,
          profit: profit,
          sellingPrice: sellingPrice,
          inventoryItemId: itemId,
        },
      });
      variationMap.set(variation.variationId, createdVariation.id);
      console.log(`Created variation: ${variation.name}`);
    }
  }

  // 7. Create variation stock levels
  console.log("Creating stock levels...");

  for (const stockEntry of VariationOnLocation) {
    const locationId = locationMap.get(stockEntry.locationId);
    const variationId = variationMap.get(stockEntry.variationId);

    if (locationId && variationId) {
      await prisma.inventoryStockLevel.create({
        data: {
          variationId: variationId,
          locationId: locationId,
          stock: stockEntry.stock,
        },
      });
      console.log(
        `Added stock for variation at location ${stockEntry.locationId}`
      );
    }
  }

  console.log("Inventory items seeding completed.");
}

// Function to seed repair price data
async function seedRepairPrices(
  genericRepairTypeMap: Map<
    string,
    { id: string; duration: string; description: string }
  >
) {
  console.log("Seeding repair price data...");

  // Get all models with their related series and brands
  const models = await prisma.model.findMany({
    include: {
      series: {
        include: {
          brand: true,
        },
      },
    },
  });

  if (models.length === 0) {
    console.log("No models found to create repairs for");
    return;
  }

  // Use the generic repair types passed in
  const genericRepairTypes = Array.from(genericRepairTypeMap.values());

  // Create model-specific repair options linked to generic repair types
  for (const model of models) {
    console.log(`Creating repair options for model: ${model.name}`);

    for (const genericRepairType of genericRepairTypes) {
      // Create a unique name for the repair option based on the model and generic type
      const entry = Array.from(genericRepairTypeMap.entries()).find(
        (entry) => entry[1].id === genericRepairType.id
      );
      const repairTypeName = entry ? entry[0] : "Unknown Repair"; // Get the name from the map key
      const optionName = `${model.name} ${repairTypeName}`;

      // Base price depends on the brand and series
      let basePrice = 0;
      if (model.series.brand.name === "Apple") {
        basePrice = 80 + Math.floor(Math.random() * 50);
      } else if (model.series.brand.name === "Samsung") {
        basePrice = 70 + Math.floor(Math.random() * 40);
      } else {
        basePrice = 60 + Math.floor(Math.random() * 30);
      }

      // Create the repair option linking model and generic repair type
      await prisma.repairOption.create({
        data: {
          name: optionName,
          description: `${genericRepairType.description} for ${model.name}`,
          repairTypeId: genericRepairType.id, // Link to generic type
          modelId: model.id, // Link to specific model
          labour: 0,
          price: basePrice,
          duration: genericRepairType.duration,
        },
      });

      console.log(`Created repair option: ${optionName}`);
    }
  }

  console.log("Repair price data seeding completed.");
}

// Function to seed device types and issues
async function seedDeviceTypesAndIssues(): Promise<{
  deviceTypeMap: Map<string, string>;
  genericRepairTypeMap: Map<
    string,
    { id: string; duration: string; description: string }
  >;
}> {
  console.log("Seeding device types and issues...");

  // 1. Create device types
  const deviceTypesData = [
    {
      name: "Smartphone",
      description: "Mobile phones with advanced features",
    },
    {
      name: "Tablet",
      description: "Portable touchscreen computers",
    },
    {
      name: "Laptop",
      description: "Portable personal computers",
    },
  ];

  const deviceTypeMap = new Map<string, string>();

  for (const deviceType of deviceTypesData) {
    const createdDeviceType = await prisma.deviceType.create({
      data: deviceType,
    });
    deviceTypeMap.set(deviceType.name, createdDeviceType.id);
    console.log(`Created device type: ${deviceType.name}`);
  }

  // 2. Create generic repair types (ensure names are unique as per schema)
  console.log("Creating generic repair types...");
  const genericRepairTypesData = [
    {
      name: "Screen Replacement",
      description: "Replace damaged screen with a new one",
      timeFrame: "1-2 hours",
    },
    {
      name: "Battery Replacement",
      description: "Replace old or damaged battery",
      timeFrame: "30-60 minutes",
    },
    {
      name: "Charging Port Repair",
      description: "Fix or replace damaged charging port",
      timeFrame: "60-90 minutes",
    },
    {
      name: "Back Glass Replacement",
      description: "Replace cracked or damaged back glass",
      timeFrame: "60-90 minutes",
    },
    {
      name: "Water Damage Treatment",
      description: "Clean and attempt to fix water damaged devices",
      timeFrame: "2-4 hours",
    },
  ];

  const genericRepairTypeMap = new Map<
    string,
    { id: string; duration: string; description: string }
  >();

  for (const repairTypeData of genericRepairTypesData) {
    // Check if it already exists to prevent duplicates if script is run partially/multiple times
    let existingType = await prisma.repairType.findUnique({
      where: { name: repairTypeData.name },
    });
    if (!existingType) {
      existingType = await prisma.repairType.create({
        data: {
          name: repairTypeData.name,
          description: repairTypeData.description,
          timeFrame: repairTypeData.timeFrame,
          order: 0, // Default order
        },
      });
      console.log(`Created generic repair type: ${repairTypeData.name}`);
    }
    genericRepairTypeMap.set(repairTypeData.name, {
      id: existingType.id,
      duration: existingType.timeFrame ?? repairTypeData.timeFrame,
      description: existingType.description ?? repairTypeData.description,
    });
  }

  // 3. Create common issues and link them to generic repair types
  console.log("Creating common issues...");
  const commonIssues = [
    {
      name: "Cracked Screen",
      keywords: "broken, shattered, display, touch not working",
      repairTypeName: "Screen Replacement",
    },
    {
      name: "Battery Not Charging",
      keywords: "power, drain, not charging, dies quickly",
      repairTypeName: "Battery Replacement",
    },
    {
      name: "Water Damage Issue", // Generic issue name
      keywords: "liquid, wet, spill, not turning on",
      repairTypeName: "Water Damage Treatment",
    },
    {
      name: "Broken Charging Port",
      keywords: "not charging, loose connection, port damaged",
      repairTypeName: "Charging Port Repair",
    },
    {
      name: "Cracked Back Glass",
      keywords: "back broken, shattered glass",
      repairTypeName: "Back Glass Replacement",
    },
    {
      name: "Tablet Screen Cracked",
      keywords: "broken, shattered, display, touch not working, tablet",
      repairTypeName: "Screen Replacement",
    },
    {
      name: "Tablet Battery Issues",
      keywords: "not charging, drain, power problems, tablet",
      repairTypeName: "Battery Replacement",
    },
  ];

  // Create issues
  for (const issue of commonIssues) {
    const repairType = genericRepairTypeMap.get(issue.repairTypeName);

    if (repairType) {
      await prisma.issue.create({
        data: {
          name: issue.name,
          keywords: issue.keywords,
          // repairTypeId: repairType.id, // Link to generic repair type ID
        },
      });
      console.log(
        `Created issue: ${issue.name} linked to ${issue.repairTypeName}`
      );
    } else {
      // Create issue without linking if type not found (should not happen with current setup)
      await prisma.issue.create({
        data: {
          name: issue.name,
          keywords: issue.keywords,
        },
      });
      console.log(`Created issue: ${issue.name} (no repair type link)`);
    }
  }

  console.log("Device types and issues seeding completed.");
  return { deviceTypeMap, genericRepairTypeMap }; // Return the maps
}

async function main() {
  // Clean up existing data
  // await cleanDatabase();

  // Seed device types, generic repair types, and issues
  const { deviceTypeMap, genericRepairTypeMap } =
    await seedDeviceTypesAndIssues();

  // Create a Staff User
  console.log("Creating staff user...");
  const hashedPassword = await bcrypt.hash("test", 10);
  await prisma.staff.create({
    data: {
      email: "test3@gmail.com",
      firstName: "Test",
      lastName: "User",
      phone: "1234567890",
      role: "admin",
      password: hashedPassword,
      jobTitle: "technician",
      isActive: true,
      availability: "Full-time",
    },
  });

  // Create Customer
  console.log("Creating customer...");
  const customerPassword = await bcrypt.hash("test", 10);
  await prisma.customer.create({
    data: {
      email: "johnDoe@gmail.com",
      firstName: "John",
      lastName: "Doe",
      phone: "1234567890",
      isActive: true,
      password: customerPassword,
    },
  });
  // Define brands to create
  const brands = [
    {
      name: "Apple",
      image: "/logo.png",
      desc: "Apple devices including iPhones, iPads, and MacBooks",
      deviceType: "Smartphone",
      series: [
        {
          name: "iPhone",
          image: "/logo.png",
          desc: "Apple iPhone smartphones",
          models: Array.from({ length: 7 }, (_, i) => ({
            name: `iPhone ${15 - i}`,
            image: "/logo.png",
            desc: `iPhone ${15 - i} smartphone`,
          })),
        },
        {
          name: "iPad",
          image: "/logo.png",
          desc: "Apple iPad tablets",
          models: [
            {
              name: "iPad Pro 12.9",
              image: "/logo.png",
              desc: "12.9-inch iPad Pro",
            },
            {
              name: "iPad Pro 11",
              image: "/logo.png",
              desc: "11-inch iPad Pro",
            },
            {
              name: "iPad Air",
              image: "/logo.png",
              desc: "iPad Air",
            },
            {
              name: "iPad mini",
              image: "/logo.png",
              desc: "iPad mini",
            },
            {
              name: "iPad 10th gen",
              image: "/models/ipad-10.png",
              desc: "10th generation iPad",
            },
            {
              name: "iPad 9th gen",
              image: "/models/ipad-9.png",
              desc: "9th generation iPad",
            },
            {
              name: "iPad 8th gen",
              image: "/models/ipad-8.png",
              desc: "8th generation iPad",
            },
          ],
        },
      ],
    },
    {
      name: "Samsung",
      image: "/brands/samsung.png",
      desc: "Samsung mobile devices and tablets",
      deviceType: "Smartphone",
      series: [
        {
          name: "Galaxy S",
          image: "/series/galaxy-s.png",
          desc: "Samsung Galaxy S series smartphones",
          models: Array.from({ length: 7 }, (_, i) => ({
            name: `Galaxy S${24 - i}`,
            image: `/models/galaxy-s${24 - i}.png`,
            desc: `Samsung Galaxy S${24 - i} smartphone`,
          })),
        },
        {
          name: "Galaxy Tab",
          image: "/series/galaxy-tab.png",
          desc: "Samsung Galaxy tablets",
          models: [
            {
              name: "Galaxy Tab S9 Ultra",
              image: "/models/tab-s9-ultra.png",
              desc: "Galaxy Tab S9 Ultra",
            },
            {
              name: "Galaxy Tab S9+",
              image: "/models/tab-s9-plus.png",
              desc: "Galaxy Tab S9+",
            },
            {
              name: "Galaxy Tab S9",
              image: "/models/tab-s9.png",
              desc: "Galaxy Tab S9",
            },
            {
              name: "Galaxy Tab S8",
              image: "/models/tab-s8.png",
              desc: "Galaxy Tab S8",
            },
            {
              name: "Galaxy Tab S7",
              image: "/models/tab-s7.png",
              desc: "Galaxy Tab S7",
            },
            {
              name: "Galaxy Tab A8",
              image: "/models/tab-a8.png",
              desc: "Galaxy Tab A8",
            },
            {
              name: "Galaxy Tab A7",
              image: "/models/tab-a7.png",
              desc: "Galaxy Tab A7",
            },
          ],
        },
      ],
    },
    {
      name: "Google",
      image: "/brands/google.png",
      desc: "Google Pixel devices",
      deviceType: "Smartphone",
      series: [
        {
          name: "Pixel",
          image: "/series/pixel.png",
          desc: "Google Pixel smartphones",
          models: Array.from({ length: 7 }, (_, i) => ({
            name: `Pixel ${8 - i}`,
            image: `/models/pixel-${8 - i}.png`,
            desc: `Google Pixel ${8 - i} smartphone`,
          })),
        },
        {
          name: "Pixel Tablet",
          image: "/series/pixel-tablet.png",
          desc: "Google Pixel tablets",
          models: [
            {
              name: "Pixel Tablet",
              image: "/models/pixel-tablet.png",
              desc: "Google Pixel Tablet",
            },
          ],
        },
      ],
    },
  ];

  // Create brands and their series/models
  for (const brand of brands) {
    console.log(`Creating brand: ${brand.name}`);
    const existingBrand = await prisma.brand.findFirst({
      where: { name: brand.name },
    });

    if (!existingBrand) {
      const deviceTypeId = deviceTypeMap.get(brand.deviceType);

      // Ensure deviceTypeId is valid before creating the brand
      if (!deviceTypeId) {
        console.error(
          `Device type '${brand.deviceType}' not found for brand '${brand.name}'. Skipping brand creation.`
        );
        continue; // Skip this brand if its device type doesn't exist
      }

      const createdBrand = await prisma.brand.create({
        data: {
          name: brand.name,
          image: brand.image,
          desc: brand.desc,
          order: 0,
          deviceTypeId: deviceTypeId,
        },
      });

      for (const series of brand.series) {
        console.log(`Creating series: ${series.name}`);
        await prisma.series.create({
          data: {
            name: series.name,
            image: series.image,
            desc: series.desc,
            order: 0,
            brandId: createdBrand.id,
            models: {
              create: series.models.map((model) => ({
                name: model.name,
                image: model.image,
                description: model.desc,
                order: 0,
              })),
            },
          },
        });
      }
    } else {
      console.log(`Brand already exists: ${brand.name}`);
    }
  }

  // Create sample diagnostic questions
  console.log("Creating diagnostic questions...");
  const allModels = await prisma.model.findMany({
    include: {
      series: {
        include: {
          brand: true,
        },
      },
    },
  });

  const sampleQuestions = [
    {
      question: "Is your device turning on?",
      description:
        "Check if the device shows any signs of life when powered on",
      type: "yes_no",
      models: allModels.map((m) => ({ id: m.id })),
    },
    {
      question: "What type of physical damage does your device have?",
      description: "Select all types of damage that apply to your device",
      type: "multiple_choice",
      options: [
        "Cracked screen",
        "Water damage",
        "Battery issues",
        "No physical damage",
      ],
      models: allModels.map((m) => ({ id: m.id })),
    },
    {
      question: "Is your device's screen responding to touch?",
      type: "yes_no",
      models: allModels.map((m) => ({ id: m.id })),
    },
    {
      question: "Which camera feature is not working?",
      type: "multiple_choice",
      options: [
        "Front camera",
        "Back camera",
        "Flash",
        "Portrait mode",
        "All features working",
      ],
      models: allModels.map((m) => ({ id: m.id })),
    },
    {
      question: "Describe any unusual sounds coming from your device",
      type: "text",
      models: allModels.map((m) => ({ id: m.id })),
    },
  ];

  for (const question of sampleQuestions) {
    console.log(`Creating question: ${question.question}`);
    await prisma.diagnosticQuestion.create({
      data: {
        question: question.question,
        description: question.description,
        type: question.type,
        options: question.options,
        models: {
          connect: question.models,
        },
      },
    });
  }

  // Seed inventory items data
  await seedInventoryItems();

  // Seed repair price data (pass the generic types map)
  await seedRepairPrices(genericRepairTypeMap);

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
