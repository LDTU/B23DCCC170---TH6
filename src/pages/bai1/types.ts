export type Priority = 'Cao' | 'Trung bình' | 'Thấp';
export type Status = 'Chưa làm' | 'Đang làm' | 'Đã xong';

export interface User {
  username: string;
  password: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  createdAt: string;
  completedAt?: string;
  order: number;
} 