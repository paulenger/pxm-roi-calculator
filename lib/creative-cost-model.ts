export type SellerType = "1P" | "3P";
export type CreativeTier = "creative" | "pm";
type Role = "AD" | "DESIGNER" | "COPYWRITER" | "QA" | "AM";
type Scaling = "fixed" | "concept" | "asin";

type Task = {
  phase: string;
  sub: string;
  task: string;
  role: Role;
  min: number;
  scaling: Scaling;
  factor?: number;
};

// These rates, task minutes, and scaling rules are copied from
// Creative_Team_Overhead_Calculator_Client.html.
const RATES: Record<SellerType, Record<Role, number>> = {
  "1P": { AD: 0.93, DESIGNER: 0.14, COPYWRITER: 0.12, QA: 0.1, AM: 0.1 },
  "3P": { AD: 0.87, DESIGNER: 0.14, COPYWRITER: 0.12, QA: 0.1, AM: 0.1 },
};

const TASKS: Task[] = [
  { phase: "Onboarding", sub: "RECEIVAL OF FORMS", task: "Role Assignment & CWU's", role: "AD", min: 15, scaling: "fixed" },
  { phase: "Onboarding", sub: "CONVERSION CHECKLIST", task: "Questionnaire Review", role: "AD", min: 60, scaling: "fixed" },
  { phase: "Onboarding", sub: "CONVERSION CHECKLIST", task: "SLA Formulation", role: "AD", min: 180, scaling: "fixed" },
  { phase: "Onboarding", sub: "CONVERSION CHECKLIST", task: "Spotlight ASIN Determination", role: "AD", min: 30, scaling: "fixed" },
  { phase: "Onboarding", sub: "CONVERSION CHECKLIST", task: "Content Briefs Requested", role: "AD", min: 30, scaling: "fixed" },
  { phase: "Onboarding", sub: "INTERNAL ALIGNMENT", task: "Internal Sync Meeting", role: "AD", min: 30, scaling: "fixed" },
  { phase: "Onboarding", sub: "INTERNAL ALIGNMENT", task: "Complete Checklist Items", role: "AD", min: 60, scaling: "fixed" },
  { phase: "Onboarding", sub: "CONVERSION KICKOFF", task: "Creative Kickoff Meeting", role: "AD", min: 45, scaling: "fixed" },
  { phase: "Onboarding", sub: "CONVERSION KICKOFF", task: "SLA Refinement", role: "AD", min: 20, scaling: "fixed" },
  { phase: "Audits", sub: "AUDIT", task: "Quantitative Audit", role: "AD", min: 20, scaling: "fixed" },
  { phase: "Audits", sub: "AUDIT", task: "Qualitative Audit", role: "AD", min: 60, scaling: "fixed" },
  { phase: "Audits", sub: "AUDIT", task: "Audit Adjustments", role: "AD", min: 25, scaling: "fixed" },
  { phase: "Image Stacks", sub: "CONCEPT", task: "Strategy + Direction", role: "AD", min: 120, scaling: "concept" },
  { phase: "Image Stacks", sub: "CONCEPT", task: "Copywriting", role: "AD", min: 45, scaling: "concept" },
  { phase: "Image Stacks", sub: "CONCEPT", task: "Design", role: "DESIGNER", min: 120, scaling: "concept" },
  { phase: "Image Stacks", sub: "CONCEPT", task: "Concept Edits", role: "DESIGNER", min: 30, scaling: "concept" },
  { phase: "Image Stacks", sub: "CONCEPT", task: "Concept Approval Review", role: "AD", min: 20, scaling: "concept" },
  { phase: "Image Stacks", sub: "CONCEPT", task: "Production Prep", role: "DESIGNER", min: 60, scaling: "concept" },
  { phase: "Image Stacks", sub: "PRODUCTION", task: "Copywriting", role: "COPYWRITER", min: 1, scaling: "asin", factor: 9 },
  { phase: "Image Stacks", sub: "PRODUCTION", task: "Copy QA", role: "QA", min: 0.15, scaling: "asin", factor: 9 },
  { phase: "Image Stacks", sub: "PRODUCTION", task: "Copy Edits", role: "COPYWRITER", min: 0.2, scaling: "asin", factor: 9 },
  { phase: "Image Stacks", sub: "PRODUCTION", task: "Copywriting Review", role: "AD", min: 0.1, scaling: "asin", factor: 9 },
  { phase: "Image Stacks", sub: "PRODUCTION", task: "Design", role: "DESIGNER", min: 1, scaling: "asin", factor: 9 },
  { phase: "Image Stacks", sub: "PRODUCTION", task: "Design QA", role: "QA", min: 0.1, scaling: "asin", factor: 9 },
  { phase: "Image Stacks", sub: "PRODUCTION", task: "Design Edits", role: "DESIGNER", min: 0.2, scaling: "asin", factor: 9 },
  { phase: "Image Stacks", sub: "PRODUCTION", task: "Design Review", role: "AD", min: 0.1, scaling: "asin", factor: 9 },
  { phase: "Image Stacks", sub: "UPLOAD", task: "PXM Upload", role: "AM", min: 0.1, scaling: "asin" },
  { phase: "Image Stacks", sub: "UPLOAD", task: "Marketplace Upload", role: "AM", min: 0.1, scaling: "asin" },
  { phase: "A+ Content", sub: "CONCEPT", task: "Strategy + Direction", role: "AD", min: 120, scaling: "concept" },
  { phase: "A+ Content", sub: "CONCEPT", task: "Copywriting", role: "AD", min: 45, scaling: "concept" },
  { phase: "A+ Content", sub: "CONCEPT", task: "Design", role: "DESIGNER", min: 120, scaling: "concept" },
  { phase: "A+ Content", sub: "CONCEPT", task: "Concept Edits", role: "DESIGNER", min: 30, scaling: "concept" },
  { phase: "A+ Content", sub: "CONCEPT", task: "Concept Approval Review", role: "AD", min: 20, scaling: "concept" },
  { phase: "A+ Content", sub: "CONCEPT", task: "Production Prep", role: "DESIGNER", min: 60, scaling: "concept" },
  { phase: "A+ Content", sub: "PRODUCTION", task: "Copywriting", role: "COPYWRITER", min: 1, scaling: "asin", factor: 7 },
  { phase: "A+ Content", sub: "PRODUCTION", task: "Copy QA", role: "QA", min: 0.15, scaling: "asin", factor: 7 },
  { phase: "A+ Content", sub: "PRODUCTION", task: "Copy Edits", role: "COPYWRITER", min: 0.2, scaling: "asin", factor: 7 },
  { phase: "A+ Content", sub: "PRODUCTION", task: "Copywriting Review", role: "AD", min: 0.1, scaling: "asin", factor: 7 },
  { phase: "A+ Content", sub: "PRODUCTION", task: "Design", role: "DESIGNER", min: 1, scaling: "asin", factor: 7 },
  { phase: "A+ Content", sub: "PRODUCTION", task: "Design QA", role: "QA", min: 0.1, scaling: "asin", factor: 7 },
  { phase: "A+ Content", sub: "PRODUCTION", task: "Design Edits", role: "DESIGNER", min: 0.2, scaling: "asin", factor: 7 },
  { phase: "A+ Content", sub: "PRODUCTION", task: "Design Review", role: "AD", min: 0.1, scaling: "asin", factor: 7 },
  { phase: "A+ Content", sub: "UPLOAD", task: "PXM Upload", role: "AM", min: 0.1, scaling: "asin" },
  { phase: "A+ Content", sub: "UPLOAD", task: "Marketplace Upload", role: "AM", min: 0.1, scaling: "asin" },
  { phase: "Brand Story", sub: "CONCEPT", task: "Strategy + Direction", role: "AD", min: 120, scaling: "fixed" },
  { phase: "Brand Story", sub: "CONCEPT", task: "Copywriting", role: "AD", min: 60, scaling: "fixed" },
  { phase: "Brand Story", sub: "CONCEPT", task: "Design", role: "DESIGNER", min: 120, scaling: "fixed" },
  { phase: "Brand Story", sub: "CONCEPT", task: "Concept Edits", role: "DESIGNER", min: 30, scaling: "fixed" },
  { phase: "Brand Story", sub: "CONCEPT", task: "Concept Review", role: "AD", min: 15, scaling: "fixed" },
  { phase: "Brand Story", sub: "UPLOAD", task: "PXM Upload", role: "AM", min: 4.5, scaling: "fixed" },
  { phase: "Brand Story", sub: "UPLOAD", task: "Marketplace Upload", role: "AM", min: 4.5, scaling: "fixed" },
  { phase: "Brand Store", sub: "CONCEPT", task: "Strategy + Direction", role: "AD", min: 120, scaling: "fixed" },
  { phase: "Brand Store", sub: "CONCEPT", task: "Copywriting", role: "AD", min: 60, scaling: "fixed" },
  { phase: "Brand Store", sub: "CONCEPT", task: "Design", role: "DESIGNER", min: 240, scaling: "fixed" },
  { phase: "Brand Store", sub: "CONCEPT", task: "Concept Edits", role: "DESIGNER", min: 60, scaling: "fixed" },
  { phase: "Brand Store", sub: "CONCEPT", task: "Concept Review", role: "AD", min: 15, scaling: "fixed" },
  { phase: "Brand Store", sub: "UPLOAD", task: "PXM Upload", role: "AM", min: 4.5, scaling: "fixed" },
  { phase: "Brand Store", sub: "UPLOAD", task: "Marketplace Upload", role: "AM", min: 4.5, scaling: "fixed" },
  { phase: "AI ImageGen", sub: "IMAGE GENERATION", task: "Product or Lifestyle Image Generation", role: "DESIGNER", min: 1, scaling: "asin" },
];

