import { api } from '@/lib/axios';

export type ApiWorkspaceUser = {
  id: number;
  workspaceId: number;
  userId: number;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MEMBER';
  department: string | null;
  position: string | null;
  joinedAt: string;
  updatedAt: string;
  monthlyReservationCount: number;
  user: {
    id: number;
    email: string;
    provider: string;
    providerId: string;
    name: string;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
};

// 사용자 관리에서 사용자 목록 불러오기
export async function fetchWorkspaceUsers(workspaceId: string | number) {
  const { data } = await api.get<ApiWorkspaceUser[]>(
    `/workspaces/${workspaceId}/users`
  );
  return data;
}

// 사용자 관리에서 특정 사용자 삭제
export async function deleteWorkspaceUser(
  workspaceId: string | number,
  userId: string | number
) {
  await api.delete(`/workspaces/${workspaceId}/users/${userId}`);
}
