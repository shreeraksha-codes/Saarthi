import type { Application } from "./api/client";

export type StepStatus = "done" | "active" | "upcoming";
export interface TimelineStep {
  id: string;
  label: string;
  status: StepStatus;
}

export const STATES: Record<string, string[]> = {
  Maharashtra: ["Pune West (MH-12)", "Mumbai Central (MH-01)"],
  Karnataka: ["Bengaluru Central (KA-01)"],
  Delhi: ["Sarai Kale Khan (DL-01)"],
  "Tamil Nadu": ["Chennai Central (TN-09)"],
};

export const VEHICLES = [
  "LMV — Light Motor Vehicle",
  "MCWG — Motorcycle with Gear",
  "MCWOG — Motorcycle without Gear",
] as const;

const FIRST_LL_ORDER = [
  "application-started",
  "application-entry",
  "eligibility",
  "personal-details",
  "documents",
  "fitness",
  "review",
  "payment",
  "submitted",
  "ll-preparation",
  "ll-test",
  "ll-result",
  "ll-issued",
  "waiting-period",
  "dl-eligible",
  "dl-review",
  "dl-payment",
  "dl-appointment",
  "dl-rto-preparation",
  "dl-driving-test",
  "dl-driving-result",
  "dl-issued",
  "dl-printed",
  "dl-dispatched",
  "dl-delivered",
] as const;

const EXISTING_LL_ORDER = [
  "existing-ll-details",
  "dl-review",
  "dl-payment",
  "dl-appointment",
  "dl-rto-preparation",
  "dl-driving-test",
  "dl-driving-result",
  "dl-issued",
  "dl-printed",
  "dl-dispatched",
  "dl-delivered",
] as const;

const FIRST_LL_LABELS: Record<string, string> = {
  "application-started": "Application started",
  "application-entry": "State/RTO",
  eligibility: "Eligibility",
  "personal-details": "Personal details",
  documents: "Documents",
  fitness: "Fitness",
  review: "Review",
  payment: "Payment",
  submitted: "Submitted",
  "ll-preparation": "LL preparation",
  "ll-test": "LL test",
  "ll-result": "LL result",
  "ll-issued": "LL issued",
  "waiting-period": "Waiting period",
  "dl-eligible": "DL eligible",
  "dl-review": "DL application",
  "dl-payment": "DL payment",
  "dl-appointment": "Appointment",
  "dl-rto-preparation": "RTO preparation",
  "dl-driving-test": "Driving test",
  "dl-driving-result": "Result",
  "dl-issued": "Licence issued",
  "dl-printed": "Printed",
  "dl-dispatched": "Dispatched",
  "dl-delivered": "Delivered",
};

const EXISTING_LL_LABELS: Record<string, string> = {
  "existing-ll-details": "Existing LL",
  "dl-review": "DL application",
  "dl-payment": "DL payment",
  "dl-appointment": "Appointment",
  "dl-rto-preparation": "RTO preparation",
  "dl-driving-test": "Driving test",
  "dl-driving-result": "Result",
  "dl-issued": "Licence issued",
  "dl-printed": "Printed",
  "dl-dispatched": "Dispatched",
  "dl-delivered": "Delivered",
};

export function canonicalStep(application: Application): string {
  const step = application.currentStep;
  const delivery = application.dl?.licence?.deliveryStatus;
  if (step === "dl-delivery" || step.startsWith("dl-printed") || step.startsWith("dl-dispatched") || step.startsWith("dl-issued") || step === "dl-delivered") {
    if (delivery === "delivered" || application.status === "dl-delivered") return "dl-delivered";
    if (delivery === "dispatched" || application.status === "dl-dispatched") return "dl-dispatched";
    if (delivery === "printed" || application.status === "dl-printed") return "dl-printed";
    return "dl-issued";
  }
  if (step === "state-rto") return "application-entry";
  if (step === "started") return "application-entry";
  return step;
}

export function timelineFor(application: Application): TimelineStep[] {
  const current = canonicalStep(application);
  const order = application.intent === "existing-ll" ? EXISTING_LL_ORDER : FIRST_LL_ORDER;
  const labels = application.intent === "existing-ll" ? EXISTING_LL_LABELS : FIRST_LL_LABELS;
  let activeId = current;
  if (application.intent === "first-ll" && (current === "application-entry" || current === "application-started")) {
    activeId = "application-entry";
  }
  const activeIndex = Math.max(0, order.indexOf(activeId as any));
  return order.map((id, index) => {
    let status: StepStatus = "upcoming";
    if (id === "application-started") status = "done";
    else if (index < activeIndex) status = "done";
    else if (index === activeIndex) status = "active";
    return { id, label: labels[id] || id, status };
  });
}

