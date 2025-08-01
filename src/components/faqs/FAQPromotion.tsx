"use client";

import Image from "next/image";
import { MessageCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

const FAQDetailsSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className=" py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image Side */}
            <div className="w-full lg:w-2/5 relative bg-gray-100">
              <div className="h-[250px] lg:h-full relative">
                <Image
                  src="/faqs-need-more-info.png"
                  alt="FAQ Support - Get answers to your questions about device repairs"
                  fill
                  className="object-contain z-10 p-6"
                  priority
                />
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-3/5 p-6 lg:p-10">
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center px-3 py-1 text-xs font-medium text-accent bg-primary rounded-full mb-3">
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Frequently Asked Questions
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Need more{" "}
                    <span className="text-secondary drop-shadow-sm">
                      information?
                    </span>
                  </h2>
                  <p className="mt-2 text-base text-gray-600">
                    Find answers to common questions about our repair services,
                    warranty coverage, and repair process.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/faqs#question-form"
                    className="px-4 py-2 bg-accent hover:bg-accent/80 transition-all rounded-md text-sm text-black font-medium flex items-center gap-2 justify-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ask a Question
                  </Link>
                  <Link
                    href="/faqs#faq-section"
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all rounded-md text-sm font-medium flex items-center gap-2 justify-center"
                  >
                    Browse FAQs
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      100<span className="text-secondary">+</span>
                    </p>
                    <p className="text-xs text-gray-600">Questions Answered</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      1<span className="text-secondary">hr</span>
                    </p>
                    <p className="text-xs text-gray-600">Avg. Response</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      24<span className="text-secondary">/7</span>
                    </p>
                    <p className="text-xs text-gray-600">Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQDetailsSection; 