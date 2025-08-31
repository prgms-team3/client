export interface MeetingRoom {
  id: string;
  name: string;
  description: string;
  capacity: number;
  features: string[];
  status: 'available' | 'occupied' | 'reserved';
  imageUrl?: string;
  reservedTime?: string;
}

export interface Reservation {
  id: string;
  title: string;
  room: string;
  date: string;
  time: string;
  attendees: string[];
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  members: User[];
  createdAt: Date;
}

export type CalendarView = 'day' | 'week' | 'month';

export interface ReservationFormData {
  title: string;
  room: string;
  date: string;
  time: string;
  attendees: string[];
  notes?: string;
}
