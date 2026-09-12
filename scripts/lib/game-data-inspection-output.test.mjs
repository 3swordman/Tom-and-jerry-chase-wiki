import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { createInventoryPage, writeInspectionEvidence } from './game-data-inspection-output.mjs';

test('pages whole inventory rows with cross-page groups and rejects changed snapshots', () => {
  const rows = Array.from({ length: 4 }, (_, i) => ({
    id: `row-${i}`,
    created_at: '2026-08-07T00:00:00Z',
    entity_type: 'characters',
    status: 'approved',
    is_public: true,
    entry: '大'.repeat(30_000),
  }));
  const output = {
    target: 'test',
    scope: { kind: 'beijing-date-range', actor: null },
    report: {
      rows: [{ rowId: 'row-0' }, { rowId: 'row-0' }, { rowId: 'row-1' }, { rowId: 'row-2' }],
      malformedRows: [{ rowId: 'row-3', code: 'malformed' }],
      dependencyGroups: [{ rowIds: ['row-0', 'row-2'] }],
    },
  };
  const first = createInventoryPage(output, rows, { pageSize: 2 });
  const second = createInventoryPage(output, rows, {
    pageSize: 2,
    cursor: first.pagination.nextCursor,
  });
  assert.deepEqual(
    [...first.inventory, ...second.inventory].map(({ rowId }) => rowId),
    rows.map(({ id }) => id)
  );
  assert.equal(first.inventory[0].inspectedActionCount, 2);
  assert.deepEqual(first.inventory[0].dependencyGroup, second.inventory[0].dependencyGroup);
  assert.equal(second.inventory[1].malformedCode, 'malformed');
  assert.equal(second.pagination.nextCursor, null);
  assert.ok(Buffer.byteLength(JSON.stringify(first)) < 50_000);
  assert.ok(!JSON.stringify(first).includes('大'));
  const wideRows = rows.map((row) => ({ ...row, entity_type: 'x'.repeat(20_000) }));
  const bounded = createInventoryPage(output, wideRows, { pageSize: 4 });
  assert.ok(bounded.inventory.length < 4);
  assert.ok(Buffer.byteLength(`${JSON.stringify(bounded, null, 2)}\n`) <= 50_000);
  assert.ok(bounded.pagination.nextCursor);
  assert.throws(
    () =>
      createInventoryPage(output, [{ ...rows[0], status: 'revoked' }, ...rows.slice(1)], {
        cursor: first.pagination.nextCursor,
      }),
    { code: 'inventory_changed_restart_required' }
  );
  assert.throws(
    () =>
      createInventoryPage({ ...output, scope: { actor: 'Jerry' } }, rows, {
        cursor: first.pagination.nextCursor,
      }),
    { code: 'inventory_changed_restart_required' }
  );
  assert.throws(() => createInventoryPage(output, rows, { cursor: 'bad' }), {
    code: 'invalid_inventory_cursor',
  });
  assert.throws(() => createInventoryPage(output, rows, { pageSize: 101 }), {
    code: 'invalid_page_size',
  });
  const empty = createInventoryPage(
    { ...output, report: { rows: [], malformedRows: [], dependencyGroups: [] } },
    []
  );
  assert.equal(empty.pagination.nextCursor, null);
  assert.deepEqual(empty.inventory, []);
});

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
