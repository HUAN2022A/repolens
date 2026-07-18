import test from 'node:test';
import assert from 'node:assert/strict';
import { isIgnoredByGitignore } from '../src/gitignore.js';

test('matches ignored directories and files', () => {
  const rules = [
    { raw: 'dist/', pattern: 'dist', anchored: false, directoryOnly: true, regex: null },
    { raw: '*.log', pattern: '*.log', anchored: false, directoryOnly: false, regex: /^[^/]*\.log$/ },
    { raw: '/coverage', pattern: 'coverage', anchored: true, directoryOnly: false, regex: null },
  ];

  assert.equal(isIgnoredByGitignore('dist', true, rules), true);
  assert.equal(isIgnoredByGitignore('dist/app.js', false, rules), true);
  assert.equal(isIgnoredByGitignore('debug.log', false, rules), true);
  assert.equal(isIgnoredByGitignore('src/debug.log', false, rules), true);
  assert.equal(isIgnoredByGitignore('coverage/index.html', false, rules), true);
  assert.equal(isIgnoredByGitignore('src/coverage/index.html', false, rules), false);
});
