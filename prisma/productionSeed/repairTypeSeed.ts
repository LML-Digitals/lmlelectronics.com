import { PrismaClient } from "@prisma/client";

const repairTypesData = [
  {
    name: "Screen Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Loud Speaker Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Back Camera Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Earpiece Speaker Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Power Button Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  // Note: "Loudspeaker Repair" and "Loud Speaker Repair" are similar, using both from the source data.
  {
    name: "Loudspeaker Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  // Note: "Loud Speaker Issue" seems distinct, adding it.
  {
    name: "Loud Speaker Issue",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  // Note: "Ear Speaker Issue" seems distinct, adding it.
  {
    name: "Ear Speaker Issue",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Headphone Jack Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Home Button Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  // Note: "Earpiece Speaker Issue" seems distinct, adding it.
  {
    name: "Earpiece Speaker Issue",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Cooling Fan Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Mute Switch Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Optical Drive Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Wifi Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  // Note: "Ear Speaker Repair" and "Earpiece Speaker Repair" are similar, using both from the source data.
  {
    name: "Ear Speaker Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Volume Button Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Vibrator Motor Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Back Camera Lens Replacement",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Back Cover Replacement",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Fingerprint Sensor Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Glass & LCD Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "HDMI Port Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "LCD Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  // Note: Trimmed trailing space from "Kickstand Hinge Replacement "
  {
    name: "Kickstand Hinge Replacement",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Screen Replacement",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Battery Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Charging Port Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Back Camera Lens Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Front Camera Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
  {
    name: "Back Glass Repair",
    description: "Standard repair service.",
    order: 0,
    labour: 100,
    timeFrame: null,
    image: null,
  },
];

export async function seedRepairTypes(prisma: PrismaClient) {
  console.log("Seeding Repair Types...");
  for (const type of repairTypesData) {
    try {
      await prisma.repairType.upsert({
        where: { name: type.name },
        update: {
          description: type.description,
          order: type.order,
          timeFrame: type.timeFrame,
        },
        create: {
          name: type.name,
          description: type.description,
          order: type.order,
          timeFrame: type.timeFrame,
        },
      });
      console.log(`Upserted repair type: ${type.name}`);
    } catch (error) {
      console.error(`Error upserting repair type ${type.name}:`, error);
    }
  }
  console.log("Repair Types seeding finished.");
}
