const puppeteer = require("puppeteer");
const path = require("node:path");

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];

    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    process.stdin.on("error", reject);
  });
}

async function launchBrowser() {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
  const args =
    process.platform === "win32"
      ? []
      : ["--no-sandbox", "--disable-setuid-sandbox"];

  return puppeteer.launch({
    executablePath,
    headless: "shell",
    args,
    pipe: true,
  });
}

async function renderPdf(html, stylesheetPath) {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: ["load", "networkidle0"],
      timeout: 30000,
    });

    if (stylesheetPath) {
      await page.addStyleTag({ path: path.resolve(stylesheetPath) });
    }

    await page.emulateMediaType("print");

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  if (process.argv.includes("--check")) {
    const pdf = await renderPdf("<html><body><h1>PDF renderer check</h1></body></html>");
    if (!Buffer.from(pdf).subarray(0, 4).equals(Buffer.from("%PDF"))) {
      throw new Error("O Puppeteer não retornou um PDF válido.");
    }
    process.stdout.write(`Puppeteer renderer is ready (${pdf.length} bytes).\n`);
    return;
  }

  const html = await readStdin();
  const stylesheetPath = process.argv[2];
  if (!html.trim()) {
    throw new Error("Nenhum conteúdo HTML foi recebido pelo renderizador.");
  }

  const pdf = await renderPdf(html, stylesheetPath);
  process.stdout.write(Buffer.from(pdf));
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
