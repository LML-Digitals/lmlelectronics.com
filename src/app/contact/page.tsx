"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form");
      }

      toast.success("Your message has been sent successfully! We'll get back to you soon.");
      reset(); // Clear the form
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Contact Us</h1>
        <p className="text-gray-600 mb-8 text-center">
          Have a question or need help? Fill out the form below and our team will get back to you as soon as possible.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                {...register("firstName")}
                type="text"
                id="firstName"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="First Name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                {...register("lastName")}
                type="text"
                id="lastName"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Last Name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="you@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              {...register("subject")}
              type="text"
              id="subject"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none ${
                errors.subject ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Subject"
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              {...register("message")}
              id="message"
              rows={5}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none resize-none ${
                errors.message ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="How can we help you?"
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-semibold py-3 rounded-md transition-colors ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
        
        <div className="mt-10 border-t pt-8 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg font-semibold mb-2">Business Contact</h2>
            <p className="text-gray-700">support@lmlelectronics.com</p>
            <p className="text-gray-700">1-800-LML-ELECTRONICS</p>
            <p className="text-gray-700">Mon-Fri: 9AM-6PM EST</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {/* Map Placeholder */}
            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              Map Placeholder
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 