'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  valueClassName?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  valueClassName,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('rounded-lg border border-gray-200', className)}>
      <CardContent className="lm-6 rm-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={cn('text-2xl font-bold', valueClassName)}>{value}</p>
          </div>
          <div className="shrink-0 p-4">
            <Icon className={cn('h-6 w-6', valueClassName)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
