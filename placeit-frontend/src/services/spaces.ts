import { api } from '@/lib/axios';

export interface Space {
  id: number;
  workspaceId: number;
  name: string;
  description: string;
  isActive: boolean;
  requiresApproval: boolean;
  capacity: number;
  amenities: string[];
}

export async function fetchSpaces(workspaceId: number): Promise<Space[]> {
  const { data } = await api.get(`/workspaces/${workspaceId}/spaces`);
  return data.spaces;
}
