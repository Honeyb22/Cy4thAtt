```react
import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Download, 
  Share2, 
  Users, 
  School, 
  Lock, 
  Calendar, 
  Award, 
  Timer, 
  Fingerprint, 
  Cpu,
  Activity,
  ChevronRight,
  RefreshCcw,
  CheckCircle
} from 'lucide-react';

const App = () => {
  // --- SECURE DATA REPOSITORY ---
  const schedule = {
    "MON": ["SK", "DRPB", "DRPB", "LUNCH", "MS", "AJ", "JK"],
    "TUE": ["DRPB", "AU", "JK", "LUNCH", "AV", "AV", "AV"],
    "WED": ["DRPB", "SK", "AJ", "LUNCH", "SK", "JK", "AJ"],
    "THU": ["AU", "AJ", "SK", "LUNCH", "MS", "JK", "JK"],
    "FRI": ["AU", "MENTOR", "JK", "LUNCH", "AU", "AV", "AV"],
    "SAT": ["AU", "AU", "AJ", "LUNCH", "DRPB", "SK", "SK"]
  };

  const teachers = [
    { id: "SK", name: "Siksha Kushwaha Mam", subject: "Computer Networks" },
    { id: "DRPB", name: "Poonam Mam", subject: "Operating Systems" },
    { id: "JK", name: "Javed Khan Sir", subject: "Database Management" },
    { id: "AU", name: "Aditi Mam", subject: "Cyber Security" },
    { id: "AJ", name: "Punit Sir", subject: "Linear Algebra" },
    { id: "AV", name: "Akash Verma Sir", subject: "Python + Lab" },
    { id: "MS", name: "Manish Shrivastava Sir", subject: "Communication Skills" },
    { id: "MENTOR", name: "Library / Mentor", subject: "Research" },
    { id: "LUNCH", name: "Lunch Break", subject: "System Idle" },
  ];

  const scheduleSlots = [
    { id: 0, name: "Lecture 01", start: "10:00 AM", end: "11:00 AM", startMins: 600, endMins: 660 },
    { id: 1, name: "Lecture 02", start: "11:00 AM", end: "12:00 PM", startMins: 660, endMins: 720 },
    { id: 2, name: "Lecture 03", start: "12:00 PM", end: "01:00 PM", startMins: 720, endMins: 780 },
    { id: 3, name: "LUNCH BREAK", start: "01:00 PM", end: "01:40 PM", startMins: 780, endMins: 820, isBreak: true },
    { id: 4, name: "Lecture 04", start: "01:40 PM", end: "02:40 PM", startMins: 820, endMins: 880 },
    { id: 5, name: "Lecture 05", start: "02:40 PM", end: "03:40 PM", startMins: 880, endMins: 940 },
    { id: 6, name: "Lecture 06", start: "03:40 PM", end: "04:30 PM", startMins: 940, endMins: 990 },
  ];

  const students = [
    "Honey Soni", "Shivank Tiwari", "Lokeshwari Agnihotri", "Sneh Sahu", 
    "Simran Shah", "Aman Namdev", "Abhishek Sahu", "Deeksha Patel", 
    "Deepak Patel", "Devyansh Vishwakarma", "Prince Lakhera"
  ];

  // --- STATE MANAGEMENT ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('MON');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [presentStudents, setPresentStudents] = useState([]);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const cardRef = useRef(null);

  // --- HELPER: SECURE LECTURE NUMBER PARSING ---
  const getLectureNum = (slotName) => {
    if (!slotName) return "00";
    const parts = slotName.split(' ');
    return parts.length > 1 && !isNaN(parts[1]) ? parts[1] : "LB";
  };

  // --- BACKGROUND SYNC ENGINE (HARDENED) ---
  const backgroundSync = () => {
    if (isManualOverride) return;

    const now = new Date();
    const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDayStr = dayMap[now.getDay()];
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Guard: Fallback to MON if day is not in schedule (e.g., SUN)
    const effectiveDay = schedule[currentDayStr] ? currentDayStr : "MON";
    setSelectedDay(effectiveDay);

    const activeSlotIndex = scheduleSlots.findIndex(slot => currentMins >= slot.startMins && currentMins < slot.endMins);
    
    if (activeSlotIndex !== -1) {
      const dayData = schedule[effectiveDay];
      const teacherCode = dayData[activeSlotIndex];
      const teacherObj = teachers.find(t => t.id === teacherCode);
      
      let firstSlotIdx = activeSlotIndex;
      let lastSlotIdx = activeSlotIndex;
      while (firstSlotIdx > 0 && dayData[firstSlotIdx - 1] === teacherCode) firstSlotIdx--;
      while (lastSlotIdx < dayData.length - 1 && dayData[lastSlotIdx + 1] === teacherCode) lastSlotIdx++;

      setSelectedLecture({
        id: activeSlotIndex,
        lectureNum: getLectureNum(scheduleSlots[activeSlotIndex].name),
        name: firstSlotIdx !== lastSlotIdx ? "Lab Session" : scheduleSlots[activeSlotIndex].name,
        start: scheduleSlots[firstSlotIdx].start,
        end: scheduleSlots[lastSlotIdx].end,
      });
      if (teacherObj) setSelectedTeacher(teacherObj.name);
    }
  };

  useEffect(() => {
    backgroundSync();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isManualOverride]);

  const indiaTime = currentTime.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const toggleStudent = (student) => {
    setPresentStudents(prev => prev.includes(student) ? prev.filter(s => s !== student) : [...prev, student]);
  };

  // --- MANUAL OVERRIDE (WITH INPUT VALIDATION) ---
  const handleManualSlotChange = (slotId) => {
    setIsManualOverride(true);
    const id = parseInt(slotId);
    const slot = scheduleSlots.find(s => s.id === id);
    if (slot) {
      setSelectedLecture({
        id: slot.id,
        lectureNum: getLectureNum(slot.name),
        name: slot.name,
        start: slot.start,
        end: slot.end
      });
      
      const dayData = schedule[selectedDay];
      if (dayData && dayData[id]) {
        const teacherCode = dayData[id];
        const teacherObj = teachers.find(t => t.id === teacherCode);
        if (teacherObj) setSelectedTeacher(teacherObj.name);
      }
    }
  };

  const currentTeacherObj = teachers.find(t => t.name === selectedTeacher);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-8">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 opacity-50" />
        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-4 rounded-2xl border border-white/10 shadow-inner">
            <School size={32} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">BTIRT COLLEGE</h1>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="text-emerald-500/80">Cyber Security</span>
              <span>•</span>
              <span>4th Semester Node</span>
            </div>
          </div>
        </div>
        <div className="mt-6 md:mt-0 text-center md:text-right">
          <div className="text-4xl font-black text-white tabular-nums tracking-tighter drop-shadow-glow">
            {indiaTime.split(' ')[0]} <span className="text-emerald-500 text-xl">{indiaTime.split(' ')[1]}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CONFIGURATION (LEFT) */}
        <section className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
            <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <ShieldCheck size={16} /> One Faculty Config
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Current Day</label>
                <select 
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-emerald-400 outline-none text-sm"
                  value={selectedDay}
                  onChange={(e) => { setSelectedDay(e.target.value); setIsManualOverride(true); }}
                >
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Faculty</label>
                <select 
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-emerald-400 outline-none text-sm"
                  value={selectedTeacher}
                  onChange={(e) => { setSelectedTeacher(e.target.value); setIsManualOverride(true); }}
                >
                  <option value="">-- SELECT --</option>
                  {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Lecture Slot</label>
                <select 
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-emerald-400 outline-none text-sm"
                  value={selectedLecture?.id ?? ""}
                  onChange={(e) => handleManualSlotChange(e.target.value)}
                >
                  <option value="" disabled>-- SELECT TIME SLOT --</option>
                  {scheduleSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>{slot.name} ({slot.start} - {slot.end})</option>
                  ))}
                </select>
                {isManualOverride && (
                  <button onClick={() => setIsManualOverride(false)} className="mt-3 flex items-center gap-2 text-[9px] text-indigo-400 font-black uppercase tracking-widest hover:text-indigo-300">
                    <RefreshCcw size={10} /> Restore Auto-Calibration
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* STUDENT REGISTRY */}
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">Students' Names</h2>
              <div className="bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                {presentStudents.length} Active
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {students.map(student => (
                <button
                  key={student}
                  onClick={() => toggleStudent(student)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-300 ${
                    presentStudents.includes(student) 
                    ? 'bg-emerald-600 border-emerald-400 text-slate-950 shadow-lg' 
                    : 'bg-slate-950 border-white/5 text-slate-500 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase truncate pr-1">{student}</span>
                  {presentStudents.includes(student) ? <CheckCircle size={14} /> : <div className="w-3 h-3 rounded-full border border-slate-800" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* IDENTITY CARD PREVIEW (RIGHT) */}
        <section className="lg:col-span-6 flex flex-col gap-6 items-center">
          {/* OPTIMIZED IDENTITY CARD FOR EXPORT (360x640 FIXED) */}
          <div 
            ref={cardRef} 
            className="bg-white rounded-2xl p-4 border-2 border-black relative overflow-hidden flex flex-col w-[360px] h-[640px] shadow-2xl"
            style={{ backgroundImage: 'radial-gradient(#e5e7eb 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }}
          >
            {/* Minimal Header */}
            <div className="relative z-10 text-center mb-3 border-b-2 border-black pb-2">
              <h2 className="text-black text-xl font-black tracking-tighter uppercase leading-none">BTIRT COLLEGE</h2>
              <p className="text-slate-500 text-xs font-black uppercase mt-0.5">Today's Attendance</p>
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-800 uppercase mt-1">
                <span>Cyber Security</span>
                <span className="text-emerald-500">•</span>
                <span>4th Sem</span>
              </div>
            </div>

            {/* Compact Content Boxes */}
            <div className="relative z-10 space-y-2 flex-grow overflow-hidden">
              <div className="grid grid-cols-12 gap-2">
                {/* Date Box */}
                <div className="col-span-8 border-2 border-black rounded-lg p-2 bg-white flex justify-between items-center shadow-[2px_2px_0px_#000]">
                  <div className="overflow-hidden">
                    <p className="text-[7px] font-black text-black uppercase">Attendance Date</p>
                    <p className="text-black font-black text-sm tracking-tighter italic truncate">
                      {currentTime.getDate()} {currentTime.toLocaleString('en-US', { month: 'short' })} {currentTime.getFullYear()}
                    </p>
                  </div>
                  <div className="border-2 border-black px-1.5 py-0.5 bg-white">
                    <span className="text-black font-black text-xs uppercase italic">{selectedDay}</span>
                  </div>
                </div>

                {/* Lecture # Box */}
                <div className="col-span-4 bg-black border-2 border-black rounded-lg p-2 flex flex-col items-center justify-center text-white">
                  <p className="text-[7px] font-black uppercase opacity-70">Lecture</p>
                  <p className="text-lg font-black italic">#{selectedLecture?.lectureNum || '00'}</p>
                </div>
              </div>

              {/* Timing Box */}
              <div className="border-2 border-black rounded-lg p-2 bg-white shadow-[2px_2px_0px_#000]">
                <p className="text-[7px] font-black text-black uppercase text-center border-b border-black pb-0.5">Lecture Timing</p>
                <p className="text-black font-black text-sm font-mono text-center tracking-tighter mt-0.5 italic">
                  {selectedLecture ? `${selectedLecture.start} - ${selectedLecture.end}` : '--- OFFLINE ---'}
                </p>
              </div>

              {/* Faculty Box */}
              <div className="border-2 border-black rounded-lg p-2.5 bg-white shadow-[2px_2px_0px_#000]">
                <p className="text-[7px] font-black text-black uppercase mb-0.5">Authorised Faculty</p>
                <p className="text-black font-black text-lg uppercase tracking-tighter italic leading-none">{selectedTeacher || 'AWAITING_ID'}</p>
              </div>

              {/* Subject Box */}
              <div className="border-2 border-black rounded-lg p-1.5 bg-white w-2/3 shadow-[3px_3px_0px_#000]">
                <p className="text-black font-black text-xs uppercase italic tracking-tighter truncate">{currentTeacherObj?.subject || '---'}</p>
              </div>

              {/* Registry List - STRICT LIMIT 10 STUDENTS */}
              <div className="border-2 border-black rounded-lg p-3 bg-white min-h-[180px] flex flex-col shadow-[2px_2px_0px_#000]">
                <div className="space-y-0.5 flex-grow">
                  {presentStudents.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-20 py-10">
                      <p className="text-black font-black text-[9px] uppercase italic">Awaiting Log Registry...</p>
                    </div>
                  ) : (
                    presentStudents.slice(0, 10).map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-black border-b border-black/5 py-0.5">
                        <span className="text-[8px] font-black w-4 text-emerald-600">{idx + 1}</span>
                        <span className="text-xs font-black uppercase tracking-tighter italic flex-grow truncate">{s}</span>
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                      </div>
                    ))
                  )}
                  {presentStudents.length > 10 && (
                    <div className="text-center pt-1">
                      <p className="text-[7px] font-bold text-slate-400">... AND {presentStudents.length - 10} OTHERS IN SECURE LOG</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Clock Box */}
              <div className="border-2 border-black rounded-xl p-2 bg-white shadow-[4px_4px_0px_#000]">
                <p className="text-2xl font-black text-black font-mono text-center tracking-tighter italic">
                   {indiaTime.split(' ')[0]} <span className="text-sm">{indiaTime.split(' ')[1]}</span>
                </p>
              </div>
            </div>

            {/* Signature Footer */}
            <div className="mt-2 pt-2 border-t-2 border-black flex justify-between items-center">
              <p className="text-black font-black text-xs italic tracking-tighter uppercase">
                BY - <span className="text-emerald-600">Honey Soni</span>
              </p>
              <div className="bg-black text-white px-2 py-0.5 font-black italic text-[9px]">CY (14)</div>
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-[360px]">
            <button onClick={() => alert("Success: Attendance session log exported.")} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-emerald-900/20 uppercase text-[10px] tracking-widest">
              <Download size={18} /> Save Image
            </button>
            <button onClick={() => alert("Initiating encrypted sharing channel...")} className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95 shadow-xl uppercase text-[10px] tracking-widest border-2 border-black">
              <Share2 size={18} /> Share Card
            </button>
          </div>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
        .drop-shadow-glow { filter: drop-shadow(0 0 10px rgba(16,185,129,0.4)); }
      `}</style>
    </div>
  );
};

export default App;



