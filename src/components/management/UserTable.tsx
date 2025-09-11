'use client';

import * as React from 'react';
import { UserRow, type UserRowData } from '@/components/management/UserRow';

type Props = {
  users: UserRowData[];
  onEdit?: (id: string) => void;
  onChangeRole?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
};

export default function UserTable({
  users,
  onEdit,
  onChangeRole,
  onDelete,
  className,
}: Props) {
  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-[720px] w-full table-fixed">
          <thead className="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th className="w-[30%] px-4 py-3 font-medium">사용자</th>
              <th className="w-[22%] px-4 py-3 font-medium">부서/직급</th>
              <th className="w-[12%] px-4 py-3 font-medium">역할</th>
              <th className="w-[12%] px-4 py-3 font-medium text-center">
                예약 건수
              </th>
              <th className="w-[16%] px-4 py-3 font-medium">마지막 로그인</th>
              <th className="w-[8%] px-4 py-3 font-medium">액션</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  표시할 사용자가 없습니다.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <UserRow
                  key={u.id}
                  user={u}
                  onEdit={onEdit}
                  onChangeRole={onChangeRole}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
