"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PageHero from "@/components/PageHero";

export default function FAQsPage() {
  const faqs = [
    {
      category: "Product Information",
      questions: [
        {
          question: "Are your repair parts genuine and high-quality?",
          answer: "Yes, we only stock genuine, high-quality repair parts from reputable manufacturers. All our products come with warranty and are tested for quality assurance before being listed on our site."
        },
        {
          question: "How do I know which parts are compatible with my device?",
          answer: "You can search for your specific device model on our website, and we'll show you all compatible parts. You can also contact our support team for assistance in finding the right parts for your device."
        },
        {
          question: "Do you offer repair guides or instructions?",
          answer: "Yes, we provide detailed repair guides and video tutorials for most common repairs. These guides are available on our website and can help you complete repairs safely and effectively."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          question: "How long does shipping take?",
          answer: "Standard shipping typically takes 3-5 business days within the continental US. We also offer expedited shipping options for faster delivery. International shipping times vary by location."
        },
        {
          question: "Do you offer free shipping?",
          answer: "Yes, we offer free standard shipping on orders over $50. For orders under $50, standard shipping is $5.99."
        },
        {
          question: "Can I track my order?",
          answer: "Yes, once your order ships, you'll receive a tracking number via email. You can also track your order through your account on our website."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. Please contact us for specific rates to your country."
        }
      ]
    },
    {
      category: "Returns & Warranty",
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for most items. Products must be unused and in original packaging. Some items may have different return policies due to their nature."
        },
        {
          question: "How do I return an item?",
          answer: "To return an item, please contact our customer service team within 30 days of purchase. We'll provide you with a return authorization number and shipping instructions."
        },
        {
          question: "What warranty do you offer on your products?",
          answer: "Most of our products come with a 1-year warranty. Some items may have extended warranty options available. Please check individual product pages for specific warranty information."
        },
        {
          question: "What if my part arrives damaged?",
          answer: "If your part arrives damaged, please contact us immediately with photos of the damage. We'll arrange for a replacement or refund at no additional cost to you."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "Do you provide technical support for repairs?",
          answer: "Yes, our technical support team is available to help with repair questions and troubleshooting. You can contact us via email, phone, or live chat during business hours."
        },
        {
          question: "What if I need help during a repair?",
          answer: "If you encounter issues during a repair, please stop immediately and contact our support team. We can provide guidance or recommend professional repair services if needed."
        },
        {
          question: "Do you offer professional repair services?",
          answer: "While we primarily sell repair parts, we can recommend certified repair technicians in your area. We also partner with repair shops that use our parts."
        }
      ]
    },
    {
      category: "Account & Orders",
      questions: [
        {
          question: "How do I create an account?",
          answer: "You can create an account by clicking the 'Sign Up' button in the top navigation. You'll need to provide your email address and create a password."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "Orders can typically be modified or cancelled within 2 hours of placement, as long as they haven't been processed for shipping. Please contact our customer service team immediately."
        },
        {
          question: "How do I view my order history?",
          answer: "You can view your order history by logging into your account and visiting the 'My Orders' section. Here you'll find all your past and current orders."
        }
      ]
    },
    {
      category: "Payment & Security",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. All payments are processed securely."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your complete credit card details on our servers."
        },
        {
          question: "Do you offer financing options?",
          answer: "We currently don't offer financing options, but we do accept all major credit cards and PayPal for payment flexibility."
        }
      ]
    }
  ];

  return (
    <div>
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our products, shipping, returns, and more."
        backgroundImage="/images/lml_box.webp"
        breadcrumbs={[{ name: "FAQs", href: "/faqs" }]}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {category.questions.map((faq, faqIndex) => (
                  <FAQItem key={faqIndex} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Still Have Questions?</h3>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our customer service team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="mailto:support@lmlelectronics.com"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="px-6 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-lg p-2 -m-2"
      >
        <h3 className="text-lg font-medium text-gray-900 pr-4">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
} 