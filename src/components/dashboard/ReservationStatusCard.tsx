import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, X } from 'lucide-react';

interface ReservationStatusCardProps {
  title: string;
  totalCount: number;
  items: Array<{
    id: string;
    name: string;
    location: string;
    date: string;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled';
  }>;
  onAddNew?: () => void;
}

export function ReservationStatusCard({
  title,
  totalCount,
  items,
  onAddNew,
}: ReservationStatusCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-700">확정</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-700">대기</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">취소</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <span className="text-sm text-muted-foreground">총 {totalCount}건</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{item.name}</span>
                  {getStatusBadge(item.status)}
                </div>
                <div className="text-xs text-gray-600">
                  {item.location} • {item.date} {item.time}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {onAddNew && (
          <div className="pt-4 border-t">
            <Button onClick={onAddNew} className="w-full">
              새 예약 추가
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
