import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting pcfix database seed...");

  // 1. Seed Error Codes from Markdown
  const candidateMdPaths = [
    path.join(process.cwd(), "data", "windows_os_errors_skill.md"),
    path.join(__dirname, "..", "data", "windows_os_errors_skill.md"),
    path.join(__dirname, "../../data/windows_os_errors_skill.md"),
    path.join(process.cwd(), "windows_os_errors_skill.md"),
    "C:\\Users\\ainol\\Downloads\\windows_os_errors_skill.md",
    "C:\\Users\\ainol\\Downloads\\pc-fixit-frontend\\data\\windows_os_errors_skill.md",
  ];

  const mdPath = candidateMdPaths.find((p) => fs.existsSync(p));

  if (mdPath) {
    console.log(`📖 Reading Windows OS Error Codes from: ${mdPath}`);
    const mdContent = fs.readFileSync(mdPath, "utf-8");
    const lines = mdContent.split(/\r?\n/);
    let errorCodeCount = 0;
    let errorCodeFailures = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("|") || trimmed.includes("---") || trimmed.includes("Error Name")) {
        continue;
      }
      const parts = trimmed.split("|").map((p) => p.trim());
      if (parts.length >= 5) {
        const codeNum = parseInt(parts[1], 10);
        const name = parts[2];
        const explanation = parts[3];
        const fixGuide = parts[4];

        if (!isNaN(codeNum) && name && explanation) {
          try {
            await prisma.errorCode.upsert({
              where: { code: codeNum },
              update: {
                name,
                explanation,
                fix_guide: fixGuide,
              },
              create: {
                code: codeNum,
                name,
                explanation,
                fix_guide: fixGuide,
                source: "researched",
                verified: false,
              },
            });
            errorCodeCount++;
          } catch (err: any) {
            errorCodeFailures++;
            console.error(`  ❌ Failed to upsert error code ${codeNum}:`, err.message);
          }
        }
      }
    }
    console.log(`✅ Upserted ${errorCodeCount} error codes (failures: ${errorCodeFailures}).`);
  } else {
    console.warn("⚠️ windows_os_errors_skill.md not found, skipping error codes markdown parse.");
  }

  // 2. Seed Categories
  const categories = [
    {
      slug: "wont-boot",
      title: "Won't boot",
      description: "Black screen, no POST, stuck on logo",
      severity: "critical",
    },
    {
      slug: "blue-screen",
      title: "Blue screen (BSOD)",
      description: "Crashes with a stop code",
      severity: "critical",
    },
    {
      slug: "running-slow",
      title: "Running slow",
      description: "Lag, freezes, long load times",
      severity: "warn",
    },
    {
      slug: "no-internet",
      title: "No internet",
      description: "Wi-Fi drops, no connection, slow speeds",
      severity: "warn",
    },
    {
      slug: "overheating",
      title: "Overheating",
      description: "Loud fans, thermal shutdowns",
      severity: "warn",
    },
    {
      slug: "driver-issues",
      title: "Driver issues",
      description: "GPU, audio, or peripheral not working",
      severity: "info",
    },
  ];

  console.log("📂 Seeding categories...");
  const validCategorySlugs = new Set<string>();
  for (const cat of categories) {
    try {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          title: cat.title,
          description: cat.description,
          severity: cat.severity,
        },
        create: {
          slug: cat.slug,
          title: cat.title,
          description: cat.description,
          severity: cat.severity,
        },
      });
      validCategorySlugs.add(cat.slug);
    } catch (err: any) {
      console.error(`  ❌ Failed to upsert category '${cat.slug}':`, err.message);
    }
  }
  console.log(`✅ Upserted ${validCategorySlugs.size} categories.`);

  // 3. Seed Researched Issues
  const researchDir = path.join(process.cwd(), "data", "research");
  const issueFiles = [
    "wont-boot.json",
    "blue-screen.json",
    "running-slow.json",
    "no-internet.json",
    "overheating.json",
    "driver-issues.json",
  ];

  // Retrieve all existing error codes in DB to prevent foreign key / record not found failures
  let existingErrorCodes = new Set<number>();
  try {
    const dbCodes = await prisma.errorCode.findMany({ select: { code: true } });
    existingErrorCodes = new Set(dbCodes.map((e) => e.code));
  } catch (err: any) {
    console.warn("⚠️ Could not fetch existing error codes from DB:", err.message);
  }

  let totalIssues = 0;
  let issueFailures = 0;

  for (const file of issueFiles) {
    const filePath = path.join(researchDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      continue;
    }

    let issuesData: any[];
    try {
      issuesData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err: any) {
      console.error(`❌ Failed to parse JSON from ${file}:`, err.message);
      continue;
    }

    for (const item of issuesData) {
      const rawCodes = Array.isArray(item.related_error_codes)
        ? (item.related_error_codes as number[])
        : [];

      // Validate error codes and auto-create stubs for missing referenced codes
      const validCodes: number[] = [];
      for (const code of rawCodes) {
        if (typeof code !== "number" || isNaN(code)) continue;

        if (existingErrorCodes.has(code)) {
          validCodes.push(code);
        } else {
          // Auto-upsert stub so foreign key relation is guaranteed to connect cleanly
          try {
            await prisma.errorCode.upsert({
              where: { code },
              update: {},
              create: {
                code,
                name: `Windows Error Code ${code}`,
                explanation: `Referenced in troubleshooting guide for issue: ${item.slug}`,
                fix_guide: `See specific resolution steps in issue ${item.slug}`,
                source: "researched",
                verified: false,
              },
            });
            existingErrorCodes.add(code);
            validCodes.push(code);
          } catch (err: any) {
            console.warn(`  ⚠️ Could not stub referenced error code ${code}:`, err.message);
          }
        }
      }

      // Verify category slug integrity
      const categorySlug = validCategorySlugs.has(item.category_slug)
        ? item.category_slug
        : null;

      try {
        await prisma.issue.upsert({
          where: { slug: item.slug },
          update: {
            title: item.title,
            summary: item.summary,
            severity: item.severity,
            category_slug: categorySlug,
            symptoms: item.symptoms || [],
            fix_steps: item.fix_steps || [],
            error_codes: {
              set: [],
              connect: validCodes.map((c) => ({ code: c })),
            },
          },
          create: {
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            severity: item.severity,
            category_slug: categorySlug,
            symptoms: item.symptoms || [],
            fix_steps: item.fix_steps || [],
            source: item.source || "researched",
            verified: Boolean(item.verified),
            error_codes: {
              connect: validCodes.map((c) => ({ code: c })),
            },
          },
        });
        totalIssues++;
      } catch (err: any) {
        issueFailures++;
        console.error(`  ❌ Failed to upsert issue '${item.slug}':`, err.message);
      }
    }
    console.log(`  📄 Loaded ${issuesData.length} issues from ${file}`);
  }
  console.log(`✅ Total issues seeded: ${totalIssues} (failures: ${issueFailures})`);

  // 4. Seed Wizard Decision Tree Nodes
  const wizardFile = path.join(researchDir, "wizard_tree.json");
  if (fs.existsSync(wizardFile)) {
    try {
      const wizardData = JSON.parse(fs.readFileSync(wizardFile, "utf-8"));
      let wizardCount = 0;
      for (const node of wizardData) {
        await prisma.wizardNode.upsert({
          where: { id: node.id },
          update: {
            question: node.question,
            options: node.options,
          },
          create: {
            id: node.id,
            question: node.question,
            options: node.options,
          },
        });
        wizardCount++;
      }
      console.log(`✅ Upserted ${wizardCount} wizard decision nodes.`);
    } catch (err: any) {
      console.error("❌ Failed seeding wizard tree nodes:", err.message);
    }
  }

  // 5. Create Full-Text Search Indexes (PostgreSQL tsvector + GIN)
  // Index expressions MUST match the WHERE and ts_rank expressions in app/api/diagnose/route.ts
  // exactly so PostgreSQL uses index scans instead of sequential scans.
  console.log("Creating tsvector GIN full-text search indexes...");
  try {
    // Issues: includes symptoms::text so the FTS query incorporating symptoms can use this index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS issues_fts_idx ON issues 
      USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(symptoms::text, '')));
    `);
    // Error codes: name + explanation composite tsvector
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS error_codes_fts_idx ON error_codes 
      USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(explanation, '')));
    `);
    // Source filter index for error codes (source-restricted FTS queries)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS error_codes_source_idx ON error_codes (source, verified);
    `);
    console.log("Full-text search GIN indexes ready.");
  } catch (err) {
    console.warn("Could not create GIN index directly via executeRaw (might not be connected to PostgreSQL yet):", err);
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
