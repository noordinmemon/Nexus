const Meeting = require('../models/Meeting');

// Schedule a meeting
exports.scheduleMeeting = async (req, res) => {
  try {
    const { title, scheduledWith, date, time, duration, message } = req.body;

    // Conflict detection - check if either user has a meeting at same date/time
    const conflict = await Meeting.findOne({
      date,
      time,
      status: { $in: ['pending', 'accepted'] },
      $or: [
        { scheduledBy: req.user.id },
        { scheduledWith: req.user.id },
        { scheduledBy: scheduledWith },
        { scheduledWith: scheduledWith }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        message: 'Time slot not available. Please choose a different time.'
      });
    }

    const meeting = await Meeting.create({
      title,
      scheduledBy: req.user.id,
      scheduledWith,
      date,
      time,
      duration: duration || 30,
      message
    });

    // Populate user details
    await meeting.populate('scheduledBy', 'name email role');
    await meeting.populate('scheduledWith', 'name email role');

    res.status(201).json({
      message: 'Meeting scheduled successfully',
      meeting
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all meetings for logged in user
exports.getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { scheduledBy: req.user.id },
        { scheduledWith: req.user.id }
      ]
    })
      .populate('scheduledBy', 'name email role avatar')
      .populate('scheduledWith', 'name email role avatar')
      .sort({ date: 1, time: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept a meeting
exports.acceptMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only the person who received the request can accept
    if (meeting.scheduledWith.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    meeting.status = 'accepted';
    meeting.meetingLink = `https://meet.nexus.com/room/${meeting._id}`;
    await meeting.save();

    res.json({ message: 'Meeting accepted', meeting });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a meeting
exports.rejectMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (meeting.scheduledWith.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    meeting.status = 'rejected';
    await meeting.save();

    res.json({ message: 'Meeting rejected', meeting });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel a meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (meeting.scheduledBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    meeting.status = 'cancelled';
    await meeting.save();

    res.json({ message: 'Meeting cancelled', meeting });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};