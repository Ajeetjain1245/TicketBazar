import { useState } from 'react';
import { User, Mail, Phone, Lock, Camera, CheckCircle, Shield } from 'lucide-react';
import useAuthStore from '../../context/authStore';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, updatePassword, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    phoneVisibility: user?.phoneVisibility || 'private',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(profileData);
    if (result.success) {
      toast.success('Profile updated successfully!');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Profile Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                <User className="h-12 w-12 text-indigo-400" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-indigo-500 rounded-full text-white hover:bg-indigo-600">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">{user?.name}</h2>
            <p className="text-slate-400">{user?.email}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin' ? 'bg-rose-500/10 text-rose-400' :
                user?.role === 'seller' ? 'bg-emerald-500/10 text-emerald-400' :
                'bg-indigo-500/10 text-indigo-400'
              }`}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
              {user?.isVerified && (
                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-4">
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-slate-100 mb-4">Account Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Orders</span>
                <span className="text-slate-100 font-medium">{user?.totalOrders || 0}</span>
              </div>
              {(user?.role === 'seller' || user?.role === 'admin') && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Sales</span>
                  <span className="text-slate-100 font-medium">{user?.totalSales || 0}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Rating</span>
                <span className="text-slate-100 font-medium">
                  {user?.rating ? `${user.rating} ⭐` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2.5 rounded-2xl font-bold font-display transition-all ${
                activeTab === 'profile'
                  ? 'bg-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-100'
              }`}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-2.5 rounded-2xl font-bold font-display transition-all ${
                activeTab === 'password'
                  ? 'bg-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-100'
              }`}
            >
              Change Password
            </button>
          </div>

          {/* Profile Form */}
          {activeTab === 'profile' && (
            <div className="card p-8 bg-slate-800/30 backdrop-blur-xl border-slate-700/50">
              <h2 className="text-xl font-bold text-slate-100 mb-8 font-display">Personal Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="label text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="input pl-10 bg-slate-800 border-slate-700 text-slate-100"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="input pl-10 bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-slate-500 text-sm mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="label text-slate-300">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="input pl-10 bg-slate-800 border-slate-700 text-slate-100"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                {/* Phone Privacy Controls */}
                <div>
                  <label className="label text-slate-300 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-400" />
                    Phone Visibility
                  </label>
                  <select
                    name="phoneVisibility"
                    value={profileData.phoneVisibility}
                    onChange={handleProfileChange}
                    className="input bg-slate-800 border-slate-700 text-slate-100"
                  >
                    <option value="private">Private — Only you can see</option>
                    <option value="buyers_only">Buyers Only — Visible after purchase</option>
                    <option value="public">Public — Visible on your seller profile</option>
                  </select>
                  <p className="text-slate-500 text-sm mt-1">
                    Controls who can see your phone number on ticket listings
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password Form */}
          {activeTab === 'password' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="label text-slate-300">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="input pl-10 bg-slate-800 border-slate-700 text-slate-100"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="input pl-10 bg-slate-800 border-slate-700 text-slate-100"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-slate-300">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input pl-10 bg-slate-800 border-slate-700 text-slate-100"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
