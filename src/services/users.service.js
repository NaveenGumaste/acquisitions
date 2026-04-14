import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { hashpassword } from '#services/auth.service.js';
import { eq } from 'drizzle-orm';

export const getALLUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      })
      .from(users);
  } catch (e) {
    logger.error('Error fetching users:', e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  } catch (e) {
    logger.error(`Error fetching user by id ${id}:`, e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const existingUser = await getUserById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatesToApply = { ...updates };

    if (updatesToApply.password) {
      updatesToApply.password = await hashpassword(updatesToApply.password);
    }

    updatesToApply.updated_at = new Date();

    const [updatedUser] = await db
      .update(users)
      .set(updatesToApply)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      });

    return updatedUser;
  } catch (e) {
    logger.error(`Error updating user with id ${id}:`, e);
    throw e;
  }
  cookies.setToke;
};

export const deleteUser = async id => {
  try {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    if (!deletedUser) {
      throw new Error('User not found');
    }

    return deletedUser;
  } catch (e) {
    logger.error(`Error deleting user with id ${id}:`, e);
    throw e;
  }
};
