"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  MapPin,
  Briefcase,
  Users,
  ClipboardCheck,
  Upload,
  FileText,
  X,
} from "lucide-react";

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Address & Education", icon: MapPin },
  { label: "Employment & Income", icon: Briefcase },
  { label: "References & History", icon: Users },
  { label: "Review & Submit", icon: ClipboardCheck },
];

const housingOptions = [
  "Studio",
  "1 Bed / 1 Bath",
  "2 Bed / 2 Bath",
  "3 Bed / 3 Bath",
  "4 Bed / 4 Bath",
  "Shared Room",
  "Other",
];

const leaseOptions = [
  "Month-to-Month",
  "Less than 6 Months",
  "6 Months",
  "6 Months+ Flexible",
  "12 Months",
  "Other",
];

interface FormData {
  // Step 1
  fullName: string;
  ssn: string;
  maritalStatus: string;
  drivingLicense: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  specificRequest: string;
  housingRequirement: string;
  preferredMoveIn: string;
  leaseDuration: string;
  // Step 2
  currentAddress: string;
  city: string;
  state: string;
  zipCode: string;
  universityName: string;
  studentId: string;
  expectedGraduation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelationship: string;
  // Step 3
  employmentStatus: string;
  employerName: string;
  monthlyIncome: string;
  incomeSource: string;
  hasCosigner: string;
  cosignerName: string;
  cosignerPhone: string;
  cosignerEmail: string;
  // Step 4
  previousLandlordName: string;
  landlordPhone: string;
  landlordAddress: string;
  reasonForLeaving: string;
  lengthOfStay: string;
  ref1Name: string;
  ref1Phone: string;
  ref1Relationship: string;
  ref2Name: string;
  ref2Phone: string;
  ref2Relationship: string;
  // Step 5
  consent: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  ssn: "",
  maritalStatus: "Single",
  drivingLicense: "",
  dateOfBirth: "",
  email: "",
  mobileNumber: "",
  specificRequest: "",
  housingRequirement: "",
  preferredMoveIn: "",
  leaseDuration: "",
  currentAddress: "",
  city: "",
  state: "",
  zipCode: "",
  universityName: "Middle Tennessee State University",
  studentId: "",
  expectedGraduation: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyRelationship: "",
  employmentStatus: "Student",
  employerName: "",
  monthlyIncome: "",
  incomeSource: "",
  hasCosigner: "No",
  cosignerName: "",
  cosignerPhone: "",
  cosignerEmail: "",
  previousLandlordName: "",
  landlordPhone: "",
  landlordAddress: "",
  reasonForLeaving: "",
  lengthOfStay: "",
  ref1Name: "",
  ref1Phone: "",
  ref1Relationship: "",
  ref2Name: "",
  ref2Phone: "",
  ref2Relationship: "",
  consent: false,
};

const stepVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export default function StudentApplicationWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading application...</div></div>}>
      <StudentApplicationPage />
    </Suspense>
  );
}

