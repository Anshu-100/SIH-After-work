/**
 * create_gov_account.js
 * One-time script to create a government admin account.
 * Usage: node create_gov_account.js
 *
 * Default credentials:
 *   Email:    gov@jharkhand.gov.in
 *   Password: GovAdmin@2024
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

const GOV_EMAIL    = 'gov@jharkhand.gov.in';
const GOV_PASSWORD = 'GovAdmin@2024';

async function main() {
  console.log('\n🔗 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('✅ MongoDB connected.\n');

  // Check if already exists
  const existing = await User.findOne({ email: GOV_EMAIL });
  if (existing) {
    if (existing.role === 'government') {
      console.log('ℹ️  Government account already exists. Nothing to do.');
    } else {
      // Upgrade role if account exists as citizen
      existing.role = 'government';
      existing.isVerified = true;
      await existing.save();
      console.log('✅ Existing account upgraded to government role.');
    }
    await mongoose.disconnect();
    return;
  }

  // Create new government account
  const hashedPassword = await bcrypt.hash(GOV_PASSWORD, 10);
  const govUser = new User({
    email:      GOV_EMAIL,
    password:   hashedPassword,
    isVerified: true,           // No OTP needed for gov account
    role:       'government',
  });

  await govUser.save();
  console.log('🏛️  Government account created successfully!\n');
  console.log('─────────────────────────────────────────');
  console.log(`  Login URL : http://localhost:5173/gov-login`);
  console.log(`  Email     : ${GOV_EMAIL}`);
  console.log(`  Password  : ${GOV_PASSWORD}`);
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

