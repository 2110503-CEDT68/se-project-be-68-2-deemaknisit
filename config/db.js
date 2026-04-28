const mongoose = require('mongoose');

const connectDB = async ()=>{
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Sync indexes to remove old ones and rebuild from schema
    try {
        await mongoose.connection.syncIndexes();
        console.log('Indexes synced successfully');
    } catch (err) {
        console.error('Error syncing indexes:', err.message);
    }

console.log('MongoDB connected:', conn.connection.host, 'DB:', conn.connection.db.databaseName);}

module.exports = connectDB;