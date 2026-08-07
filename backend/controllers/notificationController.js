const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const Expert = require('../models/Expert');

// Creates a reminder notification for any of the user's scheduled appointments
// happening within the next 24 hours that haven't been reminded about yet.
// This runs whenever notifications are fetched, so no separate scheduler/cron
// job is needed.
const createDueReminders = async (user) => {
  let filter;

  if (user.role === 'expert') {
    const expert = await Expert.findOne({ userId: user._id });
    if (!expert) return;
    filter = { expertId: expert._id };
  } else {
    filter = { farmerId: user._id };
  }

  const soon = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const dueAppointments = await Appointment.find({
    ...filter,
    status: 'scheduled',
    reminderSent: false,
    date: { $gte: new Date(), $lte: soon },
  });

  for (const appointment of dueAppointments) {
    await Notification.create({
      userId: user._id,
      message: `Reminder: your consultation "${appointment.title}" is coming up soon`,
      link: '/consultations',
    });
    appointment.reminderSent = true;
    await appointment.save();
  }
};

// GET /api/notifications
const listNotifications = async (req, res) => {
  try {
    await createDueReminders(req.user);

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

module.exports = { listNotifications, markAsRead };
