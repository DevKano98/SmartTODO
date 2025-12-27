import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useTaskStore from '../store/taskStore';
import usePomodoroStore from '../store/pomodoroStore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isStorageAccessible } from '../services/firebase';
import Loading from '../components/Loading';

const Profile = () => {
  const { currentUser } = useAuth();
  const { tasks, fetchTasks, loading: tasksLoading } = useTaskStore();
  const { completedSessions } = usePomodoroStore();
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [useFirebaseStorage, setUseFirebaseStorage] = useState(true);
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    completionRate: 0
  });
  
  useEffect(() => {
    if (currentUser) {
      fetchTasks(currentUser.uid);
      
      // Set initial profile image if user has one
      if (currentUser.photoURL) {
        setImagePreview(currentUser.photoURL);
      }
    }
  }, [currentUser, fetchTasks]);
  
  useEffect(() => {
    if (tasks.length > 0) {
      const completed = tasks.filter(task => task.status === 'completed').length;
      const inProgress = tasks.filter(task => task.status === 'in-progress').length;
      const todo = tasks.filter(task => task.status === 'to-do').length;
      
      setStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        inProgressTasks: inProgress,
        todoTasks: todo,
        completionRate: Math.round((completed / tasks.length) * 100)
      });
    }
  }, [tasks]);
  
  // Check if Firebase Storage is accessible
  useEffect(() => {
    const checkStorage = async () => {
      const isAccessible = await isStorageAccessible();
      setUseFirebaseStorage(isAccessible);
      if (!isAccessible) {
        console.log('Firebase Storage is not accessible. Using Base64 fallback.');
      }
    };
    
    checkStorage();
  }, []);
  
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setUploadError("Image size must be less than 2MB");
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setUploadError("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }
      
      setProfileImage(file);
      setUploadError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      let photoURL;
      
      if (useFirebaseStorage) {
        // Firebase Storage approach
        // Create a unique filename with timestamp to avoid caching issues
        const timestamp = new Date().getTime();
        const filename = `${currentUser.uid}_${timestamp}`;
        
        // Create a reference to the storage location
        const storageRef = ref(storage, `profile-images/${filename}`);
        
        // Set metadata to work around CORS issues
        const metadata = {
          contentType: profileImage.type,
          customMetadata: {
            'user-id': currentUser.uid,
            'timestamp': timestamp.toString()
          }
        };
        
        // Upload the file with metadata
        await uploadBytes(storageRef, profileImage, metadata);
        
        // Get the download URL
        photoURL = await getDownloadURL(storageRef);
      } else {
        // Base64 fallback approach for environments with CORS issues
        photoURL = await convertToBase64(profileImage);
      }
      
      // Update the user's profile
      await updateProfile(currentUser, {
        photoURL: photoURL
      });
      
      setUploadSuccess(true);
      setProfileImage(null); // Clear the selected file after successful upload
      
      // Force reload user info to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Check if it's a CORS error
      if (error.code === 'storage/unauthorized' || error.message.includes('CORS')) {
        setUploadError('CORS error: Try using the Base64 upload method by refreshing this page.');
        // Switch to Base64 method for next attempt
        setUseFirebaseStorage(false);
      } else {
        setUploadError(error.message || 'Failed to upload image');
      }
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Convert file to Base64 string (fallback method)
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  const handleRemoveProfileImage = async () => {
    if (!currentUser.photoURL) return;
    
    const confirmRemove = window.confirm("Are you sure you want to remove your profile photo?");
    if (!confirmRemove) return;
    
    setRemoveLoading(true);
    setUploadError(null);
    
    try {
      // Update the user's profile to remove the photo URL
      await updateProfile(currentUser, {
        photoURL: null
      });
      
      setImagePreview(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error('Error removing profile image:', error);
      setUploadError(error.message);
    } finally {
      setRemoveLoading(false);
    }
  };
  
  if (tasksLoading && tasks.length === 0) {
    return <Loading />;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {uploadLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>
                
                <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input 
                    id="profile-image" 
                    type="file" 
                    accept="image/jpeg, image/png, image/gif" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-bold">{currentUser?.displayName || 'User'}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{currentUser?.email}</p>
              
              {uploadError && (
                <div className="w-full p-3 bg-red-100 text-red-700 rounded-md text-sm mb-3">
                  {uploadError}
                </div>
              )}
              
              {uploadSuccess && (
                <div className="w-full p-3 bg-green-100 text-green-700 rounded-md text-sm mb-3">
                  Profile image updated successfully!
                </div>
              )}
              
              <div className="w-full space-y-2">
                {profileImage && (
                  <button
                    onClick={handleImageUpload}
                    className="btn btn-primary w-full"
                    disabled={uploadLoading || removeLoading}
                  >
                    {uploadLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : `Upload Using ${useFirebaseStorage ? 'Firebase Storage' : 'Base64 (Fallback)'}`}
                  </button>
                )}
                
                {currentUser?.photoURL && (
                  <button
                    onClick={handleRemoveProfileImage}
                    className="btn btn-outline btn-error w-full"
                    disabled={uploadLoading || removeLoading}
                  >
                    {removeLoading ? 'Removing...' : 'Remove Photo'}
                  </button>
                )}
              </div>
              
              {!useFirebaseStorage && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Using Base64 fallback due to CORS limitations. Images may be larger in size.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Task Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {stats.totalTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.completedTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.inProgressTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.todoTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">To Do</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Completion Rate
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stats.completionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Pomodoro Statistics</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {completedSessions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed Sessions</div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {Math.round(completedSessions * 25 / 60)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hours Focused</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
