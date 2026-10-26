// server/scripts/testResumeDeleteFlow.js
require('dotenv').config();
const prisma = require('../src/config/db');
const { signToken } = require('../src/utils/jwtHelper');

async function runTests() {
  console.log('=== TESTING RESUME DELETE BACKEND FLOW ===\n');

  // 1. Get or create a test user
  let user = await prisma.user.findFirst({ where: { email: 'diyu1234@gmail.com' } });
  if (!user) {
    user = await prisma.user.findFirst();
  }
  if (!user) {
    throw new Error('No user found to run test against.');
  }

  console.log(`Testing with user: ${user.name} (${user.id})`);
  const token = signToken(user);

  // 2. Insert two test resumes directly to test deletion flow
  const testResume1 = await prisma.resume.create({
    data: {
      userId: user.id,
      fileName: 'Test_Candidate_Alpha.pdf',
      filePath: '',
      parsedText: 'Experienced Senior Engineer with React, Node, and Python skills.',
      isActive: false,
    },
  });
  console.log(`✓ Created test resume 1: ${testResume1.fileName} (${testResume1.id})`);

  const testResume2 = await prisma.resume.create({
    data: {
      userId: user.id,
      fileName: 'Test_Candidate_Beta.pdf',
      filePath: '',
      parsedText: 'Experienced DevOps Engineer with Kubernetes, Docker, and CI/CD skills.',
      isActive: true,
    },
  });
  console.log(`✓ Created test resume 2 (active): ${testResume2.fileName} (${testResume2.id})`);

  // 3. GET /api/v1/resumes - verify both are present
  const listRes = await fetch('http://localhost:5000/api/v1/resumes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  const hasRes1 = listData.data?.some((r) => r.id === testResume1.id);
  const hasRes2 = listData.data?.some((r) => r.id === testResume2.id);
  console.log(`GET /resumes found testResume1: ${hasRes1}, testResume2: ${hasRes2}`);
  if (!hasRes1 || !hasRes2) {
    throw new Error('Failed to find created test resumes in GET /resumes');
  }

  // 4. DELETE /api/v1/resumes/:id - delete testResume2 (the active one)
  console.log(`\nDeleting test resume 2: ${testResume2.id}...`);
  const delRes = await fetch(`http://localhost:5000/api/v1/resumes/${testResume2.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const delData = await delRes.json();
  console.log(`DELETE status: ${delRes.status}, message: ${delData.message}`);
  if (delRes.status !== 200 || !delData.success) {
    throw new Error(`DELETE /resumes/:id failed: ${JSON.stringify(delData)}`);
  }

  // 5. Verify in DB and via API that testResume2 is gone
  const dbCheck = await prisma.resume.findUnique({ where: { id: testResume2.id } });
  console.log(`DB check for deleted resume (should be null): ${dbCheck}`);
  if (dbCheck !== null) {
    throw new Error('Deleted resume still exists in database!');
  }

  const listAfterDel = await fetch('http://localhost:5000/api/v1/resumes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listAfterData = await listAfterDel.json();
  const stillHasRes2 = listAfterData.data?.some((r) => r.id === testResume2.id);
  const stillHasRes1 = listAfterData.data?.some((r) => r.id === testResume1.id);
  console.log(`After deletion: testResume2 exists: ${stillHasRes2}, testResume1 exists: ${stillHasRes1}`);
  if (stillHasRes2 || !stillHasRes1) {
    throw new Error('Resume list state invalid after deletion');
  }

  // 6. Verify Active Promotion: since testResume2 was active, testResume1 should now be active!
  const activeRes = await fetch('http://localhost:5000/api/v1/resumes/active', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const activeData = await activeRes.json();
  console.log(`Active resume after deleting previous active: ${activeData.data?.fileName} (id: ${activeData.data?.id})`);
  if (activeData.data?.id !== testResume1.id) {
    throw new Error(`Expected remaining resume ${testResume1.id} to be active, but got ${activeData.data?.id}`);
  }

  // 7. Test 404 for non-existent ID
  console.log('\nTesting deletion with invalid ID...');
  const notFoundRes = await fetch('http://localhost:5000/api/v1/resumes/non_existent_id_123', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`Invalid ID DELETE status (expected 404): ${notFoundRes.status}`);
  if (notFoundRes.status !== 404) {
    throw new Error(`Expected 404 for invalid ID, got ${notFoundRes.status}`);
  }

  // 8. Delete testResume1 to clean up test data
  console.log(`\nCleaning up testResume1 (${testResume1.id})...`);
  const cleanupRes = await fetch(`http://localhost:5000/api/v1/resumes/${testResume1.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`Cleanup status: ${cleanupRes.status}`);

  console.log('\n========================================');
  console.log('✓ ALL RESUME DELETE TESTS PASSED SUCCESSFULLY!');
  console.log('========================================');
}

runTests()
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
