const MAX_SYMBOLS_PER_FILE = 40;
const MAX_IMPORTS_PER_FILE = 60;

const SYMBOL_PATTERNS = [
  { languages: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'], kind: 'function', regex: /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g },
  { languages: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'], kind: 'class', regex: /(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/g },
  { languages: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'], kind: 'interface', regex: /(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)/g },
  { languages: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'], kind: 'type', regex: /(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=/g },
  { languages: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'], kind: 'const', regex: /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=/g },
  { languages: ['.py'], kind: 'function', regex: /^\s*def\s+([A-Za-z_][\w]*)\s*\(/gm },
  { languages: ['.py'], kind: 'class', regex: /^\s*class\s+([A-Za-z_][\w]*)/gm },
  { languages: ['.go'], kind: 'function', regex: /^func\s+(?:\([^)]*\)\s*)?([A-Za-z_][\w]*)\s*\(/gm },
  { languages: ['.rs'], kind: 'function', regex: /(?:pub\s+)?fn\s+([A-Za-z_][\w]*)\s*\(/g },
  { languages: ['.rs'], kind: 'struct', regex: /(?:pub\s+)?struct\s+([A-Za-z_][\w]*)/g },
  { languages: ['.java', '.kt'], kind: 'class', regex: /(?:public\s+|private\s+|protected\s+)?(?:class|interface|enum)\s+([A-Za-z_][\w]*)/g },
];

const IMPORT_PATTERNS = [
  { languages: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'], regex: /import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g },
  { languages: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'], regex: /require\(\s*['"]([^'"]+)['"]\s*\)/g },
  { languages: ['.py'], regex: /^\s*import\s+([A-Za-z_][\w.]*)(?:\s+as\s+\w+)?/gm },
  { languages: ['.py'], regex: /^\s*from\s+([A-Za-z_][\w.]*)\s+import\s+/gm },
  { languages: ['.go'], regex: /import\s+(?:\(\s*)?["`]([^"`]+)["`]/g },
  { languages: ['.rs'], regex: /use\s+([^;]+);/g },
  { languages: ['.java', '.kt'], regex: /^\s*import\s+([^;]+);/gm },
];

function lineForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function dedupe(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function analyzeFile(file) {
  const symbols = [];
  const imports = [];
  const extension = file.extension;

  for (const pattern of SYMBOL_PATTERNS) {
    if (!pattern.languages.includes(extension)) continue;
    for (const match of file.preview.matchAll(pattern.regex)) {
      symbols.push({
        name: match[1],
        kind: pattern.kind,
        line: lineForIndex(file.preview, match.index ?? 0),
      });
      if (symbols.length >= MAX_SYMBOLS_PER_FILE) break;
    }
    if (symbols.length >= MAX_SYMBOLS_PER_FILE) break;
  }

  for (const pattern of IMPORT_PATTERNS) {
    if (!pattern.languages.includes(extension)) continue;
    for (const match of file.preview.matchAll(pattern.regex)) {
      imports.push({ source: match[1].trim() });
      if (imports.length >= MAX_IMPORTS_PER_FILE) break;
    }
    if (imports.length >= MAX_IMPORTS_PER_FILE) break;
  }

  return {
    symbols: dedupe(symbols, (symbol) => `${symbol.kind}:${symbol.name}:${symbol.line}`),
    imports: dedupe(imports, (item) => item.source),
  };
}

export function analyzeRepository(files) {
  let symbolCount = 0;
  let importCount = 0;
  const filesWithSymbols = [];
  const filesWithImports = [];

  const analyzedFiles = files.map((file) => {
    const analysis = analyzeFile(file);
    symbolCount += analysis.symbols.length;
    importCount += analysis.imports.length;
    if (analysis.symbols.length) filesWithSymbols.push(file.path);
    if (analysis.imports.length) filesWithImports.push(file.path);
    return { ...file, ...analysis };
  });

  return {
    files: analyzedFiles,
    summary: {
      symbolCount,
      importCount,
      filesWithSymbols: filesWithSymbols.length,
      filesWithImports: filesWithImports.length,
    },
  };
}
