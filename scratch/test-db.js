const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const project = await prisma.project.findFirst();
    console.log("Found project:", project ? project.id : "none");
    if (project) {
      // test creating projectRun
      const run = await prisma.projectRun.create({
        data: {
          projectId: project.id,
          runType: "on_demand"
        }
      });
      console.log("Created run successfully:", run.id);
    }
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
