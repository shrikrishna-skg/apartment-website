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
  { label: "Residence", icon: Briefcase },
  { label: "Employment", icon: Briefcase },
  { label: "General Info", icon: ClipboardCheck },
  { label: "Review & Submit", icon: ClipboardCheck },
];

interface FormData {
  // Step 1 - Personal Information
  fullName: string;
  ssn: string;
  maritalStatus: string;
  gender: string;
  drivingLicense: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  specificRequest: string;
  housingRequirement: string;
  leaseDuration: string;
  preferredMoveIn: string;
  // Step 2 - Residence Section
  currentAddress: string;
  housingStatus: string;
  residenceFrom: string;
  residenceTo: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  rentAmount: string;
  reasonForMoving: string;
  // Step 3 - Employment
  employerName: string;
  supervisor: string;
  employerAddress: string;
  employerPhone: string;
  positionHeld: string;
  dateOfHire: string;
  salaryPerMonth: string;
  // Step 4 - General Information
  completedResidenceHistory: string;
  hasPets: string;
  petType: string;
  petWeight: string;
  petAge: string;
  isESA: string;
  // Step 5
  consent: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  ssn: "",
  maritalStatus: "",
  gender: "",
  drivingLicense: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  specificRequest: "",
  housingRequirement: "",
  leaseDuration: "",
  preferredMoveIn: "",
  currentAddress: "",
  housingStatus: "",
  residenceFrom: "",
  residenceTo: "",
  landlordName: "",
  landlordEmail: "",
  landlordPhone: "",
  rentAmount: "",
  reasonForMoving: "",
  employerName: "",
  supervisor: "",
  employerAddress: "",
  employerPhone: "",
  positionHeld: "",
  dateOfHire: "",
  salaryPerMonth: "",
  completedResidenceHistory: "",
  hasPets: "",
  petType: "",
  petWeight: "",
  petAge: "",
  isESA: "",
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
      if (!formData.fullName.trim()) newErrors.push("Applicant's Name is required");
      if (!formData.ssn.trim()) newErrors.push("Social Security / Passport No is required");
      if (!formData.maritalStatus) newErrors.push("Marital Status is required");
      if (!formData.gender) newErrors.push("Gender is required");
      if (!formData.dateOfBirth) newErrors.push("Date of Birth is required");
      if (!formData.email.trim()) newErrors.push("Email is required");
      if (!formData.phone.trim()) newErrors.push("Mobile No is required");
      if (!formData.housingRequirement) newErrors.push("Housing Requirement is required");
      if (!formData.leaseDuration) newErrors.push("Lease Duration is required");
      if (!formData.preferredMoveIn) newErrors.push("Date of Move In is required");
    }

    if (currentStep === 2) {
      if (!formData.currentAddress.trim()) newErrors.push("Current Address is required");
      if (!formData.housingStatus) newErrors.push("Housing Status is required");
      if (!formData.residenceFrom) newErrors.push("From date is required");
      if (!formData.residenceTo) newErrors.push("To date is required");
      if (!formData.landlordName.trim()) newErrors.push("Owner/Landlord Name is required");
      if (!formData.landlordEmail.trim()) newErrors.push("Owner/Landlord Email is required");
      if (!formData.landlordPhone.trim()) newErrors.push("Owner/Landlord Phone is required");
      if (!formData.rentAmount.trim()) newErrors.push("Rent Amount is required");
      if (!formData.reasonForMoving.trim()) newErrors.push("Reason for Moving is required");
    }

    if (currentStep === 3) {
      if (!formData.employerName.trim()) newErrors.push("Applicant's Employer is required");
      if (!formData.supervisor.trim()) newErrors.push("Supervisor is required");
      if (!formData.employerAddress.trim()) newErrors.push("Employer's Address / Location is required");
      if (!formData.employerPhone.trim()) newErrors.push("Employer Phone is required");
      if (!formData.positionHeld.trim()) newErrors.push("Position Held is required");
      if (!formData.dateOfHire) newErrors.push("Date of Hire is required");
      if (!formData.salaryPerMonth.trim()) newErrors.push("Salary Per Month is required");
    }

    if (currentStep === 4) {
      if (!formData.completedResidenceHistory) newErrors.push("Please answer residence history question");
      if (!formData.hasPets) newErrors.push("Please answer pets question");
    }

    if (currentStep === 5) {
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
          ssn: formData.ssn || null,
          marital_status: formData.maritalStatus,
          gender: formData.gender || null,
          driving_license: formData.drivingLicense || null,
          date_of_birth: formData.dateOfBirth || null,
          email: formData.email,
          mobile_number: formData.phone,
          specific_request: formData.specificRequest || null,
          housing_requirement: formData.housingRequirement || null,
          lease_duration: formData.leaseDuration || null,
          preferred_move_in: formData.preferredMoveIn || null,
          current_address: formData.currentAddress || null,
          housing_status: formData.housingStatus || null,
          residence_from: formData.residenceFrom || null,
          residence_to: formData.residenceTo || null,
          previous_landlord_name: formData.landlordName || null,
          landlord_email: formData.landlordEmail || null,
          landlord_phone: formData.landlordPhone || null,
          rent_amount: formData.rentAmount || null,
          reason_for_leaving: formData.reasonForMoving || null,
          employer_name: formData.employerName || null,
          supervisor: formData.supervisor || null,
          employer_address: formData.employerAddress || null,
          employer_phone: formData.employerPhone || null,
          position_held: formData.positionHeld || null,
          date_of_hire: formData.dateOfHire || null,
          monthly_income: formData.salaryPerMonth || null,
          completed_residence_history: formData.completedResidenceHistory === "Yes",
          has_pets: formData.hasPets === "Yes",
          pet_type: formData.petType || null,
          pet_weight: formData.petWeight || null,
          pet_age: formData.petAge || null,
          is_esa: formData.isESA === "Yes",
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
            <p className="text-gray-600 mb-6">
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
              <span className="text-gradient">Working Professional / General Application</span>
            </h1>
            <p className="text-gray-600">
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
                  <div className="bg-blue-600 text-white rounded-lg px-5 py-3 mb-6 font-semibold text-base">
                    Personal Information Section
                  </div>

                  <div className="space-y-5">
                    {renderInput("Applicant's Name", "fullName", "text", "First and Last Name", true)}
                    {renderInput("Social Security / Passport No", "ssn", "text", "e.g., 123-45-6789 or passport number", true)}

                    {renderRadioGroup("Marital Status", "maritalStatus", [
                      "Single",
                      "Married",
                    ])}

                    {renderRadioGroup("Gender", "gender", [
                      "Female",
                      "Male",
                      "Other",
                    ])}

                    {renderInput("Driving License Number", "drivingLicense", "text", "License number (if applicable)")}
                    {renderInput("Date of Birth", "dateOfBirth", "date", "", true)}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {renderInput("Email", "email", "email", "name@domain.com", true)}
                      {renderInput("Mobile No", "phone", "tel", "(###) ###-####", true)}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Specific Request</label>
                      <textarea
                        className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[80px]"
                        placeholder="Brief description of any requests"
                        value={formData.specificRequest}
                        onChange={(e) => updateField("specificRequest", e.target.value)}
                      />
                    </div>

                    {renderRadioGroup("Housing Requirement", "housingRequirement", [
                      "Studio",
                      "1 Bed / 1 Bath",
                      "2 Bed / 2 Bath",
                      "3 Bed / 3 Bath",
                      "4 Bed / 4 Bath",
                      "Other",
                    ])}

                    {renderRadioGroup("Lease Duration Preference", "leaseDuration", [
                      "Month to Month",
                      "Less than 6 Months",
                      "6 Months",
                      "6 Months and Above Flexible",
                      "12 Months",
                      "Other",
                    ])}

                    {renderInput("Date of Move In", "preferredMoveIn", "date", "", true)}
                  </div>
                </motion.div>
              )}

              {/* Step 2 - Residence Section */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-blue-600 text-white rounded-lg px-5 py-3 mb-6 font-semibold text-base">
                    Residence Section
                  </div>

                  <div className="space-y-5">
                    {renderInput("Current Address (Include No, Street, City, State, Zip Code)", "currentAddress", "text", "Street address, City, State, Zip", true)}

                    {renderRadioGroup("Housing Status", "housingStatus", [
                      "Own",
                      "Rent",
                      "Living with Family or Friends",
                    ])}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {renderInput("From", "residenceFrom", "date", "", true)}
                      {renderInput("To", "residenceTo", "date", "", true)}
                    </div>

                    {renderInput("Owner/Landlord Name", "landlordName", "text", "Full name", true)}
                    {renderInput("Owner/Landlord Email", "landlordEmail", "email", "landlord@example.com", true)}
                    {renderInput("Owner/Landlord Phone Number", "landlordPhone", "tel", "(###) ###-####", true)}
                    {renderInput("Rent Amount", "rentAmount", "text", "Amount in dollars", true)}

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Reason for Moving <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[80px]"
                        placeholder="Brief explanation"
                        value={formData.reasonForMoving}
                        onChange={(e) => updateField("reasonForMoving", e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3 - Employment */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-blue-600 text-white rounded-lg px-5 py-3 mb-6 font-semibold text-base">
                    Employment
                  </div>

                  <div className="space-y-5">
                    {renderInput("Applicant's Employer", "employerName", "text", "Company name", true)}
                    {renderInput("Supervisor", "supervisor", "text", "Full name", true)}
                    {renderInput("Employer's Address / Location", "employerAddress", "text", "Street address, City, State", true)}
                    {renderInput("Employer Phone", "employerPhone", "tel", "(###) ###-####", true)}
                    {renderInput("Position Held", "positionHeld", "text", "Your job title", true)}
                    {renderInput("Date of Hire", "dateOfHire", "date", "", true)}
                    {renderInput("Salary Per Month", "salaryPerMonth", "text", "Amount in dollars", true)}
                  </div>
                </motion.div>
              )}

              {/* Step 4 - General Information */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-blue-600 text-white rounded-lg px-5 py-3 mb-6 font-semibold text-base">
                    General Information
                  </div>

                  <div className="space-y-5">
                    {renderRadioGroup("Did you complete the residence history?", "completedResidenceHistory", [
                      "Yes",
                      "No",
                    ])}

                    {renderRadioGroup("Do you have pets?", "hasPets", [
                      "Yes",
                      "No",
                    ])}

                    {formData.hasPets === "Yes" && (
                      <div className="space-y-5 pl-1 border-l-2 border-blue-200 ml-2 mt-3">
                        <div className="pl-4 space-y-5">
                          {renderInput("Pet Type", "petType", "text", "e.g., Dog, Cat, Bird")}
                          {renderInput("Pet Weight", "petWeight", "text", "e.g., 25 lbs")}
                          {renderInput("Pet Age", "petAge", "text", "e.g., 3 years")}

                          {renderRadioGroup("Is this an Emotional Support Animal (ESA)?", "isESA", [
                            "Yes",
                            "No",
                          ])}

                          {formData.isESA === "Yes" && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-700 mb-1">ESA Verification Document</p>
                              <p className="text-xs text-gray-500 mb-3">
                                Upload ESA registration, doctor&apos;s note, certification, or any official proof.
                              </p>
                              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-white">
                                <Upload size={20} className="text-gray-400 mb-1" />
                                <span className="text-sm text-gray-500">Add file</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setFiles((prev) => [...prev, file]);
                                      setFileLabels((prev) => [...prev, "ESA Verification"]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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

                  <p className="text-gray-600 text-sm mb-6">
                    Please review your information below before submitting.
                  </p>

                  {/* Personal Info Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Name" value={formData.fullName} />
                      <SummaryRow label="SSN / Passport" value={formData.ssn || "Not provided"} />
                      <SummaryRow label="Marital Status" value={formData.maritalStatus} />
                      <SummaryRow label="Gender" value={formData.gender || "Not provided"} />
                      <SummaryRow label="Driving License" value={formData.drivingLicense || "Not provided"} />
                      <SummaryRow label="Date of Birth" value={formData.dateOfBirth} />
                      <SummaryRow label="Email" value={formData.email} />
                      <SummaryRow label="Mobile" value={formData.phone} />
                      <SummaryRow label="Housing" value={formData.housingRequirement || "Not selected"} />
                      <SummaryRow label="Lease Duration" value={formData.leaseDuration || "Not selected"} />
                      <SummaryRow label="Move-In Date" value={formData.preferredMoveIn || "Not set"} />
                      {formData.specificRequest && (
                        <SummaryRow label="Specific Request" value={formData.specificRequest} />
                      )}
                    </div>
                  </div>

                  {/* Residence Summary */}
                  <div className="glass-subtle p-5 mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      Residence Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Current Address" value={formData.currentAddress} />
                      <SummaryRow label="Housing Status" value={formData.housingStatus || "Not provided"} />
                      <SummaryRow label="From" value={formData.residenceFrom} />
                      <SummaryRow label="To" value={formData.residenceTo} />
                      <SummaryRow label="Landlord Name" value={formData.landlordName} />
                      <SummaryRow label="Landlord Email" value={formData.landlordEmail} />
                      <SummaryRow label="Landlord Phone" value={formData.landlordPhone} />
                      <SummaryRow label="Rent Amount" value={formData.rentAmount} />
                      <SummaryRow label="Reason for Moving" value={formData.reasonForMoving} />
                    </div>
                  </div>

                  {/* Employment Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      Employment
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Employer" value={formData.employerName} />
                      <SummaryRow label="Supervisor" value={formData.supervisor} />
                      <SummaryRow label="Address" value={formData.employerAddress} />
                      <SummaryRow label="Phone" value={formData.employerPhone} />
                      <SummaryRow label="Position" value={formData.positionHeld} />
                      <SummaryRow label="Date of Hire" value={formData.dateOfHire} />
                      <SummaryRow label="Salary/Month" value={formData.salaryPerMonth} />
                    </div>
                  </div>

                  {/* General Info Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      General Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Residence History Complete" value={formData.completedResidenceHistory} />
                      <SummaryRow label="Has Pets" value={formData.hasPets} />
                      {formData.hasPets === "Yes" && (
                        <>
                          <SummaryRow label="Pet Type" value={formData.petType || "Not provided"} />
                          <SummaryRow label="Pet Weight" value={formData.petWeight || "Not provided"} />
                          <SummaryRow label="Pet Age" value={formData.petAge || "Not provided"} />
                          <SummaryRow label="ESA" value={formData.isESA || "No"} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="glass-subtle p-5 mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Upload size={16} />
                      Upload Documents
                    </h3>
                    <p className="text-xs text-gray-600 mb-4">
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
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
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
      <span className="text-gray-500 min-w-[140px]">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
