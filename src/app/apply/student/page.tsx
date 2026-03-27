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
import DatePicker from "@/components/ui/DatePicker";

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Address & Education", icon: MapPin },
  { label: "Employment & Income", icon: Briefcase },
  { label: "References & History", icon: Users },
  { label: "Documents", icon: Upload },
  { label: "Review & Submit", icon: ClipboardCheck },
];

interface DocumentFile {
  file: File;
  category: string;
}

const REQUIRED_DOCS = [
  {
    key: "studentId",
    label: "Student ID",
    description: "Upload a clear photo or scan of your student ID card",
    required: true,
    multiple: false,
    maxSize: 10,
  },
  {
    key: "stateId",
    label: "State ID or Driver's License",
    description: "Government-issued photo identification",
    required: true,
    multiple: false,
    maxSize: 10,
  },
  {
    key: "passport",
    label: "Passport (If Applicable)",
    description: "Required for international students",
    required: false,
    multiple: false,
    maxSize: 10,
  },
  {
    key: "visa",
    label: "Visa / I-20 (If Applicable)",
    description: "Required for international students on a student visa",
    required: false,
    multiple: false,
    maxSize: 10,
  },
  {
    key: "bankStatement",
    label: "Bank Statement",
    description: "Past 3 months bank statement required",
    required: true,
    multiple: true,
    maxSize: 10,
  },
  {
    key: "proofOfIncome",
    label: "Proof of Income / Financial Aid",
    description: "Pay stubs, financial aid letter, scholarship letter, or sponsor letter",
    required: false,
    multiple: true,
    maxSize: 10,
  },
  {
    key: "acceptanceLetter",
    label: "University Acceptance / Enrollment Letter",
    description: "Proof of enrollment or acceptance from your university",
    required: true,
    multiple: false,
    maxSize: 10,
  },
  {
    key: "additional",
    label: "Additional Supporting Documents",
    description: "Any other documents that support your application",
    required: false,
    multiple: true,
    maxSize: 10,
  },
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
      // Validate required documents
      const requiredDocs = isInternational
        ? REQUIRED_DOCS.filter((d) => d.required || d.key === "passport" || d.key === "visa")
        : REQUIRED_DOCS.filter((d) => d.required);
      for (const doc of requiredDocs) {
        if (!documentFiles[doc.key] || documentFiles[doc.key].length === 0) {
          newErrors.push(`${doc.label} is required`);
        }
      }
    }

    if (currentStep === 6) {
      if (!formData.consent) newErrors.push("You must agree to the certification");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors([]);
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [documentFiles, setDocumentFiles] = useState<Record<string, DocumentFile[]>>({});

  const handleDocFileAdd = (category: string, e: React.ChangeEvent<HTMLInputElement>, multiple: boolean) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((f) => ({ file: f, category }));
    setDocumentFiles((prev) => ({
      ...prev,
      [category]: multiple ? [...(prev[category] || []), ...newFiles] : newFiles,
    }));
    e.target.value = "";
  };

  const removeDocFile = (category: string, index: number) => {
    setDocumentFiles((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((_, i) => i !== index),
    }));
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

      // Upload documents by category
      if (appData.id) {
        const allDocs = Object.values(documentFiles).flat();
        for (const doc of allDocs) {
          const fileForm = new FormData();
          fileForm.append("file", doc.file);
          fileForm.append("application_id", appData.id);
          fileForm.append("document_label", doc.category);
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
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Date of Birth<span className="text-red-600 ml-1">*</span>
                      </label>
                      <DatePicker
                        value={formData.dateOfBirth}
                        onChange={(val) => updateField("dateOfBirth", val)}
                        maxDate={new Date()}
                        placeholder="Select date of birth"
                        required
                      />
                    </div>
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
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Preferred Move-In Date
                      </label>
                      <DatePicker
                        value={formData.preferredMoveIn}
                        onChange={(val) => updateField("preferredMoveIn", val)}
                        minDate={new Date()}
                        placeholder="Select move-in date"
                      />
                    </div>
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
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          Expected Graduation
                        </label>
                        <DatePicker
                          value={formData.expectedGraduation}
                          onChange={(val) => updateField("expectedGraduation", val)}
                          minDate={new Date()}
                          placeholder="Select graduation date"
                        />
                      </div>
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

              {/* Step 5 - Required Documents */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Upload size={20} className="text-blue-600" />
                    Required Documents
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Please upload all required documents. The more documents provided, the stronger your application.
                  </p>

                  <div className="space-y-4">
                    {REQUIRED_DOCS.map((doc) => {
                      const isRequiredForUser = isInternational
                        ? doc.required || doc.key === "passport" || doc.key === "visa"
                        : doc.required;
                      const files = documentFiles[doc.key] || [];

                      // Hide passport/visa for non-international unless they want to upload
                      if (!isInternational && (doc.key === "visa")) return null;

                      return (
                        <div
                          key={doc.key}
                          className={`rounded-xl border-2 p-4 transition-all ${
                            files.length > 0
                              ? "border-green-200 bg-green-50/50"
                              : isRequiredForUser
                              ? "border-gray-200 bg-white"
                              : "border-gray-100 bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                {doc.label}
                                {isRequiredForUser && (
                                  <span className="text-red-500 text-xs font-bold">*</span>
                                )}
                                {files.length > 0 && (
                                  <Check size={16} className="text-green-600" />
                                )}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                            </div>
                          </div>

                          {/* Uploaded files list */}
                          {files.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {files.map((docFile, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2"
                                >
                                  <FileText size={16} className="text-blue-500 shrink-0" />
                                  <span className="text-sm text-gray-700 truncate flex-1">
                                    {docFile.file.name}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {docFile.file.size < 1024 * 1024
                                      ? `${(docFile.file.size / 1024).toFixed(1)} KB`
                                      : `${(docFile.file.size / (1024 * 1024)).toFixed(1)} MB`}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeDocFile(doc.key, idx)}
                                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Upload button */}
                          <label className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                            <Upload size={16} className="text-gray-400 group-hover:text-blue-500" />
                            <span className="text-xs text-gray-500 group-hover:text-blue-600">
                              {files.length > 0
                                ? doc.multiple
                                  ? "Add more files"
                                  : "Replace file"
                                : `Upload ${doc.label}`}
                            </span>
                            <input
                              type="file"
                              multiple={doc.multiple}
                              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                              onChange={(e) => handleDocFileAdd(doc.key, e, doc.multiple)}
                              className="sr-only"
                            />
                          </label>

                          <p className="text-[10px] text-gray-400 mt-1.5">
                            {doc.multiple ? "Upload multiple files." : "Upload 1 file."} Max {doc.maxSize} MB per file. PDF, images, or Word documents.
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 6 - Review & Submit */}
              {currentStep === 6 && (
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

                  {/* Documents Summary */}
                  <div className="glass-subtle p-5 mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Upload size={16} />
                      Uploaded Documents
                    </h3>
                    {Object.keys(documentFiles).length > 0 ? (
                      <div className="space-y-1.5 text-sm">
                        {Object.entries(documentFiles).map(([category, files]) => {
                          if (files.length === 0) return null;
                          const docDef = REQUIRED_DOCS.find((d) => d.key === category);
                          return (
                            <div key={category} className="flex items-center gap-2">
                              <Check size={14} className="text-green-600 shrink-0" />
                              <span className="text-gray-700">
                                {docDef?.label || category}: {files.length} file{files.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No documents uploaded</p>
                    )}
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

              {currentStep < 6 ? (
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
