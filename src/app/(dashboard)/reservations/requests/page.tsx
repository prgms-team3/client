'use client';

import React, { useState } from 'react';
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

const sampleRequests = [
  {
    id: 1,
    title: '마케팅 전략 회의',
    requester: '김민지',
    department: '마케팅팀',
    spaceName: '대회의실',
    date: '2024-01-19',
    startTime: '10:00',
    endTime: '11:30',
    duration: '1시간 30분',
    attendees: 8,
    purpose: 'Q1 마케팅 전략 수립 및 캠페인 기획',
    priority: 'high',
    requestedAt: '2024-01-18 09:30',
    status: 'pending',
  },
  {
    id: 2,
    title: '개발팀 스프린트 리뷰',
    requester: '박성호',
    department: '개발팀',
    spaceName: '회의실1',
    date: '2024-01-19',
    startTime: '14:00',
    endTime: '15:00',
    duration: '1시간',
    attendees: 6,
    purpose: '2주차 스프린트 결과 리뷰 및 다음 스프린트 계획',
    priority: 'medium',
    requestedAt: '2024-01-18 11:15',
    status: 'pending',
  },
  {
    id: 3,
    title: '임원진 월간 회의',
    requester: '이정우',
    department: '경영진',
    spaceName: '임원회의실',
    date: '2024-01-20',
    startTime: '09:00',
    endTime: '11:00',
    duration: '2시간',
    attendees: 12,
    purpose: '월간 실적 검토 및 향후 전략 논의',
    priority: 'high',
    requestedAt: '2024-01-18 08:45',
    status: 'pending',
  },
  {
    id: 4,
    title: '신입사원 교육',
    requester: '최유리',
    department: '인사팀',
    spaceName: '세미나실',
    date: '2024-01-22',
    startTime: '13:00',
    endTime: '17:00',
    duration: '4시간',
    attendees: 15,
    purpose: '신입사원 온보딩 교육 프로그램',
    priority: 'medium',
    requestedAt: '2024-01-18 14:20',
    status: 'pending',
  },
];

export default function ReservationRequestsPage() {
  const [requests, setRequests] = useState(sampleRequests);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = (requestId: number) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'approved' } : req
      )
    );
  };

  const handleReject = (requestId: number) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus =
      filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority =
      filterPriority === 'all' || request.priority === filterPriority;
    const matchesSearch =
      searchTerm === '' ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${
      weekdays[date.getDay()]
    })`;
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '긴급';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '보통';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거부됨';
      default:
        return '대기중';
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <MainLayout activePage="reservation-requests">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              예약 요청 관리
            </h1>
            <p className="text-gray-600 mt-2">
              대기 중인 예약 요청을 승인하거나 거부하세요
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">대기중</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingCount}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">승인됨</p>
                  <p className="text-2xl font-bold text-green-600">
                    {approvedCount}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">거부됨</p>
                  <p className="text-2xl font-bold text-red-600">
                    {rejectedCount}
                  </p>
                </div>
                <X className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">전체</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {requests.length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 및 검색 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* 검색 */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="제목, 신청자, 부서로 검색..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* 상태 필터 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'pending', label: '대기중' },
                  { id: 'approved', label: '승인됨' },
                  { id: 'rejected', label: '거부됨' },
                ].map(status => (
                  <button
                    key={status.id}
                    onClick={() => setFilterStatus(status.id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      filterStatus === status.id
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>

              {/* 우선순위 필터 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'all', label: '모든 우선순위' },
                  { id: 'high', label: '긴급' },
                  { id: 'medium', label: '보통' },
                  { id: 'low', label: '낮음' },
                ].map(priority => (
                  <button
                    key={priority.id}
                    onClick={() => setFilterPriority(priority.id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      filterPriority === priority.id
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 예약 요청 목록 */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  조건에 맞는 예약 요청이 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map(request => (
              <Card
                key={request.id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.title}
                        </h3>
                        <Badge
                          className={`text-xs border ${getPriorityColor(
                            request.priority
                          )}`}
                        >
                          {getPriorityLabel(request.priority)}
                        </Badge>
                        <Badge
                          className={`text-xs ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>
                            {request.requester} ({request.department})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{request.spaceName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(request.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {request.startTime} - {request.endTime} (
                            {request.duration})
                          </span>
                        </div>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"
                        >
                          <X className="w-4 h-4 mr-1" />
                          거부
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 상세 정보 */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        회의 목적
                      </h4>
                      <p className="text-sm text-gray-700">{request.purpose}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>참석 예정: {request.attendees}명</span>
                      <span>
                        신청일시: {formatDateTime(request.requestedAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
