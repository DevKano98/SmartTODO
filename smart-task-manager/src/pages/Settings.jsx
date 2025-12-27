import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useThemeStore from '../store/themeStore';
import usePomodoroStore from '../store/pomodoroStore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { 
    workDuration, 
    breakDuration, 
    setWorkDuration, 
    setBreakDuration 
  } = usePomodoroStore();
  
  const [profileForm, setProfileForm] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    loading: false,
    error: null,
    success: false
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    error: null,
    success: false
  });
  
  const [pomodoroSettings, setPomodoroSettings] = useState({
    workMinutes: workDuration / 60,
    breakMinutes: breakDuration / 60
  });
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileForm({ ...profileForm, loading: true, error: null, success: false });
    
    try {
      const updates = [];
      
      // Update display name if changed
      if (profileForm.displayName !== currentUser.displayName) {
        updates.push(updateProfile(currentUser, {
          displayName: profileForm.displayName
        }));
      }
      
      // Update email if changed
      if (profileForm.email !== currentUser.email) {
        updates.push(updateEmail(currentUser, profileForm.email));
      }
      
      await Promise.all(updates);
      
      setProfileForm({
        ...profileForm,
        loading: false,
        success: true
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileForm({
        ...profileForm,
        loading: false,
        error: error.message
      });
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordForm({
        ...passwordForm,
        error: "New passwords don't match"
      });
      return;
    }
    
    setPasswordForm({ ...passwordForm, loading: true, error: null, success: false });
    
    try {
      await updatePassword(currentUser, passwordForm.newPassword);
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        loading: false,
        error: null,
        success: true
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordForm({
        ...passwordForm,
        loading: false,
        error: error.message
      });
    }
  };
  
  const handlePomodoroSubmit = (e) => {
    e.preventDefault();
    
    setWorkDuration(pomodoroSettings.workMinutes);
    setBreakDuration(pomodoroSettings.breakMinutes);
    
    alert('Pomodoro settings updated!');
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect is handled by the protected route
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={profileForm.displayName}
                onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                className="input"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="input"
              />
            </div>
            
            {profileForm.error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {profileForm.error}
              </div>
            )}
            
            {profileForm.success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
                Profile updated successfully!
              </div>
            )}
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={profileForm.loading}
            >
              {profileForm.loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input"
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input"
                required
                minLength="6"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input"
                required
                minLength="6"
              />
            </div>
            
            {passwordForm.error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {passwordForm.error}
              </div>
            )}
            
            {passwordForm.success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
                Password updated successfully!
              </div>
            )}
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={passwordForm.loading}
            >
                            {passwordForm.loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Pomodoro Settings</h2>
          
          <form onSubmit={handlePomodoroSubmit} className="space-y-4">
            <div>
              <label htmlFor="workMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Duration (minutes)
              </label>
              <input
                id="workMinutes"
                type="number"
                min="1"
                max="60"
                value={pomodoroSettings.workMinutes}
                onChange={(e) => setPomodoroSettings({ 
                  ...pomodoroSettings, 
                  workMinutes: parseInt(e.target.value) 
                })}
                className="input"
              />
            </div>
            
            <div>
              <label htmlFor="breakMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Break Duration (minutes)
              </label>
              <input
                id="breakMinutes"
                type="number"
                min="1"
                max="30"
                value={pomodoroSettings.breakMinutes}
                onChange={(e) => setPomodoroSettings({ 
                  ...pomodoroSettings, 
                  breakMinutes: parseInt(e.target.value) 
                })}
                className="input"
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Pomodoro Settings
            </button>
          </form>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dark Mode
              </span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Account</h2>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Signed in as: <span className="font-medium">{currentUser?.email}</span>
            </p>
            
            <button
              onClick={handleLogout}
              className="btn btn-danger"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
