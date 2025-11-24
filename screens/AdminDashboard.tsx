
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
import { Card, Header, Button, Input, Badge, Select, Modal } from '../components/UI';
import { Users, UserPlus, Trash2, Activity, UserCog, Search, Settings, Shield, Pencil, Music2, Upload, FileText, Image, AlertTriangle } from 'lucide-react';
import { MockService } from '../services/mockData';

export const AdminDashboard = ({ user, onNavigate }: { user: User, onNavigate: (tab: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'add_student' | 'add_teacher' | 'upload_material'>('overview');
  const [activeList, setActiveList] = useState<'all' | 'students' | 'teachers'>('all'); // Control which list is shown in overview
  
  const [newUser, setNewUser] = useState({ name: '', id: '', password: '', role: UserRole.STUDENT, instrument: '' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean, user: User | null}>({
    isOpen: false, 
    user: null
  });
  
  const [uploadData, setUploadData] = useState({ studentId: '', title: '', type: 'PDF', url: '' });
  
  const [feedback, setFeedback] = useState('');
  const [stats, setStats] = useState({ students: 0, teachers: 0, attendance: 0 });
  
  // Directory Search & Dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState<User[]>([]);
  const [allUsersForSearch, setAllUsersForSearch] = useState<User[]>([]); 
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const instrumentOptions = [
    { value: 'Drums', label: 'Drums' },
    { value: 'Guitar', label: 'Guitar' },
    { value: 'Piano', label: 'Piano' },
    { value: 'Keyboard', label: 'Keyboard' },
  ];

  const materialTypes = [
    { value: 'PDF', label: 'PDF Document' },
    { value: 'IMAGE', label: 'Image' },
    { value: 'AUDIO', label: 'Audio File' },
  ];

  useEffect(() => {
    updateStats();
    refreshDirectory();
    // Fetch all users for global search suggestions
    const allS = MockService.getUsersByRole(UserRole.STUDENT);
    const allT = MockService.getUsersByRole(UserRole.TEACHER);
    setAllUsersForSearch([...allS, ...allT]);
    
    // Click outside listener for search dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeList]);

  const refreshDirectory = () => {
    if (activeList === 'students') {
        setDirectoryUsers(MockService.getUsersByRole(UserRole.STUDENT));
    } else if (activeList === 'teachers') {
        setDirectoryUsers(MockService.getUsersByRole(UserRole.TEACHER));
    } else {
        // Default view: Students
        setDirectoryUsers(MockService.getUsersByRole(UserRole.STUDENT));
    }
  };

  const updateStats = () => {
    const data = MockService.getStats();
    setStats({ 
        students: data.studentCount, 
        teachers: data.teacherCount,
        attendance: data.avgAttendance || 0
    });
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.id) {
      setFeedback('Please fill name and ID fields');
      return;
    }
    
    if (!editingUserId && !newUser.password) {
      setFeedback('Please set an initial password for the new user');
      return;
    }

    if (newUser.role === UserRole.STUDENT && !newUser.instrument) {
      setFeedback('Please select an instrument for the student');
      return;
    }
    
    if (editingUserId) {
        // Update existing user
        const existingUser = directoryUsers.find(s => s.id === editingUserId);
        const updatedUser: User = {
            id: editingUserId,
            name: newUser.name,
            username: newUser.id,
            role: newUser.role,
            avatar: existingUser?.avatar || `https://picsum.photos/seed/${Date.now()}/200/200`,
            stats: existingUser?.stats,
            instrument: newUser.role === UserRole.STUDENT ? newUser.instrument : undefined,
            ...(newUser.password ? { password: newUser.password } : {})
        };

        MockService.updateUser(updatedUser);
        setFeedback(`Successfully updated ${newUser.role} account!`);
        refreshDirectory();
    } else {
        // Create new user
        const createdUser: User = {
            id: Date.now().toString(),
            name: newUser.name,
            username: newUser.id,
            role: newUser.role,
            password: newUser.password,
            instrument: newUser.role === UserRole.STUDENT ? newUser.instrument : undefined,
            avatar: `https://picsum.photos/seed/${Date.now()}/200/200`
        };

        MockService.addUser(createdUser);
        setFeedback(`Successfully created ${newUser.role} account!`);
        refreshDirectory();
    }
    
    // Success flow
    setTimeout(() => {
        setFeedback('');
        setNewUser({ name: '', id: '', password: '', role: newUser.role, instrument: '' });
        
        if (isEditModalOpen) {
            setIsEditModalOpen(false);
            setEditingUserId(null);
        }
        
        updateStats(); 
        // Refresh search list
        const allS = MockService.getUsersByRole(UserRole.STUDENT);
        const allT = MockService.getUsersByRole(UserRole.TEACHER);
        setAllUsersForSearch([...allS, ...allT]);
    }, 1000);
  };

  const handleUploadMaterial = () => {
    if (!uploadData.title || !uploadData.url) {
        setFeedback('Please provide a title and a file URL/Link.');
        return;
    }

    MockService.addStudyMaterial({
        id: Date.now().toString(),
        title: uploadData.title,
        type: uploadData.type as any,
        url: uploadData.url,
        studentId: uploadData.studentId,
        uploadedBy: user.name,
        date: new Date().toISOString().split('T')[0],
        isNew: true
    });

    setFeedback('Material uploaded successfully!');
    setTimeout(() => {
        setFeedback('');
        setActiveTab('overview');
    }, 1500);
  };

  const handleEditClick = (targetUser: User) => {
    setNewUser({ 
      name: targetUser.name, 
      id: targetUser.username, 
      password: '', 
      role: targetUser.role,
      instrument: targetUser.instrument || ''
    });
    setEditingUserId(targetUser.id);
    setIsEditModalOpen(true);
    setFeedback('');
  };

  const handleDeleteClick = (userToDelete: User) => {
    setDeleteConfirmation({ isOpen: true, user: userToDelete });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.user) {
        MockService.deleteUser(deleteConfirmation.user.id);
        refreshDirectory();
        updateStats();
        // Refresh search list
        const allS = MockService.getUsersByRole(UserRole.STUDENT);
        const allT = MockService.getUsersByRole(UserRole.TEACHER);
        setAllUsersForSearch([...allS, ...allT]);
        setDeleteConfirmation({ isOpen: false, user: null });
    }
  };

  const handleUploadClick = (studentId: string) => {
    setUploadData({ ...uploadData, studentId });
    setActiveTab('upload_material');
  };

  const filteredUsers = directoryUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchSuggestions = allUsersForSearch.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Search Bar - Positioned ABOVE directory content */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative z-20">
            <div className="flex items-center gap-3">
                <Search className="text-blue-500" size={24} />
                <div>
                    <h3 className="font-bold text-slate-800">Quick Find</h3>
                    <p className="text-xs text-slate-400">Search student or teacher directory</p>
                </div>
            </div>
            <div className="flex relative w-full md:w-auto flex-1 max-w-lg" ref={searchContainerRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by Name, ID, or Role..." 
                    className="pl-11 pr-4 py-3 bg-slate-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full transition-all"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                    }}
                    onFocus={() => setShowSearchDropdown(true)}
                />
                {/* Search Dropdown */}
                {showSearchDropdown && searchQuery && (
                    <div className="absolute top-full left-0 right-0 bg-white mt-2 rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto animate-fade-in overflow-hidden z-50">
                         {searchSuggestions.length > 0 ? (
                            searchSuggestions.map(u => (
                                <div 
                                    key={u.id} 
                                    className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-none transition-colors"
                                    onClick={() => {
                                        setSearchQuery(u.name);
                                        setShowSearchDropdown(false);
                                        // Automatically switch tab to user's role to show them in directory
                                        if (u.role === UserRole.STUDENT) setActiveList('students');
                                        if (u.role === UserRole.TEACHER) setActiveList('teachers');
                                    }}
                                >
                                    <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm">{u.name}</div>
                                        <div className="text-xs text-slate-500 capitalize flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.role === UserRole.STUDENT ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                                            {u.role.toLowerCase()} • {u.username}
                                        </div>
                                    </div>
                                </div>
                            ))
                         ) : (
                            <div className="p-4 text-center text-slate-400 text-sm">No results found</div>
                         )}
                    </div>
                )}
            </div>
        </div>

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
            onClick={() => setActiveList('students')}
            className={`bg-slate-800 text-white border-none relative overflow-hidden cursor-pointer hover:scale-105 transition-transform ${activeList === 'students' ? 'ring-4 ring-blue-400' : ''}`}
        >
           <div className="absolute right-2 top-2 opacity-10"><Users size={64}/></div>
           <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Students</p>
           <h3 className="text-4xl font-bold">{stats.students}</h3>
           <div className="mt-4 text-xs text-green-400 flex items-center font-medium">
             <Activity size={14} className="mr-1" /> Click to view list
           </div>
        </Card>
        
        <Card 
            onClick={() => setActiveList('teachers')}
            className={`bg-white relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer hover:scale-105 ${activeList === 'teachers' ? 'ring-4 ring-purple-400' : ''}`}
        >
           <div className="absolute right-2 top-2 text-blue-100 group-hover:text-blue-50 transition-colors"><UserCog size={64}/></div>
           <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Teachers</p>
           <h3 className="text-4xl font-bold text-slate-800">{stats.teachers}</h3>
           <div className="mt-4 text-xs text-slate-400 font-medium">Click to view list</div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none relative overflow-hidden">
           <p className="text-blue-100 text-xs uppercase font-bold tracking-wider mb-1">Attendance</p>
           {stats.attendance > 0 ? (
             <>
               <h3 className="text-4xl font-bold">{stats.attendance}%</h3>
               <div className="mt-4 text-xs text-white/80 font-medium">Daily Average</div>
             </>
           ) : (
             <div className="h-16 flex items-center">
                <span className="text-blue-200 text-sm italic">No data yet</span>
             </div>
           )}
        </Card>

        <Card className="bg-white group hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-300 flex flex-col items-center justify-center text-center" onClick={() => { setNewUser({name: '', id: '', password: '', role: UserRole.STUDENT, instrument: ''}); setEditingUserId(null); setUserSearchQuery(''); setActiveTab('add_student'); }}>
           <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
             <UserPlus size={24} />
           </div>
           <span className="font-bold text-slate-700 text-sm">Quick Add Student</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actions Panel */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-xl">User Management</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={() => { setNewUser({name: '', id: '', password: '', role: UserRole.STUDENT, instrument: ''}); setEditingUserId(null); setUserSearchQuery(''); setActiveTab('add_student'); }}
                    className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group text-left"
                >
                    <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600">Register Student</h4>
                        <p className="text-xs text-slate-500 mt-1">Create ID for new admission</p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <UserPlus size={20} />
                    </div>
                </button>

                <button 
                    onClick={() => { setNewUser({name: '', id: '', password: '', role: UserRole.TEACHER, instrument: ''}); setEditingUserId(null); setUserSearchQuery(''); setActiveTab('add_teacher'); }}
                    className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group text-left"
                >
                    <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-purple-600">Register Teacher</h4>
                        <p className="text-xs text-slate-500 mt-1">Onboard new faculty member</p>
                    </div>
                    <div className="bg-purple-50 text-purple-600 p-3 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <UserCog size={20} />
                    </div>
                </button>
            </div>
        </div>

        {/* Quick Tools Sidebar */}
        <div className="space-y-6">
            <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Admin Tools</h4>
                <div className="space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-sm font-medium text-slate-600 flex items-center">
                        <Settings size={16} className="mr-3 text-slate-400" /> Global Settings
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-sm font-medium text-slate-600 flex items-center">
                        <Shield size={16} className="mr-3 text-slate-400" /> Permissions
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-sm font-medium text-red-500 hover:text-red-600 flex items-center">
                        <Trash2 size={16} className="mr-3" /> Delete Records
                    </button>
                </div>
            </Card>
        </div>
      </div>

      {/* Directory Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60 relative z-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <h3 className="font-bold text-slate-800 text-xl">
                    {activeList === 'students' ? 'Student Directory' : activeList === 'teachers' ? 'Teacher Directory' : 'Directory'}
                </h3>
                <div className="flex gap-2 items-center">
                    <Badge color={activeList === 'students' ? 'blue' : 'purple'}>
                        {activeList === 'students' ? 'Students' : 'Teachers'}
                    </Badge>
                    <span className="text-sm text-slate-400 font-medium hidden sm:inline-block">{filteredUsers.length} Records</span>
                </div>
            </div>
        </div>
        
        {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((item) => (
                    <Card key={item.id} className="flex flex-col gap-4 hover:shadow-md transition-all group relative">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img 
                                    src={item.avatar} 
                                    alt={item.name} 
                                    className="w-12 h-12 rounded-full object-cover border border-slate-100"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                                <p className="text-xs text-slate-500 font-mono truncate">{item.username}</p>
                                {item.instrument && (
                                  <span className="inline-block mt-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">{item.instrument}</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-between pt-3 border-t border-slate-50 items-center">
                            {item.role === UserRole.STUDENT && (
                                <Button 
                                    variant="ghost"
                                    className="!p-2 text-xs h-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleUploadClick(item.id)}
                                    title="Upload Material"
                                >
                                    <Upload size={14} className="mr-1" /> Upload
                                </Button>
                            )}

                            <div className="flex gap-2 ml-auto">
                                <Button 
                                    variant="ghost" 
                                    className="!py-1.5 !px-3 text-xs flex items-center gap-1 shadow-none h-8 bg-blue-50 text-blue-600 hover:bg-blue-100" 
                                    onClick={() => handleEditClick(item)}
                                    title="Edit User"
                                >
                                    <Pencil size={12} /> Edit
                                </Button>
                                {/* EXPLICIT DELETE BUTTON */}
                                <Button 
                                    variant="danger" 
                                    className="!py-1.5 !px-3 text-xs flex items-center gap-1 shadow-none h-8" 
                                    onClick={() => handleDeleteClick(item)}
                                    title="Delete User"
                                >
                                    <Trash2 size={12} /> Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Search size={24} />
                </div>
                <h3 className="text-slate-800 font-medium">No results found</h3>
                <p className="text-slate-400 text-sm">Try adjusting your search query or category</p>
            </div>
        )}
      </div>
    </div>
  );

  const renderUploadMaterial = () => {
    const targetStudent = MockService.getUsersByRole(UserRole.STUDENT).find(u => u.id === uploadData.studentId);

    return (
    <div className="max-w-xl mx-auto animate-fade-in pt-8">
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent" onClick={() => { setActiveTab('overview'); setUserSearchQuery(''); }}>← Back to Overview</Button>
        <Card className="p-8">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Upload size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Upload Material</h2>
                    <p className="text-slate-500">Assign study resources to specific student.</p>
                </div>
            </div>
            
            <div className="space-y-6">
                {/* Student Context Banner */}
                {targetStudent && (
                    <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4 border border-blue-100 mb-2">
                        <div className="relative">
                            <img src={targetStudent.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt={targetStudent.name} />
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border border-white">
                                <Users size={10} />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">Uploading For</div>
                            <div className="font-bold text-slate-800 text-lg">{targetStudent.name}</div>
                            <div className="text-xs text-slate-500">{targetStudent.username} • {targetStudent.instrument || 'Music Student'}</div>
                        </div>
                    </div>
                )}

                <Input 
                    label="Material Title" 
                    value={uploadData.title} 
                    onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    placeholder="e.g. Sheet Music Week 1"
                    icon={FileText}
                />
                <Select 
                    label="File Type"
                    value={uploadData.type}
                    onChange={(e) => setUploadData({...uploadData, type: e.target.value as any})}
                    options={materialTypes}
                    icon={Image}
                />
                <Input 
                    label="File URL (Simulation)" 
                    value={uploadData.url} 
                    onChange={(e) => setUploadData({...uploadData, url: e.target.value})}
                    placeholder="https://example.com/file.pdf"
                    icon={Upload}
                />
                <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-600">
                    Note: Since this is a demo, please paste a public URL for the file. In a real app, this would be a file picker.
                </div>

                {feedback && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-medium border border-green-100">
                        {feedback}
                    </div>
                )}

                <div className="flex gap-4 pt-2">
                     <Button variant="secondary" onClick={() => setActiveTab('overview')} className="flex-1">Cancel</Button>
                     <Button onClick={handleUploadMaterial} className="flex-1">Upload & Notify</Button>
                </div>
            </div>
        </Card>
    </div>
    );
  };

  const renderAddUser = (role: UserRole) => {
    const usersOfRole = MockService.getUsersByRole(role);
    const searchResults = userSearchQuery ? usersOfRole.filter(u => 
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
        u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
    ) : [];

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent" onClick={() => { setActiveTab('overview'); setUserSearchQuery(''); }}>← Back to Overview</Button>
        
        <Card className="p-8">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${role === UserRole.STUDENT ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-purple-600 text-white shadow-purple-200'}`}>
                  {role === UserRole.STUDENT ? <UserPlus size={32} /> : <UserCog size={32} />}
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                      {`Register New ${role === UserRole.STUDENT ? 'Student' : 'Teacher'}`}
                  </h2>
                  <p className="text-slate-500">{'Enter details to generate a unique ID card number.'}</p>
              </div>
          </div>

          <div className="mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Find existing {role === UserRole.STUDENT ? 'student' : 'teacher'}</h4>
             <div className="relative">
                 <Input 
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or ID to autofill..."
                    icon={Search}
                 />
                 {userSearchQuery && (
                    <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 mt-2 z-20 max-h-48 overflow-y-auto">
                        {searchResults.length > 0 ? (
                            searchResults.map(u => (
                                <div 
                                    key={u.id} 
                                    className="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors border-b border-slate-50 last:border-none"
                                    onClick={() => {
                                        handleEditClick(u);
                                        setUserSearchQuery('');
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={u.avatar} className="w-8 h-8 rounded-full" alt="" />
                                        <div>
                                            <div className="font-bold text-slate-700 text-sm">{u.name}</div>
                                            <div className="text-xs text-slate-400">{u.username}</div>
                                        </div>
                                    </div>
                                    <Badge color="blue" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-slate-400 text-sm">No results found</div>
                         )}
                    </div>
                 )}
             </div>
          </div>

          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                      <Input 
                          label="Full Name" 
                          value={newUser.name} 
                          onChange={(e) => setNewUser({...newUser, name: e.target.value, role: role})}
                          placeholder="e.g. John Smith"
                      />
                  </div>
                  <Input 
                      label="Generated ID Number" 
                      value={newUser.id} 
                      onChange={(e) => setNewUser({...newUser, id: e.target.value})}
                      placeholder={role === UserRole.STUDENT ? "IVA-S..." : "IVA-T..."}
                  />
                  <Input 
                      label="Initial Password" 
                      type="password"
                      value={newUser.password} 
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="••••••••"
                  />
                  {role === UserRole.STUDENT && (
                    <div className="md:col-span-2">
                      <Select
                        label="Instrument"
                        value={newUser.instrument}
                        onChange={(e) => setNewUser({...newUser, instrument: e.target.value})}
                        options={instrumentOptions}
                        icon={Music2}
                      />
                    </div>
                  )}
              </div>
              
              {feedback && (
                  <div className={`text-sm p-4 rounded-xl font-medium flex items-center ${feedback.includes('Success') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                      {feedback}
                  </div>
              )}

              <div className="pt-4 flex gap-4">
                  <Button variant="secondary" onClick={() => setActiveTab('overview')} className="flex-1">Cancel</Button>
                  <Button onClick={handleCreateUser} className="flex-1">
                    {role === UserRole.STUDENT ? 'Register Student' : 'Register Teacher'}
                  </Button>
              </div>
          </div>
        </Card>
      </div>
    );
  };

  if (activeTab === 'add_student') return renderAddUser(UserRole.STUDENT);
  if (activeTab === 'add_teacher') return renderAddUser(UserRole.TEACHER);
  if (activeTab === 'upload_material') return renderUploadMaterial();

  return (
    <>
        {renderOverview()}
        
        {/* Edit Modal */}
        {isEditModalOpen && (
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User Details">
                <div className="space-y-4">
                        <Input 
                            label="Full Name" 
                            value={newUser.name} 
                            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        />
                        <Input 
                            label="ID Number" 
                            value={newUser.id} 
                            onChange={(e) => setNewUser({...newUser, id: e.target.value})}
                        />
                        {newUser.role === UserRole.STUDENT && (
                            <Select
                            label="Instrument"
                            value={newUser.instrument}
                            onChange={(e) => setNewUser({...newUser, instrument: e.target.value})}
                            options={instrumentOptions}
                            icon={Music2}
                            />
                        )}
                        <Input 
                            label="New Password (Optional)" 
                            type="password"
                            value={newUser.password} 
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            placeholder="Leave blank to keep current"
                        />
                        {feedback && <div className="text-sm text-blue-600">{feedback}</div>}
                        <div className="flex gap-4 pt-2">
                            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleCreateUser} className="flex-1">Save Changes</Button>
                        </div>
                </div>
            </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation.isOpen && (
                <Modal isOpen={deleteConfirmation.isOpen} onClose={() => setDeleteConfirmation({isOpen: false, user: null})} title="Confirm Delete">
                <div className="space-y-4">
                    <p>Are you sure you want to delete <strong>{deleteConfirmation.user?.name}</strong>?</p>
                    <p className="text-sm text-slate-500">This action cannot be undone.</p>
                    <div className="flex gap-4 pt-2">
                        <Button variant="secondary" onClick={() => setDeleteConfirmation({isOpen: false, user: null})} className="flex-1">Cancel</Button>
                        <Button variant="danger" onClick={handleConfirmDelete} className="flex-1">Delete</Button>
                    </div>
                </div>
                </Modal>
        )}
    </>
  );
};
