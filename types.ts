
export type Category = 'Cliente' | 'Amigo' | 'Familiar' | 'Trabalho' | 'Outros';

export interface Birthday {
  id: string;
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  phone?: string;
  email?: string;
  observations?: string;
  category: Category;
  createdAt: string;
  userId: string;
}

export interface Notification {
  id: string;
  birthdayId: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'TODAY' | 'UPCOMING';
}

export interface UserSettings {
  notificationDays: number;
  notificationsEnabled: boolean;
  notificationTime: string; // HH:mm
}

export interface User {
  id: string;
  name: string;
  email: string;
  settings: UserSettings;
}
