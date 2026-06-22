/**
 * pa-ui audit script — v1 stub
 *
 * This is a placeholder that always passes. The real audit will enforce
 * the 6 hard rules from pa-ui-architecture (tokens, standalone, signals,
 * CSS vars, CDK, APIs) once the tooling is mature.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const report = {
  timestamp: new Date().toISOString(),
  status: 'pass',
  rules: [],
  summary: 'Audit stub — no rules enforced yet.',
};

const outPath = resolve(dirname(__filename), 'report.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log('✅ pa-ui audit passed (stub)');
