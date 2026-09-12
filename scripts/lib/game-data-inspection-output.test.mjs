import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { writeInspectionEvidence } from './game-data-inspection-output.mjs';

test('exports lossless oversized evidence only to new ignored files', () => {
  const directory = mkdtempSync(join(tmpdir(), 'inspection-output-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: directory, stdio: 'ignore' });
    git('init');
    writeFileSync(join(directory, '.gitignore'), 'evidence*.json\n');
    git('add', '.gitignore');
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'test');
    const evidence = {
      target: 'test',
      rows: [
        {
          id: 'selected',
          entry: [
            [
              {
                op: 'set',
                path: 'Tom.description',
                oldValue: '旧'.repeat(20_000),
                newValue: '新'.repeat(20_000),
              },
            ],
          ],
        },
      ],
      historyRows: [{ id: 'history', entry: { op: 'delete', path: 'Tom.name', oldValue: null } }],
      report: { rows: [{ largePayload: true }] },
    };
    const receipt = writeInspectionEvidence(directory, 'evidence.json', evidence);
    const serialized = readFileSync(receipt.evidencePath, 'utf8');
    const saved = JSON.parse(serialized);
    assert.deepEqual(saved.rows, evidence.rows);
    assert.deepEqual(saved.historyRows, evidence.historyRows);
    assert.deepEqual(saved.report, evidence.report);
    assert.equal(saved.schemaVersion, 1);
    assert.match(saved.repository.head, /^[a-f0-9]{40}$/);
    assert.equal(receipt.evidenceBytes, Buffer.byteLength(serialized));
    assert.ok(receipt.evidenceBytes > 50_000);
    assert.ok(JSON.stringify(receipt).length < 500);
    assert.throws(() => writeInspectionEvidence(directory, 'evidence.json', {}), {
      code: 'EEXIST',
    });
    assert.equal(readFileSync(receipt.evidencePath, 'utf8'), serialized);
    for (const path of ['tracked.json', '../evidence-outside.json']) {
      assert.throws(() => writeInspectionEvidence(directory, path, evidence), {
        code: 'evidence_path_must_be_ignored',
      });
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
