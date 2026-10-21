import React, { useState } from 'react';
import { UserRole } from '../types';
import { soundEffects } from '../utils/audioSynthesizer';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  GraduationCap,
  BookOpen,
  Award,
  Layers,
  Volume2,
  CheckCircle2,
  Crown,
  KeyRound,
  FileCheck2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginScreenProps {
  onLogin: (code: string, name: string, role: UserRole, avatar: string, grade: number) => void;
  currentCode?: string;
  isModal?: boolean;
  onCloseModal?: () => void;
}

const STUDENT_AVATARS = [
  { icon: '🦁', label: 'Sư tử dũng cảm' },
  { icon: '🐼', label: 'Gấu trúc chăm chỉ' },
  { icon: '🚀', label: 'Tên lửa bứt phá' },
  { icon: '🐱', label: 'Mèo con thông minh' },
  { icon: '🦄', label: 'Kỳ lân sáng tạo' },
  { icon: '⭐', label: 'Ngôi sao tự tin' },
  { icon: '🦖', label: 'Khủng long kiên cường' },
  { icon: '🐬', label: 'Cá heo thân thiện' },
];

const TEACHER_PRESETS = [
  {
    code: 'GV-TOAN',
    name: 'Giáo viên Toán học (CLIL)',
    subject: 'Môn Toán học',
    avatar: '🔢',
    desc: 'Luyện nói tiếng Anh dạy Toán A1, A2, B1',
  },
  {
    code: 'GV-KHTN',
    name: 'Giáo viên Khoa học & STEM',
    subject: 'Môn Khoa học & STEM',
    avatar: '🔬',
    desc: 'Luyện nói tiếng Anh thí nghiệm & mô hình STEM',
  },
  {
    code: 'GV-ICT',
    name: 'Giáo viên Tin học & Công nghệ',
    subject: 'Môn Tin học',
    avatar: '💻',
    desc: 'Luyện nói tiếng Anh thao tác phần mềm & máy tính',
  },
  {
    code: 'GV-MYTHUAT',
    name: 'Giáo viên Mỹ thuật',
    subject: 'Môn Mỹ thuật',
    avatar: '🎨',
    desc: 'Luyện nói tiếng Anh màu sắc, bố cục & tác phẩm',
  },
  {
    code: 'GV-AMNHAC',
    name: 'Giáo viên Âm nhạc',
    subject: 'Môn Âm nhạc',
    avatar: '🎵',
    desc: 'Luyện nói tiếng Anh giai điệu & nhạc cụ',
  },
  {
    code: 'GV-GDTC',
    name: 'Giáo viên Thể chất',
    subject: 'Giáo dục Thể chất',
    avatar: '⚽',
    desc: 'Luyện nói tiếng Anh khẩu lệnh thể thao & vận động',
  },
  {
    code: 'GV-LS',
    name: 'Giáo viên Lịch sử - Địa lý',
    subject: 'Lịch sử & Địa lý',
    avatar: '🌏',
    desc: 'Luyện nói tiếng Anh di sản & bản đồ thế giới',
  },
  {
    code: 'GV-TIENGANH',
    name: 'Giáo viên Tiếng Anh',
    subject: 'Môn Tiếng Anh',
    avatar: '🗣️',
    desc: 'Luyện nói giao tiếp phản xạ chuyên sâu SGK',
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  currentCode = 'H901',
  isModal = false,
  onCloseModal,
}) => {
  // Determine initial role
  const upperCode = currentCode.trim().toUpperCase();
  const isInitialAdmin = upperCode === 'TRACY' || upperCode === 'GV01' || upperCode === 'ADMIN' || upperCode.startsWith('QT');
  const isInitialTeacher = !isInitialAdmin && upperCode.startsWith('GV');

  const [activeTab, setActiveTab] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>(
    isInitialAdmin ? 'ADMIN' : isInitialTeacher ? 'TEACHER' : 'STUDENT'
  );

  // Form states - ONLY identifier code
  const [studentCode, setStudentCode] = useState(
    isInitialTeacher || isInitialAdmin ? 'HS01' : upperCode || 'HS01'
  );
  const [teacherCode, setTeacherCode] = useState(
    isInitialTeacher ? upperCode : 'GV-TOAN'
  );
  // ADMIN: Secret unique username 'tracy', kept empty by default so it's hidden and must be typed!
  const [adminCode, setAdminCode] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const [studentGrade, setStudentGrade] = useState<number>(1);
  const [studentAvatar, setStudentAvatar] = useState<string>('🦁');

  // Teacher info resolver for subject teachers
  const getTeacherInfo = (code: string) => {
    const upper = code.trim().toUpperCase();
    const matched = TEACHER_PRESETS.find((t) => t.code === upper);
    if (matched) {
      return {
        name: matched.name,
        title: `${matched.subject} • Trường Tiểu học Ái Mộ`,
        roleBadge: 'Giáo viên Bộ môn (CLIL / EMI)',
        avatar: matched.avatar,
      };
    }
    return {
      name: `Giáo viên ${upper}`,
      title: 'Giáo viên Bộ môn • Trường Tiểu học Ái Mộ',
      roleBadge: 'Giáo viên Bộ môn (CLIL / EMI)',
      avatar: '👩‍🏫',
    };
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (activeTab === 'STUDENT') {
      soundEffects.playVictoryFanfare();
      confetti({
        particleCount: 85,
        spread: 90,
        origin: { y: 0.6 },
      });
      const code = studentCode.trim().toUpperCase() || 'HS01';
      // User is strictly identified as "Học sinh [Code]", NO kid personal names!
      const displayName = `Học sinh ${code}`;
      onLogin(code, displayName, 'STUDENT', studentAvatar, studentGrade);
    } else if (activeTab === 'TEACHER') {
      soundEffects.playVictoryFanfare();
      confetti({
        particleCount: 85,
        spread: 90,
        origin: { y: 0.6 },
      });
      const code = teacherCode.trim().toUpperCase() || 'GV-TOAN';
      const teacherInfo = getTeacherInfo(code);
      onLogin(code, teacherInfo.name, 'TEACHER', teacherInfo.avatar, 1);
    } else {
      // ADMIN: Chỉ chấp nhận tên đăng nhập bí mật duy nhất là 'tracy'
      const entered = adminCode.trim().toLowerCase();
      if (entered !== 'tracy') {
        soundEffects.playBuzzer();
        setAdminError('Tên đăng nhập quản trị không chính xác! Vui lòng kiểm tra lại.');
        return;
      }
      setAdminError(null);
      soundEffects.playVictoryFanfare();
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
      });
      onLogin('tracy', 'Cô Vũ Thị Thanh Tâm', 'ADMIN', '👩‍🏫', 1);
    }
  };

  const content = (
    <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border-4 border-indigo-100 overflow-hidden text-center transform transition-all my-auto">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-br from-indigo-800 via-blue-700 to-indigo-900 p-6 sm:p-7 text-white relative">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-amber-950 text-3xl flex items-center justify-center shadow-xl border-4 border-white/40 animate-float flex-shrink-0">
            🎙️
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-sm">
              Trường Tiểu học Ái Mộ • GDPT 2018
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase mt-0.5 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-50 to-amber-100">
              SPEAKING STUDIO
            </h1>
            <p className="text-xs sm:text-sm font-bold text-amber-200">
              Cô Vũ Thị Thanh Tâm • Khung năng lực Pre-A1 đến A2 & CLIL A1-B1
            </p>
          </div>
        </div>

        {/* Slogan Pill */}
        <div className="mt-2 inline-block px-4 py-1 rounded-full bg-white/15 text-xs sm:text-sm font-black border border-white/20 text-white shadow-inner">
          ✨ Speak Up, Level Up! – Mạnh dạn nói – Tiến bộ mỗi ngày!
        </div>

        {isModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/20 text-sm font-bold transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Form Body */}
      <div className="p-5 sm:p-7 text-left space-y-6">
        {/* 3 Role Segmented Tabs (Học Sinh vs Giáo Viên vs Cô Vũ Thị Thanh Tâm Quản Trị) */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            Chọn cổng đăng nhập hệ thống:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            {/* Tab 1: Học sinh */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setActiveTab('STUDENT');
              }}
              className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'STUDENT'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <span className="text-xl">👦</span>
              <div className="text-left leading-tight">
                <span className="block font-black text-sm sm:text-base">Học sinh</span>
                <span className={`text-[10px] ${activeTab === 'STUDENT' ? 'text-blue-100 font-bold' : 'text-slate-500'}`}>
                  Sân Khấu Luyện Nói Học Sinh
                </span>
              </div>
            </button>

            {/* Tab 2: Giáo viên */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setActiveTab('TEACHER');
              }}
              className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'TEACHER'
                  ? 'bg-amber-500 text-amber-950 shadow-md ring-2 ring-amber-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <span className="text-xl">👩‍🏫</span>
              <div className="text-left leading-tight">
                <span className="block font-black text-sm sm:text-base">Giáo viên</span>
                <span className={`text-[10px] ${activeTab === 'TEACHER' ? 'text-amber-950 font-bold' : 'text-slate-500'}`}>
                  AI Studio GV Bộ Môn
                </span>
              </div>
            </button>

            {/* Tab 3: Quản trị */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setActiveTab('ADMIN');
              }}
              className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'ADMIN'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Crown className="w-5 h-5 text-amber-300 animate-bounce" />
              <div className="text-left leading-tight">
                <span className="block font-black text-sm sm:text-base">Quản trị</span>
                <span className={`text-[10px] ${activeTab === 'ADMIN' ? 'text-rose-100 font-bold' : 'text-slate-500'}`}>
                  Studio Quản Trị
                </span>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ================= TAB 1: HỌC SINH (HS) ================= */}
          {activeTab === 'STUDENT' && (
            <div className="space-y-4">
              {/* Input: MÃ ĐỊNH DANH HỌC SINH */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Nhập Mã Định Danh Học Sinh (Mã Số):</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">
                    Chỉ cần mã số định danh, bảo mật thông tin
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                    placeholder="VD: HS01, HS02, H901, H902..."
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-black text-slate-800 text-xl tracking-wide uppercase transition-all shadow-inner"
                    autoFocus
                    required
                  />
                  <span className="absolute right-3 top-3 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-black text-xs border border-blue-200">
                    MÃ HS
                  </span>
                </div>
              </div>

              {/* Status Preview Card: Shows "Học sinh [Mã HS]" */}
              <div className="p-3.5 rounded-2xl border-2 border-blue-200 bg-blue-50/70 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                  {studentAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900 truncate">
                      Học sinh Mã: {studentCode.trim().toUpperCase() || 'HS01'}
                    </p>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                      HS • Khối Lớp {studentGrade}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    Trường Tiểu học Ái Mộ • Sẵn sàng luyện nói Tiếng Anh chuẩn GDPT 2018
                  </p>
                </div>
                <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              </div>

              {/* Grade Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Chọn khối lớp của em để luyện tập theo SGK Global Success:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        soundEffects.playPop();
                        setStudentGrade(g);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all text-center ${
                        studentGrade === g
                          ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Lớp {g}</span>
                      <span className="block text-[9px] font-bold opacity-80">
                        {g <= 2 ? 'Pre-A1' : 'A1'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mascot Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Chọn linh vật đồng hành may mắn của con:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {STUDENT_AVATARS.map((av) => (
                    <button
                      key={av.icon}
                      type="button"
                      onClick={() => {
                        soundEffects.playPop();
                        setStudentAvatar(av.icon);
                      }}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                        studentAvatar === av.icon
                          ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300 scale-105'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title={av.label}
                    >
                      <span className="text-2xl">{av.icon}</span>
                      <span className="text-[9px] font-bold mt-1 truncate max-w-full">
                        {av.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: GIÁO VIÊN BỘ MÔN (GV) ================= */}
          {activeTab === 'TEACHER' && (
            <div className="space-y-4">
              {/* Input: MÃ ĐỊNH DANH GIÁO VIÊN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Nhập Mã Định Danh Giáo Viên Bộ Môn:</span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-700">
                    Quyền Giáo viên Bộ môn (CLIL / EMI)
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
                    placeholder="VD: GV-TOAN, GV-KHTN, GV-ICT, GV-MYTHUAT..."
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none font-black text-slate-800 text-xl tracking-wide uppercase transition-all shadow-inner"
                    autoFocus
                    required
                  />
                  <span className="absolute right-3 top-3 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-xs border border-amber-300">
                    MÃ GV
                  </span>
                </div>
              </div>

              {/* Teacher Info Card Preview */}
              {(() => {
                const info = getTeacherInfo(teacherCode);
                return (
                  <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/80 flex items-center gap-3">
                    <div className="w-13 h-13 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                      {info.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-black text-slate-900">{info.name}</p>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          {info.roleBadge}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">{info.title}</p>
                      <p className="text-[11px] text-amber-800 font-medium mt-1">
                        🎯 Vào thẳng AI Studio GV Bộ Môn: 77+ Khẩu lệnh lớp học thực chiến & Kiến thức mệnh lệnh sư phạm
                      </p>
                    </div>
                    <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= TAB 3: CÔ VŨ THỊ THANH TÂM (QUẢN TRỊ) ================= */}
          {activeTab === 'ADMIN' && (
            <div className="space-y-4">
              {/* Input: TÊN ĐĂNG NHẬP QUẢN TRỊ VIÊN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-rose-600" />
                    <span>Tên Đăng Nhập Quản Trị Viên:</span>
                  </label>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    Bảo mật • Chỉ Quản trị viên truy cập
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminCode}
                    onChange={(e) => {
                      setAdminCode(e.target.value);
                      if (adminError) setAdminError(null);
                    }}
                    placeholder="Nhập tên đăng nhập quản trị..."
                    className="w-full px-4 py-3.5 pr-20 rounded-2xl border-2 border-rose-300 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 outline-none font-black text-rose-950 text-base tracking-wide transition-all shadow-inner bg-rose-50/30"
                    autoFocus
                    required
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3.5 px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1 transition-colors"
                    title={showAdminPassword ? 'Ẩn ký tự' : 'Hiện ký tự'}
                  >
                    {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAdminPassword ? 'Ẩn' : 'Hiện'}</span>
                  </button>
                </div>

                {adminError && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-rose-100/90 border-2 border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}
              </div>

              {/* Special Admin Profile Card */}
              <div className="p-4 rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 relative overflow-hidden shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-white flex-shrink-0 relative">
                    👩‍🏫
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-950 text-xs rounded-full p-0.5 shadow-sm">
                      👑
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-black text-slate-900">Cô Vũ Thị Thanh Tâm</p>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-sm flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-300" />
                        Tác Giả & Quản Trị Viên Hệ Thống
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      Giáo viên Tiếng Anh • Trường Tiểu học Ái Mộ • TP. Hà Nội
                    </p>
                  </div>
                </div>

                {/* Admin Privileges Box */}
                <div className="mt-3.5 pt-3 border-t border-rose-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">🎙️</span>
                    <span><strong>Studio Soạn Bài Độc Quyền:</strong> Thu âm trực tiếp giọng mẫu của cô giáo bằng micro lưu vào đề.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">🤖</span>
                    <span><strong>Trợ lý Google Gemini AI:</strong> Tạo bài học và câu hỏi chuẩn GDPT 2018 chỉ với 1 click.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">📁</span>
                    <span><strong>Quản trị kho đề:</strong> Toàn quyền chỉnh sửa, thêm, xóa và nhập/xuất đề JSON đồng bộ.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">🌟</span>
                    <span><strong>Toàn quyền điều hành:</strong> Truy cập được cả 3 chế độ: Studio Quản trị, AI Studio GV Bộ môn và Sân khấu HS.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Highlights on Login Portal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200">
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-2 text-left">
              <span className="text-lg">👦</span>
              <div>
                <p className="text-xs font-black text-blue-900">1. Sân Khấu Luyện Nói Học Sinh</p>
                <p className="text-[11px] text-blue-700">
                  Học sinh luyện nói SGK Global Success Lớp 1 - 5 theo 3 cấp độ với chấm điểm AI tức thì.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2 text-left">
              <span className="text-lg">👩‍🏫</span>
              <div>
                <p className="text-xs font-black text-amber-900">2. AI Studio GV Bộ Môn</p>
                <p className="text-[11px] text-amber-700">
                  Giáo viên các bộ môn luyện tiếng Anh 8 môn CLIL và 77+ khẩu lệnh lớp học thực chiến.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-2 text-left">
              <span className="text-lg">👑</span>
              <div>
                <p className="text-xs font-black text-rose-900">3. Studio Quản Trị</p>
                <p className="text-[11px] text-rose-700">
                  Cô Tâm quản trị toàn diện: Soạn bài độc quyền, ghi âm giọng cô và toàn quyền cả 3 cổng.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 transform active:scale-98 transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30 ring-2 ring-rose-200'
                : activeTab === 'TEACHER'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white shadow-amber-500/30'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
            }`}
          >
            <span>
              {activeTab === 'ADMIN' ? (
                <>👑 ĐĂNG NHẬP QUẢN TRỊ</>
              ) : activeTab === 'TEACHER' ? (
                <>👩‍🏫 ĐĂNG NHẬP GIÁO VIÊN (MÃ: {teacherCode.trim().toUpperCase() || 'GV-TOAN'})</>
              ) : (
                <>👦 ĐĂNG NHẬP HỌC SINH (MÃ: {studentCode.trim().toUpperCase() || 'HS01'})</>
              )}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {content}
      </div>
    );
  }

  // Full-page initial landing first screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0e7ff] via-[#f0f4fc] to-[#e2e8f0] flex flex-col items-center justify-center p-3 sm:p-6">
      {content}
      <p className="text-xs text-slate-500 font-bold mt-4 text-center">
        © 2026 Speaking Studio • Cô Vũ Thị Thanh Tâm • Trường Tiểu học Ái Mộ • GDPT 2018
      </p>
    </div>
  );
};
