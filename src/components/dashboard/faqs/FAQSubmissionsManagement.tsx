"use client";

import { useState, useEffect } from "react";
import { FAQSubmission } from "@prisma/client";
import {
  getFAQSubmissions,
  updateFAQSubmissionStatus,
  getFAQCategories,
} from "./Services/faqCrud";
import FAQForm from "./FAQForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FAQSubmissionsManagement() {
  const [submissions, setSubmissions] = useState<FAQSubmission[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFAQForm, setShowFAQForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<FAQSubmission | null>(null);

  useEffect(() => {
    loadSubmissions();
    loadCategories();
  }, [filter]);

  const loadCategories = async () => {
    try {
      const categoriesData = await getFAQCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await getFAQSubmissions(filter || undefined);
      setSubmissions(data);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      if (status === "approved") {
        const submission = submissions.find((sub) => sub.id === id);
        if (submission) {
          setSelectedSubmission(submission);
          setShowFAQForm(true);
          return;
        }
      }
      await updateFAQSubmissionStatus(id, status);
      await loadSubmissions();
    } catch (error) {
      console.error("Error updating submission status:", error);
    }
  };

  const handleFormSuccess = async () => {
    if (selectedSubmission) {
      await updateFAQSubmissionStatus(selectedSubmission.id, "approved");
      setShowFAQForm(false);
      setSelectedSubmission(null);
      await loadSubmissions();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl font-semibold">FAQ Submissions</h2>
        <Select
          value={filter || "all"}
          onValueChange={(value) => {
            setFilter(value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="w-full sm:w-48 min-h-[44px] text-sm sm:text-base">
            <SelectValue placeholder="Filter submissions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-sm sm:text-base">All Submissions</SelectItem>
            <SelectItem value="pending" className="text-sm sm:text-base">Pending</SelectItem>
            <SelectItem value="approved" className="text-sm sm:text-base">Approved</SelectItem>
            <SelectItem value="rejected" className="text-sm sm:text-base">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-sm sm:text-base">Loading...</div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white p-3 sm:p-4 rounded-lg shadow space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">{submission.question}</p>
                  {submission.customerName && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      From: {submission.customerName}
                      {submission.customerEmail &&
                        ` (${submission.customerEmail})`}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    submission.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : submission.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {submission.status}
                </span>
              </div>

              {submission.status === "pending" && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() =>
                      handleStatusUpdate(submission.id, "approved")
                    }
                    className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 min-h-[44px] text-sm sm:text-base"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(submission.id, "rejected")
                    }
                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 min-h-[44px] text-sm sm:text-base"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showFAQForm && selectedSubmission && (
        <FAQForm
          initialQuestion={selectedSubmission.question}
          categories={categories}
          onClose={() => {
            setShowFAQForm(false);
            setSelectedSubmission(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
