
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Card, Button, Input, Header, Toast } from '../components/UI';
import { Camera, Save, Upload, UserCircle } from 'lucide-react';
import { MockService } from '../services/mockData';

interface ProfileScreenProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onUpdateUser }) => {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(async () => {
        const updatedUser = { ...user, avatar: avatarUrl };
        await MockService.updateUser(updatedUser);
        onUpdateUser(updatedUser);
        setLoading(false);
        setShowToast(true);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-8">
      <Toast 
        message="Profile picture updated successfully!" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        type="success" 
      />

      <Header title="My Profile" subtitle="Manage your account details" />
      
      <Card className="p-8 flex flex-col items-center">
         <div className="relative group cursor-pointer mb-8" onClick={() => fileInputRef.current?.click()}>
            <div className="w-40 h-40 rounded-full p-1 border-4 border-slate-100 shadow-xl relative overflow-hidden bg-white">
                 <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover group-hover:opacity-80 transition-opacity"
                />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
                    <Camera size={32} />
                </div>
            </div>
         </div>
         
         <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
         />

         <div className="w-full max-w-md space-y-6">
            <div className="text-center">
                 <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                 <p className="text-slate-500">{user.role} • {user.username}</p>
                 <p className="text-xs text-slate-400 mt-2">Click the picture to upload a new photo</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <Input 
                    label="Or enter Image URL" 
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)} 
                    placeholder="https://example.com/avatar.jpg"
                    icon={Upload}
                />
            </div>

            <Button fullWidth onClick={handleSave} icon={Save} className="mt-4">
                {loading ? 'Saving...' : 'Save Profile Picture'}
            </Button>
         </div>
      </Card>

       <Card className="p-6">
         <div className="flex items-center gap-3 mb-6">
            <UserCircle className="text-slate-400" />
            <h3 className="font-bold text-slate-800">Account Information</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl">
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Full Name</label>
                <div className="font-semibold text-slate-700 text-lg">{user.name}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Role</label>
                <div className="font-semibold text-slate-700 text-lg capitalize">{user.role.toLowerCase()}</div>
            </div>
             <div className="bg-slate-50 p-4 rounded-xl">
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">ID Number</label>
                <div className="font-semibold text-slate-700 text-lg">{user.username}</div>
            </div>
            {user.instrument && (
                <div className="bg-slate-50 p-4 rounded-xl">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Instrument</label>
                    <div className="font-semibold text-slate-700 text-lg">{user.instrument}</div>
                </div>
            )}
         </div>
       </Card>
    </div>
  );
};
