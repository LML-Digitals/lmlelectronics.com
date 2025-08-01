import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

const BookingCTA = () => {
  return (
    <div
      className="max-w-5xl mx-auto my-10 rounded-3xl shadow-lg px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-gray-100"
    >
      {/* Left: Text */}
      <div className="flex-1 flex flex-col items-start justify-center text-left gap-2 min-w-[200px]">
        <span className="text-sm font-semibold mb-1 text-gray-900">
          INSTANT BOOKING
        </span>
        <span className="text-3xl md:text-4xl font-extrabold leading-tight mb-2 text-gray-900">
          REPAIR IN <br /> MINUTES
        </span>
        <span className="text-base font-medium mt-2 text-gray-700">
          No wait. No hassle.
        </span>
      </div>

      {/* Center: Icon */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <div className="rounded-full shadow-lg flex items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-gray-900">
          <Wrench className="w-20 h-20 md:w-28 md:h-28 text-white" />
        </div>
      </div>

      {/* Right: CTA */}
      <div className="flex-1 flex flex-col items-end justify-center text-right gap-2 min-w-[200px]">
        <span className="text-sm font-semibold mb-1 text-gray-900">
          Book online now
        </span>
        <span className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          Fast. Reliable.<br />Affordable.
        </span>
        <Link href="/bookings">
          <Button
            size="lg"
            className="rounded-full px-8 py-2 font-bold text-[1.1rem] shadow-md mt-2 bg-gray-900 hover:bg-gray-800 text-white"
          >
            Book Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BookingCTA;
