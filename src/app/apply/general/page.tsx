"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  MapPin,
  Briefcase,
  ClipboardCheck,
  Upload,
  FileText,
  X,
  Car,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";

interface DocumentFile {
  file: File;
  category: string;
}

const REQUIRED_DOCS_PROFESSIONAL = [
  {
    key: "passportPhoto",
    label: "Passport Size Photo",
    description: "Upload a clear passport-size photograph",
    required: true,
    multiple: true,
    maxSize: 10,
  },
  {
    key: "stateId",
    label: "State ID or Passport",
    description: "Government-issued photo identification",
    required: true,
    multiple: true,
    maxSize: 10,
  },
  {
    key: "visa",
    label: "Visa (If Applicable)",
    description: "Upload visa documentation if applicable",
    required: false,
    multiple: true,
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
    label: "Proof of Income (Pay stubs, Employer Letter, or Offer Letter)",
    description: "Providing pay stubs from the past 3 months will help expedite and strengthen your application. Employer or offer letters may be accepted if pay stubs are not available.",
    required: true,
    multiple: true,
    maxSize: 100,
  },
  {
    key: "additional",
    label: "Additional Supporting Documents",
    description: "Upload up to 5 additional files that support your application",
    required: false,
    multiple: true,
    maxSize: 10,
  },
];

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Residence", icon: Briefcase },
  { label: "Employment", icon: Briefcase },
  { label: "General Info", icon: ClipboardCheck },
  { label: "Vehicle", icon: ClipboardCheck },
  { label: "Background", icon: ClipboardCheck },
  { label: "Documents", icon: Upload },
  { label: "Authorization", icon: ClipboardCheck },
  { label: "Review", icon: ClipboardCheck },
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
  // Step 5 - Vehicle Information
  vehicle1Make: string;
  vehicle1Year: string;
  vehicle1Color: string;
  vehicle1Plate: string;
  hasSecondVehicle: string;
  vehicle2Make: string;
  vehicle2Year: string;
  vehicle2Color: string;
  vehicle2Plate: string;
  // Step 6 - Background Check
  filedBankruptcy: string;
  bankruptcyDetails: string;
  evictedFromTenancy: string;
  evictionDetails: string;
  convictedFelony: string;
  felonyDetails: string;
  arrestedOrConvicted: string;
  arrestDetails: string;
  // Step 7 - Documents & References
  references: string;
  // Step 8 - Authorization & Signature
  agreeTerms: string;
  signatureName: string;
  signatureDate: string;
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
  vehicle1Make: "",
  vehicle1Year: "",
  vehicle1Color: "",
  vehicle1Plate: "",
  hasSecondVehicle: "",
  vehicle2Make: "",
  vehicle2Year: "",
  vehicle2Color: "",
  vehicle2Plate: "",
  filedBankruptcy: "",
  bankruptcyDetails: "",
  evictedFromTenancy: "",
  evictionDetails: "",
  convictedFelony: "",
  felonyDetails: "",
  arrestedOrConvicted: "",
  arrestDetails: "",
  references: "",
  agreeTerms: "",
  signatureName: "",
  signatureDate: new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }),
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
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());
  const [pets, setPets] = useState<{ type: string; weight: string; age: string; category: string }[]>([
    { type: "", weight: "", age: "", category: "" },
  ]);

  const addPet = () => setPets((prev) => [...prev, { type: "", weight: "", age: "", category: "" }]);
  const removePet = (index: number) => setPets((prev) => prev.filter((_, i) => i !== index));
  const updatePet = (index: number, field: string, value: string) => {
    setPets((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

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
      if (!formData.hasSecondVehicle) newErrors.push("Please answer the 2nd vehicle question");
    }

    if (currentStep === 6) {
      if (!formData.filedBankruptcy) newErrors.push("Bankruptcy question is required");
      if (!formData.evictedFromTenancy) newErrors.push("Eviction question is required");
      if (!formData.convictedFelony) newErrors.push("Felony conviction question is required");
      if (!formData.arrestedOrConvicted) newErrors.push("Arrest/conviction question is required");
    }

    if (currentStep === 7) {
      for (const doc of REQUIRED_DOCS_PROFESSIONAL) {
        if (doc.required && (!documentFiles[doc.key] || documentFiles[doc.key].length === 0)) {
          newErrors.push(`${doc.label} is required`);
        }
      }
    }

    if (currentStep === 8) {
      if (!formData.agreeTerms || formData.agreeTerms !== "Yes, I agree") newErrors.push("You must agree to the terms and conditions");
      if (!formData.signatureName.trim()) newErrors.push("Electronic Signature is required");
      if (!formData.signatureDate) newErrors.push("Signature Date is required");
    }

    if (currentStep === 9) {
      if (!formData.agreeTerms || formData.agreeTerms !== "Yes, I agree") newErrors.push("You must agree to the terms and conditions (Step 8)");
      if (!formData.consent) newErrors.push("You must check the consent checkbox before submitting");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setVisitedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
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
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB per file
    const validFiles: File[] = [];
    const rejected: string[] = [];
    Array.from(files).forEach((f) => {
      if (f.size > MAX_SIZE) {
        rejected.push(`${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`);
      } else {
        validFiles.push(f);
      }
    });
    if (rejected.length > 0) {
      alert(`These files exceed the 4MB limit and were skipped:\n${rejected.join("\n")}\n\nPlease compress or resize them before uploading.`);
    }
    if (validFiles.length === 0) { e.target.value = ""; return; }
    const newFiles = validFiles.map((f) => ({ file: f, category }));
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
    // Set signature date/time to exact moment of submission
    const submitTimestamp = new Date().toLocaleString("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) + " CT";
    formData.signatureDate = submitTimestamp;
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
          pets: formData.hasPets === "Yes" ? pets : [],
          vehicle1_make: formData.vehicle1Make || null,
          vehicle1_year: formData.vehicle1Year || null,
          vehicle1_color: formData.vehicle1Color || null,
          vehicle1_plate: formData.vehicle1Plate || null,
          has_second_vehicle: formData.hasSecondVehicle === "Yes",
          vehicle2_make: formData.vehicle2Make || null,
          vehicle2_year: formData.vehicle2Year || null,
          vehicle2_color: formData.vehicle2Color || null,
          vehicle2_plate: formData.vehicle2Plate || null,
          filed_bankruptcy: formData.filedBankruptcy === "Yes",
          bankruptcy_details: formData.bankruptcyDetails || null,
          evicted_from_tenancy: formData.evictedFromTenancy === "Yes",
          eviction_details: formData.evictionDetails || null,
          convicted_felony: formData.convictedFelony === "Yes",
          felony_details: formData.felonyDetails || null,
          arrested_or_convicted: formData.arrestedOrConvicted === "Yes",
          arrest_details: formData.arrestDetails || null,
          references_info: formData.references || null,
          agree_terms: formData.agreeTerms === "Yes, I agree",
          signature_name: formData.signatureName || null,
          signature_date: formData.signatureDate || null,
          consent: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }
      const appData = await res.json();

      // Upload ALL documents — track failures
      if (appData.id) {
        const allDocs = Object.values(documentFiles).flat();
        const failedUploads: string[] = [];
        for (const doc of allDocs) {
          try {
            const fileForm = new FormData();
            fileForm.append("file", doc.file);
            fileForm.append("application_id", appData.id);
            fileForm.append("document_label", doc.category);
            const uploadRes = await fetch("/api/documents/upload", { method: "POST", body: fileForm });
            if (!uploadRes.ok) {
              failedUploads.push(`${doc.file.name} (${doc.category})`);
            }
          } catch {
            failedUploads.push(`${doc.file.name} (${doc.category})`);
          }
        }
        if (failedUploads.length > 0) {
          alert(`Application submitted! But ${failedUploads.length} document(s) failed to upload:\n${failedUploads.join("\n")}\n\nPlease contact the office to submit these documents.`);
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
    options: string[],
    required = false
  ) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
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

          {/* Step Indicator - Clickable Icons */}
          <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const stepNum = index + 1;
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;

              return (
                <div key={step.label} className="flex items-center">
                  <button
                    type="button"
                    className="flex flex-col items-center group cursor-pointer"
                    onClick={() => {
                      setCurrentStep(stepNum);
                      setErrors([]);
                    }}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 cursor-pointer ${
                        isCompleted && visitedSteps.has(stepNum)
                          ? "bg-green-600 text-white group-hover:bg-green-700"
                          : isActive
                          ? "bg-[#1a73e8] text-white shadow-lg shadow-blue-200"
                          : "bg-gray-50 border border-gray-200 text-gray-400 group-hover:border-blue-300 group-hover:text-blue-400"
                      }`}
                    >
                      {isCompleted && visitedSteps.has(stepNum) ? (
                        <Check size={16} />
                      ) : (
                        <StepIcon size={16} />
                      )}
                    </div>
                    <span
                      className={`text-[9px] mt-1 font-medium hidden sm:block max-w-[56px] text-center leading-tight ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted && visitedSteps.has(stepNum)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-3 sm:w-6 h-0.5 mx-0.5 transition-colors duration-500 ${
                        stepNum < currentStep && visitedSteps.has(stepNum)
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User size={20} className="text-blue-600" />
                    Personal Information
                  </h2>

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
                      "Prefer not to say",
                    ])}

                    {renderInput("Driving License Number", "drivingLicense", "text", "License number (if applicable)")}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Date of Birth<span className="text-red-600 ml-1">*</span>
                      </label>
                      <DatePicker
                        value={formData.dateOfBirth}
                        onChange={(val) => updateField("dateOfBirth", val)}
                        required
                        maxDate={new Date()}
                        placeholder="Select date of birth"
                      />
                    </div>

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

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Date of Move In<span className="text-red-600 ml-1">*</span>
                      </label>
                      <DatePicker
                        value={formData.preferredMoveIn}
                        onChange={(val) => updateField("preferredMoveIn", val)}
                        required
                        minDate={new Date()}
                        placeholder="Select move-in date"
                      />
                    </div>
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Residence
                  </h2>

                  <div className="space-y-5">
                    {renderInput("Current Address (Include No, Street, City, State, Zip Code)", "currentAddress", "text", "Street address, City, State, Zip", true)}

                    {renderRadioGroup("Housing Status", "housingStatus", [
                      "Own",
                      "Rent",
                      "Living with Friends/Family",
                      "Other",
                    ])}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          From<span className="text-red-600 ml-1">*</span>
                        </label>
                        <DatePicker
                          value={formData.residenceFrom}
                          onChange={(val) => updateField("residenceFrom", val)}
                          required
                          maxDate={new Date()}
                          placeholder="Select start date"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          To<span className="text-red-600 ml-1">*</span>
                        </label>
                        <DatePicker
                          value={formData.residenceTo}
                          onChange={(val) => updateField("residenceTo", val)}
                          required
                          placeholder="Select end date"
                        />
                      </div>
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-600" />
                    Employment
                  </h2>

                  <div className="space-y-5">
                    {renderInput("Applicant's Employer", "employerName", "text", "Company name", true)}
                    {renderInput("Supervisor", "supervisor", "text", "Full name", true)}
                    {renderInput("Employer's Address / Location", "employerAddress", "text", "Street address, City, State", true)}
                    {renderInput("Employer Phone", "employerPhone", "tel", "(###) ###-####", true)}
                    {renderInput("Position Held", "positionHeld", "text", "Your job title", true)}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Date of Hire<span className="text-red-600 ml-1">*</span>
                      </label>
                      <DatePicker
                        value={formData.dateOfHire}
                        onChange={(val) => updateField("dateOfHire", val)}
                        required
                        maxDate={new Date()}
                        placeholder="Select hire date"
                      />
                    </div>
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    General Information
                  </h2>

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
                      <div className="space-y-4 pl-1 border-l-2 border-blue-200 ml-2 mt-3">
                        {pets.map((pet, idx) => (
                          <div key={idx} className="pl-4 space-y-4 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-700">Pet {idx + 1}</span>
                              {pets.length > 1 && (
                                <button type="button" onClick={() => removePet(idx)} className="text-red-400 hover:text-red-600 p-1">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Pet Type / Breed</label>
                                <input type="text" className="input-glass" placeholder="e.g., Dog, Cat, Bird" value={pet.type} onChange={(e) => updatePet(idx, "type", e.target.value)} />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Weight (lbs)</label>
                                <input type="text" className="input-glass" placeholder="e.g., 25" value={pet.weight} onChange={(e) => updatePet(idx, "weight", e.target.value)} />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Age</label>
                                <input type="text" className="input-glass" placeholder="e.g., 3 years" value={pet.age} onChange={(e) => updatePet(idx, "age", e.target.value)} />
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-sm font-medium text-gray-700">Pet Category</label>
                              <div className="flex flex-wrap gap-3">
                                {["Regular", "Emotional Support Animal", "Service Animal"].map((opt) => (
                                  <label key={opt} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-300 border ${pet.category === opt ? "bg-blue-50 border-blue-300 text-gray-900" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                                    <input type="radio" name={`petCategory-${idx}`} value={opt} checked={pet.category === opt} onChange={() => updatePet(idx, "category", opt)} className="sr-only" />
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${pet.category === opt ? "border-[#1a73e8]" : "border-gray-300"}`}>
                                      {pet.category === opt && <div className="w-2 h-2 rounded-full bg-[#1a73e8]" />}
                                    </div>
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            </div>

                            {(pet.category === "Emotional Support Animal" || pet.category === "Service Animal") && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">{pet.category} Verification Document</p>
                                <p className="text-xs text-gray-500 mb-3">Upload registration, doctor&apos;s note, certification, or any official proof.</p>
                                {(documentFiles[`esaDoc-${idx}`] || []).length > 0 && (
                                  <div className="mb-3 space-y-1.5">
                                    {documentFiles[`esaDoc-${idx}`].map((doc, fIdx) => (
                                      <div key={fIdx} className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded px-3 py-1.5">
                                        <FileText size={14} className="text-blue-500" />
                                        <span className="truncate flex-1">{doc.file.name}</span>
                                        <button type="button" onClick={() => removeDocFile(`esaDoc-${idx}`, fIdx)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-white">
                                  <Upload size={18} className="text-gray-400 mb-1" />
                                  <span className="text-xs text-gray-500">{(documentFiles[`esaDoc-${idx}`] || []).length > 0 ? "Add more files" : "Upload document"}</span>
                                  <input type="file" className="hidden" multiple accept="*/*" onChange={(e) => handleDocFileAdd(`esaDoc-${idx}`, e, true)} />
                                </label>
                              </div>
                            )}

                            {idx < pets.length - 1 && <div className="border-b border-gray-100" />}
                          </div>
                        ))}
                        <button type="button" onClick={addPet} className="ml-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium py-2">
                          <Plus size={16} /> Add Another Pet
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 5 - Vehicle Information */}
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
                    <Car size={20} className="text-blue-600" />
                    Vehicle Information
                  </h2>

                  <div className="space-y-5">
                    {renderInput("Vehicle 1 Make (e.g. Honda, Toyota, BMW)", "vehicle1Make", "text", "Your answer")}
                    {renderInput("Vehicle 1 Year", "vehicle1Year", "text", "Your answer")}
                    {renderInput("Vehicle 1 Color", "vehicle1Color", "text", "Your answer")}
                    {renderInput("Vehicle 1 License Plate Number", "vehicle1Plate", "text", "Your answer")}

                    {renderRadioGroup("Do you have a 2nd vehicle?", "hasSecondVehicle", [
                      "Yes",
                      "No",
                    ])}

                    {formData.hasSecondVehicle === "Yes" && (
                      <div className="space-y-5 pl-1 border-l-2 border-blue-200 ml-2 mt-3">
                        <div className="pl-4 space-y-5">
                          {renderInput("Vehicle 2 Make", "vehicle2Make", "text", "Your answer")}
                          {renderInput("Vehicle 2 Year", "vehicle2Year", "text", "Your answer")}
                          {renderInput("Vehicle 2 Color", "vehicle2Color", "text", "Your answer")}
                          {renderInput("Vehicle 2 License Plate Number", "vehicle2Plate", "text", "Your answer")}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 6 - Background Check Questions */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-blue-600" />
                    Background Check Questions
                  </h2>

                  <div className="space-y-5">
                    {renderRadioGroup("Has applicant, spouse or any proposed resident ever filed for Bankruptcy?", "filedBankruptcy", [
                      "Yes",
                      "No",
                    ], true)}
                    {formData.filedBankruptcy === "Yes" && (
                      <div className="pl-4 border-l-2 border-blue-200 ml-2">
                        {renderInput("Please provide details", "bankruptcyDetails", "text", "Explain the circumstances...")}
                      </div>
                    )}

                    {renderRadioGroup("Been Evicted from Tenancy?", "evictedFromTenancy", [
                      "Yes",
                      "No",
                    ], true)}
                    {formData.evictedFromTenancy === "Yes" && (
                      <div className="pl-4 border-l-2 border-blue-200 ml-2">
                        {renderInput("Please provide details", "evictionDetails", "text", "Explain the circumstances...")}
                      </div>
                    )}

                    {renderRadioGroup("Been convicted of a felony?", "convictedFelony", [
                      "Yes",
                      "No",
                    ], true)}
                    {formData.convictedFelony === "Yes" && (
                      <div className="pl-4 border-l-2 border-blue-200 ml-2">
                        {renderInput("Please provide details", "felonyDetails", "text", "Explain the circumstances...")}
                      </div>
                    )}

                    {renderRadioGroup("Have you ever been arrested or convicted of a felony/misdemeanor?", "arrestedOrConvicted", [
                      "Yes",
                      "No",
                    ], true)}
                    {formData.arrestedOrConvicted === "Yes" && (
                      <div className="pl-4 border-l-2 border-blue-200 ml-2">
                        {renderInput("Please provide details", "arrestDetails", "text", "Explain the circumstances...")}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 7 - Required Documents */}
              {currentStep === 7 && (
                <motion.div
                  key="step7docs"
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
                    {REQUIRED_DOCS_PROFESSIONAL.map((doc) => {
                      const files = documentFiles[doc.key] || [];

                      return (
                        <div
                          key={doc.key}
                          className={`rounded-xl border-2 p-4 transition-all ${
                            files.length > 0
                              ? "border-green-200 bg-green-50/50"
                              : doc.required
                              ? "border-gray-200 bg-white"
                              : "border-gray-100 bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                {doc.label}
                                {doc.required && (
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
                              accept="*/*"
                              onChange={(e) => handleDocFileAdd(doc.key, e, doc.multiple)}
                              className="sr-only"
                            />
                          </label>

                          <p className="text-[10px] text-gray-400 mt-1.5">
                            {doc.multiple ? "Upload multiple files." : "Upload 1 file."} Max 4MB per file. All file types accepted.
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* References */}
                  <div className="border border-gray-200 rounded-lg p-4 mt-6">
                    <p className="text-sm font-semibold text-gray-800">References (2-3 personal/professional)</p>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2 inline-block"><strong>Note:</strong> Include full name, relationship, phone number, and email for each reference.</p>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px]"
                      placeholder={"e.g., Name: John Smith | Relationship: Former Manager | Phone: (###) ###-#### | Email: john@email.com"}
                      value={formData.references}
                      onChange={(e) => updateField("references", e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 8 - Authorization & Signature */}
              {currentStep === 8 && (
                <motion.div
                  key="step8auth"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Authorization & Signature
                  </h2>

                  <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3">Terms and Conditions</h3>
                    <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
                      <p>I certify that the information provided in this application is true and complete to the best of my knowledge. I understand that any false information or omission may disqualify me from further consideration for an apartment and may result in termination of my lease if discovered at a later date.</p>
                      <p>I authorize College Place Apartments to verify the information provided and to obtain a credit report and criminal background check.</p>
                      <p>I authorize College Place Apartments to contact me by phone, email, and SMS text messages regarding my application and leasing updates. I understand that message & data rates may apply, message frequency varies, and I can opt out at any time by replying STOP. Consent is not a condition of purchase or tenancy. View our <a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a> and <a href="/terms" className="text-blue-600 underline hover:text-blue-800">Terms & Conditions</a>.</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {renderRadioGroup("Do you agree to the terms and conditions?", "agreeTerms", [
                      "Yes, I agree",
                      "No",
                    ], true)}

                    {renderInput("Full Name (Electronic Signature)", "signatureName", "text", "Type your full name as signature", true)}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Signature Date<span className="text-red-600 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        className="input-glass bg-gray-50"
                        value={formData.signatureDate}
                        readOnly
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 9 - Review & Submit */}
              {currentStep === 9 && (
                <motion.div
                  key="step9review"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Review & Submit
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Please review all information before submitting. Click Edit on any section to go back.
                  </p>

                  {/* Personal Info Summary */}
                  <div className="border border-gray-200 rounded-lg p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Personal Information</h3>
                      <button onClick={() => setCurrentStep(1)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
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
                  <div className="border border-gray-200 rounded-lg p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Residence</h3>
                      <button onClick={() => setCurrentStep(2)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
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
                  <div className="border border-gray-200 rounded-lg p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Employment</h3>
                      <button onClick={() => setCurrentStep(3)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
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
                  <div className="border border-gray-200 rounded-lg p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">General Information</h3>
                      <button onClick={() => setCurrentStep(4)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Residence History Complete" value={formData.completedResidenceHistory} />
                      <SummaryRow label="Has Pets" value={formData.hasPets} />
                      {formData.hasPets === "Yes" && pets.map((pet, idx) => (
                        <div key={idx} className="col-span-2 pl-2 border-l-2 border-blue-100 mb-1">
                          <span className="text-xs font-semibold text-gray-500">Pet {idx + 1}</span>
                          <SummaryRow label="Type" value={pet.type || "N/A"} />
                          <SummaryRow label="Weight" value={pet.weight || "N/A"} />
                          <SummaryRow label="Age" value={pet.age || "N/A"} />
                          <SummaryRow label="Category" value={pet.category || "N/A"} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Summary */}
                  <div className="border border-gray-200 rounded-lg p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Vehicle Information</h3>
                      <button onClick={() => setCurrentStep(5)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Vehicle 1 Make" value={formData.vehicle1Make || "None"} />
                      <SummaryRow label="Year" value={formData.vehicle1Year || "N/A"} />
                      <SummaryRow label="Color" value={formData.vehicle1Color || "N/A"} />
                      <SummaryRow label="Plate" value={formData.vehicle1Plate || "N/A"} />
                      {formData.hasSecondVehicle === "Yes" && (
                        <>
                          <SummaryRow label="Vehicle 2 Make" value={formData.vehicle2Make || "N/A"} />
                          <SummaryRow label="Year" value={formData.vehicle2Year || "N/A"} />
                          <SummaryRow label="Color" value={formData.vehicle2Color || "N/A"} />
                          <SummaryRow label="Plate" value={formData.vehicle2Plate || "N/A"} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Background Check Summary */}
                  <div className="border border-gray-200 rounded-lg p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Background Check</h3>
                      <button onClick={() => setCurrentStep(6)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                      <SummaryRow label="Filed for Bankruptcy" value={formData.filedBankruptcy} />
                      <SummaryRow label="Evicted from Tenancy" value={formData.evictedFromTenancy} />
                      <SummaryRow label="Convicted of Felony" value={formData.convictedFelony} />
                      <SummaryRow label="Arrested/Convicted" value={formData.arrestedOrConvicted} />
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div className="border border-gray-200 rounded-lg p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Documents</h3>
                      <button onClick={() => setCurrentStep(7)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
                    {Object.keys(documentFiles).length > 0 ? (
                      <div className="space-y-1.5 text-sm">
                        {Object.entries(documentFiles).map(([category, files]) => {
                          if (files.length === 0) return null;
                          const docDef = REQUIRED_DOCS_PROFESSIONAL.find((d) => d.key === category);
                          return (
                            <div key={category} className="flex items-center gap-2 text-gray-700">
                              <Check size={14} className="text-green-600 shrink-0" />
                              <span className="font-medium">{docDef?.label || category}</span>
                              <span className="text-gray-400">({files.length} file{files.length > 1 ? "s" : ""})</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No documents uploaded</p>
                    )}
                  </div>

                  {/* References Summary */}
                  {formData.references && (
                    <div className="border border-gray-200 rounded-lg p-5 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-900">References</h3>
                        <button onClick={() => setCurrentStep(7)} className="text-blue-600 text-sm hover:underline">Edit</button>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.references}</p>
                    </div>
                  )}

                  {/* Authorization Summary */}
                  <div className="border border-gray-200 rounded-lg p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Authorization & Signature</h3>
                      <button onClick={() => setCurrentStep(8)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Agreed to Terms" value={formData.agreeTerms || "Not agreed"} />
                      <SummaryRow label="Electronic Signature" value={formData.signatureName || "Not signed"} />
                      <SummaryRow label="Signature Date" value={formData.signatureDate || "Not set"} />
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(e) => updateField("consent", e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <span className="text-xs text-gray-700 leading-relaxed">
                      By submitting this application, I confirm that all information provided is accurate. I consent to receive communications from College Place Apartments including emails, phone calls, and text messages at the number provided. Message &amp; data rates may apply. I can opt out anytime by replying STOP. Consent is not a condition of purchase or tenancy. View our{" "}
                      <a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>
                      {" "}and{" "}
                      <a href="/terms" className="text-blue-600 underline hover:text-blue-800">Terms &amp; Conditions</a>.
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

              {currentStep < STEPS.length ? (
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
