import { ITopic } from '../models/Topic';
import { IUser } from '../models/User';

export const topics: any[] = [
  {
    id: '1',
    title: 'The Big Bang Theory',
    content: 'The Big Bang theory is the prevailing cosmological model explaining the existence of the observable universe from the earliest known periods through its subsequent large-scale evolution.',
    category: 'Science'
  },
  {
    id: '2',
    title: 'The Renaissance',
    content: 'The Renaissance was a period of cultural, artistic, political, and economic revival following the Middle Ages. Generally described as taking place from the 14th to the 17th century, the Renaissance promoted the rediscovery of classical philosophy, literature, and art.',
    category: 'History'
  },
  {
    id: '3',
    title: 'Artificial Intelligence',
    content: 'Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.',
    category: 'Technology'
  },
  {
    id: '4',
    title: 'Impressionism',
    content: 'Impressionism is a 19th-century art movement characterized by relatively small, thin, yet visible brush strokes, open composition, emphasis on accurate depiction of light in its changing qualities, ordinary subject matter, inclusion of movement as a crucial element of human perception and experience, and unusual visual angles.',
    category: 'Art'
  }
];

export const users: any[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    favoriteTopics: ['1', '3']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    favoriteTopics: ['2', '4']
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    favoriteTopics: ['1', '2', '3']
  }
];