export function waitingDays(application: Application): number {
  if (!application.licence) return 0;
  return Math.max(0, Math.ceil((new Date(application.licence.eligibleForDlAt).getTime() - Date.now()) / 86400000));
}

export function applicantAge(dob: string): number | null {
  if (!dob || Number.isNaN(Date.parse(dob))) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function minimumAgeForVehicle(vehicle: string): number {
  return /without gear|mcwog/i.test(vehicle) ? 16 : 18;
}

export function eligibilityResult(dob: string, vehicle: string): { age: number | null; minAge: number; ready: boolean; summary: string } {
  const age = applicantAge(dob);
  const minAge = minimumAgeForVehicle(vehicle);
  const ready = age !== null && age >= minAge && Boolean(vehicle);
  const summary = !vehicle || age === null
    ? "Choose a vehicle class and date of birth to see demo eligibility guidance."
    : ready
      ? `In this demo you appear old enough (${age}) for ${vehicle}. Your state/RTO confirms the official rule.`
      : `In this demo the usual minimum age for ${vehicle} is ${minAge}. You are ${age}. This is guidance only — confirm with your state/RTO.`;
  return { age, minAge, ready, summary };
}

export function needsMedicalFitness(dob: string): boolean {
  const age = applicantAge(dob);
  return age !== null && age >= 40;
}

export interface NextActionCopy {
  title: string;
  need: string;
  why: string;
  after: string;
}

export function nextActionCopy(application: Application): NextActionCopy {
  const step = canonicalStep(application);
  const days = waitingDays(application);
  const failedTest = application.test && !application.test.passed;
  const failedDriving = application.dl?.drivingTest && !application.dl.drivingTest.passed;
  const copies: Record<string, NextActionCopy> = {
    "application-entry": {
      title: "Choose your state and RTO",
      need: "Select the state and RTO office where you will apply. Requirements can vary by location.",
      why: "Your documents, fees and appointments depend on the RTO you choose.",
      after: "We will check demo eligibility for your vehicle class.",
    },
    eligibility: {
      title: "Check demo eligibility",
      need: "Tell us your date of birth and the vehicle class you want to learn.",
      why: "Age and vehicle category affect what you can apply for. This is demo guidance, not a government decision.",
      after: "You can enter personal details that match your documents.",
    },
    "personal-details": {
      title: "Enter your personal details",
      need: "Add your name, mobile number and address exactly as they appear on your documents.",
      why: "Mismatched details are a common reason applications are delayed.",
      after: "You will prepare a document checklist.",
    },
    documents: {
      title: "Prepare your documents",
      need: "Mark identity, address and photo/signature evidence as ready, or replace a rejected item.",
      why: "Your RTO needs readable proof before the learner stage can continue.",
      after: "You will complete a fitness declaration.",
    },
    fitness: {
      title: "Complete the fitness declaration",
      need: needsMedicalFitness(String(application.details?.dob || ""))
        ? "Read the Form 1A guidance for your age group and confirm you understand this demo step."
        : "Read the Form 1 self-declaration guidance and confirm you understand this demo step.",
      why: "Fitness requirements can differ by age and vehicle class.",
      after: "You will review everything before payment.",
    },
    review: {
      title: "Review your application",
      need: "Check every section. Use Edit if something is wrong.",
      why: "It is easier to correct details now than after payment.",
      after: "You will pay the simulated learner-licence fee.",
    },
    payment: {
      title: application.payment?.status === "failed" ? "Retry the demo payment" : "Pay the demo learner-licence fee",
      need: application.payment?.status === "failed"
        ? `Check reference ${application.payment.reference} before retrying. Do not treat this as a real payment.`
        : "Choose UPI, card or net banking. No real money is charged.",
      why: "A recorded fee is required before the learner test stage in this demo.",
      after: "Your application will be marked submitted.",
    },
    submitted: {
      title: "Your application is submitted",
      need: "Keep your application reference. You can continue when you are ready to prepare for the test.",
      why: "Submission locks in the details you reviewed and the demo payment.",
      after: "You will get a short learner-test preparation guide.",
    },
    "ll-preparation": {
      title: "Prepare for the learner test",
      need: "Review road signs and safe driving rules. This does not replace an official tutorial.",
      why: "A short knowledge test is the next demo milestone.",
      after: "You can start the five-question learner test.",
    },
    "ll-test": {
      title: "Take the learner test",
      need: "Answer all five questions. You need 4 correct answers in this demo.",
      why: "The learner test is how this journey issues a demo Learner's Licence.",
      after: "You will see a pass or another-attempt result.",
    },
    "ll-result": {
      title: failedTest ? "Try the learner test again" : "Your learner test is complete",
      need: failedTest
        ? "Review the practice resources, then attempt the test again."
        : "Issue your simulated Learner's Licence record.",
      why: failedTest ? "Another attempt is normal. This result is not official." : "Passing unlocks the waiting period before a Driving Licence.",
      after: failedTest ? "You can practise and retake the demo test." : "Your LL will show a 6-month validity and a 30-day wait.",
    },
    "ll-issued": {
      title: "Your Learner's Licence is issued — Demo",
      need: "Download or print the simulated record and keep the reference.",
      why: "You will need these details during the waiting period and RTO visit.",
      after: "A 30-day minimum wait applies before the Driving Licence stage.",
    },
    "waiting-period": {
      title: days === 0 ? "Your waiting period is complete" : `${days} days remaining in the waiting period`,
      need: days === 0
        ? "You can continue to the Driving Licence stage."
        : "Practise safely with an eligible supervisor and keep your LL details ready.",
      why: "A Learner's Licence usually has a minimum holding period before a full licence.",
      after: "The Driving Licence application will reuse your saved details.",
    },
    "dl-eligible": {
      title: "You can apply for your Driving Licence",
      need: "Confirm the details carried forward from your learner journey.",
      why: "You should not have to enter the same information twice.",
      after: "You will review, pay the demo DL fee, and book a test appointment.",
    },
    "existing-ll-details": {
      title: "Confirm your existing Learner's Licence",
      need: "Enter your LL number, issue date, vehicle class and personal details.",
      why: "The Driving Licence application must match your current learner record.",
      after: "Those details are carried into the DL application.",
    },
    "dl-review": {
      title: "Review your Driving Licence application",
      need: "Check name, address, vehicle class and learner-licence reference.",
      why: "Carried-forward details still need your confirmation.",
      after: "You will pay the simulated Driving Licence fee.",
    },
    "dl-payment": {
      title: application.dl?.payment?.status === "failed" ? "Retry the Driving Licence demo payment" : "Pay the demo Driving Licence fee",
      need: "Choose a method. If a payment failed, use the saved reference before retrying.",
      why: "The appointment stage unlocks after a successful demo payment.",
      after: "You can book a driving-test slot.",
    },
    "dl-appointment": {
      title: "Book your driving-test appointment",
      need: "Choose a demo slot, or reschedule/cancel if you already booked one.",
      why: "An RTO visit needs a confirmed date and time.",
      after: "You will get a preparation checklist for the visit.",
    },
    "dl-rto-preparation": {
      title: "Prepare for your RTO visit",
      need: "Bring originals, your appointment slip, application reference and an appropriate vehicle.",
      why: "Online steps do not replace the in-person test where required.",
      after: "You can start the demo driving test.",
    },
    "dl-driving-test": {
      title: "Complete the demo driving test",
      need: "Follow the preparation, then record a pass or another attempt. This does not assess real driving.",
      why: "A driving test is required before a full licence can be issued.",
      after: "You will see a clear pass or retest result.",
    },
    "dl-driving-result": {
      title: failedDriving ? "Your test needs another attempt" : "Driving test passed",
      need: failedDriving
        ? "Practise the listed skills, then retry the demo test. Real retest rules vary by RTO."
        : "Issue your simulated Driving Licence record.",
      why: failedDriving ? "A failed attempt is not the end of the journey." : "Passing moves the licence into issuance and delivery.",
      after: failedDriving ? "You can retry when you are ready." : "You can follow printed, dispatched and delivered updates.",
    },
    "dl-issued": {
      title: "Driving Licence issued — Demo",
      need: "Keep the simulated licence reference. You can print this record.",
      why: "Issuance is the start of the delivery timeline.",
      after: "The demo record can be marked printed, dispatched, then delivered.",
    },
    "dl-printed": {
      title: "Your licence is being printed",
      need: "No action is required. You can check this page again for the next update.",
      why: "Smart-card printing happens after issuance in a real journey.",
      after: "The next demo status is dispatched.",
    },
    "dl-dispatched": {
      title: "Your licence is on its way",
      need: "Keep your delivery address details handy. This dispatch is simulated.",
      why: "Many RTOs post the smart card to the address on the application.",
      after: "The final demo status is delivered.",
    },
    "dl-delivered": {
      title: "Your driving licence journey is complete",
      need: "You can print the simulated record. No government licence was issued.",
      why: "You now have one saved story from application to delivery.",
      after: "You can revisit Resources if you want to review the process.",
    },
  };
  return copies[step] || {
    title: "Continue your saved journey",
    need: "Complete the highlighted next action on this screen.",
    why: "Your progress is saved on the server.",
    after: "The next stage unlocks when this demo requirement is complete.",
  };
}

// Map internal states to 11 user-facing milestones
function mapToSimplifiedStep(internalStep: string, application: Application): string {
  const step = internalStep;
  // Learner's Licence flow
  if (step === "application-started" || step === "application-entry" || step === "eligibility") return "application-started";
  if (step === "personal-details") return "personal-details";
  if (step === "documents") return "documents";
  if (step === "fitness" || step === "review" || step === "payment" || step === "submitted") return "payment";
  if (step === "ll-preparation" || step === "ll-test" || step === "ll-result") return "ll-test";
  if (step === "ll-issued") return "ll-issued";
  if (step === "waiting-period" || step === "dl-eligible") return "waiting-period";
  // Driving Licence flow
  if (step === "existing-ll-details") return "application-started";
  if (step === "dl-review") return "dl-review";
  if (step === "dl-payment" || step === "dl-appointment" || step === "dl-rto-preparation") return "dl-review";
  if (step === "dl-driving-test" || step === "dl-driving-result") return "dl-driving-test";
  if (step === "dl-issued") return "dl-issued";
  if (step === "dl-printed" || step === "dl-dispatched" || step === "dl-delivered") return "dl-delivered";
  return step;
}

export function simplifiedTimelineFor(application: Application): TimelineStep[] {
  const current = canonicalStep(application);
  const simplified = mapToSimplifiedStep(current, application);
  
  const order = ["application-started", "personal-details", "documents", "payment", "ll-test", "ll-issued", "waiting-period", "dl-review", "dl-driving-test", "dl-issued", "dl-delivered"] as const;
  
  const labels = {
    "application-started": "Application started",
    "personal-details": "Personal details",
    "documents": "Documents",
    "payment": "Payment",
    "ll-test": "Learner's Licence test",
    "ll-issued": "Learner's Licence issued",
    "waiting-period": "30-day waiting period",
    "dl-review": "Apply for Driving Licence",
    "dl-driving-test": "Driving test",
    "dl-issued": "Licence issued",
    "dl-delivered": "Delivery",
  } as const;

  const activeIndex = Math.max(0, order.indexOf(simplified as any));
  return order.map((id, index) => {
    let status: StepStatus = "upcoming";
    if (index < activeIndex) status = "done";
    else if (index === activeIndex) status = "active";
    return { id, label: labels[id as keyof typeof labels], status };
  });
}

export function applyTarget(application: Application, focus?: string | null): string {
  // Gate Documents panel - only show if first-ll AND has saved personal details
  if (focus === "documents") {
    const current = canonicalStep(application);
    const hasPersonalDetails = application.details?.name && application.details?.phone && application.details?.address && application.state && application.rto;
    
    if (application.intent === "first-ll" && hasPersonalDetails && (current === "documents" || ["personal-details", "documents", "fitness", "review", "payment", "submitted", "ll-preparation", "ll-test", "ll-result", "ll-issued", "waiting-period", "dl-eligible"].includes(current))) {
      return "documents";
    }
    // Return special gate step to show "apply first" message
    return "documents-apply-first";
  }
  
  // Gate Payments panel - only show if user has completed through payment stage or beyond
  if (focus === "payment") {
    const current = canonicalStep(application);
    const isReadyForPayment = ["payment", "submitted", "ll-preparation", "ll-test", "ll-result", "ll-issued", "waiting-period", "dl-eligible", "dl-review", "dl-payment", "dl-appointment", "dl-rto-preparation", "dl-driving-test", "dl-driving-result", "dl-issued", "dl-printed", "dl-dispatched", "dl-delivered"].includes(current);
    
    if (!isReadyForPayment) {
      // User hasn't completed personal details / documents yet
      return "payment-apply-first";
    }
    
    // Show payment history or current payment
    const isDlPayment = application.intent === "existing-ll" || current.startsWith("dl-");
    if (isDlPayment) return application.dl?.payment ? "payment-view" : "payment-apply-first";
    return application.payment ? "payment-view" : "payment-apply-first";
  }
  
  // Gate Appointments panel - only show if DL payment successful AND booking not yet done
  if (focus === "appointment") {
    const current = canonicalStep(application);
    const dlPaymentSuccessful = application.dl?.payment?.status === "successful";
    
    if (!dlPaymentSuccessful) {
      return "appointment-apply-first";
    }
    
    return application.dl?.appointment?.status === "booked" ? "appointment-view" : "appointment-apply-first";
  }
  
  return canonicalStep(application);
}
