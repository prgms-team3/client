import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Copy, LogOut, ChevronsUpDown, Check, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useLogout } from '@/hooks/useLogout';
import { useWorkspaceStore } from '@/stores/workspaceStore';

function WorkspaceToggle() {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const BASE = process.env.API_BASE_URL;

  // 유저 정보
  const { user } = useUserStore();
  const ownerKey = user?.id != null ? `u:${user.id}|${BASE ?? ''}` : 'guest';

  const {
    list,
    currentId,
    setCurrent,
    refreshIfStale,
    hardRefresh,
    bindToUser,
  } = useWorkspaceStore();
  const selected = list.find(w => w.id === currentId) ?? list[0];

  React.useEffect(() => {
    bindToUser(ownerKey);
  }, [bindToUser, ownerKey]);

  React.useEffect(() => {
    const ctrl = new AbortController();
    refreshIfStale({ staleTime: 1000 * 60 * 5, signal: ctrl.signal }).catch(
      () => {}
    );
    return () => ctrl.abort();
  }, [refreshIfStale, ownerKey]); // ownerKey가 바뀌면 새 유저 기준으로 리프레시

  const handleSelect = (id: string) => {
    setCurrent(id); // persist → 페이지 이동/새로고침에도 유지
    setOpen(false);
  };

  // 버튼 라벨: 캐시 우선 → 비어있으면 플레이스홀더
  const label =
    selected?.name ?? (list.length ? '워크스페이스' : '워크스페이스 없음');

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (list.length ? setOpen(o => !o) : null)}
          className="flex items-center gap-2 px-3 py-1.5 mt-1 text-xl font-bold hover:bg-gray-50"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate max-w-[180px] text-gray-900">{label}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>

        {/* 필요할 때만 강제 새로고침(UX용) */}
        <button
          type="button"
          onClick={() => {
            const ctrl = new AbortController();
            hardRefresh(ctrl.signal).catch(() => {});
          }}
          className="p-1.5 mt-1 text-gray-400 hover:text-gray-600"
          title="워크스페이스 목록 새로고침"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {open && list.length > 0 && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 w-60 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <ul className="max-h-64 overflow-y-auto py-1">
            {list.map(w => {
              const active = w.id === (selected?.id ?? currentId);
              return (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(w.id)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                      active ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="truncate">{w.name}</span>
                    {active && <Check className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const { user } = useUserStore();
  const { logout, loading } = useLogout({ redirectTo: '/login' });

  const handleCopy = () => {
    navigator.clipboard.writeText('STARTUP2024');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* 왼쪽: 브랜드(제목) + 워크스페이스 토글 */}
        <div className="flex items-center gap-3">
          <div
            className="brand-logo flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/dashboard')}
          >
            <Image
              src="/icon.svg"
              alt="PlaceIt Icon"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <Image
              src="/logo.svg"
              alt="PlaceIt"
              width={120}
              height={24}
              className="h-6"
            />
          </div>
          <WorkspaceToggle />
        </div>

        {/* 오른쪽: 사용자/초대코드/로그아웃 - 기존 유지 */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`${
                user?.role === 'admin' ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              {user?.name} ({user?.role === 'admin' ? '관리자' : '사용자'})
            </span>
            <span className="text-gray-400">|</span>
            <div className="flex items-center">
              <span className="text-blue-600">STARTUP2024</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="p-1 h-6 w-6 text-gray-500 hover:bg-gray-50 ml-1"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400">|</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              disabled={loading}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">
                {loading ? '로그아웃 중…' : '로그아웃'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
