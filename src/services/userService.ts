import { users } from '../data/mockData';
import { IUser } from '../models/User';

export const userService = {
  getAllUsers: (): IUser[] => {
    return users;
  },

  getUserById: (id: string): IUser | undefined => {
    return users.find(user => user.id === id);
  },

  createUser: (newUser: Omit<IUser, 'id'>): IUser => {
    const user: IUser = {
      id: (users.length + 1).toString(),
      ...newUser
    };
    users.push(user);
    return user;
  },

  updateUser: (id: string, updatedUser: Partial<IUser>): IUser | undefined => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      return users[index];
    }
    return undefined;
  },

  deleteUser: (id: string): boolean => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users.splice(index, 1);
      return true;
    }
    return false;
  },

  addFavoriteTopic: (userId: string, topicId: string): IUser | undefined => {
    const user = users.find(user => user.id === userId);
    if (user && !user.favoriteTopics.includes(topicId)) {
      user.favoriteTopics.push(topicId);
      return user;
    }
    return undefined;
  },

  removeFavoriteTopic: (userId: string, topicId: string): IUser | undefined => {
    const user = users.find(user => user.id === userId);
    if (user) {
      user.favoriteTopics = user.favoriteTopics.filter((id: string) => id !== topicId);
      return user;
    }
    return undefined;
  }
};
