import { topics } from '../data/mockData';
import { ITopic } from '../models/Topic';

export const topicService = {
  getAllTopics: (): ITopic[] => {
    return topics;
  },

  getTopicById: (id: string): ITopic | undefined => {
    return topics.find(topic => topic.id === id);
  },

  getTopicsByCategory: (category: string): ITopic[] => {
    return topics.filter(topic => topic.category.toLowerCase() === category.toLowerCase());
  },

  createTopic: (newTopic: Omit<ITopic, 'id'>): ITopic => {
    const topic: ITopic = {
      id: (topics.length + 1).toString(),
      ...newTopic
    };
    topics.push(topic);
    return topic;
  },

  updateTopic: (id: string, updatedTopic: Partial<ITopic>): ITopic | undefined => {
    const index = topics.findIndex(topic => topic.id === id);
    if (index !== -1) {
      topics[index] = { ...topics[index], ...updatedTopic };
      return topics[index];
    }
    return undefined;
  },

  deleteTopic: (id: string): boolean => {
    const index = topics.findIndex(topic => topic.id === id);
    if (index !== -1) {
      topics.splice(index, 1);
      return true;
    }
    return false;
  }
};
