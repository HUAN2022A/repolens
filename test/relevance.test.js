import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreFileForTask } from '../src/relevance.js';

test('scores task-specific files above unrelated files', () => {
  const authFile = {
    path: 'src/auth/session.ts',
    role: 'business-logic',
    score: 10,
    preview: 'export function createSession(user, oauthToken) { return user.id }',
  };
  const unrelatedFile = {
    path: 'src/theme/colors.ts',
    role: 'ui',
    score: 10,
    preview: 'export const colors = { blue: "#00f" }',
  };

  const authScore = scoreFileForTask(authFile, 'add GitHub OAuth login');
  const unrelatedScore = scoreFileForTask(unrelatedFile, 'add GitHub OAuth login');

  assert.ok(authScore.score > unrelatedScore.score);
  assert.ok(authScore.reasons.some((reason) => reason.includes('auth') || reason.includes('oauth') || reason.includes('session')));
});
