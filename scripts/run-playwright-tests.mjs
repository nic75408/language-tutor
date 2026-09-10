#!/usr/bin/env node
/* run-playwright-tests.mjs —— 测试入口，被 `npm test` 调用。
 * 依次运行 scripts/*.test.mjs 下所有测试文件。
 */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const testFiles = readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith('.test.mjs')).sort();

if (testFiles.length === 0) {
  console.log('未发现测试文件（scripts/*.test.mjs）。');
  process.exit(1);
}

let failed = false;
for (const file of testFiles) {
  console.log('\n=== 运行 ' + file + ' ===');
  const res = spawnSync(process.execPath, [join(SCRIPTS_DIR, file)], { stdio: 'inherit' });
  if (res.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
