import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Reservation, CalendarView, MeetingRoom } from '@/types';
import { sampleRooms } from '@/data/sampleData';

type RequiredFields = Pick<Reservation, 'title' | 'room' | 'date' | 'time'>;

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function dedupeKey(r: Reservation) {
  // 같은 예약의 고유성: (id || ""), date, time
  return `${r.id ?? ''}-${r.date}-${r.time}`;
}

interface ReservationStore {
  // 상태
  reservations: Reservation[];
  selectedDate: Date | null;
  currentView: CalendarView;
  rooms: MeetingRoom[];
  isInitialized: boolean;
  error: string | null;
  loading: boolean;

  // 액션
  /** 단건 추가 (id가 있으면 보존, 없으면 생성) */
  addReservation: (
    reservationData: Partial<Reservation> & RequiredFields
  ) => Promise<boolean>;

  updateReservation: (
    id: string,
    updates: Partial<Reservation>
  ) => Promise<boolean>;

  deleteReservation: (id: string) => Promise<boolean>;

  /** 예약을 통째로 교체(일반적으로 API 동기화 시 사용) */
  setReservations: (items: Reservation[]) => void;

  /** 필요 시 전체 초기화 */
  clearReservations: () => void;

  setSelectedDate: (date: Date | null) => void;
  setCurrentView: (view: CalendarView) => void;
  updateRoomStatus: (roomId: string, status: MeetingRoom['status']) => void;
  initializeWithSampleData: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

  // 선택자
  getReservationsByDate: (date: string) => Reservation[];
  getReservationsByDateRange: (
    startDate: string,
    endDate: string
  ) => Reservation[];
  getReservationsByRoom: (room: string) => Reservation[];
  getTodayReservations: () => Reservation[];
  getPendingReservations: () => Reservation[];
  getRoomById: (roomId: string) => MeetingRoom | undefined;
  getAvailableRooms: () => MeetingRoom[];
  getOccupiedRooms: () => MeetingRoom[];
}

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      reservations: [],
      selectedDate: new Date(),
      currentView: 'month',
      rooms: sampleRooms,
      isInitialized: false,
      error: null,
      loading: false,

      // 예약 추가 (id 보존)
      addReservation: async reservationData => {
        try {
          set({ loading: true, error: null });

          const newItem: Reservation = {
            // 기존 id가 있으면 유지 (API 동기화 시 핵심)
            id: reservationData.id ?? genId(),
            title: reservationData.title,
            room: reservationData.room,
            date: reservationData.date,
            time: reservationData.time,
            endTime: reservationData.endTime,
            attendees: reservationData.attendees ?? [],
            status: reservationData.status ?? 'pending',
          } as Reservation;

          set(state => {
            const map = new Map<string, Reservation>();
            // 기존 것들
            for (const r of state.reservations) {
              map.set(dedupeKey(r), r);
            }
            // 신규(upsert)
            map.set(dedupeKey(newItem), newItem);
            return { reservations: Array.from(map.values()), loading: false };
          });

          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : '예약 추가 중 오류가 발생했습니다.',
            loading: false,
          });
          return false;
        }
      },

      // 예약 수정
      updateReservation: async (id, updates) => {
        try {
          set({ loading: true, error: null });

          set(state => ({
            reservations: state.reservations.map(reservation =>
              reservation.id === id
                ? { ...reservation, ...updates }
                : reservation
            ),
            loading: false,
          }));

          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : '예약 수정 중 오류가 발생했습니다.',
            loading: false,
          });
          return false;
        }
      },

      // 예약 삭제
      deleteReservation: async id => {
        try {
          set({ loading: true, error: null });

          set(state => ({
            reservations: state.reservations.filter(
              reservation => reservation.id !== id
            ),
            loading: false,
          }));

          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : '예약 삭제 중 오류가 발생했습니다.',
            loading: false,
          });
          return false;
        }
      },

      // 통째로 교체(중복 뿌리 제거)
      setReservations: items => {
        // 들어온 배열을 dedupeKey 기준으로 깨끗이 중복 제거
        const map = new Map<string, Reservation>();
        for (const r of items) {
          map.set(dedupeKey(r), r);
        }
        set({ reservations: Array.from(map.values()) });
      },

      clearReservations: () => set({ reservations: [] }),

      // 선택된 날짜 설정
      setSelectedDate: date => set({ selectedDate: date }),

      // 현재 뷰 설정
      setCurrentView: view => set({ currentView: view }),

      // 샘플 데이터 초기화(유지)
      initializeWithSampleData: () => {
        const { reservations } = get();
        if (reservations.length === 0) {
          set({ isInitialized: true });
        }
      },

      // 에러 초기화
      clearError: () => set({ error: null }),

      // 회의실 상태 업데이트
      updateRoomStatus: (roomId, status) => {
        set(state => ({
          rooms: state.rooms.map(room =>
            room.id === roomId ? { ...room, status } : room
          ),
        }));
      },

      // 로딩 상태 설정
      setLoading: loading => set({ loading }),

      // 특정 날짜의 예약 조회
      getReservationsByDate: date => {
        const { reservations } = get();
        return reservations.filter(reservation => reservation.date === date);
      },

      // 날짜 범위의 예약 조회
      getReservationsByDateRange: (startDate, endDate) => {
        const { reservations } = get();
        return reservations.filter(reservation => {
          const reservationDate = new Date(reservation.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return reservationDate >= start && reservationDate <= end;
        });
      },

      // 특정 회의실의 예약 조회
      getReservationsByRoom: room => {
        const { reservations } = get();
        return reservations.filter(reservation => reservation.room === room);
      },

      // 오늘 예약 조회 (로컬 날짜 기준 "YYYY-MM-DD")
      getTodayReservations: () => {
        const { reservations } = get();
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const today = `${y}-${m}-${d}`;
        return reservations.filter(reservation => reservation.date === today);
      },

      // 대기 중 예약
      getPendingReservations: () => {
        const { reservations } = get();
        return reservations.filter(r => r.status === 'pending');
      },

      // 특정 회의실 조회
      getRoomById: roomId => {
        const { rooms } = get();
        return rooms.find(room => room.id === roomId);
      },

      // 사용 가능한 회의실 조회
      getAvailableRooms: () => {
        const { rooms } = get();
        return rooms.filter(room => room.status === 'available');
      },

      // 사용 중인 회의실 조회
      getOccupiedRooms: () => {
        const { rooms } = get();
        return rooms.filter(room => room.status === 'occupied');
      },
    }),
    {
      name: 'reservation-storage-v2',
      partialize: state => ({
        reservations: state.reservations,
        rooms: state.rooms,
      }),
      onRehydrateStorage: () => state => {
        if (
          state &&
          state.selectedDate &&
          typeof state.selectedDate === 'string'
        ) {
          state.selectedDate = new Date(state.selectedDate);
        }
        if (state) state.isInitialized = false;
      },
    }
  )
);
