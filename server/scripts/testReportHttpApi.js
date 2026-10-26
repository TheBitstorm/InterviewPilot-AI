// server/scripts/testReportHttpApi.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

async function testHttp() {
  console.log('=== TESTING REPORT HTTP API ENDPOINTS ===');

  const userId = 'cmuu6hi4700004k2k5qqreplr';
  const unauthorizedUserId = 'cmuswklpm0002kk2k7393irem';
  const sessionId = 'cmuu6k54m00014k2k0tfyyk2s';

  // Mint valid JWT tokens for both users matching auth convention
  const token = jwt.sign({ sub: userId, email: 'day4test@interviewpilot.dev', role: 'candidate' }, env.JWT_SECRET, { expiresIn: '1h' });
  const unauthorizedToken = jwt.sign({ sub: unauthorizedUserId, email: 'day3_user1@example.com', role: 'candidate' }, env.JWT_SECRET, { expiresIn: '1h' });

  // 1. POST /api/v1/reports/generate/:sessionId (idempotent retrieval)
  console.log('1. Testing POST /api/v1/reports/generate/:sessionId...');
  const genRes = await fetch(`http://localhost:5000/api/v1/reports/generate/${sessionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const genJson = await genRes.json();
  console.log(`Status: ${genRes.status}, generated: ${genJson.data?.generated}, score: ${genJson.data?.report?.overallScore}`);
  if (genRes.status !== 200 || genJson.data?.generated !== false) {
    throw new Error('POST /generate failed or was not idempotent');
  }
  const reportId = genJson.data?.report?.id;
  console.log(`✓ POST /generate succeeded with report ID: ${reportId}`);

  // 2. GET /api/v1/reports/:id
  console.log('\n2. Testing GET /api/v1/reports/:id...');
  const getRes = await fetch(`http://localhost:5000/api/v1/reports/${reportId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const getJson = await getRes.json();
  console.log(`Status: ${getRes.status}, score: ${getJson.data?.overallScore}, summary: ${getJson.data?.summary?.slice(0, 50)}...`);
  if (getRes.status !== 200 || !getJson.data?.overallScore) {
    throw new Error('GET /reports/:id failed');
  }
  console.log('✓ GET /reports/:id succeeded');

  // 3. GET /api/v1/reports (all user reports)
  console.log('\n3. Testing GET /api/v1/reports...');
  const getAllRes = await fetch(`http://localhost:5000/api/v1/reports`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const getAllJson = await getAllRes.json();
  console.log(`Status: ${getAllRes.status}, count: ${getAllJson.data?.length}`);
  if (getAllRes.status !== 200 || !Array.isArray(getAllJson.data) || getAllJson.data.length === 0) {
    throw new Error('GET /reports failed');
  }
  console.log('✓ GET /reports succeeded');

  // 4. Unauthorized Access Check: unauthorized user tries to fetch report
  console.log('\n4. Testing Unauthorized Access (Security)...');
  const unauthRes = await fetch(`http://localhost:5000/api/v1/reports/${reportId}`, {
    headers: { 'Authorization': `Bearer ${unauthorizedToken}` }
  });
  const unauthJson = await unauthRes.json();
  console.log(`Status: ${unauthRes.status}, error: ${unauthJson.error?.message || unauthJson.message}`);
  if (unauthRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden, got ${unauthRes.status}`);
  }
  console.log('✓ Unauthorized access successfully blocked with 403 Forbidden');

  console.log('\n=== ALL HTTP API ENDPOINT TESTS PASSED ===');
}

testHttp().catch(err => {
  console.error('HTTP test failed:', err);
  process.exit(1);
});
