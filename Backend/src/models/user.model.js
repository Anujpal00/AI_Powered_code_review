const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  type: { type: String, enum: ['review', 'codegen'], default: 'review' },
  codeSnippet: { type: String },
  issues: [{ type: String }],
  suggestions: [{ type: String }],
  query: { type: String },
  language: { type: String },
  generatedCode: { type: String },
  explanation: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  createdAt: { type: Date, default: Date.now },
  history: [historySchema]
});

module.exports = mongoose.model('User', userSchema);
