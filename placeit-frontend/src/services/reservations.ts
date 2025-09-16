import { api } from '@/lib/axios';

export interface CreateReservationBody {
  spaceId: number;
  startTime: string; // ISO
  endTime: string; // ISO
  purpose: string; // 제목
  attendees?: string;
  memo?: string;
}

export interface Reservation {
  id: number;
  spaceId: number;
  userId: number;
  attendees: string;
  memo: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiReservation = {
  id: number;
  spaceId: number;
  userId: number;
  attendees: string;
  memo: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  purpose: string;
  createdAt: string;
  updatedAt: string;
  space: {
    id: number;
    name: string;
    capacity: number;
    description: string;
    amenities: string[];
    isActive: boolean;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
};

// 예약 생성
export async function createReservation(body: CreateReservationBody) {
  const { data } = await api.post<Reservation>('/reservations', body);
  return data;
}

// 예약 조회
export async function fetchWorkspaceReservations(workspaceId: number) {
  const { data } = await api.get<{
    reservations: ApiReservation[];
    total: number;
  }>(`/workspaces/${workspaceId}/reservations`);
  return data.reservations;
}
