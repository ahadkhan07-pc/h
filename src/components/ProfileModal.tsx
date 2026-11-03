import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  RefreshCw,
  LogOut,
  X,
  Phone,
  FileText,
  Cloud,
  ShieldCheck,
} from 'lucide-react';
import { auth, signInWithGoogle, signOutUser, updateUserProfileDetails, getUserProfile, UserProfileData } from '../services/firebase';
import { storageService } from '../services/storageService';
import { AppSettings, SyncStatus, ThemeMode } from '../types/hisab';
import { TRANSLATIONS } from '../utils/translations';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  themeMode: ThemeMode;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSyncComplete?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  settings,
  themeMode,
  onUpdateSettings,
  onSyncComplete,
}) => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || settings.userName || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(storageService.getSyncStatus());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = themeMode === 'light';
  const t = TRANSLATIONS[settings.language];

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        setDisplayName(user.displayName || '');
        setPhotoURL(user.photoURL || '');
        // Fetch extended profile from Firestore
        const profile = await getUserProfile(user.uid);
        if (profile) {
          if (profile.phone) setPhone(profile.phone);
          if (profile.bio) setBio(profile.bio);
          if (profile.photoURL) setPhotoURL(profile.photoURL);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Storage Sync Status
  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setSyncStatus(storageService.getSyncStatus());
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      if (user.displayName) {
        onUpdateSettings({ userName: user.displayName });
      }
      // Trigger full data restore & sync
      setSyncing(true);
      await storageService.performFullSync();
      setSyncing(false);
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setCurrentUser(null);
      setDisplayName(settings.userName || 'ব্যবহারকারী');
      setPhone('');
      setBio('');
      setPhotoURL('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign Out failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage(settings.language === 'bn' ? 'ছবির সাইজ ২MB এর কম হতে হবে' : 'Image size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoURL(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoURL('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      if (currentUser) {
        await updateUserProfileDetails(displayName, photoURL, phone, bio);
      }
      onUpdateSettings({ userName: displayName });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setErrorMessage(null);
    try {
      const res = await storageService.performFullSync();
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      } else if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors ${
          isLight
            ? 'bg-[#FFFFFF] border border-[#DECFF2] text-[#160F24]'
            : 'bg-[#110B1B] border border-[#2B1D42] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 transition-colors ${
            isLight ? 'border-[#EAE2F3]' : 'border-[#231738]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
            <h2
              className={`text-base font-bold tracking-tight ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              {settings.language === 'bn' ? 'ব্যবহারকারী প্রোফাইল ও ক্লাউড সিঙ্ক' : 'User Profile & Cloud Sync'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? 'text-[#695B7E] hover:text-[#160F24] hover:bg-[#F4EFFB]'
                : 'text-[#948BA5] hover:text-white hover:bg-[#1E142F]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{settings.language === 'bn' ? 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে' : 'Profile updated successfully'}</span>
            </div>
          )}

          {/* Authentication Section */}
          {!currentUser ? (
            <div
              className={`p-5 rounded-2xl border text-center space-y-3 transition-colors ${
                isLight
                  ? 'bg-[#FAF6FE] border-[#E8DEF2]'
                  : 'bg-[#181126] border-[#291B40]'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mx-auto">
                <Cloud className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  {settings.language === 'bn' ? 'গুগল দিয়ে ক্লাউড ব্যাকআপ চালু করুন' : 'Enable Google Cloud Backup'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {settings.language === 'bn'
                    ? 'আপনার আর্থিক হিসাব ক্লাউড ফায়ারস্টোরে স্বয়ংক্রিয়ভাবে সিঙ্ক ও সুরক্ষিত থাকবে।'
                    : 'Your financial accounts will automatically sync securely to Google Cloud Firestore.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-gray-800 font-semibold text-xs border border-gray-300 shadow-sm flex items-center justify-center gap-2.5 hover:bg-gray-50 active:scale-98 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{settings.language === 'bn' ? 'গুগল দিয়ে সাইন-ইন করুন' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            /* Signed in User Card & Cloud Sync Status */
            <div
              className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                isLight
                  ? 'bg-[#FAF6FE] border-[#E8DEF2]'
                  : 'bg-[#181126] border-[#291B40]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{settings.language === 'bn' ? 'গুগল একাউন্ট সংযুক্ত' : 'Google Account Connected'}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{settings.language === 'bn' ? 'সাইন আউট' : 'Sign Out'}</span>
                </button>
              </div>

              {/* Cloud Sync State Row */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-white border-[#E8DEF2]' : 'bg-[#110B1B] border-[#231738]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#7C3AED]" />
                  <div>
                    <span className="text-xs font-semibold block">
                      {settings.language === 'bn' ? 'ক্লাউড স্টোরেজ স্ট্যাটাস' : 'Cloud Sync Status'}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      {syncStatus === 'synced' && (
                        <span className="text-emerald-500 font-bold">● Synced</span>
                      )}
                      {syncStatus === 'syncing' && (
                        <span className="text-[#8B5CF6] font-bold">● Syncing...</span>
                      )}
                      {syncStatus === 'failed' && (
                        <span className="text-red-400 font-bold">● Sync Failed</span>
                      )}
                      {syncStatus === 'idle' && (
                        <span className="text-gray-400">● Idle</span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={syncing}
                  className={`p-2 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    isLight
                      ? 'bg-[#F0E6FC] border-[#DECFF2] text-[#7C3AED]'
                      : 'bg-[#201438] border-[#311E55] text-[#8B5CF6]'
                  }`}
                  title={settings.language === 'bn' ? 'এখনই সিঙ্ক করুন' : 'Sync Now'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] font-medium">{settings.language === 'bn' ? 'সিঙ্ক' : 'Sync'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Profile Details Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                <div
                  className={`w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center text-xl font-bold shadow-md transition-colors ${
                    isLight
                      ? 'bg-[#F0E6FC] border-[#DECFF2] text-[#7C3AED]'
                      : 'bg-[#1C142D] border-[#362259] text-[#8B5CF6]'
                  }`}
                >
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase() || <User className="w-8 h-8" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-md hover:bg-[#6D28D9] transition-transform active:scale-95 cursor-pointer"
                  title={settings.language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Upload photo'}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                  >
                    {photoURL
                      ? settings.language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Picture'
                      : settings.language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Picture'}
                  </button>
                  {photoURL && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{settings.language === 'bn' ? 'মুছুন' : 'Remove'}</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  {settings.language === 'bn' ? 'PNG, JPG বা WebP ফরম্যাট (সর্বোচ্চ ২MB)' : 'PNG, JPG or WebP (max 2MB)'}
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isLight ? 'text-[#160F24]' : 'text-gray-300'
                }`}
              >
                {settings.language === 'bn' ? 'ব্যবহারকারীর নাম' : 'Display Name'}
              </label>
              <div className="relative">
                <User
                  className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight ? 'text-[#87789D]' : 'text-[#84789A]'
                  }`}
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder={settings.language === 'bn' ? 'আপনার নাম লিখুন' : 'Enter your name'}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-[#E5DBF0] focus:border-[#7C3AED] text-[#160F24]'
                      : 'bg-[#150F24] border-[#291B40] focus:border-[#8B5CF6] text-white'
                  }`}
                />
              </div>
            </div>

            {/* Google Email (Read-only if authenticated) */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isLight ? 'text-[#160F24]' : 'text-gray-300'
                }`}
              >
                {settings.language === 'bn' ? 'গুগল ইমেইল' : 'Google Email'}
              </label>
              <div className="relative">
                <Mail
                  className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight ? 'text-[#87789D]' : 'text-[#84789A]'
                  }`}
                />
                <input
                  type="email"
                  value={currentUser?.email || (settings.language === 'bn' ? 'সংযুক্ত নয়' : 'Not Connected')}
                  readOnly
                  disabled
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs outline-none opacity-80 cursor-not-allowed ${
                    isLight
                      ? 'bg-[#F9F5FD] border-[#E5DBF0] text-[#695B7E]'
                      : 'bg-[#120D1D] border-[#221636] text-[#84789A]'
                  }`}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isLight ? 'text-[#160F24]' : 'text-gray-300'
                }`}
              >
                {settings.language === 'bn' ? 'ফোন নম্বর (ঐচ্ছিক)' : 'Phone Number (Optional)'}
              </label>
              <div className="relative">
                <Phone
                  className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight ? 'text-[#87789D]' : 'text-[#84789A]'
                  }`}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700-000000"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-[#E5DBF0] focus:border-[#7C3AED] text-[#160F24]'
                      : 'bg-[#150F24] border-[#291B40] focus:border-[#8B5CF6] text-white'
                  }`}
                />
              </div>
            </div>

            {/* Personal Bio */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isLight ? 'text-[#160F24]' : 'text-gray-300'
                }`}
              >
                {settings.language === 'bn' ? 'ব্যক্তিগত তথ্য / বায়ো' : 'Personal Note / Bio'}
              </label>
              <div className="relative">
                <FileText
                  className={`w-4 h-4 absolute left-3 top-3 ${
                    isLight ? 'text-[#87789D]' : 'text-[#84789A]'
                  }`}
                />
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={settings.language === 'bn' ? 'আপনার ব্যক্তিগত নোট...' : 'Add a personal note or bio...'}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs outline-none transition-colors resize-none ${
                    isLight
                      ? 'bg-white border-[#E5DBF0] focus:border-[#7C3AED] text-[#160F24]'
                      : 'bg-[#150F24] border-[#291B40] focus:border-[#8B5CF6] text-white'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] font-bold text-xs text-white shadow-md transition-colors cursor-pointer"
            >
              {loading
                ? settings.language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving Changes...'
                : settings.language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
