const mongoose = require('mongoose');

async function connectDb() {
  const envUri = (process.env.MONGODB_URI || '').trim();
  const uriLower = envUri.toLowerCase();
  const isAtlas = uriLower.includes('mongodb+srv') || uriLower.includes('mongodb.net');
  
  const isPlaceholder = !envUri ||
    uriLower.includes('<username>') ||
    uriLower.includes('username') ||
    uriLower.includes('<password>') ||
    uriLower.includes('password') ||
    uriLower.includes('xxxxx') ||
    uriLower.includes('replace-with') ||
    envUri.includes('127.0.0.1') ||
    envUri.includes('localhost');

  const isConfiguredAtlas = envUri && envUri.startsWith('mongodb') && !isPlaceholder;

  if (isConfiguredAtlas) {
    try {
      console.log(`📡 Connecting to MongoDB Atlas Cloud Cluster (${envUri.split('@')[1] || 'Cluster'})...`);
      await mongoose.connect(envUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`✅ [MongoDB Atlas] Connected successfully to MongoDB Atlas Cloud Cluster!`);
      return true;
    } catch (err) {
      console.warn(`⚠️ [MongoDB Atlas] Connection attempt failed: ${err.message}`);
    }
  } else {
    console.log('ℹ️ [MongoDB Atlas] Ready to connect! Paste your Atlas connection string in backend/.env:');
    console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lmvs?retryWrites=true&w=majority');
  }

  // Attempt local MongoDB on 27017 if running
  if (envUri.includes('127.0.0.1') || envUri.includes('localhost')) {
    try {
      await mongoose.connect(envUri, { serverSelectionTimeoutMS: 1000 });
      console.log(`✅ [MongoDB Local] Connected to ${envUri}`);
      return true;
    } catch (_e) {
      console.log('ℹ️ Local MongoDB daemon not active.');
    }
  }

  console.log('⚡ Active Data Layer: In-Memory / File-based engine active. Data operations available immediately.');
  return false;
}

async function disconnectDb() {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (_err) {
    // Ignore disconnect error
  }
}

module.exports = { connectDb, disconnectDb };
