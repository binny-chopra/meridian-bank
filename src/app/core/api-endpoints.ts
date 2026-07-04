import { environment } from '../../environments/environment';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

function api(path: string, mockFile: string): string {
  return environment.useMock ? `/mock/${mockFile}.json` : `${BASE_URL}/${path}`;
}

export const API_ENDPOINTS = {
  users: api('users', 'users'),
  posts: api('posts', 'posts'),
} as const;
