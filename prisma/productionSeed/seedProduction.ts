import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedDeviceHierarchy } from "./productionSeedData"; // Import the device seeding function
import { seedRepairTypes } from "./repairTypeSeed"; // Import the repair type seeding function
import { seedBlogs } from "./blogSeed"; // Import the blog seeding function

const prisma = new PrismaClient();

// Function to seed staff data
async function seedStaff() {
  console.log("Creating staff user...");
  const hashedPassword = await bcrypt.hash("@admin@lml!Test123", 10); // Use a strong password for production
  try {
    const staff = await prisma.staff.create({
      data: {
        email: "admin@lmlrepair.com", // Use a production email
        firstName: "Admin",
        lastName: "User",
        phone: "0000000000", // Use a placeholder or real phone
        role: "admin",
        password: hashedPassword,
        jobTitle: "Administrator",
        isActive: true,
        availability: "Full-time",
      },
    });
    console.log("Created staff user:", staff.email);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      console.log("Staff user with this email already exists.");
    } else {
      console.error("Error creating staff user:", error);
      throw error; // Re-throw other errors
    }
  }
}

// Function to seed customer data
async function seedCustomer() {
  console.log("Creating customer...");
  const customerPassword = await bcrypt.hash("customerPassword", 10); // Use a strong password for production
  try {
    const customer = await prisma.customer.create({
      data: {
        email: "customer@example.com", // Use a production or placeholder email
        firstName: "Default",
        lastName: "Customer",
        phone: "1111111111", // Use a placeholder or real phone
        isActive: true,
        password: customerPassword,
      },
    });
    console.log("Created customer:", customer.email);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      console.log("Customer with this email already exists.");
    } else {
      console.error("Error creating customer:", error);
      throw error; // Re-throw other errors
    }
  }
}

async function seedStoreLocation() {
  console.log("Creating store locations...");
  try {
    // Create West Seattle location
    await prisma.storeLocation.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "West Seattle",
        slug: "west-seattle", 
        address: "3400 Harbor Ave, seattle, washington 98126, US",
        phone: "2067053895",
        email: "westseattle@lmlrepair.com",
        hours: JSON.stringify({
          monday: { open: "09:00", close: "17:00", isClosed: false },
          tuesday: { open: "09:00", close: "17:00", isClosed: false },
          wednesday: { open: "09:00", close: "17:00", isClosed: false },
          thursday: { open: "09:00", close: "17:00", isClosed: false },
          friday: { open: "09:00", close: "17:00", isClosed: false },
          saturday: { open: "10:00", close: "15:00", isClosed: false },
          sunday: { open: "10:00", close: "15:00", isClosed: true }
        }),
        images: ["https://5oohlclsrex09wdr.public.blob.vercel-storage.com/1705414661233-R1WzwUs4JZDrj81NOQbukftkDl1UM5.jpeg"],
        socialMedia: [],
        listings: [],
        isActive: true,
        createdAt: new Date("2025-04-25T07:50:50.196Z"),
        updatedAt: new Date("2025-04-25T14:17:17.835Z"),
        city: "seattle",
        countryCode: "US", 
        state: "washington",
        streetAddress: "3400 Harbor Ave",
        zip: "98126"
      }
    });

    // Create Seattle location
    await prisma.storeLocation.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Seattle",
        slug: "seattle",
        address: "123 Main Street, Seattle, SE 121212, US", 
        phone: "21234567890",
        email: "seattle@lmlrepair.com",
        hours: JSON.stringify({
          monday: { open: "09:00", close: "17:00", isClosed: false },
          tuesday: { open: "09:00", close: "17:00", isClosed: false },
          wednesday: { open: "09:00", close: "17:00", isClosed: false },
          thursday: { open: "09:00", close: "17:00", isClosed: false },
          friday: { open: "09:00", close: "17:00", isClosed: false },
          saturday: { open: "10:00", close: "15:00", isClosed: false },
          sunday: { open: "10:00", close: "15:00", isClosed: true }
        }),
        images: ["https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Gadgets-2gOMGlPZFClxOk0dQXySub8ZHqstBK.png"],
        socialMedia: [{
          icon: "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/1705414661233-R1WzwUs4JZDrj81NOQbukftkDl1UM5.jpeg",
          link: "https://www.youtube.com/",
          platform: "Youtube"
        }],
        listings: [{
          icon: "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pexels-atahandemir-28779687-phq9sJ0KmGNtd9CHKU1kpI1eiGJjfy.jpg",
          link: "https://www.youtube.com/watch?v=wBDl7HSGtUs",
          name: "Testing"
        }],
        isActive: true,
        createdAt: new Date("2025-05-01T22:02:34.895Z"),
        updatedAt: new Date("2025-05-01T22:14:40.347Z"),
        city: "Seattle",
        countryCode: "US",
        state: "SE",
        streetAddress: "123 Main Street",
        zip: "121212"
      }
    });

    // Create North Seattle location
    await prisma.storeLocation.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "North Seattle",
        slug: "north-seattle",
        address: "10015 Lake City Way NE STE #231, Seattle, Washington 98125, US",
        phone: "206-745-2977",
        email: "northseattle@lmlrepair.com",
        hours: JSON.stringify({
          monday: { open: "09:00", close: "17:00", isClosed: false },
          tuesday: { open: "09:00", close: "17:00", isClosed: false },
          wednesday: { open: "09:00", close: "17:00", isClosed: false },
          thursday: { open: "09:00", close: "17:00", isClosed: false },
          friday: { open: "09:00", close: "17:00", isClosed: false },
          saturday: { open: "10:00", close: "15:00", isClosed: false },
          sunday: { open: "10:00", close: "15:00", isClosed: true }
        }),
        images: ["https://5oohlclsrex09wdr.public.blob.vercel-storage.com/april252025-Ytz09x7VrhCcpXvvayx88NqSqY4jEX.png"],
        socialMedia: [{
          icon: "/logo.png",
          link: "https://www.linkedin.com/company/lml-repair/?viewAsMember=true",
          platform: "Linked In"
        }],
        listings: [{
          icon: "/logo.png",
          link: "https://www.linkedin.com/company/lml-repair/?viewAsMember=true",
          name: "Linked IN"
        }],
        isActive: true,
        createdAt: new Date("2025-05-02T06:52:35.094Z"),
        updatedAt: new Date("2025-05-02T07:00:24.147Z"),
        city: "Seattle",
        countryCode: "US",
        state: "Washington",
        streetAddress: "10015 Lake City Way NE STE #231",
        zip: "98125"
      }
    });

    console.log("Store locations created successfully");
  } catch (error) {
    console.error("Error creating store locations:", error);
    throw error;
  }
}

async function main() {
  console.log("Starting production seeding...");

  // Seed foundational data first (if any dependencies)
  // e.g., Users, Roles
  await seedStaff();
  await seedCustomer();

  // Seed the store location data
  await seedStoreLocation();

  // Seed the device hierarchy data
  await seedDeviceHierarchy(prisma); // Call the imported function

  // Seed Repair Types
  await seedRepairTypes(prisma);

  // Seed Blogs and Categories
  await seedBlogs(prisma);

  // Add calls to other production seed functions here if needed

  console.log("Production seed completed successfully");
}

main()
  .catch((e) => {
    console.error("Error during production seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
