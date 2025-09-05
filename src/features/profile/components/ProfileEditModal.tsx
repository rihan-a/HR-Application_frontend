import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { EmployeeProfile } from '../../../shared/types';

interface ProfileEditModalProps {
  profile: EmployeeProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Partial<EmployeeProfile>) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<EmployeeProfile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        position: profile.position || '',
        department: profile.department || '',
        bio: profile.bio || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EmployeeProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Edit Profile: {profile.firstName} {profile.lastName}
            </h2>
            <Button variant="ghost" onClick={onClose} size="sm">
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName || ''}
                onChange={(value) => handleChange('firstName', value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName || ''}
                onChange={(value) => handleChange('lastName', value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Position"
                value={formData.position || ''}
                onChange={(value) => handleChange('position', value)}
                required
              />
              <Input
                label="Department"
                value={formData.department || ''}
                onChange={(value) => handleChange('department', value)}
                required
              />
            </div>

            <Input
              label="Bio"
              value={formData.bio || ''}
              onChange={(value) => handleChange('bio', value)}
              placeholder="Tell us about yourself..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(value) => handleChange('email', value)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(value) => handleChange('phone', value)}
              />
            </div>

            <Input
              label="Address"
              value={formData.address || ''}
              onChange={(value) => handleChange('address', value)}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
