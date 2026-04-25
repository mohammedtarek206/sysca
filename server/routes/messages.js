const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Message = require('../models/Message');

// @route   POST api/messages
// @desc    Create a message (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { title, content, targetRole, recipient } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ msg: 'Please provide title and content' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      title,
      content,
      targetRole,
      recipient: targetRole === 'single_student' ? recipient : null
    });

    const message = await newMessage.save();
    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/messages
// @desc    Get messages for current user
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, filter messages directed to them
    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { targetRole: 'all' },
          { targetRole: req.user.role },
          { recipient: req.user.id }
        ]
      };
    }

    const messages = await Message.find(query)
    .populate('sender', 'name')
    .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/messages/:id
// @desc    Delete a message
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Message removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
