
import React, { useEffect, useState } from 'react';
import { User, Homework, StudyMaterial } from '../types';
import { Card, Badge, Header, Button, Toast } from '../components/UI';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Clock, Calendar, CheckCircle, Upload, TrendingUp, AlertCircle, Music2, FileText, Image, Headphones, Download } from 'lucide-react';
import { MockService } from '../services/mockData';

const data = [
  { name: 'Mon', hours: 2 },
  { name: 'Tue', hours: 3 },
  { name: 'Wed', hours: 1 },
  { name: 'Thu', hours: 4 },
  { name: 'Fri', hours: 2 },
  { name: 'Sat', hours: 5 },
  { name: 'Sun', hours: 0 },
];

export const StudentDashboard = ({ user, onNavigate }: { user: User, onNavigate: (tab: string) => void }) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const homework = MockService.getHomework(user.id);
  // Sort by due date ascending (soonest first)
  const pendingHomework = homework
    .filter(h => h.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  useEffect(() => {
    const fetchedMaterials = MockService.getMaterialsForStudent(user.id);
    setMaterials(fetchedMaterials);

    // Check for new materials to trigger popup
    const newMaterials = fetchedMaterials.filter(m => m.isNew);
    if (newMaterials.length > 0) {
        setToastMessage(`You have ${newMaterials.length} new study material(s) uploaded by your teacher.`);
        setShowToast(true);
        // Mark as seen in mock DB so it doesn't popup next time (simulated)
        MockService.markMaterialsSeen(user.id);
    }
  }, [user.id]);

  const getMaterialIcon = (type: string) => {
    switch(type) {
        case 'PDF': return <FileText size={20} className="text-red-500" />;
        case 'IMAGE': return <Image size={20} className="text-blue-500" />;
        case 'AUDIO': return <Headphones size={20} className="text-purple-500" />;
        default: return <FileText size={20} />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        type="info"
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <Header 
            title={`Welcome back, ${user.name.split(' ')[0]}!`} 
            subtitle="Here's what's happening with your music journey today." 
            userAvatar={user.avatar}
            onProfileClick={() => onNavigate('profile')}
          />
          {user.instrument && (
              <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 mb-8 md:mb-8">
                  <div className="bg-blue-50 p-2 rounded-lg mr-3 text-blue-600">
                      <Music2 size={20} />
                  </div>
                  <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Major</div>
                      <div className="font-bold text-slate-800">{user.instrument}</div>
                  </div>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-none shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={100} />
              </div>
              <div className="flex flex-col relative z-10">
                <span className="text-blue-100 text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle size={16} /> Attendance Rate
                </span>
                <span className="text-4xl font-bold tracking-tight">{user.stats?.attendance}%</span>
                <div className="mt-4">
                   <div className="flex justify-between text-xs text-blue-200 mb-1">
                     <span>Progress</span>
                     <span>Excellent</span>
                   </div>
                   <div className="h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                     <div className="bg-white h-full w-[92%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                   </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white group hover:border-blue-200 transition-colors">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <span className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                     <AlertCircle size={16} /> Pending Tasks
                  </span>
                  <span className="text-4xl font-bold text-slate-800">{user.stats?.tasks}</span>
                </div>
                <div className="mt-4 bg-orange-50 text-orange-600 px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center self-start">
                  2 assignments due soon
                </div>
              </div>
            </Card>
          </div>
          
           {/* Study Materials Section */}
           <Card>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-500" /> Study Materials
                </h3>
            </div>
            {materials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {materials.map(material => (
                        <div key={material.id} className="flex items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md transition-all group">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-3">
                                {getMaterialIcon(material.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-700 text-sm truncate">{material.title}</h4>
                                <p className="text-xs text-slate-500">Uploaded by {material.uploadedBy}</p>
                            </div>
                            <a href={material.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 p-2">
                                <Download size={18} />
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    No study materials assigned yet.
                </div>
            )}
          </Card>

          {/* Weekly Practice Chart */}
          <Card className="min-h-[320px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Practice Activity</h3>
                <p className="text-slate-400 text-sm">Hours spent per day</p>
              </div>
              <select className="bg-slate-50 border-none text-sm text-slate-600 font-medium px-3 py-2 rounded-lg outline-none cursor-pointer">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#94a3b8', dy: 10}} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
                      padding: '12px'
                    }} 
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="#4f46e5" 
                    radius={[6, 6, 6, 6]} 
                    barSize={24}
                    className="hover:opacity-80 transition-opacity cursor-pointer" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-8">
          
          {/* Next Class */}
          <Card className="bg-slate-800 text-white border-none relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20"></div>
             <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-purple-500 rounded-full blur-2xl opacity-20"></div>
             
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Up Next</span>
                <h3 className="text-2xl font-bold mt-1">Advanced {user.instrument || 'Music'}</h3>
                <p className="text-slate-400 text-sm mt-1">Prof. Harmony • Room 302</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Calendar size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm font-medium text-blue-200 bg-white/5 p-3 rounded-lg relative z-10">
              <Clock size={16} className="mr-3" />
              Today, 4:00 PM - 5:00 PM
            </div>
          </Card>

          {/* Homework List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 text-lg">Pending Homework</h3>
              <button className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View All</button>
            </div>
            <div className="space-y-4">
              {pendingHomework.map(hw => (
                <Card key={hw.id} className="flex flex-col p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-50 p-3 rounded-xl text-orange-500 group-hover:bg-orange-100 transition-colors">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{hw.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{hw.subject} • Due {hw.dueDate}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 pl-[52px]">{hw.description}</p>
                  <div className="pl-[52px]">
                    <Button variant="secondary" className="!py-2 text-sm w-auto inline-flex">
                        <Upload size={14} className="mr-2" /> Submit Assignment
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
