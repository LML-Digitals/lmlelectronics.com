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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Clock, 
  MessageSquare,
  Star,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AIAnalysisData {
  approved: boolean;
  score: number;
  category: string;
  answer: string;
  confidence: number;
  notes: string;
}

export default function AIEnhancedFAQSubmissions() {
  const [submissions, setSubmissions] = useState<FAQSubmission[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFAQForm, setShowFAQForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FAQSubmission | null>(null);
  const [aiProcessing, setAiProcessing] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, AIAnalysisData>>({});
  const { toast } = useToast();

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

  const handleAIAnalysis = async (submissionId: string) => {
    try {
      setAiProcessing(submissionId);
      
      const response = await fetch('/api/faq/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      const result = await response.json();

      if (result.success) {
        setAiAnalysis(prev => ({
          ...prev,
          [submissionId]: result.data.analysis
        }));
        
        // Update the submission in the list
        setSubmissions(prev => 
          prev.map(sub => 
            sub.id === submissionId 
              ? { ...sub, ...result.data.submission }
              : sub
          )
        );

        toast({
          title: "AI Analysis Complete",
          description: result.data.analysis.approved 
            ? "AI approved this submission and generated an answer!"
            : "AI reviewed the submission and provided feedback.",
        });
      } else {
        toast({
          title: "AI Analysis Failed",
          description: result.error || "Failed to analyze submission",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error analyzing submission:", error);
      toast({
        title: "Error",
        description: "Failed to analyze submission",
        variant: "destructive",
      });
    } finally {
      setAiProcessing(null);
    }
  };

  const handleAIApprove = async (submissionId: string) => {
    try {
      const response = await fetch('/api/faq/ai-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      const result = await response.json();

      if (result.success) {
        await loadSubmissions();
        toast({
          title: "FAQ Approved",
          description: "FAQ has been created and published successfully!",
        });
      } else {
        toast({
          title: "Approval Failed",
          description: result.error || "Failed to approve FAQ",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving FAQ:", error);
      toast({
        title: "Error",
        description: "Failed to approve FAQ",
        variant: "destructive",
      });
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">FAQ Submissions</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Brain className="h-3 w-3 mr-1" />
            AI Enhanced
          </Badge>
        </div>
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
        <div className="space-y-4">
          {submissions.map((submission) => {
            const analysis = aiAnalysis[submission.id];
            const isProcessing = aiProcessing === submission.id;
            
            return (
              <Card key={submission.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base">{submission.question}</CardTitle>
                      {submission.customerName && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          From: {submission.customerName}
                          {submission.customerEmail && ` (${submission.customerEmail})`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
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
                      {submission.aiProcessedAt && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Processed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* AI Analysis Results - Only show for pending submissions */}
                  {submission.aiProcessedAt && submission.status === "pending" && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-blue-900">AI Analysis</h4>
                        <Badge 
                          variant={submission.aiApproved ? "default" : "secondary"}
                          className={submission.aiApproved ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {submission.aiApproved ? "Approved" : "Not Recommended"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-3 w-3 text-yellow-600" />
                            <span className="text-xs font-medium">Quality Score</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={submission.aiScore || 0} className="flex-1 h-2" />
                            <span className={`text-xs font-bold ${getScoreColor(submission.aiScore || 0)}`}>
                              {submission.aiScore || 0}%
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-medium">Confidence</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={submission.aiConfidence || 0} className="flex-1 h-2" />
                            <span className={`text-xs font-bold ${getConfidenceColor(submission.aiConfidence || 0)}`}>
                              {submission.aiConfidence || 0}%
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <MessageSquare className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium">Category</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {submission.aiCategory || 'General'}
                          </Badge>
                        </div>
                      </div>
                      
                      {submission.aiNotes && (
                        <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                          <strong>AI Notes:</strong> {submission.aiNotes}
                        </div>
                      )}
                      
                      {submission.aiApproved && submission.aiAnswer && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <div className="flex items-center gap-1 mb-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-medium text-green-800">AI Generated Answer</span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">{submission.aiAnswer}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {!submission.aiProcessedAt && (
                      <Button
                        onClick={() => handleAIAnalysis(submission.id)}
                        disabled={isProcessing}
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      >
                        {isProcessing ? (
                          <>
                            <Clock className="h-3 w-3 mr-1 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-3 w-3 mr-1" />
                            AI Analyze
                          </>
                        )}
                      </Button>
                    )}
                    
                    {submission.aiProcessedAt && submission.status === "pending" && (
                      <Button
                        onClick={() => handleAIAnalysis(submission.id)}
                        disabled={isProcessing}
                        variant="outline"
                        size="sm"
                        className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                      >
                        {isProcessing ? (
                          <>
                            <Clock className="h-3 w-3 mr-1 animate-spin" />
                            Re-analyzing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Re-analyze
                          </>
                        )}
                      </Button>
                    )}
                    
                    {submission.status === "pending" && (
                      <>
                        {submission.aiApproved && submission.aiAnswer && (
                          <Button
                            onClick={() => handleAIApprove(submission.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            AI Approve
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => handleStatusUpdate(submission.id, "approved")}
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Manual Approve
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(submission.id, "rejected")}
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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