import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const slugArgIndex = args.indexOf("--slug");
  const codeArgIndex = args.indexOf("--code");

  if (slugArgIndex === -1 && codeArgIndex === -1) {
    console.log(`
Usage:
  npx tsx scripts/verify-entry.ts --slug <issue-slug>
  npx tsx scripts/verify-entry.ts --code <error-code-number>

Examples:
  npx tsx scripts/verify-entry.ts --slug no-post-dram-led
  npx tsx scripts/verify-entry.ts --code 85
    `);
    process.exit(0);
  }

  if (slugArgIndex !== -1 && args[slugArgIndex + 1]) {
    const slug = args[slugArgIndex + 1];
    const issue = await prisma.issue.update({
      where: { slug },
      data: {
        verified: true,
        source: "verified",
      },
    });
    console.log(`✅ Marked issue "${issue.title}" (${issue.slug}) as verified: true [source: verified]`);
  }

  if (codeArgIndex !== -1 && args[codeArgIndex + 1]) {
    const code = parseInt(args[codeArgIndex + 1], 10);
    if (!isNaN(code)) {
      const errCode = await prisma.errorCode.update({
        where: { code },
        data: {
          verified: true,
          source: "verified",
        },
      });
      console.log(`✅ Marked error code ${errCode.code} (${errCode.name}) as verified: true [source: verified]`);
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Error updating entry:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
