"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  ClipboardCheck,
  Upload,
  FileText,
  X,
} from "lucide-react";

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Employment & Address", icon: Briefcase },
  { label: "Review & Submit", icon: ClipboardCheck },
];

interface FormData {
  // Step 1
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  drivingLicense: string;
  maritalStatus: string;
  // Step 2
  employerName: string;
  position: string;
  monthlyIncome: string;
  employmentDuration: string;
  previousAddress: string;
  previousCity: string;
  previousState: string;
  previousZip: string;
  // Step 3
  consent: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  ssn: "",
  drivingLicense: "",
  maritalStatus: "Single",
  employerName: "",
  position: "",
  monthlyIncome: "",
  employmentDuration: "",
  previousAddress: "",
  previousCity: "",
  previousState: "",
  previousZip: "",
  consent: false,
};

const stepVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export default function GeneralApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateStep = (): boolean => {
    const newErrors: string[] = [];

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.push("Full Name is required");
      if (!formData.email.trim()) newErrors.push("Email is required");
      if (!formData.phone.trim()) newErrors.push("Phone is required");
      if (!formData.dateOfBirth) newErrors.push("Date of Birth is required");
    }

    if (currentStep === 2) {
      if (!formData.employerName.trim()) newErrors.push("Employer Name is required");
      if (!formData.monthlyIncome.trim()) newErrors.push("Monthly Income is required");
    }

    if (currentStep === 3) {
      if (!formData.consent) newErrors.push("You must agree to the certification");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors([]);
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileLabels, setFileLabels] = useState<string[]>([]);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setFileLabels((prev) => [...prev, ...newFiles.map(() => "Supporting Document")]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileLabels((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileLabel = (index: number, label: string) => {
    setFileLabels((prev) => prev.map((l, i) => (i === index ? label : l)));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant_type: "professional",
          full_name: formData.fullName,
          email: formData.email,
          mobile_number: formData.phone,
          date_of_birth: formData.dateOfBirth || null,
          ssn: formData.ssn || null,
          driving_license: formData.drivingLicense || null,
          marital_status: formData.maritalStatus,
          employer_name: formData.employerName || null,
          monthly_income: formData.monthlyIncome || null,
          current_address: formData.previousAddress || null,
          city: formData.previousCity || null,
          state: formData.previousState || null,
          zip_code: formData.previousZip || null,
          consent: formData.consent,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }
      const appData = await res.json();

      // Upload documents if any
      if (uploadedFiles.length > 0 && appData.id) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          const fileForm = new FormData();
          fileForm.append("file", uploadedFiles[i]);
          fileForm.append("application_id", appData.id);
          fileForm.append("document_label", fileLabels[i] || "Supporting Document");
          await fetch("/api/documents/upload", { method: "POST", body: fileForm });
        }
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const renderInput = (
    label: string,
    field: keyof FormData,
    type = "text",
    placeholder = "",
    required = false
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        type={type}
        className="input-glass"
        placeholder={placeholder}
        value={formData[field] as string}
        onChange={(e) => updateField(field, e.target.value)}
      />
    </div>
  );

  const renderRadioGroup = (
    label: string,
    field: keyof FormData,
    options: string[]
  ) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-300 border ${
              formData[field] === option
                ? "bg-blue-50 border-blue-300 text-gray-900"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={field}
              value={option}
              checked={formData[field] === option}
              onChange={() => updateField(field, option)}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                formData[field] === option
                  ? "border-[#1a73e8]"
                  : "border-gray-300"
              }`}
            >
              {formData[field] === option && (
                <div className="w-2 h-2 rounded-full bg-[#1a73e8]" />
              )}
            </div>
            {option}
          </label>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <>
        <div className="bg-ambient" />
        <main className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-10 text-center max-w-lg"
          >
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Application Submitted!
            </h2>
            <p className="text-gray-500 mb-6">
              Thank you for submitting your general application. Our team will
              review your information and contact you within 24-48 hours.
            </p>
            <Link href="/" className="btn-glow inline-block">
              Return Home
            </Link>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Back to Application Types
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="text-gradient">General Application</span>
            </h1>
            <p className="text-gray-500">
              Complete all steps below to submit your application
            </p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-10">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const stepNum = index + 1;
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;

              return (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isActive
                          ? "bg-[#1a73e8] text-white shadow-lg shadow-blue-200"
                          : "bg-gray-50 border border-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={18} />
                      ) : (
                        <StepIcon size={18} />
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 font-medium hidden sm:block ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-3 transition-colors duration-500 ${
                        stepNum < currentStep
                          ? "bg-green-600"
                          : "bg-gray-100"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 mb-6"
              style={{ borderColor: "rgba(239,68,68,0.3)" }}
            >
              <p className="text-red-600 text-sm font-medium mb-1">
                Please fix the following:
              </p>
              <ul className="list-disc list-inside text-red-600/80 text-sm space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Form Steps */}
          <div className="glass p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1 - Personal Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User size={20} className="text-blue-600" />
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {renderInput("Full Name", "fullName", "text", "John Doe", true)}
                    {renderInput("Email", "email", "email", "you@email.com", true)}
                    {renderInput("Phone", "phone", "tel", "(615) 000-0000", true)}
                    {renderInput("Date of Birth", "dateOfBirth", "date", "", true)}
                    {renderInput("SSN", "ssn", "text", "XXX-XX-XXXX")}
                    {renderInput("Driving License", "drivingLicense", "text", "License number")}
                  </div>

                  <div className="mt-5">
                    {renderRadioGroup("Marital Status", "maritalStatus", [
                      "Single",
                      "Married",
                    ])}
                  </div>
                </motion.div>
              )}

              {/* Step 2 - Employment & Address */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-600" />
                    Employment & Previous Address
                  </h2>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {renderInput("Employer Name", "employerName", "text", "Company name", true)}
                    {renderInput("Position / Title", "position", "text", "Your role")}
                    {renderInput("Monthly Income", "monthlyIncome", "text", "$0.00", true)}
                    {renderInput("Employment Duration", "employmentDuration", "text", "e.g., 2 years")}
                  </div>

                  <div className="border-t border-gray-100 mt-8 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Previous Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        {renderInput("Street Address", "previousAddress", "text", "Street address")}
                      </div>
                      {renderInput("City", "previousCity", "text", "City")}
                      {renderInput("State", "previousState", "text", "State")}
                      {renderInput("Zip Code", "previousZip", "text", "Zip Code")}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3 - Review & Submit */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ClipboardCheck size={20} className="text-blue-600" />
                    Review & Submit
                  </h2>

                  <p className="text-gray-500 text-sm mb-6">
                    Please review your information below before submitting.
                  </p>

                  {/* Personal Info Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Full Name" value={formData.fullName} />
                      <SummaryRow label="Email" value={formData.email} />
                      <SummaryRow label="Phone" value={formData.phone} />
                      <SummaryRow label="Date of Birth" value={formData.dateOfBirth} />
                      <SummaryRow label="SSN" value={formData.ssn || "Not provided"} />
                      <SummaryRow label="Driving License" value={formData.drivingLicense || "Not provided"} />
                      <SummaryRow label="Marital Status" value={formData.maritalStatus} />
                    </div>
                  </div>

                  {/* Employment Summary */}
                  <div className="glass-subtle p-5 mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      Employment & Previous Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Employer" value={formData.employerName} />
                      <SummaryRow label="Position" value={formData.position || "Not provided"} />
                      <SummaryRow label="Monthly Income" value={formData.monthlyIncome} />
                      <SummaryRow label="Duration" value={formData.employmentDuration || "Not provided"} />
                      <SummaryRow label="Previous Address" value={formData.previousAddress || "Not provided"} />
                      <SummaryRow label="City" value={formData.previousCity || "Not provided"} />
                      <SummaryRow label="State" value={formData.previousState || "Not provided"} />
                      <SummaryRow label="Zip" value={formData.previousZip || "Not provided"} />
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="glass-subtle p-5 mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Upload size={16} />
                      Upload Documents
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Upload supporting documents such as ID, proof of income, employment letter, or any other relevant documents.
                      Accepted formats: PDF, images (JPG, PNG), Word, Excel, text files. Max 10MB per file.
                    </p>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
                            <FileText size={18} className="text-blue-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                            </div>
                            <select
                              value={fileLabels[idx]}
                              onChange={(e) => updateFileLabel(idx, e.target.value)}
                              className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none"
                            >
                              <option value="Supporting Document">Supporting Document</option>
                              <option value="Photo ID">Photo ID</option>
                              <option value="Proof of Income">Proof of Income</option>
                              <option value="Employment Letter">Employment Letter</option>
                              <option value="Bank Statement">Bank Statement</option>
                              <option value="Pay Stubs">Pay Stubs</option>
                              <option value="Other">Other</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                      <Upload size={18} className="text-gray-400 group-hover:text-blue-500" />
                      <span className="text-sm text-gray-500 group-hover:text-blue-600">
                        {uploadedFiles.length > 0 ? "Add more files" : "Choose files to upload"}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={handleFileAdd}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {/* Consent */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all flex-shrink-0 ${
                        formData.consent
                          ? "bg-[#1a73e8] border-[#1a73e8]"
                          : "border-gray-300 group-hover:border-[#1a73e8]"
                      }`}
                      onClick={() => updateField("consent", !formData.consent)}
                    >
                      {formData.consent && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <span
                      className="text-sm text-gray-700 leading-relaxed"
                      onClick={() => updateField("consent", !formData.consent)}
                    >
                      I certify that all information provided in this application
                      is true and accurate to the best of my knowledge. I
                      understand that providing false information may result in
                      denial of my application or termination of my lease.
                    </span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="btn-outline flex items-center gap-2 text-sm"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="btn-glow flex items-center gap-2 text-sm"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {submitError && (
                    <p className="text-red-600 text-sm">{submitError}</p>
                  )}
                  <button
                    onClick={handleSubmit}
                    className="btn-glow flex items-center gap-2 text-sm"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                    {!submitting && <Check size={16} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5">
      <span className="text-gray-400 min-w-[140px]">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
