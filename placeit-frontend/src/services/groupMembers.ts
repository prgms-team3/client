import { api } from '@/lib/axios';

export type ApiGroupMember = {
  id: number;
  groupId: number;
  userId: number;
  role: 'ADMIN' | 'LEADER' | 'MEMBER';
  joinedAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    provider: string | null;
    providerId: string | null;
    name: string;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
};

/** 멤버 조회 */
export async function fetchGroupMembers(
  groupId: string | number
): Promise<ApiGroupMember[]> {
  const id = String(groupId);
  const { data } = await api.get(`/groups/${id}/members`);
  // 서버가 배열을 준다고 가정
  return Array.isArray(data) ? (data as ApiGroupMember[]) : [];
}

/** 멤버 제거 */
export async function removeGroupMember(
  groupId: string | number,
  userId: string | number
) {
  const gid = String(groupId);
  const uid = String(userId);
  await api.delete(`/groups/${gid}/members/${uid}`);
}
