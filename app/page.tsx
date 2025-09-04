"use client";

import React, { useState, useEffect } from "react";
import {
  ProgressIndicator,
  GlassCard,
  AnimatedTextarea,
  FloatingInput,
  AutoSaveIndicator,
  FuturisticButton,
  LoadingSpinner,
} from "@/components/ui";
import {
  FileText,
  Briefcase,
  Sparkles,
  Download,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  CheckCircle,
} from "lucide-react";
import { compressText } from "@/lib/compression";
import { cn } from "@/lib/utils";

export default function Home() {
  // Core state
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [supportingInfo, setSupportingInfo] = useState({
    skills: "",
    achievements: "",
    preferences: "",
  });

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    supporting: false,
  });
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Generation state
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // Edit state
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState("");

  const steps = ["Resume", "Job Details", "Generate", "Export"];

  // Auto-save to sessionStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        resumeText ||
        jobDescription ||
        Object.values(supportingInfo).some((v) => v)
      ) {
        setSaveStatus("saving");
        try {
          sessionStorage.setItem(
            "coverLetterData",
            JSON.stringify({
              resumeText,
              jobDescription,
              supportingInfo,
              savedAt: new Date().toISOString(),
            })
          );
          setTimeout(() => setSaveStatus("saved"), 500);
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (error) {
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), 3000);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [resumeText, jobDescription, supportingInfo]);

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("coverLetterData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setResumeText(data.resumeText || "");
        setJobDescription(data.jobDescription || "");
        setSupportingInfo(
          data.supportingInfo || {
            skills: "",
            achievements: "",
            preferences: "",
          }
        );
        setGeneratedCoverLetter(data.generatedCoverLetter || "");
        setEditedCoverLetter(data.generatedCoverLetter || "");
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Update current step based on filled fields and generation
  useEffect(() => {
    if (generatedCoverLetter) {
      setCurrentStep(3);
    } else if (jobDescription && resumeText) {
      setCurrentStep(2);
    } else if (resumeText) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  }, [resumeText, jobDescription, generatedCoverLetter]);

  // Clear all data
  const clearAllData = () => {
    if (
      confirm("Are you sure you want to clear all data? This cannot be undone.")
    ) {
      setResumeText("");
      setJobDescription("");
      setSupportingInfo({ skills: "", achievements: "", preferences: "" });
      setGeneratedCoverLetter("");
      setEditedCoverLetter("");
      sessionStorage.removeItem("coverLetterData");
      setSaveStatus("idle");
      setCurrentStep(0);
    }
  };

  // Generate cover letter function
  const generateCoverLetter = async () => {
    setIsGenerating(true);
    setGenerationError("");
    setCurrentStep(2);

    try {
      // Compress large text fields for efficient transmission
      const compressedResume = compressText(resumeText);
      const compressedJob = compressText(jobDescription);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: compressedResume,
          jobDescription: compressedJob,
          supportingInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      setGeneratedCoverLetter(data.coverLetter);
      setEditedCoverLetter(data.coverLetter);

      // Save to sessionStorage
      const savedData = JSON.parse(
        sessionStorage.getItem("coverLetterData") || "{}"
      );
      sessionStorage.setItem(
        "coverLetterData",
        JSON.stringify({
          ...savedData,
          generatedCoverLetter: data.coverLetter,
          generatedAt: data.timestamp,
        })
      );
    } catch (error: any) {
      console.error("Generation error:", error);
      setGenerationError(
        error.message || "Failed to generate cover letter. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async () => {
    const textToCopy = isEditing ? editedCoverLetter : generatedCoverLetter;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Save edited version
  const saveEdit = () => {
    setGeneratedCoverLetter(editedCoverLetter);
    setIsEditing(false);

    // Update sessionStorage
    const savedData = JSON.parse(
      sessionStorage.getItem("coverLetterData") || "{}"
    );
    sessionStorage.setItem(
      "coverLetterData",
      JSON.stringify({
        ...savedData,
        generatedCoverLetter: editedCoverLetter,
        editedAt: new Date().toISOString(),
      })
    );
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditedCoverLetter(generatedCoverLetter);
    setIsEditing(false);
  };

  return (
    <div className="relative min-h-screen z-10">
      {/* Floating orbs for depth */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-sky-200 rounded-full blur-3xl opacity-20 animate-float" />
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-lime-200 rounded-full blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "3s" }}
      />

      {/* Header */}
      <header className="border-b border-gray-200/50 backdrop-blur-sm bg-white/30 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-lime-500 rounded-lg blur-md opacity-50" />
                <div className="relative bg-white rounded-lg p-2">
                  <FileText className="w-6 h-6 text-gray-800" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  AI Cover Letter Generator
                </h1>
                <p className="text-xs text-gray-500">
                  Craft the perfect cover letter in seconds
                </p>
              </div>
            </div>

            {/* Step Progress - Desktop */}
            <div className="hidden lg:block flex-1 max-w-2xl px-8">
              <ProgressIndicator
                steps={steps}
                currentStep={currentStep}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <AutoSaveIndicator status={saveStatus} />
              <button
                onClick={clearAllData}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Progress */}
        <div className="lg:hidden px-6 pb-4">
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            className="w-full"
          />
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-12rem)]">
          {/* Left Panel - Input Section */}
          <div className="space-y-6 animate-fade-up">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Information
                </h2>
              </div>

              <GlassCard className="relative overflow-hidden">
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-lime-500 to-sky-500" />

                <div className="space-y-6 pt-2">
                  {/* Resume Input */}
                  <AnimatedTextarea
                    label="Resume"
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    maxLength={3000}
                    className="min-h-[200px]"
                  />

                  {/* Supporting Info - Collapsible */}
                  <div className="border-t border-gray-200/50 pt-4">
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          supporting: !prev.supporting,
                        }))
                      }
                      className="w-full flex items-center justify-between py-2 text-left hover:text-sky-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="font-medium">
                          Supporting Information
                        </span>
                        <span className="text-xs text-gray-400">
                          (Optional)
                        </span>
                      </div>
                      {expandedSections.supporting ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {expandedSections.supporting && (
                      <div className="space-y-4 mt-4 animate-fade-up">
                        <FloatingInput
                          label="Key Skills"
                          placeholder="e.g., Project Management, React, Data Analysis..."
                          value={supportingInfo.skills}
                          onChange={(e) =>
                            setSupportingInfo((prev) => ({
                              ...prev,
                              skills: e.target.value,
                            }))
                          }
                        />

                        <FloatingInput
                          label="Notable Achievements"
                          placeholder="e.g., Increased sales by 40%, Led team of 10..."
                          value={supportingInfo.achievements}
                          onChange={(e) =>
                            setSupportingInfo((prev) => ({
                              ...prev,
                              achievements: e.target.value,
                            }))
                          }
                        />

                        <FloatingInput
                          label="Preferences & Style"
                          placeholder="e.g., Formal tone, emphasize leadership..."
                          value={supportingInfo.preferences}
                          onChange={(e) =>
                            setSupportingInfo((prev) => ({
                              ...prev,
                              preferences: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Job Description Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Job Description
                </h2>
              </div>

              <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-500 via-sky-500 to-lime-500" />

                <div className="pt-2">
                  <AnimatedTextarea
                    label="Job Description"
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    maxLength={5000}
                    className="min-h-[150px]"
                  />
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Right Panel - Preview Section */}
          <div className="animate-fade-up stagger-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
              <span className="ml-auto text-sm text-gray-400">
                {generatedCoverLetter
                  ? "Generated successfully"
                  : isGenerating
                  ? "Generating..."
                  : resumeText && jobDescription
                  ? "Ready to generate"
                  : "Not generated yet"}
              </span>
            </div>

            <GlassCard className="h-[calc(100vh-16rem)] relative overflow-hidden">
              {/* Decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

              {/* Content based on state */}
              {isGenerating ? (
                // Loading state
                <div className="h-full p-6 space-y-4 animate-fade-up">
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-lime-500 rounded-full blur-xl opacity-50 animate-pulse" />
                      <LoadingSpinner size="lg" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded-full animate-pulse w-5/6" />
                    <div className="h-4 bg-gray-200 rounded-full animate-pulse w-4/6" />
                    <div className="h-4 bg-gray-200 rounded-full animate-pulse w-full" />
                    <div className="h-4 bg-gray-200 rounded-full animate-pulse w-3/6" />
                  </div>
                  <p className="text-center text-gray-500 mt-8">
                    Crafting your perfect cover letter...
                  </p>
                </div>
              ) : generationError ? (
                // Error state
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center space-y-4 max-w-sm">
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-gray-700 font-medium">
                      Generation Failed
                    </p>
                    <p className="text-sm text-red-500">{generationError}</p>
                    <FuturisticButton
                      variant="primary"
                      size="md"
                      icon={Sparkles}
                      onClick={generateCoverLetter}
                    >
                      Try Again
                    </FuturisticButton>
                  </div>
                </div>
              ) : generatedCoverLetter ? (
                // Generated content
                <div className="h-full flex flex-col">
                  {/* Edit/View toolbar */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={copyToClipboard}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                              copied
                                ? "bg-green-100 text-green-700"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                            )}
                          >
                            {copied ? (
                              <>
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 inline mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors"
                          >
                            <Edit className="w-4 h-4 inline mr-1" />
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {generatedCoverLetter.split(" ").length} words
                    </span>
                  </div>

                  {/* Cover letter content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {isEditing ? (
                      <textarea
                        value={editedCoverLetter}
                        onChange={(e) => setEditedCoverLetter(e.target.value)}
                        className="w-full h-full p-4 bg-white/50 border-2 border-gray-200/50 rounded-xl resize-none focus:outline-none focus:border-sky-500 transition-colors"
                        style={{ minHeight: "400px" }}
                      />
                    ) : (
                      <div className="prose prose-gray max-w-none">
                        {generatedCoverLetter
                          .split("\n")
                          .map((paragraph, index) => (
                            <p
                              key={index}
                              className="mb-4 text-gray-700 leading-relaxed"
                            >
                              {paragraph}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Empty state
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-sm">
                    {/* Animated placeholder icon */}
                    <div className="relative mx-auto w-32 h-32">
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-lime-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                      <div className="relative bg-white rounded-full p-8 shadow-xl">
                        <FileText className="w-16 h-16 text-gray-300" />
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 font-medium">
                        Your cover letter will appear here
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {!resumeText && !jobDescription
                          ? "Fill in your information and job details to get started"
                          : !resumeText
                          ? "Add your resume to continue"
                          : !jobDescription
                          ? "Add the job description to generate"
                          : "Ready to generate your cover letter!"}
                      </p>
                    </div>

                    {/* Generate Button */}
                    <FuturisticButton
                      variant="primary"
                      size="lg"
                      icon={Sparkles}
                      disabled={!resumeText || !jobDescription}
                      onClick={generateCoverLetter}
                      className="mx-auto"
                    >
                      Generate Cover Letter
                    </FuturisticButton>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Export Actions - visible when content exists */}
            {generatedCoverLetter && !isGenerating && (
              <div className="mt-4 flex items-center justify-between animate-fade-up">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setGeneratedCoverLetter("");
                      setEditedCoverLetter("");
                      setJobDescription("");
                    }}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors"
                  >
                    Create Another
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all inline-flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                    Export Word
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Generate Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200/50">
        <FuturisticButton
          variant="primary"
          size="lg"
          icon={Sparkles}
          disabled={!resumeText || !jobDescription || isGenerating}
          onClick={generateCoverLetter}
          isLoading={isGenerating}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Cover Letter"}
        </FuturisticButton>
      </div>
    </div>
  );
}
