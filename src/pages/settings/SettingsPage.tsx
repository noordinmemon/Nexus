import React, { useState } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard, Shield } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('business_nexus_token');

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [generatingOtp, setGeneratingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) return null;

  const handleGenerateOTP = async () => {
    setGeneratingOtp(true);
    try {
      const response = await fetch(`${API_URL}/auth/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setOtp(data.otp);
      setOtpSent(true);
      toast.success('OTP generated successfully');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setGeneratingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue) {
      toast.error('Enter the OTP');
      return;
    }
    setVerifyingOtp(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ otp: otpValue })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setOtpVerified(true);
      setOtpSent(false);
      setOtpValue('');
      toast.success('2FA verified successfully');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(user.id, { name, bio });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md">
                <User size={18} className="mr-3" />
                Profile
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Lock size={18} className="mr-3" />
                Security
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Bell size={18} className="mr-3" />
                Notifications
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Globe size={18} className="mr-3" />
                Language
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Palette size={18} className="mr-3" />
                Appearance
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <CreditCard size={18} className="mr-3" />
                Billing
              </button>
            </nav>
          </CardBody>
        </Card>

        {/* Main settings content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar src={user.avatarUrl} alt={user.name} size="xl" />
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="mt-2 text-sm text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  defaultValue={user.email}
                  disabled
                />
                <Input
                  label="Role"
                  value={user.role}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveProfile} isLoading={saving}>
                  Save Changes
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* 2FA Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  <div className="mt-1">
                    {otpVerified
                      ? <Badge variant="primary">Verified</Badge>
                      : <Badge variant="gray">Not Verified</Badge>
                    }
                  </div>
                </div>
                <Button
                  variant="outline"
                  leftIcon={<Shield size={16} />}
                  onClick={handleGenerateOTP}
                  isLoading={generatingOtp}
                >
                  Generate OTP
                </Button>
              </div>

              {otpSent && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-3">
                  <p className="text-sm text-blue-800 font-medium">
                    Your OTP: <span className="text-lg font-bold">{otp}</span>
                  </p>
                  <p className="text-xs text-blue-600">
                    In production this would be sent to your email. Expires in 10 minutes.
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <Button
                      onClick={handleVerifyOTP}
                      isLoading={verifyingOtp}
                    >
                      Verify
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleChangePassword}>
                  Update Password
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};