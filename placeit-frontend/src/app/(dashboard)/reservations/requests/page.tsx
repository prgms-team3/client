'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Clock,
  MapPin,
  User,
  Check,
  X,
  AlertCircle,
  Calendar,
  Search,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/management/StatCard';
import { api } from '@/lib/axios';
import { useWorkspaceStore } from '@/stores/workspaceStore';

type Space = {
  id: number;
  workspaceId: number;
  name: string;
  description: string | null;
  location: string | null;
  capacity: number;
  requiresApproval: boolean;
  isActive: boolean;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

type ReqUser = {
  id: number;
  email: string;
  provider: string;
  providerId: string;
  name: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

type Reservation = {
  id: number;
  spaceId: number;
  userId: number;
  attendees: string;
  memo: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
  space: Space;
  user: ReqUser;
};

export default function ReservationRequestsPage() {
  const [requests, setRequests] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingIds, setApprovingIds] = useState<Set<number>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<number>>(new Set());
  const workspaceId = useWorkspaceStore(state => state.currentId);

  // 내 역할 조회
  const [myWorkspaceRole, setMyWorkspaceRole] = useState<string | null>(null);
  const isAdmin = useMemo(
    () => ['SUPER_ADMIN', 'ADMIN'].includes(myWorkspaceRole ?? ''),
    [myWorkspaceRole]
  );

  useEffect(() => {
    const fetchReservations = async () => {
      if (!workspaceId) return;
      setLoading(true);
      try {
        const res = await api.get<{ reservations: Reservation[] }>(
          `/workspaces/${workspaceId}/reservations`
        );
        // 승인 필요 공간만 필터
        const onlyApprovalRequired = (res.data.reservations || []).filter(
          r => r.space?.requiresApproval === true
        );
        setRequests(onlyApprovalRequired);
      } catch (e) {
        console.error('예약 불러오기 실패', e);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [workspaceId]);

  // 현재 워크스페이스에서의 내 역할 가져오기
  useEffect(() => {
    const fetchMyRole = async () => {
      if (!workspaceId) return;
      try {
        const res = await api.get<{ workspaces: any[] }>('/workspaces/my');
        const ws = res.data.workspaces?.find(
          (w: any) => String(w.id) === String(workspaceId)
        );
        const role: string | null = ws?.workspaceUsers?.[0]?.role ?? null;
        setMyWorkspaceRole(role);
      } catch (e) {
        console.error('내 역할 조회 실패', e);
        setMyWorkspaceRole(null);
      }
    };
    fetchMyRole();
  }, [workspaceId]);

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return requests
      .filter(request => {
        const matchesStatus =
          filterStatus === 'all' || request.status === filterStatus;
        const matchesSearch =
          term === '' ||
          request.purpose?.toLowerCase().includes(term) ||
          request.memo?.toLowerCase().includes(term) ||
          request.user?.name?.toLowerCase().includes(term) ||
          request.space?.name?.toLowerCase().includes(term);
        const matchesApproval = request.space?.requiresApproval === true;
        return matchesStatus && matchesSearch && matchesApproval;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [requests, filterStatus, searchTerm]);

  // 예약 요청 승인
  const handleApprove = async (requestId: number) => {
    if (!isAdmin) return; // 가드
    if (approvingIds.has(requestId)) return;

    const prev = requests.find(r => r.id === requestId)?.status;

    setRequests(prevList =>
      prevList.map(req =>
        req.id === requestId
          ? ({ ...req, status: 'APPROVED' } as Reservation)
          : req
      )
    );
    setApprovingIds(prevSet => new Set(prevSet).add(requestId));

    try {
      await api.post(`/reservations/${requestId}/approve`);
    } catch (e) {
      console.error('예약 승인 실패', e);
      setRequests(prevList =>
        prevList.map(req =>
          req.id === requestId
            ? ({ ...req, status: prev ?? 'PENDING' } as Reservation)
            : req
        )
      );
      alert('승인 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setApprovingIds(prevSet => {
        const next = new Set(prevSet);
        next.delete(requestId);
        return next;
      });
    }
  };

  // 예약 요청 거절
  const handleReject = async (requestId: number) => {
    if (!isAdmin) return; // 가드
    if (rejectingIds.has(requestId)) return;

    const prev = requests.find(r => r.id === requestId)?.status;

    setRequests(prevList =>
      prevList.map(req =>
        req.id === requestId
          ? ({ ...req, status: 'REJECTED' } as Reservation)
          : req
      )
    );
    setRejectingIds(prevSet => new Set(prevSet).add(requestId));

    try {
      await api.post(`/reservations/${requestId}/reject`);
    } catch (e) {
      console.error('예약 거절 실패', e);
      setRequests(prevList =>
        prevList.map(req =>
          req.id === requestId
            ? ({ ...req, status: prev ?? 'PENDING' } as Reservation)
            : req
        )
      );
      alert('거절 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setRejectingIds(prevSet => {
        const next = new Set(prevSet);
        next.delete(requestId);
        return next;
      });
    }
  };

  const formatDateTime = (dateTimeStr: string, addHours = 0) => {
    const date = new Date(dateTimeStr);
    if (addHours) date.setHours(date.getHours() + addHours);

    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const mi = date.getMinutes().toString().padStart(2, '0');
    return `${mm}/${dd} ${hh}:${mi}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거부됨';
      default:
        return status;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  return (
    <MainLayout activePage="reservation-requests">
      <div className="p-6 space-y-8 mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              예약 요청 관리
            </h1>
            <p className="text-gray-600 mt-2">
              승인이 필요한 공간 예약만 표시합니다.
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="전체"
            value={requests.length}
            icon={Calendar}
            valueClassName="text-blue-600"
          />
          <StatCard
            label="대기중"
            value={pendingCount}
            icon={AlertCircle}
            valueClassName="text-yellow-600"
          />
          <StatCard
            label="승인됨"
            value={approvedCount}
            icon={Check}
            valueClassName="text-green-600"
          />
          <StatCard
            label="거부됨"
            value={rejectedCount}
            icon={X}
            valueClassName="text-red-600"
          />
        </div>

        {/* 필터 및 검색 */}
        <Card>
          <CardContent className="px-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* 검색 */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="목적, 메모, 신청자, 공간명으로 검색..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* 상태 필터 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'PENDING', label: '대기중' },
                  { id: 'APPROVED', label: '승인됨' },
                  { id: 'REJECTED', label: '거부됨' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFilterStatus(s.id as typeof filterStatus)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      filterStatus === s.id
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 예약 요청 목록 */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">
                불러오는 중…
              </CardContent>
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  조건에 맞는 예약 요청이 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map(request => {
              const approving = approvingIds.has(request.id);
              const rejecting = rejectingIds.has(request.id);

              return (
                <Card
                  key={request.id}
                  className="hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="px-6 py-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.purpose || '회의'}
                          </h3>
                          <Badge
                            className={`text-xs ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusLabel(request.status)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            승인 필요
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDateTime(request.startTime)} ~{' '}
                              {formatDateTime(request.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>
                              {request.user?.name ??
                                `사용자 #${request.userId}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {request.space?.name ??
                                `회의실 #${request.spaceId}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isAdmin && request.status === 'PENDING' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={approving || rejecting}
                            className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {approving ? (
                              <>
                                <Clock className="w-4 h-4 mr-1 animate-spin" />
                                승인 중…
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                승인
                              </>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            disabled={approving || rejecting}
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {rejecting ? (
                              <>
                                <Clock className="w-4 h-4 mr-1 animate-spin" />
                                거절 중…
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                거절
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 상세 정보 */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          참석자 목록
                        </h4>
                        <p className="text-sm text-gray-700">
                          {request.attendees || '-'}
                        </p>
                        <h4 className="text-sm font-medium text-gray-900 mt-2 mb-1">
                          설명
                        </h4>
                        <p className="text-sm text-gray-700">
                          {request.memo || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end text-xs text-gray-500 mt-2">
                      <span>
                        신청일시: {formatDateTime(request.createdAt, 9)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
