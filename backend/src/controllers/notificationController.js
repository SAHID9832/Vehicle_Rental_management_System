const db = require('../config/database');
const { success, error } = require('../utils/response');

/**
 * Get all notifications for current user
 */
const getAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return success(res, rows, 'Notifications fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a notification as read
 */
const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const [result] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return error(res, 'Notification not found or unauthorized', 404);
    }
    return success(res, null, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read
 */
const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    return success(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  markRead,
  markAllRead,
};
