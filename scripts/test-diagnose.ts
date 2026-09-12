async function testDiagnose(label: string, prompt: string) {
  console.log(`\n========================================`);
  console.log(`TEST: ${label}`);
  console.log(`Prompt: "${prompt}"`);
  console.log(`========================================`);

  try {
    const res = await fetch("http://localhost:3000/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Path: ${data.path}`);
    console.log(`Source: ${data.source}`);
    console.log(`Reply Preview:`);
    console.log(data.reply ? data.reply.substring(0, 400) + "..." : data);
    return data;
  } catch (err: any) {
    console.error("Test failed:", err.message);
  }
}

async function run() {
  // Test 1: Scope Guard (Off-topic)
  await testDiagnose(
    "Scope Guard (Off-topic query)",
    "Can you write me a poem about golden retrievers?"
  );

  // Test 2: Grounded Technical Query (Known issue / PC hardware)
  await testDiagnose(
    "Grounding / Known Hardware Issue",
    "My motherboard has a solid red DRAM debug LED and won't display anything to the monitor."
  );

  // Test 3: Windows Error Code Grounding
  await testDiagnose(
    "Windows Error Code Query",
    "I'm getting error 0x0000007B INACCESSIBLE_BOOT_DEVICE on startup."
  );

  // Test 4: Obscure PC Hardware Query
  await testDiagnose(
    "Obscure Hardware Query (Search Fallback)",
    "ASUS ROG Ryujin III 360 AIO tachometer header triggering Q-code 00 on ROG Maximus Z790 Hero."
  );
}

run();
