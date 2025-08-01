import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding carriers and services...");

  // FedEx
  const fedex = await prisma.carrier.upsert({
    where: { code: "fedex" },
    update: {},
    create: {
      name: "FedEx",
      code: "fedex",
      isActive: true,
      requiresCredentials: true,
      accountIdEnvKey: "FEDEX_ACCOUNT_ID",
      apiKeyEnvKey: "FEDEX_API_KEY",
      apiSecretEnvKey: "FEDEX_API_SECRET",
      description: "FedEx shipping services",
      logoUrl: "https://www.fedex.com/content/dam/fedex-com/logos/logo.png",
      trackingUrlTemplate:
        "https://www.fedex.com/apps/fedextrack/?action=track&trackingnumber={trackingNumber}",
    },
  });

  // FedEx Services
  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: fedex.id,
        code: "FEDEX_GROUND",
      },
    },
    update: {},
    create: {
      carrierId: fedex.id,
      name: "FedEx Ground",
      code: "FEDEX_GROUND",
      isActive: true,
      estimatedDays: 5,
      description: "Cost-effective ground delivery in 1-5 business days",
    },
  });

  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: fedex.id,
        code: "FEDEX_2DAY",
      },
    },
    update: {},
    create: {
      carrierId: fedex.id,
      name: "FedEx 2Day",
      code: "FEDEX_2DAY",
      isActive: true,
      estimatedDays: 2,
      description: "Delivery in 2 business days",
    },
  });

  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: fedex.id,
        code: "FEDEX_EXPRESS_SAVER",
      },
    },
    update: {},
    create: {
      carrierId: fedex.id,
      name: "FedEx Express Saver",
      code: "FEDEX_EXPRESS_SAVER",
      isActive: true,
      estimatedDays: 3,
      description: "Delivery in 3 business days",
    },
  });

  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: fedex.id,
        code: "FEDEX_OVERNIGHT",
      },
    },
    update: {},
    create: {
      carrierId: fedex.id,
      name: "FedEx Overnight",
      code: "FEDEX_OVERNIGHT",
      isActive: true,
      estimatedDays: 1,
      description: "Next-business-day delivery by 8 p.m",
    },
  });

  // UPS
  const ups = await prisma.carrier.upsert({
    where: { code: "ups" },
    update: {},
    create: {
      name: "UPS",
      code: "ups",
      isActive: true,
      requiresCredentials: true,
      accountIdEnvKey: "UPS_ACCOUNT_ID",
      apiKeyEnvKey: "UPS_API_KEY",
      apiSecretEnvKey: "UPS_API_SECRET",
      description: "UPS shipping services",
      logoUrl: "https://www.ups.com/assets/resources/images/UPS_logo.svg",
      trackingUrlTemplate:
        "https://www.ups.com/track?loc=en_US&tracknum={trackingNumber}",
    },
  });

  // UPS Services
  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: ups.id,
        code: "UPS_GROUND",
      },
    },
    update: {},
    create: {
      carrierId: ups.id,
      name: "UPS Ground",
      code: "UPS_GROUND",
      isActive: true,
      estimatedDays: 5,
      description: "Day-definite delivery in 1-5 business days",
    },
  });

  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: ups.id,
        code: "UPS_3DAY_SELECT",
      },
    },
    update: {},
    create: {
      carrierId: ups.id,
      name: "UPS 3 Day Select",
      code: "UPS_3DAY_SELECT",
      isActive: true,
      estimatedDays: 3,
      description: "Delivery by the end of the third business day",
    },
  });

  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: ups.id,
        code: "UPS_2DAY_AIR",
      },
    },
    update: {},
    create: {
      carrierId: ups.id,
      name: "UPS 2nd Day Air",
      code: "UPS_2DAY_AIR",
      isActive: true,
      estimatedDays: 2,
      description: "Delivery by the end of the second business day",
    },
  });

  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: ups.id,
        code: "UPS_NEXT_DAY_AIR",
      },
    },
    update: {},
    create: {
      carrierId: ups.id,
      name: "UPS Next Day Air",
      code: "UPS_NEXT_DAY_AIR",
      isActive: true,
      estimatedDays: 1,
      description: "Next-business-day delivery by 10:30 a.m.",
    },
  });

  // USPS
  const usps = await prisma.carrier.upsert({
    where: { code: "usps" },
    update: {},
    create: {
      name: "USPS",
      code: "usps",
      isActive: true,
      requiresCredentials: true,
      accountIdEnvKey: "USPS_ACCOUNT_ID",
      apiKeyEnvKey: "USPS_API_KEY",
      description: "United States Postal Service",
      logoUrl:
        "https://www.usps.com/global-elements/header/images/utility-header/logo-sb.svg",
      trackingUrlTemplate:
        "https://tools.usps.com/go/TrackConfirmAction?tLabels={trackingNumber}",
    },
  });

  // USPS Services
  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: usps.id,
        code: "USPS_PRIORITY",
      },
    },
    update: {},
    create: {
      carrierId: usps.id,
      name: "USPS Priority Mail",
      code: "USPS_PRIORITY",
      isActive: true,
      estimatedDays: 3,
      description: "Delivery in 1-3 business days",
    },
  });

  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: usps.id,
        code: "USPS_FIRST_CLASS",
      },
    },
    update: {},
    create: {
      carrierId: usps.id,
      name: "USPS First Class",
      code: "USPS_FIRST_CLASS",
      isActive: true,
      estimatedDays: 5,
      description: "Delivery in 1-5 business days",
    },
  });

  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: usps.id,
        code: "USPS_EXPRESS",
      },
    },
    update: {},
    create: {
      carrierId: usps.id,
      name: "USPS Priority Mail Express",
      code: "USPS_EXPRESS",
      isActive: true,
      estimatedDays: 1,
      description: "Overnight delivery to most U.S. addresses",
    },
  });

  // DHL
  const dhl = await prisma.carrier.upsert({
    where: { code: "dhl" },
    update: {},
    create: {
      name: "DHL",
      code: "dhl",
      isActive: true,
      requiresCredentials: true,
      accountIdEnvKey: "DHL_ACCOUNT_ID",
      apiKeyEnvKey: "DHL_API_KEY",
      apiSecretEnvKey: "DHL_API_SECRET",
      description: "DHL Express shipping services",
      logoUrl: "https://www.dhl.com/img/meta/dhl-logo.png",
      trackingUrlTemplate:
        "https://www.dhl.com/us-en/home/tracking.html?tracking-id={trackingNumber}",
    },
  });

  // DHL Services
  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: dhl.id,
        code: "DHL_EXPRESS_WORLDWIDE",
      },
    },
    update: {},
    create: {
      carrierId: dhl.id,
      name: "DHL Express Worldwide",
      code: "DHL_EXPRESS_WORLDWIDE",
      isActive: true,
      estimatedDays: 2,
      description: "International delivery by end of day",
    },
  });

  await prisma.carrierService.upsert({
    where: {
      carrierId_code: {
        carrierId: dhl.id,
        code: "DHL_EXPRESS_12",
      },
    },
    update: {},
    create: {
      carrierId: dhl.id,
      name: "DHL Express 12:00",
      code: "DHL_EXPRESS_12",
      isActive: true,
      estimatedDays: 1,
      description: "Delivery by noon the next possible business day",
    },
  });

  console.log("Carriers and services seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding carriers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
