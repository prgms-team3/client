import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building } from 'lucide-react';

interface MeetingRoomCardProps {
  name: string;
  description: string;
  capacity: number;
  features: string[];
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  imageUrl?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  reservedTime?: string;
}

export function MeetingRoomCard({
  name,
  description,
  capacity,
  features,
  status,
  imageUrl,
  isSelected = false,
  onSelect,
  reservedTime,
}: MeetingRoomCardProps) {
  // 상수 정의
  const CARD_DIMENSIONS = {
    minHeight: 'min-h-[400px]',
    maxWidth: 'max-w-[280px]',
    imageHeight: 'h-48',
  } as const;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-orange-500';
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
      case 'reserved':
        return '예약됨';
      case 'maintenance':
        return '점검 중';
      default:
        return '알 수 없음';
    }
  };

  return (
    <Card
      className={`w-full ${
        CARD_DIMENSIONS.maxWidth
      } h-full hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col ${
        CARD_DIMENSIONS.minHeight
      } border-2 ${
        isSelected
          ? 'border-blue-500 shadow-xl bg-blue-50 ring-4 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="relative pb-3">
        <div
          className={`${CARD_DIMENSIONS.imageHeight} bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden mb-4 relative`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.nextElementSibling as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = 'flex';
                }
              }}
            />
          ) : null}
          {/* 기본 이미지 플레이스홀더 (이미지가 없거나 로드 실패 시) */}
          <div
            className={`w-full h-full items-center justify-center ${
              imageUrl ? 'hidden' : 'flex'
            }`}
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

      <CardContent className="pb-4 flex-1">
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

          {/* 예약 시간 표시 */}
          {reservedTime && (
            <div
              className={`mt-2 p-2 rounded-lg border ${
                status === 'occupied'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  status === 'occupied' ? 'text-red-700' : 'text-orange-700'
                }`}
              >
                {status === 'occupied' ? '사용 중' : '예약됨'}: {reservedTime}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
