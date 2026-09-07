import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001/api';
const EMAIL = `test_${Date.now()}@test.com`;
const PASSWORD = 'password123';

async function runTests() {
  console.log('--- Phase 1: Authentication API Tests ---');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${e.message}`);
      failed++;
    }
  };

  // Test 1: Successful Registration
  await test('User Registration', async () => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: EMAIL,
        password: PASSWORD,
      })
    });
    const data = await res.json();
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}. Msg: ${data.message || JSON.stringify(data)}`);
  });

  // Test 2: Duplicate Registration
  await test('Duplicate Registration returns 409 Conflict', async () => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User 2',
        email: EMAIL,
        password: PASSWORD,
      })
    });
    const data = await res.json();
    if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}. Msg: ${data.message}`);
  });

  // Test 3: Incorrect Password format
  await test('Incorrect Password returns 401 Unauthorized', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: EMAIL,
        password: 'wrongpassword!',
      })
    });
    const data = await res.json();
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}. Msg: ${data.message}`);
    if (data.message !== 'Incorrect password or email') throw new Error(`Expected specific message, got: ${data.message}`);
  });

  // Test 4: Forgot Password flow
  await test('Forgot Password API returns success', async () => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL })
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}. Msg: ${data.message || JSON.stringify(data)}`);
  });

  console.log('\n--- Summary ---');
  console.log(`Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
