import Image from 'next/image';
import React from 'react';

interface RepairPageHero {
  title?: string;
  description?: string;
  image?: string;
}

export default function RepairPageHero ({
  title,
  description,
  image,
}: RepairPageHero) {
  return (
    <section className="relative max-w-5xl w-full mx-auto px-4 pb-12">
      {/* <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-secondary mb-8 leading-tight">
        {title || <></>}
      </h1> */}

      <div className="flex flex-col lg:flex-row-reverse items-center gap-5 md:gap-20 bg-[#e6e7e8] min-h-[200px] p-4 rounded-3xl">
        <div className="lg:w-1/3 flex justify-center p-2 relative">
          <Image
            src={image || '/smillingGuy.png'}
            alt="hero image"
            width={300}
            height={400}
            className="hidden lg:block object-contain rounded-2xl p-2 absolute -bottom-24"
            priority
          />
          <Image
            src={image || '/smillingGuy.png'}
            alt="hero image mobile"
            width={200}
            height={300}
            className="lg:hidden object-contain rounded-2xl"
            priority
          />
        </div>

        <div className="flex-1 p-6 md:p-8">
          <h2 className="text-gray-700 leading-relaxed">
            {description || (
              <>
                We specialize in professional device repairs with expert
                technicians and high-quality parts. Our comprehensive repair
                services include diagnostics, repairs, and testing to ensure
                your device is working perfectly. Contact us today to learn more
                about how we can help fix your device and get you back up and
                running.
              </>
            )}
          </h2>
        </div>
      </div>
    </section>
  );
}
