import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building } from 'lucide-react';

interface MeetingRoomCardProps {
  id: string;
  name: string;
  description: string;
  capacity: number;
  features: string[];
  status: 'available' | 'occupied' | 'maintenance';
  imageUrl: string;
  onReserve: (roomId: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  reservedTime?: string;
}

export function MeetingRoomCard({
  id,
  name,
  description,
  capacity,
  features,
  status,
  imageUrl,
  onReserve,
  isSelected = false,
  onSelect,
  reservedTime,
}: MeetingRoomCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '사용 가능';
      case 'occupied':
        return '사용 중';
      case 'maintenance':
        return '점검 중';
      default:
        return '알 수 없음';
    }
  };

  return (
    <Card
      className={`w-full max-w-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="relative pb-3">
        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden mb-4 relative">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
          {/* 기본 이미지 플레이스홀더 (이미지 로드 실패 시) */}
          <div
            className="w-full h-full items-center justify-center"
            style={{ display: 'none' }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-blue-600 font-medium">{name}</p>
            </div>
          </div>
          <Badge
            className={`absolute top-2 right-2 ${getStatusColor(
              status
            )} text-white text-xs px-2 py-1`}
          >
            {getStatusText(status)}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-3">
          {/* 수용 인원 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{capacity}명</span>
          </div>

          {/* 제공 기능 */}
          <div>
            <span className="text-sm font-medium text-gray-600">
              제공 기능:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {features.map((feature, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-700"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* 예약 시간 (사용 중인 경우) */}
          {status === 'occupied' && reservedTime && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-xs text-red-700 font-medium">
                예약 시간: {reservedTime}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className={`w-full ${
            status === 'available'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
          disabled={status !== 'available'}
          onClick={() => onReserve(id)}
        >
          {status === 'available' ? '예약하기' : '예약 불가'}
        </Button>
      </CardFooter>
    </Card>
  );
}
