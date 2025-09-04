"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ProgressIndicator,
  GlassCard,
  AnimatedTextarea,
  FloatingInput,
  FuturisticButton,
  LoadingSpinner,
  SkipToMain,
  ParticleEffect,
  EasterEggNotification,
} from "@/components/ui";
import {
  FileText,
  Sparkles,
  Download,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  CheckCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  Keyboard,
  Eraser,
  FileType,
  Linkedin,
  Globe,
  Code2,
} from "lucide-react";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import {
  compressText,
  compressForStorage,
  decompressFromStorage,
} from "@/lib/compression";
import { exportToPDF, exportToWord, exportToText } from "@/lib/export";
import { cn } from "@/lib/utils";
import {
  useKeyboardShortcuts,
  getShortcutLabel,
} from "@/lib/useKeyboardShortcuts";
import { useDebounce } from "@/lib/performance";
import { useAnnouncement, ariaLabels } from "@/lib/accessibility";
import { useSounds } from "@/lib/sounds";
import { useEasterEggs } from "@/lib/easterEggs";

// Footer Component for Portfolio/LinkedIn
function DeveloperFooter() {
  return (
    <footer className="mt-16 mb-8 relative">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      <div className="container mx-auto px-6 pt-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Developer info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Crafted with passion by Brandon Church
            </p>
            <p className="text-xs text-gray-400 max-w-md">
              Full-stack developer specializing in creating beautiful,
              functional applications
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://brandon-church-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>View Portfolio</span>
            </a>

            <a
              href="https://www.linkedin.com/in/brandon-church-946278138/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Connect</span>
            </a>
          </div>

          {/* Fun tagline */}
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
            <Code2 className="w-3 h-3" />
            <span>More cool projects await in my portfolio</span>
            <Sparkles className="w-3 h-3" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  // State variables
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [supportingInfo, setSupportingInfo] = useState({
    skills: "",
    achievements: "",
    preferences: "",
  });
  const [expandedSections, setExpandedSections] = useState({
    supporting: false,
  });
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(false); // Always starts false

  const steps = ["Resume", "Job Details", "Generate", "Export"];

  // Refs for focus management
  const generateButtonRef = useRef<HTMLButtonElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Custom hooks
  const announce = useAnnouncement();
  const sounds = useSounds();
  const easterEggs = useEasterEggs();

  // Sound state is NOT persisted - always starts OFF
  useEffect(() => {
    // Ensure sounds are off on mount
    if (sounds.isEnabled()) {
      sounds.toggleSounds(); // Turn off if it was on
    }
    setSoundsEnabled(false);
  }, []);

  // Debounced values for performance (3 seconds for less aggressive saving)
  const debouncedResumeText = useDebounce(resumeText, 3000);
  const debouncedJobDescription = useDebounce(jobDescription, 3000);
  const debouncedSupportingInfo = useDebounce(supportingInfo, 3000);

  // Silent auto-save with debouncing
  useEffect(() => {
    if (
      debouncedResumeText ||
      debouncedJobDescription ||
      Object.values(debouncedSupportingInfo).some((v) => v)
    ) {
      try {
        const compressed = compressForStorage({
          resumeText: debouncedResumeText,
          jobDescription: debouncedJobDescription,
          supportingInfo: debouncedSupportingInfo,
          generatedCoverLetter,
        });
        sessionStorage.setItem("coverLetterData", compressed);
      } catch (error) {
        console.error("Failed to save:", error);
      }
    }
  }, [
    debouncedResumeText,
    debouncedJobDescription,
    debouncedSupportingInfo,
    generatedCoverLetter,
  ]);

  // Load from sessionStorage on mount
  useEffect(() => {
    const compressed = sessionStorage.getItem("coverLetterData");
    if (compressed) {
      const data = decompressFromStorage(compressed);
      if (data) {
        setResumeText(data.resumeText || "");
        setJobDescription(data.jobDescription || "");
        setSupportingInfo(
          data.supportingInfo || {
            skills: "",
            achievements: "",
            preferences: "",
          }
        );
        if (data.generatedCoverLetter) {
          setGeneratedCoverLetter(data.generatedCoverLetter);
          setEditedCoverLetter(data.generatedCoverLetter);
        }
      }
    }
  }, []);

  // Update current step based on filled fields
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

  // Check for easter eggs in text (only on significant changes)
  useEffect(() => {
    const checkTimer = setTimeout(() => {
      easterEggs.checkTriggerPhrases(resumeText + jobDescription);
    }, 1000);
    return () => clearTimeout(checkTimer);
  }, [resumeText, jobDescription, easterEggs]);

  // Clear all data
  const clearAllData = useCallback(() => {
    if (
      confirm("Are you sure you want to clear all data? This cannot be undone.")
    ) {
      setResumeText("");
      setJobDescription("");
      setSupportingInfo({ skills: "", achievements: "", preferences: "" });
      setGeneratedCoverLetter("");
      setEditedCoverLetter("");
      sessionStorage.removeItem("coverLetterData");
      setCurrentStep(0);
      announce("All data cleared");
      sounds.playClick();
    }
  }, [announce, sounds]);

  // Generate cover letter function
  const generateCoverLetter = useCallback(async () => {
    if (!resumeText || !jobDescription) {
      announce("Please fill in both resume and job description");
      sounds.playError();
      return;
    }

    setIsGenerating(true);
    setGenerationError("");
    setCurrentStep(2);
    announce("Generating cover letter");
    sounds.playGenerate();

    const startTime = performance.now();

    try {
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

      // Check for achievements
      const endTime = performance.now();
      if (endTime - startTime < 30000) {
        easterEggs.unlockAchievement("speed_demon");
      }
      easterEggs.unlockAchievement("first_generation");

      announce("Cover letter generated successfully");
      sounds.playSuccess();
    } catch (error: any) {
      console.error("Generation error:", error);
      setGenerationError(
        error.message || "Failed to generate cover letter. Please try again."
      );
      announce("Failed to generate cover letter");
      sounds.playError();
    } finally {
      setIsGenerating(false);
    }
  }, [
    resumeText,
    jobDescription,
    supportingInfo,
    announce,
    sounds,
    easterEggs,
  ]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    const textToCopy = isEditing ? editedCoverLetter : generatedCoverLetter;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      announce("Copied to clipboard");
      sounds.playCopy();
    } catch (error) {
      console.error("Failed to copy:", error);
      announce("Failed to copy");
      sounds.playError();
    }
  }, [isEditing, editedCoverLetter, generatedCoverLetter, announce, sounds]);

  // Save edited version
  const saveEdit = useCallback(() => {
    setGeneratedCoverLetter(editedCoverLetter);
    setIsEditing(false);
    announce("Changes saved");
    sounds.playClick();
  }, [editedCoverLetter, announce, sounds]);

  // Cancel edit
  const cancelEdit = useCallback(() => {
    setEditedCoverLetter(generatedCoverLetter);
    setIsEditing(false);
    announce("Edit cancelled");
    sounds.playClick();
  }, [generatedCoverLetter, announce, sounds]);

  // Start editing
  const startEdit = useCallback(() => {
    setIsEditing(true);
    announce("Editing mode");
    sounds.playClick();
    // Focus the textarea after state update
    setTimeout(() => {
      editTextareaRef.current?.focus();
    }, 100);
  }, [announce, sounds]);

  // Export handlers
  const handleExportPDF = useCallback(async () => {
    const letterToExport = isEditing ? editedCoverLetter : generatedCoverLetter;
    const result = await exportToPDF(letterToExport);

    if (result.success) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      announce("Exported as PDF");
      sounds.playSuccess();
    } else {
      announce("Export failed");
      sounds.playError();
    }
  }, [isEditing, editedCoverLetter, generatedCoverLetter, announce, sounds]);

  const handleExportWord = useCallback(async () => {
    const letterToExport = isEditing ? editedCoverLetter : generatedCoverLetter;
    const result = await exportToWord(letterToExport);

    if (result.success) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      announce("Exported as Word document");
      sounds.playSuccess();
    } else {
      announce("Export failed");
      sounds.playError();
    }
  }, [isEditing, editedCoverLetter, generatedCoverLetter, announce, sounds]);

  const handleExportText = useCallback(() => {
    const letterToExport = isEditing ? editedCoverLetter : generatedCoverLetter;
    const result = exportToText(letterToExport);

    if (result.success) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      announce("Exported as text file");
      sounds.playSuccess();

      // Check for export master achievement
      easterEggs.unlockAchievement("export_master");
    }
  }, [
    isEditing,
    editedCoverLetter,
    generatedCoverLetter,
    announce,
    sounds,
    easterEggs,
  ]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "cmd+enter": generateCoverLetter,
    "cmd+shift+c": copyToClipboard,
    "cmd+e": startEdit,
    "cmd+s": saveEdit,
    escape: cancelEdit,
    "cmd+shift+p": handleExportPDF,
    "cmd+shift+w": handleExportWord,
    "cmd+r": generateCoverLetter,
    "cmd+shift+delete": clearAllData,
  });

  return (
    <div className="relative min-h-screen z-10">
      <SkipToMain />

      {/* Easter Eggs - Subtle positioning */}
      <ParticleEffect enabled={easterEggs.particlesEnabled} />

      {/* Easter Egg Notification - Bottom right corner instead of center */}
      {easterEggs.showEasterEgg && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-up">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">{easterEggs.showEasterEgg}</p>
          </div>
        </div>
      )}

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
            <div className="flex items-center gap-2">
              {/* Keyboard shortcuts toggle - more subtle */}
              <button
                onClick={() => setShowKeyboardHints(!showKeyboardHints)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-60 hover:opacity-100"
                title="Keyboard shortcuts"
                aria-label="Toggle keyboard shortcuts"
              >
                <Keyboard className="w-4 h-4 text-gray-600" />
              </button>

              {/* Clear All Button - Enhanced hover effect */}
              <button
                onClick={clearAllData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all hover:-translate-y-0.5 shadow-sm"
                aria-label={ariaLabels.clearAllButton}
              >
                <Eraser className="w-4 h-4" />
                <span>Clear All</span>
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

        {/* Keyboard Shortcuts Panel - Subtle slide animation */}
        <div
          className={cn(
            "border-t border-gray-200/50 bg-white/50 overflow-hidden transition-all duration-300 ease-in-out",
            showKeyboardHints ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="container mx-auto px-6 py-3">
            <div className="flex flex-wrap gap-4 text-xs justify-center lg:justify-start">
              <span className="kbd-hint">
                {getShortcutLabel("cmd+enter")} Generate
              </span>
              <span className="kbd-hint">
                {getShortcutLabel("cmd+shift+c")} Copy
              </span>
              <span className="kbd-hint">{getShortcutLabel("cmd+e")} Edit</span>
              <span className="kbd-hint">{getShortcutLabel("cmd+s")} Save</span>
              <span className="kbd-hint">
                {getShortcutLabel("escape")} Cancel
              </span>
              <span className="kbd-hint">
                {getShortcutLabel("cmd+shift+p")} PDF
              </span>
              <span className="kbd-hint">
                {getShortcutLabel("cmd+shift+w")} Word
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main id="main-content" className="container mx-auto px-6 py-8">
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
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-lime-500 to-sky-500" />

                <div className="space-y-6 pt-2">
                  <AnimatedTextarea
                    label="Resume"
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                    }}
                    maxLength={5000}
                    showCount={true}
                    className="min-h-[200px] focus-visible"
                    aria-label={ariaLabels.resumeInput}
                  />

                  <div className="border-t border-gray-200/50 pt-4">
                    <button
                      onClick={() => {
                        setExpandedSections((prev) => ({
                          ...prev,
                          supporting: !prev.supporting,
                        }));
                        sounds.playClick();
                      }}
                      className="w-full flex items-center justify-between py-2 text-left hover:text-sky-600 transition-colors"
                      aria-expanded={expandedSections.supporting}
                      aria-controls="supporting-info"
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

                    {/* Smooth expand/collapse animation */}
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        expandedSections.supporting
                          ? "max-h-96 opacity-100 mt-4"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      <div id="supporting-info" className="space-y-4">
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
                          maxLength={300}
                          showCount={true}
                          aria-label={ariaLabels.skillsInput}
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
                          maxLength={300}
                          showCount={true}
                          aria-label={ariaLabels.achievementsInput}
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
                          maxLength={200}
                          showCount={true}
                          aria-label={ariaLabels.preferencesInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

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
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                    }}
                    maxLength={4000}
                    showCount={true}
                    className="min-h-[150px] focus-visible"
                    aria-label={ariaLabels.jobDescriptionInput}
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
              <span
                className="ml-auto text-sm text-gray-400"
                role="status"
                aria-live="polite"
              >
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
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

              {/* Content based on state */}
              {isGenerating ? (
                // Loading state
                <div
                  className="h-full p-6 space-y-4 animate-fade-up"
                  aria-busy="true"
                >
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
                <div
                  className="h-full flex items-center justify-center p-6"
                  role="alert"
                >
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
                  <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors focus-visible"
                            aria-label={ariaLabels.saveButton}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors focus-visible"
                            aria-label={ariaLabels.cancelButton}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={copyToClipboard}
                            className={cn(
                              "px-3 py-1.5 bg-white border rounded-lg text-sm font-medium transition-all duration-200 shadow-sm",
                              copied
                                ? "border-green-200 text-green-700 bg-green-100"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
                            )}
                            aria-label={ariaLabels.copyButton}
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
                            onClick={startEdit}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
                            aria-label={ariaLabels.editButton}
                          >
                            <Edit className="w-4 h-4 inline mr-1" />
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {
                        (isEditing
                          ? editedCoverLetter
                          : generatedCoverLetter
                        ).split(" ").length
                      }{" "}
                      words
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {isEditing ? (
                      <textarea
                        ref={editTextareaRef}
                        value={editedCoverLetter}
                        onChange={(e) => setEditedCoverLetter(e.target.value)}
                        className="w-full h-full p-4 bg-white/50 border-2 border-gray-200/50 rounded-xl resize-none focus:outline-none focus:border-sky-500 transition-colors font-serif text-gray-700"
                        style={{ minHeight: "400px" }}
                        aria-label="Edit cover letter"
                      />
                    ) : (
                      <div className="prose prose-gray max-w-none">
                        <div className="bg-white/40 rounded-xl p-8 shadow-sm border border-gray-100/50">
                          <div className="mb-6 pb-4 border-b border-gray-200/50">
                            <p className="text-sm text-gray-500 mb-2">
                              {new Date().toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="font-semibold text-gray-700">
                              Hiring Manager
                            </p>
                          </div>

                          <div className="space-y-4">
                            {generatedCoverLetter
                              .split("\n")
                              .map((paragraph, index) =>
                                paragraph.trim() ? (
                                  <p
                                    key={index}
                                    className="text-gray-700 leading-relaxed"
                                  >
                                    {paragraph}
                                  </p>
                                ) : null
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Empty state
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-sm">
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

                    <FuturisticButton
                      ref={generateButtonRef}
                      variant="primary"
                      size="lg"
                      icon={Sparkles}
                      disabled={!resumeText || !jobDescription}
                      onClick={generateCoverLetter}
                      className="mx-auto"
                      aria-label={ariaLabels.generateButton}
                    >
                      Generate Cover Letter
                    </FuturisticButton>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Export Actions */}
            {generatedCoverLetter && !isGenerating && (
              <div className="mt-4 mb-8 space-y-3 animate-fade-up">
                {/* Quick Actions */}
                <div className="flex flex-col gap-3">
                  {/* Top Row - Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={generateCoverLetter}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 focus-visible shadow-sm group"
                      aria-label={ariaLabels.regenerateButton}
                    >
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      Regenerate
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedCoverLetter("");
                        setEditedCoverLetter("");
                        setJobDescription("");
                        sounds.playClick();
                      }}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 focus-visible shadow-sm group"
                    >
                      <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                      Create Another
                    </button>
                  </div>

                  {/* Divider with Export label */}
                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative px-3">
                      <span className="text-xs text-gray-500 font-medium">
                        EXPORT
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row - Export Buttons with Brand Colors and Icons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportPDF}
                      className="flex-1 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 focus-visible shadow-sm group"
                      aria-label={ariaLabels.exportPDFButton}
                    >
                      <FaFilePdf className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={handleExportWord}
                      className="flex-1 px-4 py-2.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 focus-visible shadow-sm group"
                      aria-label={ariaLabels.exportWordButton}
                    >
                      <FaFileWord className="w-4 h-4" />
                      Word
                    </button>
                    <button
                      onClick={handleExportText}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 focus-visible shadow-sm"
                      aria-label={ariaLabels.exportTextButton}
                    >
                      <FileType className="w-4 h-4" />
                      Text
                    </button>
                  </div>
                </div>

                {/* Success Message */}
                {exportSuccess && (
                  <div
                    className="flex items-center justify-center p-2 bg-green-50 border border-green-200 rounded-lg animate-fade-up"
                    role="status"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">
                      Exported successfully!
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Developer Footer */}
      <DeveloperFooter />

      {/* Sound Toggle Button - Subtle in corner */}
      <button
        onClick={() => {
          const newState = sounds.toggleSounds();
          setSoundsEnabled(newState);
          announce(
            newState ? "Sound effects enabled" : "Sound effects disabled"
          );
        }}
        className={cn(
          "fixed bottom-4 right-4 w-10 h-10 rounded-full bg-white border-2 border-gray-200",
          "flex items-center justify-center transition-all hover:scale-110",
          "opacity-50 hover:opacity-100",
          soundsEnabled && "border-sky-500 opacity-70"
        )}
        aria-label="Toggle sound effects"
      >
        {soundsEnabled ? (
          <Volume2 className="w-4 h-4 text-sky-500" />
        ) : (
          <VolumeX className="w-4 h-4 text-gray-400" />
        )}
      </button>

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
          aria-label={ariaLabels.generateButton}
        >
          {isGenerating ? "Generating..." : "Generate Cover Letter"}
        </FuturisticButton>
      </div>
    </div>
  );
}
