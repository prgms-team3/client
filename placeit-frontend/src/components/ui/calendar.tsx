'use client';

import * as React from 'react';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  reservations = [],
  showDetailedReservations = false,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  reservations?: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    room: string;
    status: string;
  }>;
  showDetailedReservations?: boolean;
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-background group/calendar p-6 w-full [--cell-size:8rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: date =>
          date.toLocaleString('ko-KR', { month: 'short' }),
        formatDay: date => date.getDate().toString(),
        formatCaption: date =>
          `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
        ...formatters,
      }}
      classNames={{
        root: cn('w-full', defaultClassNames.root),
        months: cn(
          'flex gap-4 flex-row relative w-full',
          defaultClassNames.months
        ),
        month: cn(
          'flex flex-col w-full gap-4 min-w-full',
          defaultClassNames.month
        ),
        nav: cn(
          'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-20 aria-disabled:opacity-50 p-0 select-none',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-20 aria-disabled:opacity-50 p-0 select-none',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'flex items-center justify-center h-20 w-full px-20',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'w-full flex items-center text-sm font-medium justify-center h-20 gap-1.5',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          'absolute bg-popover inset-0 opacity-0',
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          'select-none font-medium text-base',
          captionLayout === 'label'
            ? 'text-base'
            : 'rounded-md pl-2 pr-1 flex items-center gap-1 text-base h-20 [&>svg]:text-muted-foreground [&>svg]:size-4',
          defaultClassNames.caption_label
        ),
        table: 'w-full border-collapse min-w-full',
        weekdays: cn('flex w-full', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground rounded-md flex-1 font-medium text-sm select-none py-3',
          defaultClassNames.weekday
        ),
        week: cn('flex w-full min-w-full', defaultClassNames.week),
        week_number_header: cn(
          'select-none w-36',
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          'text-[0.8rem] select-none text-muted-foreground',
          defaultClassNames.week_number
        ),
        day: cn(
          'relative h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none w-full h-full'
        ),
        range_start: cn(
          'rounded-l-md bg-accent',
          defaultClassNames.range_start
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),
        today: cn(
          'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
          defaultClassNames.today
        ),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon
                className={cn('size-5 text-gray-600', className)}
                {...props}
              />
            );
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-5 text-gray-600', className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon
              className={cn('size-5 text-gray-600', className)}
              {...props}
            />
          );
        },
        DayButton: ({ ...dayProps }) => (
          <CalendarDayButton
            {...dayProps}
            reservations={reservations}
            showDetailedReservations={showDetailedReservations}
          />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-32 items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  reservations = [],
  showDetailedReservations = false,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  reservations?: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    room: string;
    status: string;
  }>;
  showDetailedReservations?: boolean;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  // 해당 날짜의 예약 찾기
  const dayReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.date);
    return (
      reservationDate.getDate() === day.date.getDate() &&
      reservationDate.getMonth() === day.date.getMonth() &&
      reservationDate.getFullYear() === day.date.getFullYear()
    );
  });

  return (
    <button
      ref={ref}
      type="button"
      data-day={`${day.date.getFullYear()}. ${
        day.date.getMonth() + 1
      }. ${day.date.getDate()}.`}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[selected-single=true]:border-2 data-[selected-single=true]:border-blue-500 data-[selected-single=true]:text-gray-900 data-[range-middle=true]:bg-gray-50 data-[range-middle=true]:text-gray-700 data-[range-start=true]:border-2 data-[range-start=true]:border-blue-500 data-[range-start=true]:text-gray-900 data-[range-end=true]:border-2 data-[range-end=true]:border-blue-500 data-[range-end=true]:text-gray-900 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground aspect-square w-full h-full flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md [&>span]:text-sm [&>span]:opacity-70 text-base',
        className
      )}
      {...props}
    >
      <div className="relative w-full h-full p-2">
        <span className="text-sm font-medium">{day.date.getDate()}</span>

        {showDetailedReservations ? (
          // 상세 예약 내용 표시 (예약관리 페이지용)
          <div className="mt-1 space-y-1">
            {dayReservations.slice(0, 2).map((reservation, index) => (
              <div
                key={reservation.id || `${day.date.toISOString()}-${index}`}
                className={`text-xs p-1 rounded ${
                  index === 0
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                } truncate`}
                title={`${reservation.title} - ${reservation.time}`}
              >
                {reservation.title}
                <div className="text-[10px] opacity-75">{reservation.time}</div>
              </div>
            ))}
            {dayReservations.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{dayReservations.length - 2}건
              </div>
            )}
          </div>
        ) : (
          // 예약 건수만 간단하게 표시 (대시보드용)
          dayReservations.length > 0 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium">
              {dayReservations.length}건
            </div>
          )
        )}
      </div>
    </button>
  );
}

export { Calendar, CalendarDayButton };
