import { squareClient, SQUARE_LOCATION_ID } from "../src/lib/square/client";
import { randomUUID } from "crypto";

// Sample categories for electronics repair
const categories = [
  {
    name: "iPhone Repair Kits",
    abbreviation: "IPHONE",
  },
  {
    name: "Samsung Galaxy Kits",
    abbreviation: "SAMSUNG",
  },
  {
    name: "Google Pixel Parts",
    abbreviation: "PIXEL",
  },
  {
    name: "Universal Tools",
    abbreviation: "TOOLS",
  },
  {
    name: "Replacement Screens",
    abbreviation: "SCREENS",
  },
  {
    name: "Batteries",
    abbreviation: "BATTERY",
  },
];

// Sample products for each category
const products = [
  // iPhone Repair Kits
  {
    name: "iPhone 14 Pro Screen Replacement Kit",
    description:
      "Complete kit with OLED screen, tools, and adhesive for iPhone 14 Pro repair",
    categoryName: "iPhone Repair Kits",
    price: 89.99,
    sku: "IPH14PRO-SCREEN-001",
  },
  {
    name: "iPhone 13 Battery Replacement Kit",
    description:
      "High-capacity battery with tools and adhesive strips for iPhone 13",
    categoryName: "iPhone Repair Kits",
    price: 29.99,
    sku: "IPH13-BATTERY-001",
  },
  {
    name: "iPhone 12 Mini Complete Repair Kit",
    description:
      "Everything needed for iPhone 12 Mini repairs: screen, battery, tools",
    categoryName: "iPhone Repair Kits",
    price: 119.99,
    sku: "IPH12MINI-COMPLETE-001",
  },

  // Samsung Galaxy Kits
  {
    name: "Samsung Galaxy S23 Ultra Screen Kit",
    description:
      "Premium AMOLED display with S Pen support and installation tools",
    categoryName: "Samsung Galaxy Kits",
    price: 149.99,
    sku: "SAM-S23ULTRA-SCREEN-001",
  },
  {
    name: "Galaxy S22 Battery Replacement",
    description: "Original capacity battery with adhesive and removal tools",
    categoryName: "Samsung Galaxy Kits",
    price: 34.99,
    sku: "SAM-S22-BATTERY-001",
  },

  // Google Pixel Parts
  {
    name: "Pixel 7 Pro Screen Assembly",
    description: "Complete screen assembly with frame for Google Pixel 7 Pro",
    categoryName: "Google Pixel Parts",
    price: 199.99,
    sku: "PIX7PRO-SCREEN-001",
  },
  {
    name: "Pixel 6a Battery Kit",
    description: "Replacement battery with adhesive strips and tools",
    categoryName: "Google Pixel Parts",
    price: 24.99,
    sku: "PIX6A-BATTERY-001",
  },

  // Universal Tools
  {
    name: "Professional Repair Tool Set",
    description:
      "64-piece precision tool kit for smartphone and tablet repairs",
    categoryName: "Universal Tools",
    price: 49.99,
    sku: "TOOLS-PRO-64PC-001",
  },
  {
    name: "Spudger Set (5-piece)",
    description: "Anti-static spudgers for safe component removal",
    categoryName: "Universal Tools",
    price: 12.99,
    sku: "TOOLS-SPUDGER-5PC-001",
  },
  {
    name: "Heat Gun Pro",
    description: "Variable temperature heat gun for adhesive removal",
    categoryName: "Universal Tools",
    price: 79.99,
    sku: "TOOLS-HEATGUN-PRO-001",
  },

  // Replacement Screens
  {
    name: "Universal LCD Test Board",
    description: "Test multiple screen types and resolutions",
    categoryName: "Replacement Screens",
    price: 159.99,
    sku: "SCREEN-TEST-BOARD-001",
  },

  // Batteries
  {
    name: "Universal Battery Tester",
    description: "Digital battery capacity and health tester",
    categoryName: "Batteries",
    price: 39.99,
    sku: "BATTERY-TESTER-001",
  },
];

async function seedSquareData() {
  try {
    console.log("Starting Square data seeding...");
    console.log("⚠️  Note: This is a stub implementation for Square SDK v42");
    console.log(
      "The actual Square API calls need to be implemented with correct method names"
    );

    // Step 1: Create categories
    console.log("Creating categories...");
    const createdCategories: { [key: string]: string } = {};

    for (const category of categories) {
      try {
        // TODO: Replace with correct Square SDK v42 method
        console.log(`📝 Would create category: ${category.name}`);

        // Mock successful creation
        const mockId = `category_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        createdCategories[category.name] = mockId;
        console.log(`✓ Mock created category: ${category.name} (${mockId})`);
      } catch (error) {
        console.error(`✗ Error creating category ${category.name}:`, error);
      }
    }

    // Step 2: Create products
    console.log("\nCreating products...");

    for (const product of products) {
      try {
        const categoryId = createdCategories[product.categoryName];

        if (!categoryId) {
          console.error(`✗ Category not found for product: ${product.name}`);
          continue;
        }

        // TODO: Replace with correct Square SDK v42 method
        console.log(
          `📝 Would create product: ${product.name} in category ${product.categoryName}`
        );

        // Mock successful creation
        const mockProductId = `product_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const mockVariationId = `variation_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        console.log(
          `✓ Mock created product: ${product.name} (${mockProductId})`
        );

        // Mock inventory setting
        await setInitialInventory(mockVariationId, 50);
      } catch (error) {
        console.error(`✗ Error creating product ${product.name}:`, error);
      }
    }

    console.log("\n✅ Square data seeding completed successfully!");
    console.log("\n📝 Next steps:");
    console.log(
      "1. Copy your environment variables from env.example to .env.local"
    );
    console.log("2. Add your Square sandbox credentials to .env.local");
    console.log(
      "3. Update this script with correct Square SDK v42 method names"
    );
    console.log("4. Start your development server: npm run dev");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

async function setInitialInventory(catalogObjectId: string, quantity: number) {
  try {
    // TODO: Replace with correct Square SDK v42 method
    console.log(
      `📝 Would set inventory for ${catalogObjectId}: ${quantity} units`
    );
    console.log(
      `✓ Mock set inventory for ${catalogObjectId}: ${quantity} units`
    );
  } catch (error) {
    console.error(`✗ Error setting inventory for ${catalogObjectId}:`, error);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  // Load environment variables
  require("dotenv").config({ path: ".env.local" });

  if (!process.env.SQUARE_ACCESS_TOKEN) {
    console.error("❌ Missing SQUARE_ACCESS_TOKEN in environment variables");
    console.log(
      "Please copy env.example to .env.local and add your Square credentials"
    );
    process.exit(1);
  }

  if (!process.env.SQUARE_LOCATION_ID) {
    console.error("❌ Missing SQUARE_LOCATION_ID in environment variables");
    console.log("Please add your Square location ID to .env.local");
    process.exit(1);
  }

  seedSquareData();
}

export { seedSquareData };
