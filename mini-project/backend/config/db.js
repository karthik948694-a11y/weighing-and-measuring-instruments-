const mongoose = require('mongoose');

let mongoServerInstance = null;

async function connectDb() {
  let uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('USERNAME:PASSWORD')) {
    uri = 'mongodb://127.0.0.1:27017/lmvs';
  }

  // 1. Attempt connection to configured URI with quick timeout
  try {
    console.log(`Attempting connection to MongoDB (${uri.includes('127.0.0.1') || uri.includes('localhost') ? 'Local' : 'Remote'})...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to MongoDB successfully!');
    return;
  } catch (err) {
    console.warn(`Standard MongoDB connection unavailable (${err.message}).`);
  }

  // 2. Fallback to embedded In-Memory MongoDB
  try {
    console.log('Starting In-Memory MongoDB Server (zero setup required)...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServerInstance = await MongoMemoryServer.create({
      instance: { dbName: 'lmvs' }
    });
    const memUri = mongoServerInstance.getUri();
    await mongoose.connect(memUri);
    console.log(`Connected to In-Memory MongoDB at ${memUri}`);
  } catch (memErr) {
    console.error('Failed to start In-Memory MongoDB fallback:', memErr.message);
    throw memErr;
  }
}

module.exports = { connectDb };
