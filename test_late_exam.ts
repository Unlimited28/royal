import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

async function testLateSubmission() {
  const baseURL = 'http://localhost:8000/api';

  // 1. Login
  const loginRes = await axios.post(`${baseURL}/auth/login`, {
    email: 'ambassador@ogbcra.org',
    password: 'password123'
  });
  const token = loginRes.data.accessToken;
  const authHeader = { Authorization: `Bearer ${token}` };

  // 2. Find an exam
  const examsRes = await axios.get(`${baseURL}/exams`, { headers: authHeader });
  const examId = examsRes.data[0]._id;

  // 3. Start attempt
  console.log('Starting exam attempt...');
  const startRes = await axios.post(`${baseURL}/exams/${examId}/start`, {}, { headers: authHeader });
  const attemptId = startRes.data._id;
  console.log('Attempt ID:', attemptId);

  // 4. Manually manipulate DB to make attempt old
  console.log('Manipulating DB to make attempt expired...');
  await mongoose.connect(process.env.MONGO_URL!);
  await mongoose.connection.db.collection('examattempts').updateOne(
    { _id: new mongoose.Types.ObjectId(attemptId) },
    { $set: { startedAt: new Date(Date.now() - 3600 * 1000) } } // 1 hour ago
  );

  // 5. Submit attempt
  console.log('Attempting to submit expired exam...');
  await axios.post(`${baseURL}/exams/attempts/${attemptId}/submit`, {
    answers: {}
  }, { headers: authHeader });

  // 6. Verify status in DB
  const attempt = await mongoose.connection.db.collection('examattempts').findOne({ _id: new mongoose.Types.ObjectId(attemptId) });
  console.log('Final Attempt Status in DB:', attempt?.status);
  console.log('Late flag in DB:', attempt?.late);

  if (attempt?.status === 'AUTO_SUBMITTED' && attempt?.late === true) {
    console.log('PASS: Exam correctly hardened against late submission');
  } else {
    console.log('FAIL: Exam hardening failed');
  }

  await mongoose.disconnect();
}

testLateSubmission().catch(console.error);
