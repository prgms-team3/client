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
  workspaceUsers?: WorkspaceUser[]; // 멤버 수 계산용
  createdAt: string; // ISO
  // 백엔드에서 내려오는 경우가 있어 보였지만, 현재 사용처가 불명확하면 주석 처리
  // updatedAt?: string;
  // deleted?: boolean;
};

export type CreateWorkspace = {
  name: string;
  description?: string;
  imageFile?: File | null;
  imageUrl?: string | null;
  // 이미지 업로드가 필요하면 FormData 규격으로 확장
};

export type UpdateWorkspace = Partial<Omit<CreateWorkspace, 'name'>> & {
  name?: string;
};

// 초대/참가 콜백 등에서 id만 필요한 다양한 응답을 포괄
export type JoinWorkspaceResponse =
  | { workspace?: { id?: number | string } }
  | { id?: number | string };
