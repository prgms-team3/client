import { api } from '@/lib/axios';
import type {
  Workspace,
  CreateWorkspace,
  UpdateWorkspace,
} from '@/types/workspace';

// 워크스페이스 생성
export async function createWorkspace(
  payload: CreateWorkspace
): Promise<Workspace> {
  const res = await api.post<Workspace>('/workspaces', payload);
  return res.data;
}

// 워크스페이스 목록 조회
export async function fetchMyWorkspaces() {
  const res = await api.get('/workspaces/my');
  return res.data;
}

export async function updateWorkspace(
  id: string,
  body: UpdateWorkspace
): Promise<Workspace> {
  const { data } = await api.patch(`/workspaces/${id}`, body); // PATCH /workspaces/{id}
  return data;
}

// 워크스페이스 삭제
export async function deleteWorkspace(id: string | number): Promise<void> {
  await api.delete(`/workspaces/${id}`);
}

//워크스페이스 활성화
export async function activateWorkspace(id: string | number): Promise<void> {
  await api.patch(`/workspaces/${id}/activate`);
}

// 워크스페이스 비활성화
export async function deactivateWorkspace(id: string | number): Promise<void> {
  await api.patch(`/workspaces/${id}/deactivate`);
}