function StudentApplicationPage() {
  const searchParams = useSearchParams();
  const isInternational = searchParams.get("type") === "international";
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
      if (!formData.mobileNumber.trim()) newErrors.push("Mobile Number is required");
      if (!formData.dateOfBirth) newErrors.push("Date of Birth is required");
    }

    if (currentStep === 2) {
      if (!formData.currentAddress.trim()) newErrors.push("Current Address is required");
      if (!formData.city.trim()) newErrors.push("City is required");
      if (!formData.state.trim()) newErrors.push("State is required");
      if (!formData.zipCode.trim()) newErrors.push("Zip Code is required");
      if (!formData.emergencyContactName.trim()) newErrors.push("Emergency Contact Name is required");
      if (!formData.emergencyContactPhone.trim()) newErrors.push("Emergency Contact Phone is required");
    }

    if (currentStep === 5) {
      if (!formData.consent) newErrors.push("You must agree to the certification");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
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
          applicant_type: isInternational ? "international" : "student",
          full_name: formData.fullName,
          ssn: formData.ssn || null,
          marital_status: formData.maritalStatus,
          driving_license: formData.drivingLicense || null,
          date_of_birth: formData.dateOfBirth || null,
          email: formData.email,
          mobile_number: formData.mobileNumber,
          specific_request: formData.specificRequest || null,
          housing_requirement: formData.housingRequirement || null,
          preferred_move_in: formData.preferredMoveIn || null,
          lease_duration: formData.leaseDuration || null,
          current_address: formData.currentAddress || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zipCode || null,
          university_name: formData.universityName || null,
          student_id: formData.studentId || null,
          expected_graduation: formData.expectedGraduation || null,
          emergency_contact_name: formData.emergencyContactName || null,
          emergency_contact_phone: formData.emergencyContactPhone || null,
          emergency_relationship: formData.emergencyRelationship || null,
          employment_status: formData.employmentStatus || null,
          employer_name: formData.employerName || null,
          monthly_income: formData.monthlyIncome || null,
          income_source: formData.incomeSource || null,
          has_cosigner: formData.hasCosigner === "Yes",
          cosigner_name: formData.cosignerName || null,
          cosigner_phone: formData.cosignerPhone || null,
          cosigner_email: formData.cosignerEmail || null,
          previous_landlord_name: formData.previousLandlordName || null,
          landlord_phone: formData.landlordPhone || null,
          landlord_address: formData.landlordAddress || null,
          reason_for_leaving: formData.reasonForLeaving || null,
          length_of_stay: formData.lengthOfStay || null,
          ref1_name: formData.ref1Name || null,
          ref1_phone: formData.ref1Phone || null,
          ref1_relationship: formData.ref1Relationship || null,
          ref2_name: formData.ref2Name || null,
          ref2_phone: formData.ref2Phone || null,
          ref2_relationship: formData.ref2Relationship || null,
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
              Thank you for submitting your{" "}
              {isInternational ? "international student" : "student"} application.
              Our team will review your information and contact you within 24-48
              hours.
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
              <span className="text-gradient">
                {isInternational
                  ? "International Student Application"
                  : "Student Application"}
              </span>
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
                      className={`w-8 sm:w-14 h-0.5 mx-1 sm:mx-2 transition-colors duration-500 ${
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
              className="glass p-4 mb-6 border-red-500/30"
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
              {/* Step 1 - Personal Information */}
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
                    {renderInput(
                      isInternational ? "Passport Number" : "SSN",
                      "ssn",
                      "text",
                      isInternational ? "Passport number" : "XXX-XX-XXXX"
                    )}
                    {renderInput("Driving License", "drivingLicense", "text", "License number")}
                    {renderInput("Date of Birth", "dateOfBirth", "date", "", true)}
                    {renderInput("Email", "email", "email", "you@email.com", true)}
                    {renderInput("Mobile Number", "mobileNumber", "tel", "(615) 000-0000", true)}
                  </div>

                  <div className="mt-5">
                    {renderRadioGroup("Marital Status", "maritalStatus", [
                      "Single",
                      "Married",
                    ])}
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      Specific Request
                    </label>
                    <textarea
                      className="input-glass min-h-[80px] resize-y"
                      placeholder="Any specific requests or accommodations..."
                      value={formData.specificRequest}
                      onChange={(e) =>
                        updateField("specificRequest", e.target.value)
                      }
                    />
                  </div>

                  <div className="mt-5">
                    {renderRadioGroup(
                      "Housing Requirement",
                      "housingRequirement",
                      housingOptions
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    {renderInput(
                      "Preferred Move-In Date",
                      "preferredMoveIn",
                      "date"
                    )}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Lease Duration
                      </label>
                      <select
                        className="input-glass"
                        value={formData.leaseDuration}
                        onChange={(e) =>
                          updateField("leaseDuration", e.target.value)
                        }
                      >
                        <option value="" className="bg-white">
                          Select duration
                        </option>
                        {leaseOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2 - Address & Education */}
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
                    <MapPin size={20} className="text-blue-600" />
                    Address & Education
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      {renderInput(
                        "Current Address",
                        "currentAddress",
                        "text",
                        "Street address",
                        true
                      )}
                    </div>
                    {renderInput("City", "city", "text", "City", true)}
                    {renderInput("State", "state", "text", "State", true)}
                    {renderInput("Zip Code", "zipCode", "text", "Zip Code", true)}
                  </div>

                  <div className="border-t border-gray-100 mt-8 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Education Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {renderInput(
                        "University Name",
                        "universityName",
                        "text",
                        "University name"
                      )}
                      {renderInput(
                        "Student ID",
                        "studentId",
                        "text",
                        "Student ID number"
                      )}
                      {renderInput(
                        "Expected Graduation",
                        "expectedGraduation",
                        "date"
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-8 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {renderInput(
                        "Contact Name",
                        "emergencyContactName",
                        "text",
                        "Full name",
                        true
                      )}
                      {renderInput(
                        "Contact Phone",
                        "emergencyContactPhone",
                        "tel",
                        "(000) 000-0000",
                        true
                      )}
                      {renderInput(
                        "Relationship",
                        "emergencyRelationship",
                        "text",
                        "e.g., Parent, Sibling"
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3 - Employment & Income */}
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
                    <Briefcase size={20} className="text-blue-600" />
                    Employment & Income
                  </h2>

                  <div className="mb-5">
                    {renderRadioGroup("Employment Status", "employmentStatus", [
                      "Student",
                      "Part-Time",
                      "Full-Time",
                      "Unemployed",
                    ])}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {renderInput(
                      "Employer Name",
                      "employerName",
                      "text",
                      "Employer name (if applicable)"
                    )}
                    {renderInput(
                      "Monthly Income",
                      "monthlyIncome",
                      "text",
                      "$0.00"
                    )}
                    {renderInput(
                      "Income Source",
                      "incomeSource",
                      "text",
                      "e.g., Job, Scholarship, Parents"
                    )}
                  </div>

                  <div className="border-t border-gray-100 mt-8 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Co-Signer Information
                    </h3>
                    <div className="mb-5">
                      {renderRadioGroup("Has Co-Signer?", "hasCosigner", [
                        "Yes",
                        "No",
                      ])}
                    </div>

                    {formData.hasCosigner === "Yes" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                      >
                        {renderInput(
                          "Co-Signer Name",
                          "cosignerName",
                          "text",
                          "Full name"
                        )}
                        {renderInput(
                          "Co-Signer Phone",
                          "cosignerPhone",
                          "tel",
                          "(000) 000-0000"
                        )}
                        {renderInput(
                          "Co-Signer Email",
                          "cosignerEmail",
                          "email",
                          "cosigner@email.com"
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 4 - References & History */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users size={20} className="text-blue-600" />
                    References & Rental History
                  </h2>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Previous Landlord
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {renderInput(
                      "Landlord Name",
                      "previousLandlordName",
                      "text",
                      "Full name"
                    )}
                    {renderInput(
                      "Landlord Phone",
                      "landlordPhone",
                      "tel",
                      "(000) 000-0000"
                    )}
                    <div className="sm:col-span-2">
                      {renderInput(
                        "Landlord Address",
                        "landlordAddress",
                        "text",
                        "Property address"
                      )}
                    </div>
                    {renderInput(
                      "Reason for Leaving",
                      "reasonForLeaving",
                      "text",
                      "e.g., End of lease, relocation"
                    )}
                    {renderInput(
                      "Length of Stay",
                      "lengthOfStay",
                      "text",
                      "e.g., 12 months"
                    )}
                  </div>

                  <div className="border-t border-gray-100 mt-8 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Reference 1
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {renderInput("Name", "ref1Name", "text", "Full name")}
                      {renderInput("Phone", "ref1Phone", "tel", "(000) 000-0000")}
                      {renderInput(
                        "Relationship",
                        "ref1Relationship",
                        "text",
                        "e.g., Professor, Employer"
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-8 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Reference 2
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {renderInput("Name", "ref2Name", "text", "Full name")}
                      {renderInput("Phone", "ref2Phone", "tel", "(000) 000-0000")}
                      {renderInput(
                        "Relationship",
                        "ref2Relationship",
                        "text",
                        "e.g., Professor, Employer"
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5 - Review & Submit */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
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
                      <SummaryRow label={isInternational ? "Passport" : "SSN"} value={formData.ssn || "Not provided"} />
                      <SummaryRow label="Marital Status" value={formData.maritalStatus} />
                      <SummaryRow label="Driving License" value={formData.drivingLicense || "Not provided"} />
                      <SummaryRow label="Date of Birth" value={formData.dateOfBirth} />
                      <SummaryRow label="Email" value={formData.email} />
                      <SummaryRow label="Mobile" value={formData.mobileNumber} />
                      <SummaryRow label="Housing" value={formData.housingRequirement || "Not selected"} />
                      <SummaryRow label="Move-In Date" value={formData.preferredMoveIn || "Not set"} />
                      <SummaryRow label="Lease Duration" value={formData.leaseDuration || "Not selected"} />
                    </div>
                    {formData.specificRequest && (
                      <div className="mt-2">
                        <SummaryRow label="Specific Request" value={formData.specificRequest} />
                      </div>
                    )}
                  </div>

                  {/* Address & Education Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      Address & Education
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Address" value={formData.currentAddress} />
                      <SummaryRow label="City" value={formData.city} />
                      <SummaryRow label="State" value={formData.state} />
                      <SummaryRow label="Zip Code" value={formData.zipCode} />
                      <SummaryRow label="University" value={formData.universityName} />
                      <SummaryRow label="Student ID" value={formData.studentId || "Not provided"} />
                      <SummaryRow label="Expected Graduation" value={formData.expectedGraduation || "Not set"} />
                      <SummaryRow label="Emergency Contact" value={formData.emergencyContactName} />
                      <SummaryRow label="Emergency Phone" value={formData.emergencyContactPhone} />
                      <SummaryRow label="Relationship" value={formData.emergencyRelationship || "Not provided"} />
                    </div>
                  </div>

                  {/* Employment & Income Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      Employment & Income
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Employment Status" value={formData.employmentStatus} />
                      <SummaryRow label="Employer" value={formData.employerName || "N/A"} />
                      <SummaryRow label="Monthly Income" value={formData.monthlyIncome || "Not provided"} />
                      <SummaryRow label="Income Source" value={formData.incomeSource || "Not provided"} />
                      <SummaryRow label="Has Co-Signer" value={formData.hasCosigner} />
                      {formData.hasCosigner === "Yes" && (
                        <>
                          <SummaryRow label="Co-Signer Name" value={formData.cosignerName || "Not provided"} />
                          <SummaryRow label="Co-Signer Phone" value={formData.cosignerPhone || "Not provided"} />
                          <SummaryRow label="Co-Signer Email" value={formData.cosignerEmail || "Not provided"} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* References Summary */}
                  <div className="glass-subtle p-5 mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      References & History
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Previous Landlord" value={formData.previousLandlordName || "N/A"} />
                      <SummaryRow label="Landlord Phone" value={formData.landlordPhone || "N/A"} />
                      <SummaryRow label="Reason for Leaving" value={formData.reasonForLeaving || "N/A"} />
                      <SummaryRow label="Length of Stay" value={formData.lengthOfStay || "N/A"} />
                      <SummaryRow label="Reference 1" value={formData.ref1Name ? `${formData.ref1Name} (${formData.ref1Relationship})` : "N/A"} />
                      <SummaryRow label="Reference 2" value={formData.ref2Name ? `${formData.ref2Name} (${formData.ref2Relationship})` : "N/A"} />
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="glass-subtle p-5 mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Upload size={16} />
                      Upload Documents
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Upload supporting documents such as ID, proof of income, student ID, or any other relevant documents.
                      Accepted formats: PDF, images (JPG, PNG), Word, Excel, text files. Max 10MB per file.
                    </p>

                    {/* File list */}
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
                              <option value="Passport">Passport</option>
                              <option value="Student ID">Student ID</option>
                              <option value="Proof of Income">Proof of Income</option>
                              <option value="Bank Statement">Bank Statement</option>
                              <option value="Employment Letter">Employment Letter</option>
                              <option value="Acceptance Letter">Acceptance Letter</option>
                              <option value="Visa / I-20">Visa / I-20</option>
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

                    {/* Upload button */}
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

              {currentStep < 5 ? (
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
