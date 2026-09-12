import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createJiti } from 'jiti';

test('verifies a 41-row chain across fetch batches and fails closed on missing rows', async () => {
  const projectDir = fileURLToPath(new URL('../../', import.meta.url));
  const jiti = createJiti(import.meta.url, { alias: { '@': `${projectDir}/src` } });
  const { createActionPatchTargetRegistry } = jiti('../../src/lib/gameData/actionPatchTargets.ts');
  const characters = createActionPatchTargetRegistry().characters;
  const characterId = Object.keys(characters).find(
    (id) => typeof characters[id].description === 'string'
  );
  assert.ok(characterId);
  const rows = Array.from({ length: 41 }, (_, index) => ({
    id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    created_at: `2026-08-07T00:00:${String(index).padStart(2, '0')}Z`,
    entity_type: 'characters',
    status: 'approved',
    is_public: true,
    entry: {
      op: 'set',
      path: `${characterId}.description`,
      oldValue: `step-${index}`,
      newValue: index === 40 ? characters[characterId].description : `step-${index + 1}`,
    },
  }));
  let missing = false;
  const requests = [];
  const server = createServer((request, response) => {
    const ids = new URL(request.url, 'http://localhost').searchParams
      .get('id')
      .slice(4, -1)
      .split(',');
    requests.push(ids);
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify(
        rows.filter((row) => ids.includes(row.id) && (!missing || row !== rows[0])).toReversed()
      )
    );
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const run = () =>
    promisify(execFile)(
      process.execPath,
      [
        'scripts/verify-game-data-actions.mjs',
        `--ids=${rows
          .toReversed()
          .map(({ id }) => id)
          .join(',')}`,
      ],
      {
        cwd: projectDir,
        env: {
          ...process.env,
          NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${server.address().port}`,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key',
        },
      }
    );
  try {
    const result = await run();
    const output = JSON.parse(result.stdout.slice(result.stdout.indexOf('{')));
    assert.deepEqual(output.verification, {
      verifiedRowIds: rows.map(({ id }) => id),
      failures: [],
    });
    assert.deepEqual(
      requests.map((ids) => ids.length),
      [25, 16]
    );
    missing = true;
    await assert.rejects(run(), (error) => {
      assert.equal(error.code, 1);
      assert.deepEqual(JSON.parse(error.stderr).error, { code: 'rows_missing', ids: [rows[0].id] });
      assert.ok(!error.stdout.includes('verifiedRowIds'));
      return true;
    });
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
