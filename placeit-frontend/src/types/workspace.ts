// workspcae.ts  (오타 있었으면 파일명 workspace.ts 로 맞춰주세요)

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

  // 상태/소유
  isActive: boolean;
  superAdminName?: string; // 서버가 제공하지 않을 수도 있으므로 optional

  // 초대 코드
  invitationCode?: string; // (과거/다른 엔드포인트에서 내려올 수 있으므로 optional로 유지)
  activeInvitationCode?: string; // 활성 코드가 별도 필드로 내려오는 경우 대응

  // 멤버/권한 관련
  workspaceUsers?: WorkspaceUser[]; // 멤버 수 계산용
  userCount?: number; // 서버에서 집계 숫자를 주는 경우
  userRole?: WorkspaceRole | string; // 서버가 문자열로 주는 경우를 포괄

  // 타임스탬프/관리
  createdAt: string; // ISO
  updatedAt?: string; // ISO (서버가 줄 수도 있어 optional)
  deleted?: boolean; // 일부 응답에 포함될 수 있어 optional
};

export type CreateWorkspace = {
  name: string;
  description?: string;
  imageUrl?: string; // URL 기반으로 생성
  // imageFile?: File | null; // (파일 업로드가 필요해지면 주석 해제 후 FormData 전략 사용)
};

export type UpdateWorkspace = Partial<
  Pick<CreateWorkspace, 'name' | 'description' | 'imageUrl'>
> & {
  name?: string;
};

// 초대/참가 응답: 서버가 Workspace 자체를 반환하거나 { workspace: Workspace }로 감싸 반환할 수 있음
export type JoinWorkspaceResponse = Workspace | { workspace: Workspace };
