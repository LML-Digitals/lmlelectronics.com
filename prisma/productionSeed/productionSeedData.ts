import { Prisma, PrismaClient } from "@prisma/client";
// Note: bcrypt is not used in this specific seeding logic, but kept for context if needed elsewhere
// import bcrypt from "bcryptjs";

// Exportable function containing the core seeding logic
export async function seedDeviceHierarchy(prisma: PrismaClient) {
  console.log(`Starting device hierarchy seeding ...`);

  // --- Deleting Existing Data (in reverse order of dependency) ---
  console.log("Deleting existing models...");
  await prisma.model.deleteMany({});
  console.log("Models deleted.");

  console.log("Deleting existing series...");
  await prisma.series.deleteMany({});
  console.log("Series deleted.");

  console.log("Deleting existing brands...");
  await prisma.brand.deleteMany({});
  console.log("Brands deleted.");

  console.log("Deleting existing device types...");
  await prisma.deviceType.deleteMany({});
  console.log("Device types deleted.");

  // --- DeviceType Seeding ---
  console.log("Seeding DeviceTypes...");
  // Keep the original IDs as they are UUIDs
  const deviceTypesData = [
    {
      id: "3baa72a5-4e64-44ae-bde4-f5be28b08a21",
      name: "New Things",
      description: "",
      seoMetadata: "",
    },
    {
      id: "b0baffb4-bcfe-4c5c-be40-c6e65543f27e",
      name: "Console",
      description: "",
      seoMetadata: "",
    },
    {
      id: "e65bfce8-2130-11f0-b1eb-6ebdba418b57",
      name: "Phone",
      description: null,
      seoMetadata: null,
    },
    {
      id: "e65c33e0-2130-11f0-b1eb-6ebdba418b57",
      name: "Computer",
      description: null,
      seoMetadata: null,
    },
    {
      id: "e65c3520-2130-11f0-b1eb-6ebdba418b57",
      name: "Tablet",
      description: null,
      seoMetadata: null,
    },
    {
      id: "e65c35e2-2130-11f0-b1eb-6ebdba418b57",
      name: "Accessories",
      description: null,
      seoMetadata: null,
    },
  ];
  await prisma.deviceType.createMany({
    data: deviceTypesData,
  });
  console.log(`Seeded ${deviceTypesData.length} device types.`);

  // --- Brand Seeding ---
  console.log("Seeding Brands...");
  // Discard original IDs, map original IDs for relationship building
  const brandsInputData = [
    {
      originalId: 1,
      name: "Apple",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Appe-fyMhQm9sb7nKmK95QGzMixJGxm5tCH.png",
      desc: "We provide expert repair services for Apple products, including iPhones, iPads, and MacBooks. Whether it's a cracked screen, battery replacement, or water damage, our technicians are trained to handle all issues with precision and care.",
      order: 0,
      deviceTypeId: "e65bfce8-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 2,
      name: "Samsung",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Samsung-0wF6K2asUmgmMJ1UcfIOmGFs9HrehQ.png",
      desc: "We proudly carries genuine replacement parts for screen repair, battery replacement and more. Count on us to get your broken Samsung smartphone fixed quickly and reliably.",
      order: 0,
      deviceTypeId: "e65bfce8-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 3,
      name: "Apple",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Appe-fyMhQm9sb7nKmK95QGzMixJGxm5tCH.png",
      desc: "We provide expert repair services for Apple products, including iPhones, iPads, and MacBooks. Whether it's a cracked screen, battery replacement, or water damage, our technicians are trained to handle all issues with precision and care.",
      order: 0,
      deviceTypeId: "e65c3520-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 4,
      name: "Google",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Google-Se1I8xat9VKSZAx9R4TWPCaBPCIuIB.png",
      desc: "We provide comprehensive repair services for Google Pixel phones. Our services include screen replacements, battery fixes, and solutions for software malfunctions, ensuring your Pixel phone operates at its best.",
      order: 0,
      deviceTypeId: "e65bfce8-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 5,
      name: "Motorola",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Motorola-onI9YSWeR4jGr6vzbTZCtredHSCU5w.png",
      desc: "Our repair services for Motorola devices include solutions for screen repairs, battery replacements, and software troubleshooting. We ensure your Motorola smartphone or tablet remains reliable and efficient.",
      order: 0,
      deviceTypeId: "e65bfce8-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 6,
      name: "LG",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/LG-HYQJzjhl15dBdhEG5OFLsqSUqr9061.png",
      desc: "Our skilled technicians are experienced in repairing LG devices, including smartphones and tablets. We handle issues ranging from broken screens and battery replacements to more complex hardware and software problems.",
      order: 0,
      deviceTypeId: "e65bfce8-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 7,
      name: "OnePlus ",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ONE%20PLUS-5vMaLjSvT2x9gCF0qWiGuaeyQNJnJc.png",
      desc: "We provide specialized repair services for OnePlus smartphones. From cracked screens and battery issues to software malfunctions, our technicians are equipped to handle all repairs with precision.",
      order: 0,
      deviceTypeId: "e65bfce8-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 10,
      name: "Sony",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Sony-ZcV9raGdUl8CTF31pI0cqU5DT43itl.png",
      desc: "We specialize in repairing Sony devices such as smartphones, tablets, and laptops. Our technicians can address issues like screen damage, battery problems, and software glitches, ensuring your Sony device is as good as new.",
      order: 0,
      deviceTypeId: "b0baffb4-bcfe-4c5c-be40-c6e65543f27e",
    },
    {
      originalId: 11,
      name: "Samsung",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Samsung-0wF6K2asUmgmMJ1UcfIOmGFs9HrehQ.png",
      desc: "We proudly carries genuine replacement parts for screen repair, battery replacement and more. Count on us to get your broken Samsung smartphone fixed quickly and reliably.",
      order: 0,
      deviceTypeId: "e65c3520-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 14,
      name: "Apple",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Appe-fyMhQm9sb7nKmK95QGzMixJGxm5tCH.png",
      desc: "We provide expert repair services for Apple products, including iPhones, iPads, and MacBooks. Whether it's a cracked screen, battery replacement, or water damage, our technicians are trained to handle all issues with precision and care.",
      order: 0,
      deviceTypeId: "e65c33e0-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 15,
      name: "Microsoft ",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Microsoft-hoIOrwe87SYUHl0HM2w935D4ZcEHgV.png",
      desc: "We offer comprehensive repair services for Microsoft devices, including Surface tablets and laptops. Our expertise covers screen repairs, battery replacements, keyboard fixes, and more to keep your Microsoft device in top condition.",
      order: 0,
      deviceTypeId: "e65c33e0-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 16,
      name: "Microsoft ",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Microsoft-hoIOrwe87SYUHl0HM2w935D4ZcEHgV.png",
      desc: "We offer comprehensive repair services for Microsoft devices, including Surface tablets and laptops. Our expertise covers screen repairs, battery replacements, keyboard fixes, and more to keep your Microsoft device in top condition.",
      order: 0,
      deviceTypeId: "b0baffb4-bcfe-4c5c-be40-c6e65543f27e",
    },
    {
      originalId: 17,
      name: "Apple",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Appe-fyMhQm9sb7nKmK95QGzMixJGxm5tCH.png",
      desc: "We provide expert repair services for Apple products, including iPhones, iPads, and MacBooks. Whether it's a cracked screen, battery replacement, or water damage, our technicians are trained to handle all issues with precision and care.",
      order: 0,
      deviceTypeId: "e65c35e2-2130-11f0-b1eb-6ebdba418b57",
    },
    {
      originalId: 23,
      name: "Random Brand",
      image: "/logo.png",
      desc: "asda",
      order: 0,
      deviceTypeId: "3baa72a5-4e64-44ae-bde4-f5be28b08a21",
    },
  ];

  // Prepare data for Prisma, removing originalId
  const brandsDataForPrisma = brandsInputData.map(
    ({ originalId, ...rest }) => rest
  );

  // Create brands
  await prisma.brand.createMany({
    data: brandsDataForPrisma,
  });

  // Fetch created brands to map original IDs to new IDs
  // IMPORTANT: Assumes IDs are generated sequentially based on insertion order.
  // This generally works for auto-increment IDs in a single seed run but isn't guaranteed across all DBs/scenarios.
  const createdBrands = await prisma.brand.findMany({
    orderBy: { id: "asc" }, // Assuming 'id' is the auto-incrementing primary key
  });

  if (createdBrands.length !== brandsInputData.length) {
    throw new Error(
      "Mismatch between input brands and created brands count. Seeding cannot reliably continue."
    );
  }

  const brandIdMap = new Map<number, number>(); // Map<originalSqlId, newPrismaId>
  brandsInputData.forEach((brandInput, index) => {
    brandIdMap.set(brandInput.originalId, createdBrands[index].id);
  });
  console.log(`Seeded ${createdBrands.length} brands.`);

  // --- Series Seeding ---
  console.log("Seeding Series...");
  const seriesInputData = [
    {
      originalId: 1,
      name: "iPhone",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iPhone-TCycyr0i7da8xL3eYRlogi32WU6VY7.png",
      desc: "Apple iPhone Series Repairs",
      order: 0,
      originalBrandId: 1,
    },
    {
      originalId: 2,
      name: "Galaxy S ",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Galaxy%20S-lfXc0IlE0VMn4Puwmu6gRIhmghtK7w.png",
      desc: "Flagship Series for Samsung Mobile Devices",
      order: 0,
      originalBrandId: 2,
    },
    {
      originalId: 3,
      name: "Galaxy Note",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Galaxy_Note-gYj0T4wIUNhgsOqg6vFcz1B80yUZkJ.png",
      desc: "Note series for Samsung ",
      order: 0,
      originalBrandId: 2,
    },
    {
      originalId: 4,
      name: "Galaxy A",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Galaxy%20A-zWT4Pw0dO7odWAWZkGHfK8fzywkUk1.png",
      desc: "Budget Series for Samsung Mobile Devices",
      order: 0,
      originalBrandId: 2,
    },
    {
      originalId: 5,
      name: "Play Station",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/playstation5-QfQrC23p05t0P69AYaXADNysS3M6Py.png",
      desc: "Sony Console series repairs",
      order: 0,
      originalBrandId: 10,
    },
    {
      originalId: 6,
      name: "iPad",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Ipad-removebg-z3td9mu4GFygwl8XJAjBU271yAh4nm.png",
      desc: "Apple iPad Series Repairs",
      order: 2,
      originalBrandId: 3,
    },
    {
      originalId: 7,
      name: "Watch",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Watch-FRKoUJJyBmbLj3yKv8NeFYRgYGI8lw.png",
      desc: "Apple Watch Series Repairs",
      order: 1,
      originalBrandId: 17,
    },
    {
      originalId: 8,
      name: "MacBook",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Macbook-4rUR23aODtjnJ7CAhxal6GicTzArmg.png",
      desc: "Apple MacBook Series Repairs",
      order: 3,
      originalBrandId: 14,
    },
    {
      originalId: 9,
      name: "Pixel",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Pixel-SpNI8e9VhMyJAAZb3kJ8SsugpHj91v.png",
      desc: "Google Pixel Series Repairs",
      order: 0,
      originalBrandId: 4,
    },
    {
      originalId: 10,
      name: "Phone",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/oneplusseries-syIRBgLTMb1gOqzR48U9eLvQLb80JB.png",
      desc: "OnePlus Phones Series",
      order: 0,
      originalBrandId: 7,
    },
    {
      originalId: 12,
      name: "Surface Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/SurfacePro-f0f0CdHbECEhS3KVRRcK3hNXYs0hI2.png",
      desc: "Microsoft Surface Pro Series",
      order: 0,
      originalBrandId: 15,
    },
    {
      originalId: 13,
      name: "Surface Book",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Surfacebook-SBhJiBWiH4mBTgtD7tGXHfX1IEDDBj.png",
      desc: "Microsoft Surface Book Series",
      order: 0,
      originalBrandId: 15,
    },
    {
      originalId: 14,
      name: "Xbox",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/Xbox-XSLNP3o6KsfTAFtU8OAoCzBYQkEv7I.png",
      desc: "Microsoft Xbox Series",
      order: 0,
      originalBrandId: 16,
    },
    {
      originalId: 16,
      name: "G Series",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/g7-UYcQQDBfnkvJsZf84UQPWCqTuCDBi2.png",
      desc: "LG G Series",
      order: 0,
      originalBrandId: 6,
    },
    {
      originalId: 17,
      name: "V Series",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/v60-AsAgjQXRO7OleMGWvfBQd6YFZ4DXLV.png",
      desc: "LG V Series",
      order: 0,
      originalBrandId: 6,
    },
    {
      originalId: 18,
      name: "random series",
      image: "/logo.png",
      desc: "asda",
      order: 0,
      originalBrandId: 23,
    },
  ];

  const seriesDataForPrisma = seriesInputData.map(
    ({ originalId, originalBrandId, ...rest }) => {
      const brandId = brandIdMap.get(originalBrandId);
      if (brandId === undefined) {
        throw new Error(
          `Could not find new Brand ID for original Brand ID ${originalBrandId} when processing Series ${originalId}`
        );
      }
      return { ...rest, brandId };
    }
  );

  await prisma.series.createMany({
    data: seriesDataForPrisma,
  });

  const createdSeries = await prisma.series.findMany({
    orderBy: { id: "asc" }, // Assuming auto-incrementing ID
  });

  if (createdSeries.length !== seriesInputData.length) {
    throw new Error(
      "Mismatch between input series and created series count. Seeding cannot reliably continue."
    );
  }

  const seriesIdMap = new Map<number, number>(); // Map<originalSqlId, newPrismaId>
  seriesInputData.forEach((seriesInput, index) => {
    seriesIdMap.set(seriesInput.originalId, createdSeries[index].id);
  });
  console.log(`Seeded ${createdSeries.length} series.`);

  // --- Model Seeding ---
  console.log("Seeding Models...");
  // Note: This list is truncated for brevity in the example prompt.
  // Make sure to include ALL model data from your original SQL.
  const modelsInputData = [
    {
      originalId: 1,
      name: "iPhone 11",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone11-ahxpfTDBAl1AVSXjtXp6c3CA7y14cT.png",
      description:
        "If you own the Apple iPhone 14 Pro Max, having a reliable iPhone 14 Pro Max repair service that you can count on definitely provides peace of mind. When your iPhone 14 Pro Max needs anything from a screen repair to a battery replacement, CPR has the parts, tools, and experience to get the job done right – quickly and hassle-free. You can also sell your iPhone 14 Pro Max to CPR or trade it in for one of the many premium pre-owned devices available in our stores.",
      order: 29,
      originalSeriesId: 1,
    },
    {
      originalId: 2,
      name: "Galaxy S23 Ultra ",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys23ultra-oxyfdZqefDpkTfyT3Lns4RMneex5RV.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 5,
      name: "Playstation 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/playstation3-HanrXWDrYiJkoJoYTAFfrYI0MFYnip.png",
      description: null,
      order: 0,
      originalSeriesId: 5,
    },
    {
      originalId: 6,
      name: "Playstation 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/playstation4-l5OynILOivlWI7uV59TuX6TlEgdW8y.png",
      description: null,
      order: 0,
      originalSeriesId: 5,
    },
    {
      originalId: 7,
      name: "Playstation 4 Slim",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/playstation4slim-pQNI0O4y1T5GuLP7dLj4j3FxBiJbj3.png",
      description: null,
      order: 0,
      originalSeriesId: 5,
    },
    {
      originalId: 8,
      name: "Playstation 4 Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/playstation4pro-Hw9Wo6DxAaniwl6blitefFHZ0gQass.png",
      description: null,
      order: 0,
      originalSeriesId: 5,
    },
    {
      originalId: 9,
      name: "Playstation 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/playstation5-zkRkvi413Csh1Vq6a4l4NzzdOKVkw9.png",
      description: null,
      order: 0,
      originalSeriesId: 5,
    },
    {
      originalId: 10,
      name: "Watch Series 1",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseries1-iokMpSuKCSvvJoGV6IfpURtU6HCXvN.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 11,
      name: "Watch Series 8",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseries8-vhPEZiQqMO7QGPFpwPvqiR6oJBr7jo.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 12,
      name: "Watch Series SE Gen 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseriessegen2-s4GE5RCwF8qvxiyaSArOfFMHsKFt6X.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 13,
      name: "Watch Series 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseries2-gKc91R2CfHVbmsPlNMJsd06Ip9F9mT.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 14,
      name: "Watch Series 9",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseries9-25M4wcTxCgDIbt3n2n8N591kf8whGr.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 15,
      name: "Watch Series 6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseries6-yihYhbJM28dLQGqcplxZl9S1PWvp4j.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 16,
      name: "Watch Ultra",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchultra-t1JNpZJmdT4sc9Qmt9OUDEEuW2GVRX.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 17,
      name: "Watch Series SE Gen 1",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseriessegen1-sHl27sn5yoguAZ9pMsk1ol3rjQjwD6.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 18,
      name: "Watch Series 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseries5-yHDnl6DChOHDj7n1IsbSsrZxPOJZjl.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 19,
      name: "Watch Series 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseries4-eyH4deQXKgxF1hAH1kZ1OklkYH4q1n.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 20,
      name: "Watch Series 7",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseries7-ag7t8tdhAdBzTrpGD4sas8X9uY56xd.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 21,
      name: "Watch Series 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/watchseries3-1Fxru3CkHgjMbzr3SU4fm0aIiYG197.png",
      description: null,
      order: 0,
      originalSeriesId: 7,
    },
    {
      originalId: 22,
      name: "iPad Pro 12.9 Gen 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro129gen2-6oxjsFJHaWCub0lyW0dXANUHom5Sr8.png",
      description: null,
      order: 26,
      originalSeriesId: 6,
    },
    {
      originalId: 23,
      name: "iPad Air 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadair2-jLiZoc2GzJlOJufeXSzVzs1ITQTTME.png",
      description: null,
      order: 10,
      originalSeriesId: 6,
    },
    {
      originalId: 24,
      name: "iPad Pro 11 Gen 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro11gen2-XwqMNeZeA6cI8DXf3EDgvUYhM3zLDc.png",
      description: null,
      order: 22,
      originalSeriesId: 6,
    },
    {
      originalId: 25,
      name: "iPad 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipad5-2KwXjYn69vy9WQHkrv2fSj75aLDtQY.png",
      description: null,
      order: 5,
      originalSeriesId: 6,
    },
    {
      originalId: 26,
      name: "iPad Pro 12.9 Gen 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro129gen3-wv6KTvVoCOAphTqrFekUBpm087TyzN.png",
      description: null,
      order: 27,
      originalSeriesId: 6,
    },
    {
      originalId: 27,
      name: "iPad 6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipad6-0cK5j9nEWoqYP1uAr1IQNhk9BP3C2Q.png",
      description: null,
      order: 3,
      originalSeriesId: 6,
    },
    {
      originalId: 28,
      name: "iPad Pro 11 Gen 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro11gen4-mYdi1IoPUHYHN1GxXEk2w4ROci8eBB.png",
      description: null,
      order: 24,
      originalSeriesId: 6,
    },
    {
      originalId: 29,
      name: "iPad Pro 10.5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro105-HtybJTaB7GMW07uqkP9hW0zN8FuOqF.png",
      description: null,
      order: 20,
      originalSeriesId: 6,
    },
    {
      originalId: 30,
      name: "iPad 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipad4-M63IRI6bc3rHSR1UIC4WCShOEg87Sp.png",
      description: null,
      order: 4,
      originalSeriesId: 6,
    },
    {
      originalId: 31,
      name: "iPad Mini 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadmini4-fdh33LIorZ4tr6Vv1l7DymbXQmGisv.png",
      description: null,
      order: 17,
      originalSeriesId: 6,
    },
    {
      originalId: 32,
      name: "iPad Mini 1",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadmini1-xyjlSoYk1HzVMKnZN2l6cnPoRiWKCm.png",
      description: null,
      order: 14,
      originalSeriesId: 6,
    },
    {
      originalId: 33,
      name: "iPad 10",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipad10-49yDOQEDoDOaKG2UndGngxNxfX113h.png",
      description: null,
      order: 1,
      originalSeriesId: 6,
    },
    {
      originalId: 34,
      name: "iPad Mini 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadmini2-WkhQHG0j0Nnr7Yh0ynCTuMqGLUyhUT.png",
      description: null,
      order: 15,
      originalSeriesId: 6,
    },
    {
      originalId: 35,
      name: "iPad 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipad3-7wj0cyuyKHaftiHiVM2Li2GqY0Z1Qv.png",
      description: null,
      order: 0,
      originalSeriesId: 6,
    },
    {
      originalId: 36,
      name: "iPad Mini 6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadmini6-Dx2Id29sIZDPxJWVWNOCK4Wr2Wx3YD.png",
      description: null,
      order: 19,
      originalSeriesId: 6,
    },
    {
      originalId: 37,
      name: "iPad Pro 12.9 Gen 6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro129gen6-Xj2CDSTwaRm5rciylaWLBU4faSX3wI.png",
      description: null,
      order: 30,
      originalSeriesId: 6,
    },
    {
      originalId: 38,
      name: "iPad Pro 12.9 Gen 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro129gen5-r42gbxzFPAZpkz3yvXLQvuBk04tUYJ.png",
      description: null,
      order: 29,
      originalSeriesId: 6,
    },
    {
      originalId: 39,
      name: "iPad Mini 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadmini5-M6py7WkWyRX7dMOF2IEkTgaPsrOyHB.png",
      description: null,
      order: 18,
      originalSeriesId: 6,
    },
    {
      originalId: 40,
      name: "iPad Pro 11 Gen 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro11gen3-TTDwFyFBcJUz54FHJOjNc4kuji8rNa.png",
      description: null,
      order: 23,
      originalSeriesId: 6,
    },
    {
      originalId: 41,
      name: "iPad Air 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadair3-3lJ3UCVeceMarjHIf0IMA96o6eJiYx.png",
      description: null,
      order: 11,
      originalSeriesId: 6,
    },
    {
      originalId: 42,
      name: "iPad Air 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadmini5-0CoB3DxBWGOeXbl3qnZLi5Wo551oDu.png",
      description: null,
      order: 13,
      originalSeriesId: 6,
    },
    {
      originalId: 43,
      name: "iPad Pro 12.9 Gen 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro129gen4-tLGh6CwhIsFeLTOYhfGqRLzqxsu2P5.png",
      description: null,
      order: 28,
      originalSeriesId: 6,
    },
    {
      originalId: 44,
      name: "iPad Mini 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadmini3-qL5fbuEYCPTDT4aWXQ5t4Wn5P0S1EP.png",
      description: null,
      order: 16,
      originalSeriesId: 6,
    },
    {
      originalId: 45,
      name: "iPad Air 1",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadair1-t4I8uI2ueD2aP6zK86Fm1eLcnbMfu1.png",
      description: null,
      order: 9,
      originalSeriesId: 6,
    },
    {
      originalId: 46,
      name: "iPad Pro 9.7",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro97-E8P77FUYnw0fjiinvwQr9UtEbKN70o.png",
      description: null,
      order: 31,
      originalSeriesId: 6,
    },
    {
      originalId: 47,
      name: "iPad Air 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadair4-v5wknrrLEzKbITSnoTPznccYmBruvO.png",
      description: null,
      order: 12,
      originalSeriesId: 6,
    },
    {
      originalId: 48,
      name: "iPad 8",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipad8-SeLhQa0YdTv1c5SjCwoVIQ4zWMcQDO.png",
      description: null,
      order: 7,
      originalSeriesId: 6,
    },
    {
      originalId: 49,
      name: "iPad 9",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipad9-FwKNyxLuZIsLzDXmVqElRFTEWtww0c.png",
      description: null,
      order: 8,
      originalSeriesId: 6,
    },
    {
      originalId: 50,
      name: "iPad Pro 11 Gen 1",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro11gen1-6BMLQbjuy2fh3OOhX1hxPI8kmc6caT.png",
      description: null,
      order: 21,
      originalSeriesId: 6,
    },
    {
      originalId: 51,
      name: "iPad Pro 12.9 Gen 1",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipadpro129gen3-r2EK8NDyOJQ8mkF82Q37OjHq6J9lz5.png",
      description: null,
      order: 25,
      originalSeriesId: 6,
    },
    {
      originalId: 52,
      name: "iPad 7",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipad7-fRdpYkTEYpHRv9wf4sOZgJ1IL3eKBR.png",
      description: null,
      order: 6,
      originalSeriesId: 6,
    },
    {
      originalId: 53,
      name: "iPad 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/ipad2-1mvTVUJAya92tlgBlux6gELoEGRgAB.png",
      description: null,
      order: 2,
      originalSeriesId: 6,
    },
    {
      originalId: 54,
      name: "iPhone 14 Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone14pro-lK83qKCJX2Kvlq53TjM89qM2oG5ptN.png",
      description: null,
      order: 20,
      originalSeriesId: 1,
    },
    {
      originalId: 55,
      name: "iPhone 13 Pro Max",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone13promax-D8RWcOZQxXRVnzFikxq7AURpzuD1J5.png",
      description: null,
      order: 21,
      originalSeriesId: 1,
    },
    {
      originalId: 56,
      name: "iPhone 5 SE",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone5se-HyCcOmQ3tkvmlOQYtb9KFHkJetBV8D.png",
      description: null,
      order: 22,
      originalSeriesId: 1,
    },
    {
      originalId: 57,
      name: "iPhone XS",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphonexs-VuXxzvby2VQNDesbI56dZxs47Gcrjl.png",
      description: null,
      order: 23,
      originalSeriesId: 1,
    },
    {
      originalId: 58,
      name: "iPhone XR",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphonexr-RpfTwdwj2Uush3jAWV6miwmhvaopts.png",
      description: null,
      order: 24,
      originalSeriesId: 1,
    },
    {
      originalId: 59,
      name: "iPhone 6 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone6plus-SnwQoyPoa7dwGntpTSsvGwYMbDBGbq.png",
      description: null,
      order: 25,
      originalSeriesId: 1,
    },
    {
      originalId: 60,
      name: "iPhone X",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphonex-WXOgTMIqElQ3hWNgWcGU3HNUT5Ngtg.png",
      description: null,
      order: 26,
      originalSeriesId: 1,
    },
    {
      originalId: 61,
      name: "iPhone 14 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone14plus-naUa5OTNsH9FFgbu5jwCNqJ09OiwvJ.png",
      description: null,
      order: 27,
      originalSeriesId: 1,
    },
    {
      originalId: 62,
      name: "iPhone 15 Pro Max",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone15promax-5MxV4f9lJdJcCCQkcGMIky6LGZeurM.png",
      description: null,
      order: 28,
      originalSeriesId: 1,
    },
    {
      originalId: 63,
      name: "iPhone 12",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone12-6GbkJ41K6msNcSF4uAxH5PYEQ7HAo6.png",
      description: null,
      order: 19,
      originalSeriesId: 1,
    },
    {
      originalId: 64,
      name: "iPhone 6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone6-Y5paGCK0myu94ddmRShoACB3GBkMP8.png",
      description: null,
      order: 30,
      originalSeriesId: 1,
    },
    {
      originalId: 65,
      name: "iPhone 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone4-zOTvyLoqprjABBM4aryVJWdOla67v6.png",
      description: null,
      order: 31,
      originalSeriesId: 1,
    },
    {
      originalId: 66,
      name: "iPhone 13 Mini",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone13mini-dsXacrJK5IlwHeLIBezTwVVl4FcrDD.png",
      description: null,
      order: 32,
      originalSeriesId: 1,
    },
    {
      originalId: 67,
      name: "iPhone 7",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone7-KUHa6Rm4wTPGTMSZbKXzRQS4CMY8i1.png",
      description: null,
      order: 33,
      originalSeriesId: 1,
    },
    {
      originalId: 68,
      name: "iPhone XS Max",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphonexsmax-2F4NQYIbpi7Nvwyzh3Bg93txwlrksI.png",
      description: null,
      order: 35,
      originalSeriesId: 1,
    },
    {
      originalId: 70,
      name: "iPhone 11 Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone11pro-GfSI4i973qodZ67k4c6VuRsp7wDiPT.png",
      description: null,
      order: 34,
      originalSeriesId: 1,
    },
    {
      originalId: 71,
      name: "iPhone 8 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone8plus-C6swYI8oeoM8DXmc1AfDsA4rWDDgyZ.png",
      description: null,
      order: 36,
      originalSeriesId: 1,
    },
    {
      originalId: 72,
      name: "iPhone 13 Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone13pro-tZ5LzRWzRyrbuDe8jTLsD6uPHZUk9i.png",
      description: null,
      order: 37,
      originalSeriesId: 1,
    },
    {
      originalId: 73,
      name: "iPhone 7 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone7plus-tuSFrZyQ8BCS6Unfxr3LwXZBnluq5L.png",
      description: null,
      order: 9,
      originalSeriesId: 1,
    },
    {
      originalId: 74,
      name: "iPhone 6s Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone6splus-LwbJTgahLTRhVFEDNsdGTVfr02yYiJ.png",
      description: null,
      order: 2,
      originalSeriesId: 1,
    },
    {
      originalId: 76,
      name: "iPhone 15 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone15plus-TerP9FPl8rlwVkdgUPEeVrF8IfqPMb.png",
      description: null,
      order: 3,
      originalSeriesId: 1,
    },
    {
      originalId: 77,
      name: "iPhone 12 Pro Max",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone12promax-bcPmCeEENBK7W2w4mM6AbbsTaZWZGh.png",
      description: null,
      order: 4,
      originalSeriesId: 1,
    },
    {
      originalId: 78,
      name: "iPhone 5C",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone5c-FqIHfNtGu1p2kZo6LA95sM21W6ZGfH.png",
      description: null,
      order: 5,
      originalSeriesId: 1,
    },
    {
      originalId: 79,
      name: "iPhone 4S",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone4s-YVvikN0JuZAbLgMTJwzAsmFyk4RZN4.png",
      description:
        "If you own the Apple iPhone 14 Pro Max, having a reliable iPhone 14 Pro Max repair service that you can count on definitely provides peace of mind. When your iPhone 14 Pro Max needs anything from a screen repair to a battery replacement, CPR has the parts, tools, and experience to get the job done right – quickly and hassle-free. You can also sell your iPhone 14 Pro Max to CPR or trade it in for one of the many premium pre-owned devices available in our stores.",
      order: 0,
      originalSeriesId: 1,
    },
    {
      originalId: 80,
      name: "iPhone 6s",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone6s-du3PLkyXmk0QmG3y64Ie0ymmqwpFZF.png",
      description: null,
      order: 6,
      originalSeriesId: 1,
    },
    {
      originalId: 81,
      name: "iPhone 12 Mini",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone12mini-LzlRzt0awJj57c6BKbl3w9tZ1EUpvl.png",
      description: null,
      order: 7,
      originalSeriesId: 1,
    },
    {
      originalId: 82,
      name: "iPhone 14 Pro Max",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone14promax-gIeSCE3mHeUHBN6S5LTiXgqVm1KCHu.png",
      description: null,
      order: 8,
      originalSeriesId: 1,
    },
    {
      originalId: 83,
      name: "iPhone 14",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone14-oJx6esf300Pzozhbh3FNMjChypSv2T.png",
      description: "iphone 14 description ",
      order: 1,
      originalSeriesId: 1,
    },
    {
      originalId: 84,
      name: "iPhone 15",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone15-WvGvg4UBOQ332OdplPDfaV2TvqRk7Q.png",
      description: null,
      order: 10,
      originalSeriesId: 1,
    },
    {
      originalId: 85,
      name: "iPhone SE 2020",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphonese2020-o7fd9uoFIS5gN5RH5QzZ4cvVod407o.png",
      description: null,
      order: 11,
      originalSeriesId: 1,
    },
    {
      originalId: 86,
      name: "iPhone 5S",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone5s-GrskX4PUrHd6Nw28xBnQYSDW132L0b.png",
      description: null,
      order: 12,
      originalSeriesId: 1,
    },
    {
      originalId: 87,
      name: "iPhone 8",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone8-07RRTBoDbUjlcIbjd7cYM7x6juvXzY.png",
      description: null,
      order: 13,
      originalSeriesId: 1,
    },
    {
      originalId: 88,
      name: "iPhone SE 2022",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphonese2022-iW4IaOv1da8L7eMHTyp7Eckfb3E4yu.png",
      description: null,
      order: 14,
      originalSeriesId: 1,
    },
    {
      originalId: 89,
      name: "iPhone 12 Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone12pro-kk4KAQ1XhecNtSK2TcuBQUgueQcVqV.png",
      description: null,
      order: 15,
      originalSeriesId: 1,
    },
    {
      originalId: 90,
      name: "iPhone 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone5-xIOttWQYHsJqTNwQGIEPrsyJNFJTTr.png",
      description:
        "$69.99 for screen replacement, $60 for battery, $69.99 back camera,  $69.99 charging port",
      order: 16,
      originalSeriesId: 1,
    },
    {
      originalId: 91,
      name: "iPhone 11 Pro Max",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone11promax-hOCASi2f4MNYKgXM5yUXpjlPCtsUeD.png",
      description: "$159 for soft oled ",
      order: 17,
      originalSeriesId: 1,
    },
    {
      originalId: 92,
      name: "iPhone 15 Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/iphone15pro-WbXJlt60IUcc9wXafEvM5GnjiLPy5V.png",
      description: "$260 for Soft Oled ",
      order: 18,
      originalSeriesId: 1,
    },
    {
      originalId: 93,
      name: "Pixel 3a",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel3a-f5SxhHtAg5tNEfuvkt70wO1R3gY9Dw.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 94,
      name: "Pixel 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel3-Ojy9RpwUXM4BtNqbw1sFwq1HoVR90E.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 95,
      name: "Pixel 4 XL",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel4xl-GqFWo1qRpQIFqGw9XmO6JfJngLubcu.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 96,
      name: "Pixel 4a 5g",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel4a5g-TuU1UmVDuszzfCvsQbpOwW2ozY4OIK.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 97,
      name: "Pixel 6 Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel6pro-2NfSpxTxeIAbdyKbbgCf7b3T2N3RmN.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 98,
      name: "Pixel 4a",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel4a-8l1zeSdYXpqxRA2JK2I9lmPkTvvuZG.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 99,
      name: "Pixel 7 Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel7pro-lG628pSuJOlgXNLrcnLfOMsUZjaAl8.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 100,
      name: "Pixel 5A 5G",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel5a5g-fwrvY2HFRQhBPcJrwUl4IvNpvwSI8f.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 101,
      name: "Pixel 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel5-zsQRkES8pMPmOrAjEe8MnzsIjaMDei.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 102,
      name: "Pixel 3 XL",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel3xl-O6hxfqPZ1V0b2Hvbp8vJ0k4mRL9ONE.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 103,
      name: "Pixel 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel4-1JbymBkj0MjUZE6LYKiiKb11VuCb8r.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 104,
      name: "Pixel 2 XL",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel2xl-sia1pWFH1wM1WwrL87tk9UHwiYqmQP.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 105,
      name: "Pixel 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel2-3QQ3d0SU6gkrz82yhMtOVUcJ5qRjjm.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 106,
      name: "Pixel 1",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel1-xLKXGcAZNJSbRQbCm0JGzCQGr1uZav.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 107,
      name: "Pixel Fold",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixelfold-BCitYZZ5Wsjst6kHGGn8njFx7i2FHr.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 108,
      name: "Pixel 6a",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel6a-ouc4The3LwkNnM5ERytclugRzntnhF.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 109,
      name: "Pixel 3a XL",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel3axl-qT0eY8chrbLapTMDo3aTzNCFUwyc2a.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 110,
      name: "Pixel 8",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel8-gkQ8rbhWDciblkH8oU769XzS3hYeax.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 111,
      name: "Pixel 1 XL",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel1xl-N4AHvaf71M4OVu2U9UjNtXe52avkWr.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 112,
      name: "Pixel 8 Pro",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel8pro-FczqQfxJVwcYsFJ5BfSqXpdaxBd8bD.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 113,
      name: "Pixel 6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel6-6OrsJYHF1uqGIgaU1aCSmxnHAkDnZT.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 114,
      name: "Pixel 7A",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel7a-jiKoR3oKLEJ1e8FUuZTeXlVcQhgyQD.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 115,
      name: "Pixel 7",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/pixel7-g7ymS2h4nBVs6y3ENauntLkvjT7rs0.png",
      description: null,
      order: 0,
      originalSeriesId: 9,
    },
    {
      originalId: 116,
      name: "Galaxy Note 20",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote20-UNc2VA0r4TbiiQtXHDigDB1hCdD7qy.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 117,
      name: "Galaxy Note 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote4-wlgKq2BtDpXnXvS3jO8blt5eDo4XHS.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 118,
      name: "Galaxy Note 9",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote9--G3XKFbWtD9njJ7VmSd32gSdVnP8IyS.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 119,
      name: "Galaxy Note 8",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote8-AHrzK6ZU7Mjr3Q4zdKUeKGjOKh6pcc.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 120,
      name: "Galaxy Note 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote2-ZXjRVWefnBIy7WHwZIM1iDl3XsPdxj.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 121,
      name: "Galaxy Note 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote5-ydSSyyeCx6u7LNsvYL5y1XIW4jmVpP.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 122,
      name: "Galaxy Note 20 Ultra",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote20ultra-8CXzyBx8reGxDbnHNfxisgadtXBcGt.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 123,
      name: "Galaxy Note 10 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote10%20plus-TsFdBDgvBhi98cAIghlVZwd6UEY6Uv.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 124,
      name: "Galaxy Note 10",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote10-VlprnEC7g4FRIRrKgH8Stl2obgqsD4.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 125,
      name: "Galaxy Note 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote3-sKY9CW1sOlBo8WPtoG5q43xhWIViyj.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 126,
      name: "Galaxy Note 10 Lite",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxynote10lite-sMJ8DVPc1NuwJt35Z9RHvGsokMiNP2.png",
      description: null,
      order: 0,
      originalSeriesId: 3,
    },
    {
      originalId: 127,
      name: "Galaxy S21 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys21plus-RSTR2EfCTx1mUNNVtIqLMmZg93q3Wn.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 128,
      name: "Galaxy S22 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys22plus-4fAW7J8QMEncbZGzvyxO6LCnHOpwAF.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 129,
      name: "Galaxy S21 FE",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys21fe-QsMEpg9r6Yh1XhjZmPAu1HkVxiiK54.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 130,
      name: "Galaxy S6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys6-wsuUvQ9gzfOGnnjHe5EOORdHy1rW1r.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 131,
      name: "Galaxy S5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys5-6fYcUxzrIX2nQbDGeLGLtI6NUUXfk0.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 132,
      name: "Galaxy S7 Edge",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys7edge-P1L073ygK0damzowLMAjzZp21awRBw.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 133,
      name: "Galaxy S21",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys21-s5eVdUvflaxvftYKvEGnjfoC4V21S1.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 134,
      name: "Galaxy S6 Active",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys6active-wqJRg17Ci1j8dHZ1VDrg7fO8lrkaPg.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 135,
      name: "Galaxy S9",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys9-hxA8lnIwfvMDezbav3APYcZIz3GWlL.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 136,
      name: "Galaxy S3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys3-gazIkV2q9WJcPToRmSvLLBCmu1JYuf.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 137,
      name: "Galaxy S7",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys7-dvU9Lv9fDk0c8Z5Np3JKr2oKkRlYRc.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 138,
      name: "Galaxy S22",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys22-hYJpxZC6M7t2WBkHJDHQhqTE2G21YC.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 139,
      name: "Galaxy S6 Edge Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys6edgeplus-VEOv5PmMDpKi8nDKDSgs4Gv64foyP1.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 140,
      name: "Galaxy S20 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys20plus-E1e9e548kWDEtAn8Z4MYDn8WkCrVHL.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 141,
      name: "Galaxy S10 Lite",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys10lite-KZwKVkfXU7RDkjRIESqmmcwLMhIuFH.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 142,
      name: "Galaxy S8 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys8plus-9DsufEhr49ghgJwIzJy319k3UZPZsJ.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 143,
      name: "Galaxy S21 Ultra",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys21ultra-3pEXCVOtyAQZCsJRGRmXvG5HX7ccGq.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 144,
      name: "Galaxy S7 Active",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys7active-DzrDFN421YACs7D3symMXUnO9VXQAE.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 145,
      name: "Galaxy S22 Ultra",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys22ultra-dueK9nRwi5wabd6XSkPYz4MikXnC8z.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 146,
      name: "Galaxy S8",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys8-ZNihsAf7xHNfToddVbUMMHD5W1JP9e.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 147,
      name: "Galaxy S20",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys20-chjuwIRBv7SA3lUxtMbmmkTokWPot8.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 148,
      name: "Galaxy S24",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys24-dAAMDfueihzlzPEpOQWsu8olGHQkhI.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 149,
      name: "Galaxy S20 FE",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys20fe-w8GlAGPc8Q5qdViQ10ick0nTa12gj5.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 150,
      name: "Galaxy S9 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys9plus-K4vowluUZn7s8lbVnVu1ua56tx3Zch.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 151,
      name: "Galaxy S10",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys10-NUGxb1qnUN4IMkXaGsUd7HA21k8CYR.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 152,
      name: "Galaxy S20 Ultra",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys20ultra-X7aFsvUAcj9uTseaG3TcXEP6i3sxXB.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 153,
      name: "Galaxy S6 Edge",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys6edge-ynGxjMd9ImTTVYGdMDE3YgEknwcvWA.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 154,
      name: "Galaxy S24 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys24plus-hlC8fYsbjGnJoNWsZ68WwcctZWELS5.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 155,
      name: "Galaxy S10 5g",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxy%20s10%205G-tvc5GgTsUVsL9TG6x26LtPqJwgJW0i.png",
      description: "Galaxy S1 5g",
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 156,
      name: "Galaxy S10e",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys10e-qohs8f8CsRcgzHgyqHOMxAPhZFnoTd.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 157,
      name: "Galaxy S23",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys23-Zlg4viC9wtOLfXBcdJTlf0tfJ1HHeG.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 158,
      name: "Galaxy S4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys4-sfYOy2KRoGF0Dne5XliFKTbkAOwXh9.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 159,
      name: "Galaxy S10 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys10plus-0jdj48F74B5FPvYC7mOy7PnSYz3UfE.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 160,
      name: "Galaxy S8 Active",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys8active-fkUlweH5gLqw7gEzs7vnhyMZeDp1ep.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 163,
      name: "Galaxy S23 Plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys23plus-Tg9wJKiGLaQoKsYfXnPdaRBycV9wHu.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 164,
      name: "Galaxy S23 FE",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys23fe-lj04JW6UmDSxDIlArSIarOSSfcOshP.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 165,
      name: "Galaxy S24 Ultra",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/galaxys24ultra-jWxbyz5Gq7iVYAVumWHuNcUZYhDII2.png",
      description: null,
      order: 0,
      originalSeriesId: 2,
    },
    {
      originalId: 166,
      name: "Oneplus 5t",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/5t-nNqHDIpnRwOnabO6OK6nvodTr6bOW9.png",
      description: null,
      order: 0,
      originalSeriesId: 10,
    },
    {
      originalId: 167,
      name: "Oneplus 3t",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/3t-p42Wuq50WvAvnlIUezAXttdhxTmoIu.png",
      description: null,
      order: 0,
      originalSeriesId: 10,
    },
    {
      originalId: 168,
      name: "Oneplus 6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/6-cZ4BcFORQQCCAGhXqNwZ1b7Qn7nhRV.png",
      description: null,
      order: 0,
      originalSeriesId: 10,
    },
    {
      originalId: 169,
      name: "Oneplus 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/5-XUi0G0TfUguSGpqxVfL8uiwsOOYjYq.png",
      description: null,
      order: 0,
      originalSeriesId: 10,
    },
    {
      originalId: 170,
      name: "Oneplus 6t",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/6t-rKtBfAYh8dsSN2Mu3vwuaavNDYsPMW.png",
      description: null,
      order: 0,
      originalSeriesId: 10,
    },
    {
      originalId: 173,
      name: "Surface Book 2",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/surfacebook2-BabFJtJLsMqabnUdJDPlqOLm5rzNDv.png",
      description: null,
      order: 0,
      originalSeriesId: 13,
    },
    {
      originalId: 174,
      name: "Surface Book 1",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/surfacebook1-xuE7MbewSnxbosayYjY1LE6wMDVZis.png",
      description: null,
      order: 0,
      originalSeriesId: 13,
    },
    {
      originalId: 175,
      name: "Surface Pro 6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/surfacepro6-Tw6mZCGnivuPQUriOaAG9GWSjBkSiq.png",
      description: null,
      order: 0,
      originalSeriesId: 12,
    },
    {
      originalId: 176,
      name: "Surface Pro 7plus",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/surfacepro7plus-L6uYcZOQUgdK2AEC1U6C0GmUAe8Y3p.png",
      description: null,
      order: 0,
      originalSeriesId: 12,
    },
    {
      originalId: 177,
      name: "Surface Pro 4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/surfacepro4-SvthxiJMO5oFLhxoosa0rV1TlFkMmX.png",
      description: null,
      order: 0,
      originalSeriesId: 12,
    },
    {
      originalId: 178,
      name: "Surface Pro 3",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/surfacepro3-BFSKOLjzNACDk9AZuTAGCcz09K4dX1.png",
      description: null,
      order: 0,
      originalSeriesId: 12,
    },
    {
      originalId: 179,
      name: "Surface Pro 7",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/surfacepro7-Nl5ZCPLdagAolUO08qiqHrAzLgiJWR.png",
      description: null,
      order: 0,
      originalSeriesId: 12,
    },
    {
      originalId: 180,
      name: "Surface Pro 5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/surfacepro5-rOr9UNB2dTsXVHHNWeBvVw6y4wxN67.png",
      description: null,
      order: 0,
      originalSeriesId: 12,
    },
    {
      originalId: 181,
      name: "Xbox One S",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/xboxones-7mpHTxNFnCrBWOyPAm1xVsnwImiPM5.png",
      description: null,
      order: 0,
      originalSeriesId: 14,
    },
    {
      originalId: 182,
      name: "Xbox One",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/xboxone-kb1toItJRtDYUxUB3pvS544cfyainR.png",
      description: null,
      order: 0,
      originalSeriesId: 14,
    },
    {
      originalId: 183,
      name: "Xbox One X",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/xboxonex-NzmRopBl7XtqirLMbHXqbfJGgUWior.png",
      description: null,
      order: 0,
      originalSeriesId: 14,
    },
    {
      originalId: 184,
      name: "Xbox Series S",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/xboxseriess-gz7F3M6GaON4jwgMgyngS7AcDGjbc0.png",
      description: null,
      order: 0,
      originalSeriesId: 14,
    },
    {
      originalId: 185,
      name: "Xbox Series X",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/xboxseriesx-c4B10us9rvY6uPMCpJRu8L5CRMW3lL.png",
      description: null,
      order: 0,
      originalSeriesId: 14,
    },
    {
      originalId: 186,
      name: "LG G4",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/g4-8xJjQgs1HhIIsyga97botaJwz1fIaa.png",
      description: null,
      order: 0,
      originalSeriesId: 16,
    },
    {
      originalId: 187,
      name: "LG G6",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/g6-2hjJITHwTy6GShZDs9oe5XIqT7vMnP.png",
      description: null,
      order: 0,
      originalSeriesId: 16,
    },
    {
      originalId: 188,
      name: "LG G7",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/g7-W4rVkkUzENTHKSLurKrB60sITdFR3e.png",
      description: null,
      order: 0,
      originalSeriesId: 16,
    },
    {
      originalId: 189,
      name: "LG G5",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/g5-iwKMfn2Diic0mPTGgZPoUAJiAgb1iK.png",
      description: null,
      order: 0,
      originalSeriesId: 16,
    },
    {
      originalId: 190,
      name: "LG V20",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/v20-C5dsjpOGj2VsCc5Px7MFs4Pv1fh2fy.png",
      description: null,
      order: 0,
      originalSeriesId: 17,
    },
    {
      originalId: 191,
      name: "LG V40",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/v40-GehlsLF1cAVEKe8VovJVlXfUUcR1Ss.png",
      description: null,
      order: 0,
      originalSeriesId: 17,
    },
    {
      originalId: 192,
      name: "LG V30",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/v30-HyHef84WLL8xsDrponmZFU9qcAFUPt.png",
      description: null,
      order: 0,
      originalSeriesId: 17,
    },
    {
      originalId: 193,
      name: "LG V60",
      image:
        "https://5oohlclsrex09wdr.public.blob.vercel-storage.com/v60-pHZSCjlg8Rp5LdRtQiUfrd1eSAauTo.png",
      description: null,
      order: 0,
      originalSeriesId: 17,
    },
    {
      originalId: 194,
      name: "random models",
      image: "/logo.png",
      description: "LML-Repair",
      order: 0,
      originalSeriesId: 18,
    },
  ];

  const modelsDataForPrisma = modelsInputData.map(
    ({ originalId, originalSeriesId, ...rest }) => {
      const seriesId = seriesIdMap.get(originalSeriesId);
      if (seriesId === undefined) {
        throw new Error(
          `Could not find new Series ID for original Series ID ${originalSeriesId} when processing Model ${originalId}`
        );
      }
      return { ...rest, seriesId };
    }
  );

  await prisma.model.createMany({
    data: modelsDataForPrisma,
  });
  console.log(`Seeded ${modelsDataForPrisma.length} models.`);

  console.log(`Device hierarchy seeding finished.`);
}

// Standalone execution function (if you need to run this file directly)
async function runStandaloneSeed() {
  console.log("Running standalone device hierarchy seed...");
  const prisma = new PrismaClient();
  try {
    await seedDeviceHierarchy(prisma);
  } catch (e) {
    console.error("Error during standalone device hierarchy seeding:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("Standalone seed finished and Prisma client disconnected.");
  }
}

// Allow standalone execution by checking if the script is run directly
if (require.main === module) {
  runStandaloneSeed();
}
