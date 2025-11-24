
import React, { useState, useEffect } from 'react';
import { User, UserRole, SystemNotification, AttendanceRecord } from '../types';
import { Card, Header, Button, Badge, Input, Select, TextArea, Modal } from '../components/UI';
import { Users, CheckSquare, PlusCircle, Video, Clock, Search, Bell, TrendingUp, Pencil, Trash2, Music2, Upload, FileText, Image, Calendar, ChevronLeft, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { MockService } from '../services/mockData';

type ViewState = 'dashboard' | 'attendance' | 'homework' | 'upload' | 'students';

export const TeacherDashboard = ({ user, onNavigate }: { user: User, onNavigate: (tab: string) => void }) => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [studentCount, setStudentCount] = useState(0);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  
  // Search for students
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', username: '', password: '', instrument: '' });
  const [feedback, setFeedback] = useState('');

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  // Homework State
  const [hwForm, setHwForm] = useState({ title: '', description: '', dueDate: '', subject: '', studentId: '' });

  // Upload State
  const [uploadForm, setUploadForm] = useState({ title: '', type: 'PDF', url: '', studentId: '' });

  // Message State
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageTarget, setMessageTarget] = useState<User | null>(null);

  const instrumentOptions = [
    { value: 'Drums', label: 'Drums' },
    { value: 'Guitar', label: 'Guitar' },
    { value: 'Piano', label: 'Piano' },
    { value: 'Keyboard', label: 'Keyboard' },
  ];

  const materialTypes = [
    { value: 'PDF', label: 'PDF Document' },
    { value: 'VIDEO', label: 'Video Lesson' },
    { value: 'IMAGE', label: 'Image' },
    { value: 'AUDIO', label: 'Audio File' },
  ];

  useEffect(() => {
    updateDashboardData();
  }, [view]);

  const updateDashboardData = () => {
    const stats = MockService.getStats();
    setStudentCount(stats.studentCount);
    
    // Pass user.id to get targeted notifications
    const notifs = MockService.getNotifications(UserRole.TEACHER, user.id);
    setNotifications(notifs);

    const allStudents = MockService.getUsersByRole(UserRole.STUDENT);
    setStudents(allStudents);
  };

  // --- Handlers ---

  const handleEditClick = (student: User) => {
    setEditingStudent(student);
    setEditForm({ 
        name: student.name, 
        username: student.username, 
        password: '', 
        instrument: student.instrument || '' 
    });
    setFeedback('');
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to remove this student from the directory?')) {
        MockService.deleteUser(id);
        setStudents(prev => prev.filter(s => s.id !== id));
        setStudentCount(prev => prev - 1);
    }
  };

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.username) {
        setFeedback('Please fill in all fields');
        return;
    }
    
    if (editingStudent) {
        const updatedUser = {
            ...editingStudent,
            name: editForm.name,
            username: editForm.username,
            instrument: editForm.instrument,
            ...(editForm.password ? { password: editForm.password } : {})
        };
        
        MockService.updateUser(updatedUser);
        setFeedback('Student updated successfully!');
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...updatedUser } : s));
        
        setTimeout(() => {
            setEditingStudent(null);
            setFeedback('');
        }, 1000);
    }
  };

  const handleMarkAttendance = () => {
    const records: AttendanceRecord[] = Object.keys(attendanceStatus).map(studentId => ({
        date: attendanceDate,
        studentId,
        status: attendanceStatus[studentId]
    }));
    
    MockService.markAttendance(records);
    setFeedback('Attendance marked successfully!');
    setTimeout(() => {
        setFeedback('');
        setView('dashboard');
        setAttendanceStatus({});
    }, 1500);
  };

  const handleAssignHomework = () => {
    if(!hwForm.title || !hwForm.studentId || !hwForm.dueDate) {
        setFeedback('Please fill all required fields, including selecting a student.');
        return;
    }

    MockService.addHomework({
        id: Date.now().toString(),
        title: hwForm.title,
        description: hwForm.description,
        dueDate: hwForm.dueDate,
        subject: hwForm.subject || 'Music',
        assignedBy: user.name,
        status: 'pending',
        studentId: hwForm.studentId
    });

    setFeedback('Homework assigned successfully to student!');
    setTimeout(() => {
        setFeedback('');
        setHwForm({ title: '', description: '', dueDate: '', subject: '', studentId: '' });
        setView('dashboard');
    }, 1500);
  };

  const handleUploadSubmit = () => {
    if (!uploadForm.title || !uploadForm.url || !uploadForm.studentId) {
        setFeedback('Please provide title, URL and select a specific student');
        return;
    }

    MockService.addStudyMaterial({
        id: Date.now().toString(),
        title: uploadForm.title,
        type: uploadForm.type as any,
        url: uploadForm.url,
        studentId: uploadForm.studentId,
        uploadedBy: user.name,
        date: new Date().toISOString().split('T')[0],
        isNew: true
    });

    setFeedback('Material uploaded & student notified!');
    setTimeout(() => {
        setUploadForm({ title: '', type: 'PDF', url: '', studentId: '' });
        setFeedback('');
        setView('dashboard');
    }, 1500);
  };

  // Message Handlers
  const handleMessageClick = (student: User) => {
    setMessageTarget(student);
    setMessageText('');
    setMessageModalOpen(true);
  };

  const handleSendMessage = () => {
    if (!messageText || !messageTarget) return;
    
    MockService.sendNotification({
        id: Date.now().toString(),
        message: `Message from ${user.name}: ${messageText}`,
        time: 'Just now',
        type: 'info',
        targetRole: UserRole.STUDENT,
        targetUserId: messageTarget.id
    });
    
    setMessageModalOpen(false);
    setFeedback(`Message sent to ${messageTarget.name} successfully.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  // --- Sub-Screens ---

  if (editingStudent) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in pt-8">
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent" onClick={() => setEditingStudent(null)}>← Back</Button>
          <Card className="p-8">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Pencil size={28} />
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800">Edit Student</h2>
                      <p className="text-slate-500">{editingStudent.name}</p>
                  </div>
              </div>

              <div className="space-y-6">
                  <Input label="Full Name" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                  <Input label="ID Number" value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} />
                  <Select label="Instrument" value={editForm.instrument} onChange={(e) => setEditForm({...editForm, instrument: e.target.value})} options={instrumentOptions} icon={Music2} />
                  <Input label="New Password (Optional)" type="password" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} placeholder="Leave blank to keep current" />
                  
                  {feedback && (
                      <div className={`text-sm p-4 rounded-xl font-medium flex items-center ${feedback.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {feedback}
                      </div>
                  )}

                  <div className="pt-4 flex gap-4">
                      <Button variant="secondary" onClick={() => setEditingStudent(null)} className="flex-1">Cancel</Button>
                      <Button onClick={handleSaveEdit} className="flex-1">Save Changes</Button>
                  </div>
              </div>
          </Card>
      </div>
    );
  }

  const renderAttendanceView = () => (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <Button variant="ghost" className="mb-4 pl-0" onClick={() => setView('dashboard')}><ChevronLeft size={20} className="mr-1"/> Back to Dashboard</Button>
        <Card className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <CheckSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Mark Attendance</h2>
                        <p className="text-slate-500 text-sm">Record student presence for today.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-600">Date:</span>
                    <input 
                        type="date" 
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="bg-slate-50 border-none rounded-lg px-4 py-2 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                            <th className="pb-3 pl-2 font-semibold">Student</th>
                            <th className="pb-3 font-semibold">Instrument</th>
                            <th className="pb-3 text-center font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 pl-2">
                                    <div className="flex items-center gap-3">
                                        <img src={student.avatar} alt="" className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="font-bold text-slate-700">{student.name}</div>
                                            <div className="text-xs text-slate-400">{student.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <Badge color="blue">{student.instrument || 'General'}</Badge>
                                </td>
                                <td className="py-4">
                                    <div className="flex justify-center gap-2">
                                        <button 
                                            onClick={() => setAttendanceStatus({...attendanceStatus, [student.id]: 'present'})}
                                            className={`p-2 rounded-lg transition-all ${attendanceStatus[student.id] === 'present' ? 'bg-green-100 text-green-600 ring-2 ring-green-500 ring-offset-1' : 'bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-500'}`}
                                            title="Present"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button 
                                            onClick={() => setAttendanceStatus({...attendanceStatus, [student.id]: 'late'})}
                                            className={`p-2 rounded-lg transition-all ${attendanceStatus[student.id] === 'late' ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-500 ring-offset-1' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
                                            title="Late"
                                        >
                                            <Clock size={20} />
                                        </button>
                                        <button 
                                            onClick={() => setAttendanceStatus({...attendanceStatus, [student.id]: 'absent'})}
                                            className={`p-2 rounded-lg transition-all ${attendanceStatus[student.id] === 'absent' ? 'bg-red-100 text-red-600 ring-2 ring-red-500 ring-offset-1' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                                            title="Absent"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {feedback && (
                <div className="mt-6 bg-green-50 text-green-600 p-4 rounded-xl text-sm font-medium text-center">
                    {feedback}
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <Button onClick={handleMarkAttendance} icon={CheckSquare} className="w-full md:w-auto">Save Attendance</Button>
            </div>
        </Card>
    </div>
  );

  const renderHomeworkView = () => (
    <div className="max-w-2xl mx-auto animate-fade-in pt-4">
        <Button variant="ghost" className="mb-4 pl-0" onClick={() => setView('dashboard')}><ChevronLeft size={20} className="mr-1"/> Back to Dashboard</Button>
        <Card className="p-8">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <PlusCircle size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Assign Homework</h2>
                    <p className="text-slate-500">Create a new task for a specific student.</p>
                </div>
            </div>

            <div className="space-y-5">
                 {/* Enhanced Student Selector */}
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Users size={16} className="text-purple-500" /> 
                        Assign to Individual Student
                    </h4>
                    <Select
                        value={hwForm.studentId}
                        onChange={e => setHwForm({...hwForm, studentId: e.target.value})}
                        options={students
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(s => ({ value: s.id, label: `${s.name} (${s.username}) ${s.instrument ? `- ${s.instrument}` : ''}` }))}
                        icon={Users}
                    />
                    <p className="text-xs text-slate-400 mt-2 px-1">
                        Select a specific student to assign this homework to. It will appear on their dashboard pending tasks.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input 
                        label="Title" 
                        placeholder="e.g. Scale Practice" 
                        value={hwForm.title} 
                        onChange={e => setHwForm({...hwForm, title: e.target.value})} 
                    />
                    <Input 
                        label="Subject" 
                        placeholder="e.g. Piano, Theory" 
                        value={hwForm.subject} 
                        onChange={e => setHwForm({...hwForm, subject: e.target.value})} 
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                    <Input 
                        label="Due Date" 
                        type="date"
                        value={hwForm.dueDate} 
                        onChange={e => setHwForm({...hwForm, dueDate: e.target.value})} 
                    />
                </div>

                <TextArea 
                    label="Description / Instructions" 
                    placeholder="Detailed instructions for the student..." 
                    value={hwForm.description} 
                    onChange={e => setHwForm({...hwForm, description: e.target.value})} 
                    rows={4}
                />

                {feedback && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-medium text-center border border-green-100">
                        {feedback}
                    </div>
                )}

                <div className="pt-2">
                    <Button fullWidth onClick={handleAssignHomework}>Assign Task</Button>
                </div>
            </div>
        </Card>
    </div>
  );

  const renderUploadView = () => (
    <div className="max-w-2xl mx-auto animate-fade-in pt-4">
        <Button variant="ghost" className="mb-4 pl-0" onClick={() => setView('dashboard')}><ChevronLeft size={20} className="mr-1"/> Back to Dashboard</Button>
        <Card className="p-8">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                    <Video size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Upload Lesson</h2>
                    <p className="text-slate-500">Share video or PDF materials with a specific student.</p>
                </div>
            </div>

            <div className="space-y-6">
                 {/* Enhanced Student Selector with explicit labeling for single student selection */}
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Users size={16} className="text-blue-500" /> 
                        Assign Material To
                    </h4>
                    <Select
                        value={uploadForm.studentId}
                        onChange={e => setUploadForm({...uploadForm, studentId: e.target.value})}
                        options={students
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(s => ({ value: s.id, label: `${s.name} (${s.username}) ${s.instrument ? `- ${s.instrument}` : ''}` }))}
                        icon={Users}
                    />
                    <p className="text-xs text-slate-400 mt-2 px-1">
                        Select a specific student to assign this material to. It will appear on their dashboard.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <Input 
                        label="Material Title" 
                        value={uploadForm.title} 
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        icon={FileText}
                    />
                    <Select
                        label="File Type"
                        value={uploadForm.type}
                        onChange={(e) => setUploadForm({...uploadForm, type: e.target.value as any})}
                        options={materialTypes}
                        icon={Image}
                    />
                </div>

                <Input 
                    label="File URL" 
                    value={uploadForm.url} 
                    onChange={(e) => setUploadForm({...uploadForm, url: e.target.value})}
                    placeholder="https://youtube.com/... or https://drive..."
                    icon={Upload}
                />

                <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-600 flex gap-3">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p>You can paste a link to a YouTube video, Google Drive PDF, or any other hosted file.</p>
                </div>
                
                {feedback && (
                    <div className={`text-sm p-4 rounded-xl font-medium flex items-center ${feedback.includes('notified') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {feedback}
                    </div>
                )}

                <div className="pt-2">
                    <Button fullWidth onClick={handleUploadSubmit}>Upload & Notify Student</Button>
                </div>
            </div>
        </Card>
    </div>
  );

  const renderStudentListView = () => {
    const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <Button variant="ghost" className="pl-0" onClick={() => setView('dashboard')}><ChevronLeft size={20} className="mr-1"/> Back to Dashboard</Button>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="pl-10 pr-4 py-2.5 bg-white rounded-xl border-none shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-slate-800">All Students</h2>
                 <Badge color="blue">{filtered.length} Enrolled</Badge>
            </div>
            
            {/* Feedback display for actions in this view */}
            {feedback && (
                <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-medium border border-green-100 flex items-center animate-fade-in">
                    <CheckCircle size={16} className="mr-2" />
                    {feedback}
                </div>
            )}

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((student) => (
                        <Card key={student.id} className="flex flex-col gap-4 hover:shadow-lg transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img 
                                        src={student.avatar} 
                                        alt={student.name} 
                                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                    />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 text-lg truncate">{student.name}</h4>
                                    <p className="text-sm text-slate-500 font-mono">{student.username}</p>
                                    <Badge color="purple" className="mt-2 inline-block">{student.instrument || 'N/A'}</Badge>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                                <div className="text-center border-r border-slate-200">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Attendance</div>
                                    <div className="text-lg font-bold text-slate-700">{student.stats?.attendance || 90}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Tasks</div>
                                    <div className="text-lg font-bold text-slate-700">{student.stats?.tasks || 0}</div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                 <Button 
                                    variant="ghost" 
                                    className="flex-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100" 
                                    onClick={() => { setHwForm({...hwForm, studentId: student.id}); setView('homework'); }}
                                >
                                    Assign
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="!p-2 text-indigo-500 hover:bg-indigo-50"
                                    onClick={() => handleMessageClick(student)}
                                    title="Send Message"
                                >
                                    <MessageSquare size={16} />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="!p-2 text-slate-500 hover:bg-slate-100"
                                    onClick={() => handleEditClick(student)}
                                >
                                    <Pencil size={16} />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="!p-2 text-red-500 hover:bg-red-50"
                                    onClick={() => handleDeleteClick(student.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Search size={32} />
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg">No students found</h3>
                    <p className="text-slate-400">Try adjusting your search criteria.</p>
                </div>
            )}
        </div>
    );
  };

  // --- Main Render ---

  if (view === 'attendance') return renderAttendanceView();
  if (view === 'homework') return renderHomeworkView();
  if (view === 'upload') return renderUploadView();
  if (view === 'students') {
      return (
        <>
            {renderStudentListView()}
            {/* Message Modal within student list context */}
            <Modal isOpen={messageModalOpen} onClose={() => setMessageModalOpen(false)} title={`Message ${messageTarget?.name}`}>
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700">
                        <p>Sending a direct message to <strong>{messageTarget?.name}</strong>. They will see this in their notification center.</p>
                    </div>
                    <TextArea 
                        label="Your Message" 
                        value={messageText} 
                        onChange={(e) => setMessageText(e.target.value)} 
                        placeholder="e.g. Please remember to bring your sheet music tomorrow."
                        rows={4}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={() => setMessageModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendMessage} icon={MessageSquare}>Send Message</Button>
                    </div>
                </div>
            </Modal>
        </>
      );
  }

  // Dashboard View
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Header 
            title="Teacher Dashboard" 
            subtitle="Manage your classes, students and assignments."
            userAvatar={user.avatar}
            onProfileClick={() => onNavigate('profile')}
        />
      </div>

      {/* Stats & Notifications Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Students Card */}
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-blue-100">
                    <Users size={20} />
                    <span className="font-medium text-sm uppercase tracking-wide">Total Students</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">{studentCount}</h2>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 inline-flex items-center gap-2 text-xs font-medium">
                    <TrendingUp size={14} className="text-green-300" />
                    <span>Enrolled in Academy</span>
                </div>
              </div>
          </Card>

          {/* Notifications Panel */}
          <Card className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Bell size={18} className="text-orange-500" />
                      Notifications
                  </h3>
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">{notifications.length} New</span>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[120px] pr-2">
                  {notifications.length > 0 ? notifications.map((notif) => (
                      <div key={notif.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                          <div>
                              <p className="text-sm font-medium text-slate-700 leading-tight">{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                          </div>
                      </div>
                  )) : (
                      <div className="text-center text-slate-400 py-4 text-sm">No new notifications</div>
                  )}
              </div>
          </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
            { icon: CheckSquare, label: 'Mark Attendance', color: 'text-blue-600', bg: 'bg-blue-50', action: () => setView('attendance') },
            { icon: PlusCircle, label: 'Assign Homework', color: 'text-purple-600', bg: 'bg-purple-50', action: () => setView('homework') },
            { icon: Video, label: 'Upload Lesson', color: 'text-green-600', bg: 'bg-green-50', action: () => setView('upload') },
            { icon: Users, label: 'Student List', color: 'text-orange-600', bg: 'bg-orange-50', action: () => setView('students') }
        ].map((item, idx) => (
            <Card 
                key={idx} 
                onClick={item.action}
                className="flex flex-col items-center justify-center py-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-slate-100 group"
            >
                <div className={`${item.bg} p-4 rounded-2xl ${item.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon size={28} />
                </div>
                <span className="font-bold text-slate-700">{item.label}</span>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-xl">Today's Classes</h3>
                <Button variant="ghost" className="text-sm">View Calendar</Button>
            </div>
            <div className="space-y-4">
            {[
                { time: '10:00 AM', class: 'Grade 4 - Theory', students: 12, room: 'Room 101' },
                { time: '02:00 PM', class: 'Grade 5 - Piano Practical', students: 8, room: 'Hall A' }
            ].map((item, i) => (
                <Card key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 group hover:border-l-4 hover:border-l-blue-500 transition-all">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center bg-blue-50 w-16 h-16 rounded-2xl flex-shrink-0">
                        <Clock size={20} className="text-blue-500 mb-1" />
                        <span className="text-xs font-bold text-blue-700">{item.time.split(' ')[0]}</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{item.class}</h4>
                        <div className="flex items-center text-sm text-slate-500 mt-1 gap-3">
                            <span className="flex items-center gap-1"><Users size={14}/> {item.students} Students</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{item.room}</span>
                        </div>
                    </div>
                </div>
                <Button variant="secondary" className="sm:w-auto w-full text-sm">Start Class</Button>
                </Card>
            ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-xl">Recent Homework</h3>
                <Button variant="ghost" className="text-sm">All Submissions</Button>
            </div>
            <Card className="p-0 overflow-hidden">
                <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="flex-1">Student</div>
                    <div className="flex-1">Assignment</div>
                    <div className="w-24 text-right">Status</div>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { name: 'Alice Melody', task: 'C Major Scale Video', status: 'submitted', time: '2h ago' },
                        { name: 'John Doe', task: 'Theory Worksheet 3', status: 'late', time: '1d ago' },
                        { name: 'Sarah Keys', task: 'Sight Reading Ex', status: 'submitted', time: '3h ago' },
                    ].map((sub, i) => (
                        <div key={i} className="p-4 flex items-center hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="flex-1">
                                <div className="font-bold text-slate-700 text-sm">{sub.name}</div>
                                <div className="text-xs text-slate-400">{sub.time}</div>
                            </div>
                            <div className="flex-1 text-sm text-slate-600">{sub.task}</div>
                            <div className="w-24 text-right">
                                <Badge color={sub.status === 'submitted' ? 'green' : 'red'}>
                                    {sub.status === 'submitted' ? 'On Time' : 'Late'}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
          </div>
      </div>
    </div>
  );
};
