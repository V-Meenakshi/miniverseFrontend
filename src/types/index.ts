export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  publishAt: string;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  likesCount: number;
  commentsCount: number;
  likedBy?: string[];
  isLiked?: boolean;
  fileUrl?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface PostRequest {
  title: string;
  content: string;
  publishAt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  isPrivate: boolean;
  fileUrl?: string;
}

export interface CommentRequest {
  content: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}