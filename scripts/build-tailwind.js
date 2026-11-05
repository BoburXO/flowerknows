const fs = require("fs");
const path = require("path");
const { compile } = require("@tailwindcss/node");
const { Scanner } = require("@tailwindcss/oxide");

async function buildTailwind() {
  console.log("🌸 Compiling Tailwind CSS for Flower Knows...");
  const baseDir = process.cwd();

  const inputCss = `
@import "tailwindcss";

@layer base {
  :root {
    --primary: #D47A75;
    --primary-light: #F7D6D0;
    --primary-dark: #A94E4A;
    --bg-nude: #FAF6F0;
    --bg-card: #FFFFFF;
    --bg-cream: #F5EFEB;
    --text-main: #3D332A;
    --text-muted: #7E6F62;
    --accent-gold: #D4AF37;
    --accent-rose: #E8A598;
    --border-soft: #EFE6DC;
  }

  body {
    background-color: #FAF6F0;
    color: #3D332A;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
}

.font-serif-vintage {
  font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
}

.soft-glow {
  box-shadow: 0 10px 30px -5px rgba(232, 165, 152, 0.15), 0 0 0 1px rgba(239, 230, 220, 0.8);
}

.soft-glow-hover {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.soft-glow-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px -5px rgba(212, 122, 117, 0.2), 0 0 0 1px rgba(229, 196, 159, 0.6);
}

.vintage-border {
  border: 1px solid rgba(229, 196, 159, 0.5);
}

.rococo-gradient {
  background: linear-gradient(135deg, #FAF6F0 0%, #F5ECE3 50%, #F8EFE9 100%);
}

.rose-gold-gradient {
  background: linear-gradient(135deg, #E8A598 0%, #D47A75 100%);
}
`;

  const compiler = await compile(inputCss, {
    base: baseDir,
    onDependency: () => {},
  });

  const scanner = new Scanner({
    sources: [
      { base: baseDir, pattern: "app/**/*.{js,ts,jsx,tsx}", negated: false },
      { base: baseDir, pattern: "components/**/*.{js,ts,jsx,tsx}", negated: false },
      { base: baseDir, pattern: "lib/**/*.{js,ts,jsx,tsx}", negated: false },
      { base: baseDir, pattern: "data/**/*.{js,json}", negated: false },
    ],
  });

  const candidates = new Set();
  for (const candidate of scanner.scan()) {
    candidates.add(candidate);
  }

  // Common additional utility classes
  const commonCandidates = [
    "flex", "grid", "hidden", "block", "inline-block", "inline-flex",
    "w-full", "h-full", "min-h-screen", "max-w-7xl", "mx-auto",
    "p-4", "p-6", "p-8", "py-2", "py-3", "py-4", "px-4", "px-6",
    "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-full",
    "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl",
    "font-bold", "font-semibold", "font-medium", "font-light",
    "text-[#3D332A]", "text-[#7E6F62]", "text-[#8C7A6B]", "text-[#D47A75]", "text-[#D4AF37]",
    "bg-[#FAF6F0]", "bg-[#FAF3EC]", "bg-[#F5ECE3]", "bg-[#FCEEE9]", "bg-[#FFFDFB]", "bg-white",
    "border", "border-[#EFE6DC]", "border-[#E8DDD0]", "border-[#D47A75]",
    "shadow-xs", "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl",
    "transition", "duration-200", "duration-300", "duration-500", "duration-700",
    "hover:scale-105", "hover:scale-110", "hover:bg-[#FAF3EC]", "hover:text-[#D47A75]",
    "hover:border-[#D47A75]", "cursor-pointer"
  ];
  for (const c of commonCandidates) {
    candidates.add(c);
  }

  console.log(`Found ${candidates.size} Tailwind utility candidates.`);
  const builtCss = compiler.build([...candidates]);

  const outputPath = path.join(baseDir, "app", "tailwind.css");
  fs.writeFileSync(outputPath, builtCss, "utf-8");
  console.log(`✓ Tailwind compiled successfully to ${outputPath} (${builtCss.length} bytes)`);
}

buildTailwind().catch((err) => {
  console.error("Tailwind build error:", err);
  process.exit(1);
});
