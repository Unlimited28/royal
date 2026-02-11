import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

async function testDuplicatePresident() {
  const baseURL = 'http://localhost:8000/api';
  const assocName = 'Ogun State Baptist Conference';

  // 1. Get original president
  await mongoose.connect(process.env.MONGODB_URI!);
  const association = await mongoose.connection.db.collection('associations').findOne({ name: assocName });
  const originalPresId = association?.president;
  console.log('Original President ID:', originalPresId);

  // 2. Register a second president
  console.log('Registering a second president for the same association...');
  const newEmail = `new_pres_${Date.now()}@ogbcra.org`;
  await axios.post(`${baseURL}/auth/register`, {
        email: newEmail,
        password: 'presaccess123',
        firstName: 'Second',
        lastName: 'President',
        phone: '08000000000',
        church: 'Test Church',
        associationName: assocName,
        age: 40,
        role: 'president',
        passcode: 'presaccess123'
  });

  // 3. Verify transition
  const updatedAssociation = await mongoose.connection.db.collection('associations').findOne({ name: assocName });
  const newPresId = updatedAssociation?.president;
  console.log('New President ID:', newPresId);

  const oldPres = await mongoose.connection.db.collection('users').findOne({ _id: originalPresId });
  console.log('Old President Status:', oldPres?.status);
  console.log('Old President isCurrentPresident:', oldPres?.isCurrentPresident);

  if (newPresId && !newPresId.equals(originalPresId) && oldPres?.isCurrentPresident === false) {
    console.log('PASS: President transition enforced correctly');
  } else {
    console.log('FAIL: President transition failed');
  }

  await mongoose.disconnect();
}

testDuplicatePresident().catch(console.error);
