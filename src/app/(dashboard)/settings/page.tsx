'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit2, Save, X } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

export default function SettingsPage() {
  const user = useUserStore(s => s.user);
  const updateUser = useUserStore(s => s.updateUser);

  const role = user?.role ?? 'user';

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(() => ({
    name: user?.name ?? '',
    email: user?.email ?? '',
    department: user?.department ?? '',
    position: user?.position ?? '',
    contact: user?.contact ?? '',
    timezone: user?.timezone ?? '',
    introduction: user?.introduction ?? '',
  }));

  useEffect(() => {
    setFormData({
      name: user?.name ?? '',
      email: user?.email ?? '',
      department: user?.department ?? '',
      position: user?.position ?? '',
      contact: user?.contact ?? '',
      timezone: user?.timezone ?? '',
      introduction: user?.introduction ?? '',
    });
  }, [user]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      department: formData.department || undefined,
      position: formData.position || undefined,
      contact: formData.contact || undefined,
      timezone: formData.timezone || undefined,
      introduction: formData.introduction || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name ?? '',
      email: user?.email ?? '',
      department: user?.department ?? '',
      position: user?.position ?? '',
      contact: user?.contact ?? '',
      timezone: user?.timezone ?? '',
      introduction: user?.introduction ?? '',
    });
    setIsEditing(false);
  };

  return (
    <MainLayout activePage="settings">
      <div className="p-6 pb-12 max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
          <p className="text-gray-600">개인 정보를 업데이트하세요</p>
        </div>

        {/* 프로필 정보 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">프로필 정보</h2>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className={
                  role === 'admin'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
              >
                <Edit2 className="w-4 h-4 mr-2" />
                편집
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  취소
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 프로필 사진 및 기본 정보 */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div
                  className={`w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg ${
                    role === 'admin'
                      ? 'bg-gradient-to-br from-red-100 to-red-200'
                      : 'bg-gradient-to-br from-blue-100 to-blue-200'
                  }`}
                >
                  <div
                    className={`w-full h-full flex items-center justify-center text-4xl font-bold ${
                      role === 'admin' ? 'text-red-600' : 'text-blue-600'
                    }`}
                  >
                    {formData.name?.charAt(0) ?? '?'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {formData.name || '사용자'}
                </h3>
                <p className="text-gray-600 mb-2">이사</p>
                <Badge
                  className={
                    role === 'admin'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }
                >
                  {role === 'admin' ? '관리자' : '사용자'}
                </Badge>
              </div>
            </div>

            {/* 상세 정보 입력 필드 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 왼쪽 열 */}
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      이름 *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name ?? ''}
                      onChange={e => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="department"
                      className="text-sm font-medium text-gray-700"
                    >
                      부서
                    </Label>
                    <Input
                      id="department"
                      value={formData.department ?? ''}
                      onChange={e =>
                        handleInputChange('department', e.target.value)
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="contact"
                      className="text-sm font-medium text-gray-700"
                    >
                      연락처
                    </Label>
                    <Input
                      id="contact"
                      value={formData.contact ?? ''}
                      onChange={e =>
                        handleInputChange('contact', e.target.value)
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* 오른쪽 열 */}
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      이메일 *
                    </Label>
                    <Input
                      id="email"
                      value={formData.email ?? ''}
                      onChange={e => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="position"
                      className="text-sm font-medium text-gray-700"
                    >
                      직급
                    </Label>
                    <Input
                      id="position"
                      value={formData.position ?? ''}
                      onChange={e =>
                        handleInputChange('position', e.target.value)
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="timezone"
                      className="text-sm font-medium text-gray-700"
                    >
                      시간대
                    </Label>
                    <Input
                      id="timezone"
                      value={formData.timezone ?? ''}
                      onChange={e =>
                        handleInputChange('timezone', e.target.value)
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* 자기소개 */}
              <div>
                <Label
                  htmlFor="introduction"
                  className="text-sm font-medium text-gray-700"
                >
                  자기소개
                </Label>
                <Textarea
                  id="introduction"
                  value={formData.introduction ?? ''}
                  onChange={e =>
                    handleInputChange('introduction', e.target.value)
                  }
                  disabled={!isEditing}
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
