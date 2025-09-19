import { api } from '@/lib/axios';

/** 회의실 편의/설비 키 */
export type AmenityKey =
  | 'monitor'
  | 'projector'
  | 'whiteboard'
  | 'aircon'
  | 'microphone'
  | 'speaker'
  | 'wifi';

/** 이미지 타입: 사진/도면 */
export type ImageType = 'PHOTO' | 'FLOOR_PLAN';

/** 회의실 이미지 */
export type RoomImage = {
  imageUrl: string;
  imageType: ImageType;
};

/** 앱에서 사용하는 표준 Space 타입 */
export type Space = {
  id: number;
  workspaceId?: number;
  name: string;
  description: string;
  location?: string | null;
  capacity: number;
  isActive: boolean;
  requiresApproval: boolean;
  amenities: AmenityKey[];
  images?: RoomImage[];

  createdAt?: string;
  updatedAt?: string;
};

type ApiSpace = {
  id: number;
  workspaceId?: number;
  name: string;
  description?: string | null;
  location?: string | null;
  capacity: number;
  isActive: boolean;
  requiresApproval: boolean;
  amenities?: string[];
  images?: { imageUrl: string; imageType: ImageType }[];
  createdAt?: string;
  updatedAt?: string;
};

type ApiSpacesResponse = { spaces: ApiSpace[] } | ApiSpace[];

function mapApiSpaceToSpace(s: ApiSpace): Space {
  const validAmenity = new Set<AmenityKey>([
    'monitor',
    'projector',
    'whiteboard',
    'aircon',
    'microphone',
    'speaker',
    'wifi',
  ]);

  const amenities: AmenityKey[] = (s.amenities ?? []).filter(
    (a): a is AmenityKey => validAmenity.has(a as AmenityKey)
  );

  return {
    id: s.id,
    workspaceId: s.workspaceId,
    name: s.name,
    description: s.description ?? '',
    location: s.location ?? null,
    capacity: s.capacity,
    isActive: s.isActive,
    requiresApproval: s.requiresApproval,
    amenities,
    images: s.images ?? [],
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

/** 현재 워크스페이스의 회의실 목록 가져오기 */
export async function fetchSpaces(workspaceId: number): Promise<Space[]> {
  const { data } = await api.get<ApiSpacesResponse>(
    `/workspaces/${workspaceId}/spaces`
  );

  const list: ApiSpace[] = Array.isArray(data) ? data : data?.spaces ?? [];
  return list.map(mapApiSpaceToSpace);
}

export async function fetchSpaceById(
  workspaceId: number,
  spaceId: number
): Promise<Space | null> {
  const { data } = await api.get<ApiSpace>(
    `/workspaces/${workspaceId}/spaces/${spaceId}`
  );
  return data ? mapApiSpaceToSpace(data) : null;
}
