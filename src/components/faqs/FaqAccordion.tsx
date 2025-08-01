"use client";

import { FAQ } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

interface FaqAccordionProps {
  faqs: FAQ[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={faq.id}
          className="rounded-lg border border-[#D1D3D4] bg-white/50 backdrop-blur-sm overflow-hidden hover:border-secondary transition-colors"
        >
          <button
            onClick={() =>
              setExpandedIndex(expandedIndex === index ? null : index)
            }
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <h3 className="font-medium text-black">{faq.question}</h3>
            {expandedIndex === index ? (
              <Minus className="h-5 w-5 text-secondary" />
            ) : (
              <Plus className="h-5 w-5 text-secondary" />
            )}
          </button>
          <AnimatePresence>
            {expandedIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4 pt-0 text-[#000000]">{faq.answer}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
