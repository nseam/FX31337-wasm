import { spawnSync } from 'child_process';
import { writeFileSync } from 'fs';

const result = spawnSync(
  'npx tsx tests/js/IndicatorTest.ts',
  [],
  { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, timeout: 60000, shell: true }
);

const output = (result.stdout || '') + (result.stderr || '');
writeFileSync('chart_out.txt', output, 'utf8');
if (result.error) {
  console.error('spawnSync error:', result.error.message);
} else {
  process.stdout.write(output || '(no output)\n');
}

