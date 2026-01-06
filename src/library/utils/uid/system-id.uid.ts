import { customAlphabet } from 'nanoid';

export const systemId = () => customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 36)();
