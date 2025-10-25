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

const roadmapDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  objectives: [{ type: String }],
  task: { type: String },
  resources: [{ type: String }],
  practiceQuestions: [{ type: String }],
  tip: { type: String },
  nextDayHint: { type: String },
  completed: { type: Boolean, default: false }
});

const roadmapSchema = new mongoose.Schema({
  field: { type: String, required: true },
  duration: { type: Number, required: true },
  skillLevel: { type: String, required: true },
  dailyTime: { type: String },
  days: [roadmapDaySchema],
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  createdAt: { type: Date, default: Date.now },
  history: [historySchema],
  roadmap: roadmapSchema
});

module.exports = mongoose.model('User', userSchema);
