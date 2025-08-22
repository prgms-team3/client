import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Calendar,
  Building,
  Users,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';

interface ReservationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReservationItem {
  id: string;
  name: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  location: string;
  date: string;
  time: string;
}

export function ReservationPanel({ isOpen, onClose }: ReservationPanelProps) {
  const sampleReservations: ReservationItem[] = [
    {
      id: '1',
      name: '주간 팀 미팅',
      status: 'confirmed',
      location: '대회의실',
      date: '1월 15일',
      time: '10:00-10:30',
    },
    {
      id: '2',
      name: '프로젝트 기획회의',
      status: 'confirmed',
      location: '창의실',
      date: '1월 15일',
      time: '14:00-15:30',
    },
    {
      id: '3',
      name: '마케팅 전략 회의',
      status: 'pending',
      location: '소회의실',
      date: '1월 16일',
      time: '09:00-10:00',
    },
    {
      id: '4',
      name: '1:1 미팅',
      status: 'confirmed',
      location: '회의실1',
      date: '1월 16일',
      time: '15:00-15:30',
    },
    {
      id: '5',
      name: '아이디어 회의',
      status: 'pending',
      location: '창의실',
      date: '1월 17일',
      time: '11:00-12:00',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-500 text-white">확정</Badge>;
      case 'pending':
        return <Badge className="bg-gray-500 text-white">대기</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">취소</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed right-0 top-0 h-full w-96 max-w-none translate-x-0 translate-y-0 rounded-none border-l shadow-xl ml-64">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                예약 관리
              </DialogTitle>
              <p className="text-sm text-gray-600">회의실 현황 및 예약 관리</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 전체 예약 현황 버튼 */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            전체 예약 현황
            <Badge className="ml-2 bg-white text-blue-600">5</Badge>
          </Button>

          {/* 빠른 링크 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">오늘 일정</div>
              <div className="text-xs text-gray-500">2건</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Building className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">회의실 현황</div>
              <div className="text-xs text-gray-500">8개</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium">사용자 관리</div>
              <div className="text-xs text-gray-500">24명</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium">사용 통계</div>
              <div className="text-xs text-gray-500">분석</div>
            </div>
          </div>

          {/* 예약 현황 목록 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">예약 현황</h3>
              <span className="text-sm text-gray-500">
                총 {sampleReservations.length}건의 예약이 있습니다
              </span>
            </div>

            <div className="space-y-3">
              {sampleReservations.map(reservation => (
                <div
                  key={reservation.id}
                  className="p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {reservation.name}
                        </span>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {reservation.location} • {reservation.date}{' '}
                        {reservation.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      수정
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      취소
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 새 예약 추가 버튼 */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />새 예약 추가
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
