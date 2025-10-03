const User = require('../models/user.model');

exports.addHistory = async (req, res) => {
  try {
    const { type, codeSnippet, issues, suggestions, query, language, generatedCode, explanation } = req.body;
    const user = await User.findById(req.user.id);
    if (type === 'codegen') {
      user.history.push({ type: 'codegen', query, language, generatedCode, explanation });
    } else {
      user.history.push({ type: 'review', codeSnippet, issues, suggestions });
    }
    await user.save();
    res.status(201).json({ message: 'History added.' });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getHistory = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.history);
};

exports.deleteHistory = async (req, res) => {
  const { index } = req.params;
  const user = await User.findById(req.user.id);
  if (index < 0 || index >= user.history.length) {
    return res.status(400).json({ message: 'Invalid index' });
  }
  user.history.splice(index, 1);
  await user.save();
  res.json({ message: 'History deleted' });
};
