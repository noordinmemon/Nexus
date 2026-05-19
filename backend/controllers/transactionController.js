const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');

// Generate mock transaction ID
const generateTransactionId = () => {
  return 'txn_' + Math.random().toString(36).substring(2, 15) + Date.now();
};

// Deposit
exports.deposit = async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      amount,
      status: 'completed',
      description: description || 'Deposit',
      transactionId: generateTransactionId()
    });

    res.status(201).json({
      message: 'Deposit successful',
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Withdraw
exports.withdraw = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const deposits = await Transaction.aggregate([
      { $match: { user: userId, type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const withdrawals = await Transaction.aggregate([
      { $match: { user: userId, type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const balance = (deposits[0]?.total || 0) - (withdrawals[0]?.total || 0);

    if (amount > balance) {
      return res.status(400).json({ message: `Insufficient balance. Current balance: $${balance}` });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'withdrawal',
      amount,
      status: 'completed',
      description: description || 'Withdrawal',
      transactionId: generateTransactionId()
    });

    res.status(201).json({
      message: 'Withdrawal successful',
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Transfer
exports.transfer = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { amount, recipientId, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const deposits = await Transaction.aggregate([
      { $match: { user: userId, type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const withdrawals = await Transaction.aggregate([
      { $match: { user: userId, type: { $in: ['withdrawal', 'transfer'] }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const balance = (deposits[0]?.total || 0) - (withdrawals[0]?.total || 0);

    if (amount > balance) {
      return res.status(400).json({ message: `Insufficient balance. Current balance: $${balance}` });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'transfer',
      amount,
      status: 'completed',
      description: description || `Transfer to ${recipient.name}`,
      recipient: recipientId,
      transactionId: generateTransactionId()
    });

    res.status(201).json({
      message: 'Transfer successful',
      transaction
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transactions + balance
exports.getTransactions = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const transactions = await Transaction.find({ user: req.user.id })
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });

    const deposits = await Transaction.aggregate([
      { $match: { user: userId, type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const debits = await Transaction.aggregate([
      { $match: { user: userId, type: { $in: ['withdrawal', 'transfer'] }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const balance = (deposits[0]?.total || 0) - (debits[0]?.total || 0);

    res.json({ transactions, balance });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};