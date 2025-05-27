const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('dotenv').config();


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const urlSchema = new Schema({
  url: { type: String, required: true },
  shortUrl: { type: String, required: true }
});

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;
