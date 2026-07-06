import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { API_ENDPOINTS } from '../../core/api-endpoints';
import { DEFAULT_USERS_LIMIT } from '../../core/constants/http.constants';
import { UserActivity } from '../../core/models/user-activity';
import { VendorPost } from '../../core/models/post';
import { VendorUser } from '../../core/models/user';

@Injectable({
  providedIn: 'root',
})
export class UserActivityApi {
  private readonly http = inject(HttpClient);

  getUserActivity(): Observable<UserActivity[]> {
    const params = new HttpParams().set('_limit', DEFAULT_USERS_LIMIT);

    return forkJoin({
      users: this.http.get<VendorUser[]>(API_ENDPOINTS.users, { params }),
      posts: this.http.get<VendorPost[]>(API_ENDPOINTS.posts),
    }).pipe(map(({ users, posts }) => this.toUserActivity(users, posts)));
  }

  private toUserActivity(users: VendorUser[], posts: VendorPost[]): UserActivity[] {
    const postCountByUserId = new Map<number, number>();
    for (const post of posts) {
      postCountByUserId.set(post.userId, (postCountByUserId.get(post.userId) ?? 0) + 1);
    }

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      postCount: postCountByUserId.get(user.id) ?? 0,
    }));
  }
}
