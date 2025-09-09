// 워크스페이스 내 유저 역할
export enum WorkspaceRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export type WorkspaceUser = {
  id: number;
  workspaceId: number;
  userId: number;
  role: WorkspaceRole;
  joinedAt: string; // ISO
  updatedAt: string; // ISO
};

export type Workspace = {
  id: string | number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  invitationCode: string; // 백엔드 생성값
  superAdminName: string; // 백엔드 제공 소유자명
  workspaceUsers?: unknown[]; // 멤버 수 계산용
  createdAt: string;
};

export type CreateWorkspace = {
  name: string;
  description?: string;
  // 이미지 업로드가 필요하면 FormData 규격으로 확장
};

export type UpdateWorkspace = Partial<Omit<CreateWorkspace, 'name'>> & {
  name?: string;
};
