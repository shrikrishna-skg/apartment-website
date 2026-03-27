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
  ShieldCheck,
  PenTool,
  Plus,
  Trash2,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Address & Education", icon: MapPin },
  { label: "General Info", icon: FileText },
  { label: "Employment & Income", icon: Briefcase },
  { label: "References & History", icon: Users },
  { label: "Background", icon: ShieldCheck },
  { label: "Documents", icon: Upload },
  { label: "Authorization", icon: PenTool },
  { label: "Review & Submit", icon: ClipboardCheck },
];

interface DocumentFile {
  file: File;
  category: string;
}

const REQUIRED_DOCS_STUDENT = [
  {
    key: "passportPhoto",
    label: "Passport Size Photo",
    description: "Upload a clear passport-size photograph",
    required: true,
    multiple: true,
    maxSize: 10,
  },
  {
    key: "studentId",
    label: "Student ID",
    description: "Upload a clear photo or scan of your student ID card",
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
    label: "Visa / I-20 (If Applicable)",
    description: "Required for international students on a student visa",
    required: false,
    internationalRequired: true,
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
    label: "Proof of Income (Pay stubs, Financial Aid, or Sponsor Letter)",
    description: "Providing proof of income will help expedite and strengthen your application",
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
  gender: string;
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
  addressType: string;
  city: string;
  state: string;
  zipCode: string;
  universityName: string;
  studentId: string;
  courseName: string;
  courseStartDate: string;
  expectedGraduation: string;
  advisorPhone: string;
  advisorEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  emergencyRelationship: string;
  emergencyContact2Name: string;
  emergencyContact2Phone: string;
  emergencyContact2Email: string;
  emergencyRelationship2: string;
  // Step 3
  employmentStatus: string;
  employerName: string;
  monthlyIncome: string;
  incomeSource: string;
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
  // Step 5 - Background Check
  filedBankruptcy: string;
  bankruptcyDetails: string;
  evictedFromTenancy: string;
  evictionDetails: string;
  convictedFelony: string;
  felonyDetails: string;
  arrestedOrConvicted: string;
  arrestDetails: string;
  // General Info - Pets & Vehicle
  hasPets: string;
  hasVehicle: string;
  vehicle1Make: string;
  vehicle1Year: string;
  vehicle1Color: string;
  vehicle1Plate: string;
  // Authorization
  agreeTerms: string;
  signatureName: string;
  signatureDate: string;
  consent: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  ssn: "",
  maritalStatus: "Single",
  gender: "",
  drivingLicense: "",
  dateOfBirth: "",
  email: "",
  mobileNumber: "",
  specificRequest: "",
  housingRequirement: "",
  preferredMoveIn: "",
  leaseDuration: "",
  currentAddress: "",
  addressType: "",
  city: "",
  state: "",
  zipCode: "",
  universityName: "Middle Tennessee State University",
  studentId: "",
  courseName: "",
  courseStartDate: "",
  expectedGraduation: "",
  advisorPhone: "",
  advisorEmail: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactEmail: "",
  emergencyRelationship: "",
  emergencyContact2Name: "",
  emergencyContact2Phone: "",
  emergencyContact2Email: "",
  emergencyRelationship2: "",
  employmentStatus: "Student",
  employerName: "",
  monthlyIncome: "",
  incomeSource: "",
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
  filedBankruptcy: "",
  bankruptcyDetails: "",
  evictedFromTenancy: "",
  evictionDetails: "",
  convictedFelony: "",
  felonyDetails: "",
  arrestedOrConvicted: "",
  arrestDetails: "",
  hasPets: "",
  hasVehicle: "",
  vehicle1Make: "",
  vehicle1Year: "",
  vehicle1Color: "",
  vehicle1Plate: "",
  agreeTerms: "",
  signatureName: "",
  signatureDate: new Date().toLocaleString("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }) + " CT",
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
      if (!formData.fullName.trim()) newErrors.push("Full Name is required");
      if (!formData.email.trim()) newErrors.push("Email is required");
      if (!formData.mobileNumber.trim()) newErrors.push("Mobile Number is required");
      if (!formData.dateOfBirth) newErrors.push("Date of Birth is required");
      if (!formData.gender) newErrors.push("Gender is required");
      if (!formData.housingRequirement) newErrors.push("Housing Requirement is required");
      if (!formData.preferredMoveIn) newErrors.push("Preferred Move-In Date is required");
      if (!formData.leaseDuration) newErrors.push("Lease Duration is required");
    }

    if (currentStep === 2) {
      if (!formData.currentAddress.trim()) newErrors.push("Current Address is required");
      if (!formData.addressType) newErrors.push("Address Type is required");
      if (!formData.city.trim()) newErrors.push("City is required");
      if (!formData.state.trim()) newErrors.push("State is required");
      if (!formData.zipCode.trim()) newErrors.push("Zip Code is required");
      if (!formData.universityName.trim()) newErrors.push("University Name is required");
      if (!formData.studentId.trim()) newErrors.push("Student ID is required");
      if (!formData.courseName.trim()) newErrors.push("Course Name is required");
      if (!formData.courseStartDate) newErrors.push("Course Start Date is required");
      if (!formData.expectedGraduation) newErrors.push("Expected Graduation is required");
      if (!formData.emergencyContactName.trim()) newErrors.push("Emergency Contact 1 Name is required");
      if (!formData.emergencyContactPhone.trim()) newErrors.push("Emergency Contact 1 Phone is required");
    }

    if (currentStep === 3) {
      if (!formData.hasPets) newErrors.push("Pet question is required");
      if (!formData.hasVehicle) newErrors.push("Vehicle question is required");
    }

    if (currentStep === 5) {
      if (!formData.previousLandlordName.trim()) newErrors.push("Landlord Name is required");
      if (!formData.landlordPhone.trim()) newErrors.push("Landlord Phone is required");
      if (!formData.landlordAddress.trim()) newErrors.push("Landlord Address is required");
      if (!formData.reasonForLeaving.trim()) newErrors.push("Reason for Leaving is required");
      if (!formData.lengthOfStay.trim()) newErrors.push("Length of Stay is required");
    }

    if (currentStep === 6) {
      if (!formData.filedBankruptcy) newErrors.push("Bankruptcy question is required");
      if (!formData.evictedFromTenancy) newErrors.push("Eviction question is required");
      if (!formData.convictedFelony) newErrors.push("Felony conviction question is required");
      if (!formData.arrestedOrConvicted) newErrors.push("Arrest/conviction question is required");
    }

    if (currentStep === 7) {
      // Validate required documents
      for (const doc of REQUIRED_DOCS_STUDENT) {
        const isReq = doc.required || (isInternational && (doc as Record<string, unknown>).internationalRequired);
        if (isReq && (!documentFiles[doc.key] || documentFiles[doc.key].length === 0)) {
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
      if (!formData.agreeTerms || formData.agreeTerms !== "Yes, I agree") newErrors.push("You must agree to the terms first (Step 8)");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setVisitedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep((prev) => Math.min(prev + 1, 9));
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
          applicant_type: isInternational ? "international" : "student",
          full_name: formData.fullName,
          ssn: formData.ssn || null,
          marital_status: formData.maritalStatus,
          gender: formData.gender || null,
          driving_license: formData.drivingLicense || null,
          date_of_birth: formData.dateOfBirth || null,
          email: formData.email,
          mobile_number: formData.mobileNumber,
          specific_request: formData.specificRequest || null,
          housing_requirement: formData.housingRequirement || null,
          preferred_move_in: formData.preferredMoveIn || null,
          lease_duration: formData.leaseDuration || null,
          current_address: formData.currentAddress || null,
          address_type: formData.addressType || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zipCode || null,
          university_name: formData.universityName || null,
          student_id: formData.studentId || null,
          course_name: formData.courseName || null,
          course_start_date: formData.courseStartDate || null,
          expected_graduation: formData.expectedGraduation || null,
          advisor_phone: formData.advisorPhone || null,
          advisor_email: formData.advisorEmail || null,
          emergency_contact_name: formData.emergencyContactName || null,
          emergency_contact_phone: formData.emergencyContactPhone || null,
          emergency_contact_email: formData.emergencyContactEmail || null,
          emergency_relationship: formData.emergencyRelationship || null,
          emergency_contact2_name: formData.emergencyContact2Name || null,
          emergency_contact2_phone: formData.emergencyContact2Phone || null,
          emergency_contact2_email: formData.emergencyContact2Email || null,
          emergency_relationship2: formData.emergencyRelationship2 || null,
          employment_status: formData.employmentStatus || null,
          employer_name: formData.employerName || null,
          monthly_income: formData.monthlyIncome || null,
          income_source: formData.incomeSource || null,
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
          filed_bankruptcy: formData.filedBankruptcy === "Yes",
          bankruptcy_details: formData.bankruptcyDetails || null,
          evicted_from_tenancy: formData.evictedFromTenancy === "Yes",
          eviction_details: formData.evictionDetails || null,
          convicted_felony: formData.convictedFelony === "Yes",
          felony_details: formData.felonyDetails || null,
          arrested_or_convicted: formData.arrestedOrConvicted === "Yes",
          arrest_details: formData.arrestDetails || null,
          has_pets: formData.hasPets === "Yes",
          pets: formData.hasPets === "Yes" ? pets : [],
          has_vehicle: formData.hasVehicle === "Yes",
          vehicle1_make: formData.vehicle1Make || null,
          vehicle1_year: formData.vehicle1Year || null,
          vehicle1_color: formData.vehicle1Color || null,
          vehicle1_plate: formData.vehicle1Plate || null,
          agree_terms: formData.agreeTerms === "Yes, I agree",
          signature_name: formData.signatureName || null,
          signature_date: formData.signatureDate || null,
          consent: formData.agreeTerms === "Yes, I agree",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }
      const appData = await res.json();

      // Upload documents by category (best-effort, don't block submission)
      if (appData.id) {
        const allDocs = Object.values(documentFiles).flat();
        for (const doc of allDocs) {
          try {
            const fileForm = new FormData();
            fileForm.append("file", doc.file);
            fileForm.append("application_id", appData.id);
            fileForm.append("document_label", doc.category);
            await fetch("/api/documents/upload", { method: "POST", body: fileForm });
          } catch {
            // Document upload failure shouldn't block the application
          }
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div>
                      {renderRadioGroup("Marital Status", "maritalStatus", [
                        "Single",
                        "Married",
                      ])}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Female", "Male", "Other", "Prefer not to say"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => updateField("gender", g)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                              formData.gender === g
                                ? "bg-[#1a73e8] text-white border-[#1a73e8]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
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
                      housingOptions,
                      true
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Preferred Move-In Date<span className="text-red-600 ml-1">*</span>
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
                        Lease Duration<span className="text-red-600 ml-1">*</span>
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
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">
                        Address Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Own", "Rental", "Living with Friends/Family", "Other"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateField("addressType", opt)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                              formData.addressType === opt
                                ? "bg-[#1a73e8] text-white border-[#1a73e8]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
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
                        "University name",
                        true
                      )}
                      {renderInput(
                        "Student ID",
                        "studentId",
                        "text",
                        "Student ID number",
                        true
                      )}
                      {renderInput(
                        "Course Name",
                        "courseName",
                        "text",
                        "e.g., Computer Science, Business Administration",
                        true
                      )}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          Course Start Date<span className="text-red-600 ml-1">*</span>
                        </label>
                        <DatePicker
                          value={formData.courseStartDate}
                          onChange={(val) => updateField("courseStartDate", val)}
                          placeholder="Select course start date"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          Expected Graduation<span className="text-red-600 ml-1">*</span>
                        </label>
                        <DatePicker
                          value={formData.expectedGraduation}
                          onChange={(val) => updateField("expectedGraduation", val)}
                          minDate={new Date()}
                          placeholder="Select graduation date"
                        />
                      </div>
                      {renderInput(
                        "Advisor Phone",
                        "advisorPhone",
                        "tel",
                        "(000) 000-0000"
                      )}
                      {renderInput(
                        "Advisor Email",
                        "advisorEmail",
                        "email",
                        "advisor@university.edu"
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-8 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Emergency Contact 1
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
                        "Contact Email",
                        "emergencyContactEmail",
                        "email",
                        "contact@email.com"
                      )}
                      {renderInput(
                        "Relationship",
                        "emergencyRelationship",
                        "text",
                        "e.g., Parent, Sibling"
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-8 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Emergency Contact 2
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {renderInput(
                        "Contact Name",
                        "emergencyContact2Name",
                        "text",
                        "Full name"
                      )}
                      {renderInput(
                        "Contact Phone",
                        "emergencyContact2Phone",
                        "tel",
                        "(000) 000-0000"
                      )}
                      {renderInput(
                        "Contact Email",
                        "emergencyContact2Email",
                        "email",
                        "contact@email.com"
                      )}
                      {renderInput(
                        "Relationship",
                        "emergencyRelationship2",
                        "text",
                        "e.g., Parent, Sibling"
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3 - General Info (Pets & Vehicle) */}
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
                    <FileText size={20} className="text-blue-600" />
                    General Information
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pet Information</h3>
                      <div className="mb-5">
                        {renderRadioGroup("Do you have pets? *", "hasPets", ["Yes", "No"], true)}
                      </div>

                      {formData.hasPets === "Yes" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-4 pl-1 border-l-2 border-blue-200 ml-2"
                        >
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
                                  <input type="text" className="input-glass" placeholder="e.g., Dog - Golden Retriever" value={pet.type} onChange={(e) => updatePet(idx, "type", e.target.value)} />
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
                        </motion.div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                      <div className="mb-5">
                        {renderRadioGroup("Do you have a vehicle? *", "hasVehicle", ["Yes", "No"], true)}
                      </div>

                      {formData.hasVehicle === "Yes" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-5 pl-1 border-l-2 border-blue-200 ml-2"
                        >
                          <div className="pl-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {renderInput("Vehicle Make / Model", "vehicle1Make", "text", "e.g., Toyota Camry")}
                            {renderInput("Year", "vehicle1Year", "text", "e.g., 2022")}
                            {renderInput("Color", "vehicle1Color", "text", "e.g., Silver")}
                            {renderInput("License Plate", "vehicle1Plate", "text", "e.g., ABC-1234")}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4 - Employment & Income */}
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

                </motion.div>
              )}

              {/* Step 5 - References & History */}
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
                    <Users size={20} className="text-blue-600" />
                    References & Rental History
                  </h2>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Previous Landlord <span className="text-red-500 text-sm">*</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {renderInput(
                      "Landlord Name",
                      "previousLandlordName",
                      "text",
                      "Full name",
                      true
                    )}
                    {renderInput(
                      "Landlord Phone",
                      "landlordPhone",
                      "tel",
                      "(000) 000-0000",
                      true
                    )}
                    <div className="sm:col-span-2">
                      {renderInput(
                        "Landlord Address",
                        "landlordAddress",
                        "text",
                        "Property address",
                        true
                      )}
                    </div>
                    {renderInput(
                      "Reason for Leaving",
                      "reasonForLeaving",
                      "text",
                      "e.g., End of lease, relocation",
                      true
                    )}
                    {renderInput(
                      "Length of Stay",
                      "lengthOfStay",
                      "text",
                      "e.g., 12 months",
                      true
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

              {/* Step 6 - Background Check */}
              {currentStep === 6 && (
                <motion.div
                  key="step6bg"
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
                    ])}
                    {formData.filedBankruptcy === "Yes" && (
                      <div className="pl-4 border-l-2 border-blue-200 ml-2">
                        {renderInput("Please provide details", "bankruptcyDetails", "text", "Explain the circumstances...")}
                      </div>
                    )}

                    {renderRadioGroup("Been Evicted from Tenancy?", "evictedFromTenancy", [
                      "Yes",
                      "No",
                    ])}
                    {formData.evictedFromTenancy === "Yes" && (
                      <div className="pl-4 border-l-2 border-blue-200 ml-2">
                        {renderInput("Please provide details", "evictionDetails", "text", "Explain the circumstances...")}
                      </div>
                    )}

                    {renderRadioGroup("Been convicted of a felony?", "convictedFelony", [
                      "Yes",
                      "No",
                    ])}
                    {formData.convictedFelony === "Yes" && (
                      <div className="pl-4 border-l-2 border-blue-200 ml-2">
                        {renderInput("Please provide details", "felonyDetails", "text", "Explain the circumstances...")}
                      </div>
                    )}

                    {renderRadioGroup("Have you ever been arrested or convicted of a felony/misdemeanor?", "arrestedOrConvicted", [
                      "Yes",
                      "No",
                    ])}
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
                    {REQUIRED_DOCS_STUDENT.map((doc) => {
                      const isRequiredForUser = doc.required || (isInternational && !!(doc as Record<string, unknown>).internationalRequired);
                      const files = documentFiles[doc.key] || [];

                      // Hide visa for non-international students
                      if (!isInternational && doc.key === "visa") return null;

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
                    ])}

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
                  key="step8review"
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
                      <SummaryRow label="Gender" value={formData.gender || "Not provided"} />
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
                      <SummaryRow label="Address Type" value={formData.addressType || "Not selected"} />
                      <SummaryRow label="City" value={formData.city} />
                      <SummaryRow label="State" value={formData.state} />
                      <SummaryRow label="Zip Code" value={formData.zipCode} />
                      <SummaryRow label="University" value={formData.universityName} />
                      <SummaryRow label="Student ID" value={formData.studentId} />
                      <SummaryRow label="Course Name" value={formData.courseName} />
                      <SummaryRow label="Course Start Date" value={formData.courseStartDate || "Not set"} />
                      <SummaryRow label="Expected Graduation" value={formData.expectedGraduation || "Not set"} />
                      <SummaryRow label="Advisor Phone" value={formData.advisorPhone || "Not provided"} />
                      <SummaryRow label="Advisor Email" value={formData.advisorEmail || "Not provided"} />
                    </div>
                    <div className="border-t border-gray-100 mt-3 pt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Emergency Contact 1</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                        <SummaryRow label="Name" value={formData.emergencyContactName} />
                        <SummaryRow label="Phone" value={formData.emergencyContactPhone} />
                        <SummaryRow label="Email" value={formData.emergencyContactEmail || "Not provided"} />
                        <SummaryRow label="Relationship" value={formData.emergencyRelationship || "Not provided"} />
                      </div>
                    </div>
                    <div className="border-t border-gray-100 mt-3 pt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Emergency Contact 2</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                        <SummaryRow label="Name" value={formData.emergencyContact2Name} />
                        <SummaryRow label="Phone" value={formData.emergencyContact2Phone} />
                        <SummaryRow label="Email" value={formData.emergencyContact2Email || "Not provided"} />
                        <SummaryRow label="Relationship" value={formData.emergencyRelationship2 || "Not provided"} />
                      </div>
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
                    </div>
                  </div>

                  {/* References Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      References & History
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Previous Landlord" value={formData.previousLandlordName} />
                      <SummaryRow label="Landlord Phone" value={formData.landlordPhone} />
                      <SummaryRow label="Landlord Address" value={formData.landlordAddress} />
                      <SummaryRow label="Reason for Leaving" value={formData.reasonForLeaving} />
                      <SummaryRow label="Length of Stay" value={formData.lengthOfStay} />
                      <SummaryRow label="Reference 1" value={formData.ref1Name ? `${formData.ref1Name} (${formData.ref1Relationship})` : "N/A"} />
                      <SummaryRow label="Reference 2" value={formData.ref2Name ? `${formData.ref2Name} (${formData.ref2Relationship})` : "N/A"} />
                    </div>
                  </div>

                  {/* General Info Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      General Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Has Pets" value={formData.hasPets || "Not answered"} />
                      {formData.hasPets === "Yes" && pets.map((pet, idx) => (
                        <div key={idx} className="col-span-2 pl-2 border-l-2 border-blue-100 mb-1">
                          <span className="text-xs font-semibold text-gray-500">Pet {idx + 1}</span>
                          <SummaryRow label="Type" value={pet.type || "N/A"} />
                          <SummaryRow label="Weight" value={pet.weight || "N/A"} />
                          <SummaryRow label="Age" value={pet.age || "N/A"} />
                          <SummaryRow label="Category" value={pet.category || "N/A"} />
                        </div>
                      ))}
                      <SummaryRow label="Has Vehicle" value={formData.hasVehicle || "Not answered"} />
                      {formData.hasVehicle === "Yes" && (
                        <>
                          <SummaryRow label="Vehicle" value={formData.vehicle1Make || "N/A"} />
                          <SummaryRow label="Vehicle Year" value={formData.vehicle1Year || "N/A"} />
                          <SummaryRow label="Vehicle Color" value={formData.vehicle1Color || "N/A"} />
                          <SummaryRow label="License Plate" value={formData.vehicle1Plate || "N/A"} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Background Check Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      Background Check
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <SummaryRow label="Filed for Bankruptcy" value={formData.filedBankruptcy || "Not answered"} />
                      <SummaryRow label="Evicted from Tenancy" value={formData.evictedFromTenancy || "Not answered"} />
                      <SummaryRow label="Convicted of Felony" value={formData.convictedFelony || "Not answered"} />
                      <SummaryRow label="Arrested/Convicted" value={formData.arrestedOrConvicted || "Not answered"} />
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div className="glass-subtle p-5 mb-4">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Upload size={16} />
                      Uploaded Documents
                    </h3>
                    {Object.keys(documentFiles).length > 0 ? (
                      <div className="space-y-1.5 text-sm">
                        {Object.entries(documentFiles).map(([category, files]) => {
                          if (files.length === 0) return null;
                          const docDef = REQUIRED_DOCS_STUDENT.find((d) => d.key === category);
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

                  {/* Authorization Summary */}
                  <div className="glass-subtle p-5 mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                      Authorization & Signature
                    </h3>
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
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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

              {currentStep < 9 ? (
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
