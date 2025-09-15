import { api } from '@/lib/axios';

export interface Space {
  id: number;
  workspaceId: number;
  name: string;
  description: string;
  capacity: number;
  amenities: string[];
}

export async function fetchSpaces(workspaceId: number): Promise<Space[]> {
  const { data } = await api.get(`/workspaces/${workspaceId}/spaces`);
  return data.spaces;
}
