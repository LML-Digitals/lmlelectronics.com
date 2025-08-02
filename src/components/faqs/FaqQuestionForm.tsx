"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { submitFAQQuestion } from "./services/faqService";
import { toast } from "@/components/ui/use-toast";

interface FormData {
  customerName: string;
  customerEmail: string;
  question: string;
}

export default function FaqQuestionForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerEmail: "",
    question: "",
  });
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await submitFAQQuestion(formData);
      setFormData({ customerName: "", customerEmail: "", question: "" });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting question:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 border border-[#D1D3D4]">
      <h3 className="text-2xl font-semibold mb-6">Still have questions?</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              placeholder="Your name"
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
              placeholder="Your email"
              className="mt-2"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="question" className="text-sm font-medium">
            Your Question*
          </Label>
          <Textarea
            id="question"
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            placeholder="Type your question here..."
            required
            className="mt-2 min-h-[120px]"
          />
        </div>

        <Button
          type="submit"
          className="w-full text-white h-12 text-base"
        >
          {loading && <CircleDashed className="h-4 w-4 mr-2 animate-spin" />}
          Submit Question
        </Button>

        {/* Success Message */}
        {showSuccess && (
          <div className="flex items-center gap-2 text-[#000000] bg-secondary p-4 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <p>Your question has been submitted successfully!</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-[#000000] bg-red-400 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
