import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb+srv://adityamadan15_db_user:MaddyAniDikshita747738@cluster0.rvmrvf2.mongodb.net/devconnect?retryWrites=true&w=majority&appName=Cluster0');
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
  const res = await User.updateOne({ email: 'jaindikshita234@gmail.com' }, { $set: { username: 'Dikshita-Jain-06' } });
  console.log('Update result:', res);
  process.exit(0);
}

run();
