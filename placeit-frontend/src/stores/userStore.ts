import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  department: string;
  position: string;
  contact: string;
  timezone: string;
  introduction: string;
  role: 'admin' | 'user';
  workspaceId: string;
  isWorkspaceOwner: boolean;
}

interface UserStore {
  // 상태
  user: User;

  // 액션
  updateUser: (updates: Partial<User>) => void;
  resetUser: () => void;
  createWorkspace: (workspaceName: string) => void;
  joinWorkspace: (inviteCode: string) => void;
}

// 초기 사용자 데이터
const initialUser: User = {
  name: '박사용자',
  email: 'admin@company.com',
  department: '경영진',
  position: '이사',
  contact: '010-1234-5678',
  timezone: '한국 (UTC+9)',
  introduction: '회사의 전반적인 업무를 관리하고 있습니다.',
  role: 'admin',
  workspaceId: 'workspace-001',
  isWorkspaceOwner: true,
};

export const useUserStore = create<UserStore>()(
  persist(
    set => ({
      // 초기 상태
      user: initialUser,

      // 사용자 정보 업데이트
      updateUser: updates =>
        set(state => ({
          user: { ...state.user, ...updates },
        })),

      // 사용자 정보 초기화
      resetUser: () => set({ user: initialUser }),

      // 워크스페이스 생성 (관리자 역할)
      createWorkspace: (workspaceName: string) =>
        set(state => ({
          user: {
            ...state.user,
            role: 'admin',
            workspaceId: `workspace-${workspaceName}-${Date.now()}`,
            isWorkspaceOwner: true,
          },
        })),

      // 초대코드로 워크스페이스 참여 (일반 사용자 역할)
      joinWorkspace: (inviteCode: string) =>
        set(state => ({
          user: {
            ...state.user,
            role: 'user',
            workspaceId: `workspace-${inviteCode}`,
            isWorkspaceOwner: false,
          },
        })),
    }),
    {
      name: 'user-storage', // 로컬 스토리지 키
    }
  )
);
