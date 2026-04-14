import logger from '#config/logger.js';
import {
  deleteUser as deleteUserService,
  getALLUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
} from '#services/users.service.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users');
    const allUsers = await getALLUsers();
    res.status(200).json({
      message: 'Users fetched successfully',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    const { id } = paramsValidation.data;

    logger.info(`Fetching user with id: ${id}`);
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User fetched successfully',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by id', e);
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);
    const bodyValidation = updateUserSchema.safeParse(req.body);

    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = paramsValidation.data;
    const updates = bodyValidation.data;
    const authUserId = Number(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && authUserId !== id) {
      logger.warn(`User ${authUserId} attempted to update user ${id}`);
      return res
        .status(403)
        .json({ error: 'You are not allowed to update this user' });
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'role') && !isAdmin) {
      logger.warn(`User ${authUserId} attempted to change role for user ${id}`);
      return res.status(403).json({ error: 'Only admin can update user role' });
    }

    logger.info(`Updating user with id: ${id}`);
    const updatedUser = await updateUserService(id, updates);

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = paramsValidation.data;
    const authUserId = Number(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && authUserId !== id) {
      logger.warn(`User ${authUserId} attempted to delete user ${id}`);
      return res
        .status(403)
        .json({ error: 'You are not allowed to delete this user' });
    }

    logger.info(`Deleting user with id: ${id}`);
    const deletedUser = await deleteUserService(id);

    return res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (e) {
    logger.error('Error deleting user', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};
