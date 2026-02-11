import axios from 'axios';

async function testSecurity() {
  const baseURL = 'http://localhost:8000/api';

  // 1. Login as Ambassador
  console.log('Logging in as Ambassador...');
  const loginRes = await axios.post(`${baseURL}/auth/login`, {
    email: 'ambassador@ogbcra.org',
    password: 'password123'
  });
  const token = loginRes.data.accessToken;
  const authHeader = { Authorization: `Bearer ${token}` };

  // 2. Attempt to access Admin stats
  console.log('Attempting to access Admin stats as Ambassador...');
  try {
    await axios.get(`${baseURL}/dashboard/superadmin/stats`, { headers: authHeader });
    console.error('FAIL: Ambassador could access Super Admin stats');
  } catch (error) {
    console.log('PASS: Ambassador blocked from Super Admin stats (Status:', error.response?.status, ')');
  }

  // 3. Attempt to create an exam
  console.log('Attempting to create an exam as Ambassador...');
  try {
    await axios.post(`${baseURL}/exams`, { title: 'Hack Exam' }, { headers: authHeader });
    console.error('FAIL: Ambassador could create an exam');
  } catch (error) {
    console.log('PASS: Ambassador blocked from creating exam (Status:', error.response?.status, ')');
  }

  // 4. Attempt to access President users
  console.log('Attempting to access President users as Ambassador...');
  try {
    await axios.get(`${baseURL}/dashboard/president/users`, { headers: authHeader });
    console.error('FAIL: Ambassador could access President users');
  } catch (error) {
    console.log('PASS: Ambassador blocked from President users (Status:', error.response?.status, ')');
  }

  // 5. Test Refresh Token Reuse
  console.log('Testing Refresh Token Reuse...');
  const refreshToken = loginRes.data.refreshToken;

  console.log('First refresh attempt...');
  const refresh1 = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  console.log('First refresh success');

  console.log('Second refresh attempt with SAME token (reuse)...');
  try {
    await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
    console.error('FAIL: Refresh token reuse allowed');
  } catch (error) {
    console.log('PASS: Refresh token reuse blocked (Status:', error.response?.status, ')');
    console.log('Message:', error.response?.data?.message);
  }
}

testSecurity().catch(console.error);
