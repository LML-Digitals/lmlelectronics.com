import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed warranty types...");

  // Check if any warranty types already exist
  const existingCount = await prisma.warrantyType.count();
  if (existingCount > 0) {
    console.log(
      `${existingCount} warranty types already exist. Skipping seed.`
    );
    return;
  }

  // Create default warranty types
  const warrantyTypes = [
    {
      name: "Standard Warranty",
      description:
        "Basic warranty covering manufacturing defects. Includes parts and labor for repairs.",
      duration: 90, // 90 days
    },
    {
      name: "Extended Warranty",
      description:
        "Extended coverage for manufacturing defects and some accidental damage. Includes parts and labor with priority support.",
      duration: 365, // 1 year
    },
    {
      name: "Premium Warranty",
      description:
        "Our best warranty covering manufacturing defects, accidental damage, and water damage. Includes priority support and all labor and parts.",
      duration: 730, // 2 years
    },
    {
      name: "Lifetime Warranty",
      description:
        "Limited lifetime warranty covering manufacturing defects only. Does not expire.",
      duration: 0, // No expiration (0 months)
    },
  ];

  for (const type of warrantyTypes) {
    await prisma.warrantyType.create({
      data: type,
    });
    console.log(`Created warranty type: ${type.name}`);
  }

  console.log("Warranty types seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
