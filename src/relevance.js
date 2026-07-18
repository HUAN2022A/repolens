const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'add', 'fix', 'make', 'this', 'that', 'from',
  'into', 'using', 'use', 'new', 'old', 'get', 'set', 'create', 'update'
]);

const DOMAIN_HINTS = [
  { keywords: ['auth', 'login', 'oauth', 'session', 'password', 'token'], hints: ['auth', 'login', 'session', 'user', 'middleware', 'provider'] },
  { keywords: ['payment', 'stripe', 'billing', 'invoice', 'webhook'], hints: ['payment', 'stripe', 'billing', 'invoice', 'webhook'] },
  { keywords: ['email', 'mail', 'notification', 'invite', 'invitation'], hints: ['email', 'mail', 'notification', 'template', 'invite'] },
  { keywords: ['api', 'route', 'endpoint', 'handler'], hints: ['api', 'route', 'endpoint', 'handler', 'controller'] },
  { keywords: ['database', 'db', 'schema', 'model', 'migration', 'prisma'], hints: ['schema', 'model', 'migration', 'prisma', 'database', 'db'] },
  { keywords: ['ui', 'page', 'component', 'button', 'form', 'style'], hints: ['component', 'page', 'ui', 'form', 'style', 'css'] },
  { keywords: ['test', 'spec', 'coverage'], hints: ['test', 'spec', '__tests__', 'fixtures'] },
  { keywords: ['config', 'build', 'script', 'dependency'], hints: ['config', 'package', 'tsconfig', 'vite', 'next', 'docker'] },
];

export function taskKeywords(task) {
  return task
    .toLowerCase()
    .split(/[^a-z0-9_\-]+/i)
    .filter((word) => word.length >= 3)
    .filter((word) => !STOP_WORDS.has(word));
}

function expandedKeywords(keywords) {
  const expanded = new Set(keywords);
  for (const domain of DOMAIN_HINTS) {
    if (domain.keywords.some((keyword) => keywords.includes(keyword))) {
      for (const hint of domain.hints) expanded.add(hint);
    }
  }
  return [...expanded];
}

function countOccurrences(text, keyword) {
  let count = 0;
  let index = text.indexOf(keyword);
  while (index !== -1) {
    count += 1;
    index = text.indexOf(keyword, index + keyword.length);
  }
  return count;
}

export function scoreFileForTask(file, task) {
  const keywords = expandedKeywords(taskKeywords(task));
  if (!keywords.length) {
    return { score: file.score, reasons: ['general high-signal file'] };
  }

  const pathText = file.path.toLowerCase();
  const nameText = pathText.split('/').at(-1) ?? pathText;
  const previewText = file.preview.slice(0, 4000).toLowerCase();
  const reasons = [];
  let score = file.score;

  for (const keyword of keywords) {
    if (nameText.includes(keyword)) {
      score += 35;
      reasons.push(`filename matches "${keyword}"`);
    } else if (pathText.includes(keyword)) {
      score += 25;
      reasons.push(`path matches "${keyword}"`);
    }

    const occurrences = countOccurrences(previewText, keyword);
    if (occurrences > 0) {
      score += Math.min(30, occurrences * 6);
      reasons.push(`content mentions "${keyword}"`);
    }
  }

  if (file.role === 'test' && keywords.some((keyword) => ['test', 'spec'].includes(keyword))) score += 20;
  if (file.role === 'entrypoint' && keywords.some((keyword) => ['api', 'route', 'endpoint', 'handler'].includes(keyword))) score += 20;
  if (file.role === 'config' && keywords.some((keyword) => ['config', 'build', 'dependency', 'package'].includes(keyword))) score += 20;

  return {
    score,
    reasons: reasons.length ? [...new Set(reasons)].slice(0, 5) : ['high structural relevance'],
  };
}
