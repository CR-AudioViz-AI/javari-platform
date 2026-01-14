/**
 * Phase G: Community Engine Test Suite
 */

import { getPermissions, canCreateContent, canManageSettings } from '../security/communityRoles';
import { activityTracker } from '../analytics/activity';
import { resolveCommunityAssetPath } from '../assets/communityResolver';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runPhaseGTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase G Test Harness - Community Engine');
  console.log('══════════════════════════════════════\n');

  results.push(testRolePermissions());
  results.push(testAssetPathResolver());
  results.push(await testActivityTracking());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

function testRolePermissions(): TestResult {
  try {
    const ownerPerms = getPermissions('owner');
    const memberPerms = getPermissions('member');
    const guestPerms = getPermissions('guest');

    const passed = 
      ownerPerms.manageSettings === true &&
      memberPerms.createContent === true &&
      guestPerms.createContent === false;

    console.log(`${passed ? '✓' : '✗'} Role Permissions: ${passed ? 'correct' : 'failed'}`);

    return {
      testName: 'Role Permissions',
      passed,
      details: `Owner: ${ownerPerms.manageSettings}, Member: ${memberPerms.createContent}, Guest: ${guestPerms.createContent}`,
    };
  } catch (error) {
    return {
      testName: 'Role Permissions',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testAssetPathResolver(): TestResult {
  try {
    const path = resolveCommunityAssetPath({
      communityId: 'test-123',
      tool: 'presentation-maker',
      assetType: 'exports',
      year: 2026,
      month: 1,
    });

    const expected = '/mnt/user-data/communities/test-123/presentation-maker/exports/2026/01';
    const passed = path === expected;

    console.log(`${passed ? '✓' : '✗'} Asset Path Resolver: ${passed ? 'correct' : 'failed'}`);

    return {
      testName: 'Asset Path Resolver',
      passed,
      details: `Path: ${path}`,
    };
  } catch (error) {
    return {
      testName: 'Asset Path Resolver',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testActivityTracking(): Promise<TestResult> {
  try {
    // Test activity logging (will use in-memory if DB not configured)
    await activityTracker.recordContentCreation('test-community', 'test-user', 'presentation-maker', 'test-content-123');

    console.log(`✓ Activity Tracking: logged`);

    return {
      testName: 'Activity Tracking',
      passed: true,
      details: 'Activity logged successfully',
    };
  } catch (error) {
    return {
      testName: 'Activity Tracking',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
