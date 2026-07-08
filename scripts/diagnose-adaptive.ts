import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { adaptiveEngine } from "../src/modules/adaptive/adaptive-engine";
import { roadmapEngine } from "../src/modules/adaptive/roadmap-engine";

// run the end to end pipeline diagnostic checks for the adaptive ai engine
async function testWorkflow() {
  console.log("=== testing adaptive ai engine integration ===");

  const dbUrl = process.env.DATABASE_URL;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log(`database url: ${dbUrl ? "configured" : "missing"}`);
  console.log(`gemini api key: ${geminiKey ? "configured" : "missing"}`);

  if (!dbUrl) {
    console.error("database connection string is missing");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // fetch or seed a mock workspace and topic for tests
    let user = await prisma.user.findFirst();
    if (!user) {
      // create a mock role first
      let role = await prisma.role.findFirst();
      if (!role) {
        role = await prisma.role.create({
          data: { name: "student", description: "student role" },
        });
      }
      user = await prisma.user.create({
        data: {
          email: "antigravity-tester@example.com",
          passwordHash: "mock-password-hash",
          roleId: role.id,
        },
      });
    }

    let workspace = await prisma.workspace.findFirst({
      where: { userId: user.id },
    });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "test workspace",
          targetRole: "software engineer",
          userId: user.id,
        },
      });
    }

    let subject = await prisma.subject.findFirst();
    if (!subject) {
      subject = await prisma.subject.create({
        data: { name: "data structures" },
      });
    }

    let topic = await prisma.topic.findFirst({
      where: { subjectId: subject.id },
    });
    if (!topic) {
      topic = await prisma.topic.create({
        data: { name: "binary trees", subjectId: subject.id },
      });
    }

    // create a static roadmap if missing
    let roadmap = await prisma.roadmap.findFirst({
      where: { workspaceId: workspace.id },
    });
    if (!roadmap) {
      roadmap = await prisma.roadmap.create({
        data: {
          workspaceId: workspace.id,
          nodes: {
            create: [
              { topicId: topic.id, sequenceOrder: 1, status: "UNLOCKED" },
            ],
          },
        },
      });
    }

    console.log("\n1. executing adaptive engine pipeline analysis");
    const result = await adaptiveEngine.analyzeAssessmentAttempt({
      userId: user.id,
      workspaceId: workspace.id,
      role: "software engineer",
      selectedCompanies: ["google"],
      subject: subject.name,
      subjectId: subject.id,
      topic: topic.name,
      topicId: topic.id,
      score: 50, // triggers failure pathway
      wrongQuestionIds: ["mock-q-1"],
      questionMetadata: [
        {
          id: "mock-q-1",
          concept: "tree traversal",
          pattern: "dfs",
          questionType: "Theory",
          difficulty: "MEDIUM",
        },
      ],
    });

    console.log("- analysis pipeline succeeded");
    console.log(`- passed status: ${result.passed}`);
    console.log(`- recommended action: ${result.action}`);
    console.log(`- quiz generated questions count: ${result.quiz?.questions?.length || 0}`);
    console.log(`- mutated roadmap node length: ${result.roadmap?.length || 0}`);

    console.log("\n2. verifying mutated roadmap retrieval");
    const mutated = await roadmapEngine.getActiveRoadmap(workspace.id);
    console.log(`- retrieved active mutated nodes count: ${mutated.length}`);

    console.log("\n3. completing recovery simulation");
    await roadmapEngine.completeRecovery(workspace.id, topic.id);
    const resolvedRoadmap = await roadmapEngine.getActiveRoadmap(workspace.id);
    console.log(`- recovered nodes count: ${resolvedRoadmap.length}`);

    console.log("\n=== all adaptive engine workflow checks passed ===");
  } catch (err: any) {
    console.error(`\n- failure during diagnostics: ${err.message}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testWorkflow();