function multiplier(
  task: Task,
  asinCount: number,
  conceptCount: number,
  aiImagesPerAsin: number,
) {
  const factor = task.phase === "AI ImageGen" ? aiImagesPerAsin : task.factor;
  if (task.scaling === "asin") return asinCount * (factor || 1);
  if (task.scaling === "concept") return conceptCount;
  return 1;
}

export function calculateCreativeProduction({
  asinCount,
  conceptCount,
  aiImagesPerAsin,
  sellerType,
  tier,
}: {
  asinCount: number;
  conceptCount: number;
  aiImagesPerAsin: number;
  sellerType: SellerType;
  tier: CreativeTier;
}) {
  const asin = Math.max(1, Math.trunc(asinCount) || 1);
  const concept = Math.max(1, Math.trunc(conceptCount) || 1);
  const aiImages = Math.max(1, Math.trunc(aiImagesPerAsin) || 15);
  const rates = RATES[sellerType];
  const tierMultiplier = tier === "pm" ? 1.2 : 1;

  const computed = TASKS.map((task) => {
    const mult = multiplier(task, asin, concept, aiImages);
    const minutes = task.min * mult;
    const baseCost = task.min * mult * rates[task.role];
    return { ...task, minutes, baseCost };
  });

  const baseCost = computed.reduce((sum, task) => sum + task.baseCost, 0);
  const minutes = computed.reduce((sum, task) => sum + task.minutes, 0);

  const phaseCosts = Object.fromEntries(
    [
      "Onboarding",
      "Audits",
      "Image Stacks",
      "A+ Content",
      "Brand Story",
      "Brand Store",
      "AI ImageGen",
    ].map((phase) => [
      phase,
      computed
        .filter((task) => task.phase === phase)
        .reduce((sum, task) => sum + task.baseCost, 0) * tierMultiplier,
    ]),
  );
  const subPhaseCost = (phase: string, sub: string) =>
    computed
      .filter((task) => task.phase === phase && task.sub === sub)
      .reduce((sum, task) => sum + task.baseCost, 0) * tierMultiplier;

  return {
    projectCost: baseCost * tierMultiplier,
    projectHours: minutes / 60,
    phaseCosts,
    aiImageGenerationCost: phaseCosts["AI ImageGen"],
    imageStackProductionCost: subPhaseCost("Image Stacks", "PRODUCTION"),
    aPlusProductionCost: subPhaseCost("A+ Content", "PRODUCTION"),
    designerRatePerMinute: rates.DESIGNER,
    tierMultiplier,
  };
}
