import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed: CBC pilot scaffold + Cambridge family scaffold.
 *
 * IMPORTANT (data-model.md): the CBC pilot is mapped from official KICD
 * documents only — never fabricated structure. This seed therefore creates the
 * curriculum/schooling families and publishes a subject list under the openly
 * published CBC 2024 subject labels present in the browse/design references.
 * Topic/lesson hierarchies are intentionally NOT invented here; they are the
 * licensing-reviewed Phase 2 deliverable.
 */
const CBC_SUBJECTS = [
  { code: "MATH", name: "Mathematics" },
  { code: "ENG", name: "English Language & Literature" },
  { code: "KIS", name: "Kiswahili" },
  { code: "SCI", name: "Integrated Science" },
  { code: "SST", name: "Social Studies & CBC Arts" },
  { code: "PRE-TECH", name: "Pre-Technical Studies" },
  { code: "LIFE-SKILLS", name: "Life Skills" },
];

const CAMBRIDGE_SUBJECTS = [
  { code: "PHYS-0625", name: "Physics (0625)" },
  { code: "CHEM-0620", name: "Chemistry (0620)" },
  { code: "MATH-0607", name: "Additional Mathematics (0607)" },
  { code: "ENG-0500", name: "First Language English (0500)" },
];

async function seed() {
  console.log("Seeding WhiteBoard pilot curriculum scaffolding…");

  const cbc = await prisma.curriculum.upsert({
    where: { code: "CBC" },
    update: {},
    create: {
      code: "CBC",
      family: "CBC",
      name: "Kenya Competency Based Curriculum",
      description:
        "CBC pilot scaffold (grade-band scope per official KICD mapping. Full topic/lesson structure ships under Phase 2 licensing review.)",
    },
  });

  for (const [i, subject] of CBC_SUBJECTS.entries()) {
    await prisma.subject.upsert({
      where: { curriculumId_code: { curriculumId: cbc.id, code: subject.code } },
      update: {},
      create: {
        curriculumId: cbc.id,
        code: subject.code,
        name: subject.name,
        sequence: i,
      },
    });
  }

  const cambridge = await prisma.curriculum.upsert({
    where: { code: "CAMBRIDGE" },
    update: {},
    create: {
      code: "CAMBRIDGE",
      family: "CAMBRIDGE",
      name: "Cambridge International",
      description:
        "Cambridge scaffold. Content structure is licensing-reviewed before ingestion (see implementation plan Phase 3/Future).",
    },
  });

  for (const [i, subject] of CAMBRIDGE_SUBJECTS.entries()) {
    await prisma.subject.upsert({
      where: {
        curriculumId_code: { curriculumId: cambridge.id, code: subject.code },
      },
      update: {},
      create: {
        curriculumId: cambridge.id,
        code: subject.code,
        name: subject.name,
        sequence: i,
      },
    });
  }

  console.log(
    `Seeded curricula: ${cbc.code} (${CBC_SUBJECTS.length} subjects), ${cambridge.code} (${CAMBRIDGE_SUBJECTS.length} subjects).`,
  );
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });