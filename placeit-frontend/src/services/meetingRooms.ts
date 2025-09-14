import { api } from '@/lib/axios';

// 회의실 조회
export async function fetchWorkspaceRooms(workspaceId: string | number) {
  const { data } = await api.get<{ spaces: any[]; total: number }>(
    `/workspaces/${workspaceId}/spaces`
  );
  return data.spaces;
}
