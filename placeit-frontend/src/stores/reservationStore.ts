import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Reservation, CalendarView, MeetingRoom } from '@/types';
import { sampleRooms } from '@/data/sampleData';

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
  addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<boolean>;
  updateReservation: (
    id: string,
    updates: Partial<Reservation>
  ) => Promise<boolean>;
  deleteReservation: (id: string) => Promise<boolean>;
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
      currentView: 'day',
      rooms: sampleRooms,
      isInitialized: false,
      error: null,
      loading: false,

      // 예약 추가
      addReservation: async reservationData => {
        try {
          set({ loading: true, error: null });

          const newReservation: Reservation = {
            ...reservationData,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };

          set(state => ({
            reservations: [...state.reservations, newReservation],
            loading: false,
          }));

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

      // 선택된 날짜 설정
      setSelectedDate: date => {
        set({ selectedDate: date });
      },

      // 현재 뷰 설정
      setCurrentView: view => {
        set({ currentView: view });
      },

      // 샘플 데이터 초기화
      initializeWithSampleData: () => {
        const { reservations } = get();
        if (reservations.length === 0) {
          // 샘플 데이터는 여기서 직접 추가하지 않고,
          // 컴포넌트에서 필요할 때 호출하도록 함
          set({ isInitialized: true });
        }
      },

      // 에러 초기화
      clearError: () => {
        set({ error: null });
      },

      // 회의실 상태 업데이트
      updateRoomStatus: (roomId, status) => {
        set(state => ({
          rooms: state.rooms.map(room =>
            room.id === roomId ? { ...room, status } : room
          ),
        }));
      },

      // 로딩 상태 설정
      setLoading: loading => {
        set({ loading });
      },

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

      // 오늘 예약 조회
      getTodayReservations: () => {
        const { reservations } = get();
        const today = new Date().toISOString().split('T')[0];
        return reservations.filter(reservation => reservation.date === today);
      },

      // 대기 중인 예약 조회
      getPendingReservations: () => {
        const { reservations } = get();
        return reservations.filter(
          reservation => reservation.status === 'pending'
        );
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
      name: 'reservation-storage', // 로컬 스토리지 키
      partialize: state => ({
        reservations: state.reservations,
        rooms: state.rooms,
        // selectedDate는 세션별로 초기화하는 것이 더 나을 수 있음
        // selectedDate: state.selectedDate,
      }), // 뷰 상태는 저장하지 않음
      onRehydrateStorage: () => state => {
        // selectedDate가 문자열로 저장되었다면 Date 객체로 변환
        if (
          state &&
          state.selectedDate &&
          typeof state.selectedDate === 'string'
        ) {
          state.selectedDate = new Date(state.selectedDate);
        }
        // 초기화 플래그는 항상 false로 설정
        if (state) {
          state.isInitialized = false;
        }
      },
    }
  )
);
