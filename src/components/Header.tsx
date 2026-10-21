import React from 'react';
import { UserRole } from '../types';
import { soundEffects } from '../utils/audioSynthesizer';
import { Award, BookOpen, Flame, Sparkles, User, RefreshCw, Volume2 } from 'lucide-react';

interface HeaderProps {
  currentUser: string;
  userRole: UserRole;
  userCode: string;
  stars: number;
  streakDays: number;
  spinTickets: number;
  onOpenWheel: () => void;
  onOpenLeaderboard: () => void;
  onOpenGuide: () => void;
  onSwitchUser: () => void;
  onOpenTeacherAiStudio: () => void;
  currentView?: string;
  onToggleSoundTest?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  userRole,
  userCode,
  stars,
  streakDays,
  spinTickets,
  onOpenWheel,
  onOpenLeaderboard,
  onOpenGuide,
  onSwitchUser,
  onOpenTeacherAiStudio,
  currentView,
}) => {
  return (
    <header className="bg-gradient-to-r from-indigo-800 via-blue-700 to-indigo-900 text-white shadow-xl sticky top-0 z-40 border-b-4 border-amber-400">
      {/* Top micro announcement bar */}
      <div className="bg-indigo-950/70 py-1 px-4 text-center text-xs font-semibold text-amber-200 border-b border-indigo-700/40 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
        <span>Chương trình GDPT 2018 • Tiếng Anh Global Success (Lớp 1 - 5) • Trường Tiểu học Ái Mộ</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 transform hover:scale-105 transition-transform border-2 border-white/40">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-50 to-amber-100">
                SPEAKING STUDIO
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-sm">
                Ái Mộ Primary
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-1.5">
              <span>Cô Vũ Thị Thanh Tâm</span>
              <span className="text-white/40">•</span>
              <span className="text-indigo-200">Trường Tiểu học Ái Mộ</span>
            </p>
          </div>
        </div>

        {/* Slogan Pill (Hidden on extra small screens) */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold tracking-wide text-white shadow-inner">
          <span className="text-amber-300 font-black">🌟 Speak Up, Level Up!</span>
          <span className="text-white/40">•</span>
          <span className="text-blue-100">Mạnh dạn nói – Tiến bộ mỗi ngày!</span>
        </div>

        {/* User Stats & Action shortcuts in requested order:
            1. Huong dan
            2. Dang nhap ma HS
            3. AI Studio GV Bo mon
            4. Bang vang
            5. 3 ngay
            6. 15 sao
            7. Vong quay
        */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* 1. Hướng Dẫn */}
          <button
            onClick={() => {
              soundEffects.playPop();
              onOpenGuide();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs border border-white/20 transition-all shadow-sm"
            title="Hướng dẫn sử dụng & Khung năng lực GDPT 2018"
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span className="inline">Hướng Dẫn</span>
          </button>

          {/* 2. Đăng nhập mã HS / GV */}
          <div 
            onClick={onSwitchUser}
            className="flex items-center gap-2 pl-2.5 pr-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 cursor-pointer active:scale-95 transition-all shadow-sm"
            title="Nhấn để đổi tài khoản hoặc đăng nhập lại bằng mã định danh"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                userRole === 'ADMIN'
                  ? 'bg-rose-600 shadow-sm ring-1 ring-rose-300'
                  : userRole === 'TEACHER'
                  ? 'bg-amber-500 shadow-sm'
                  : 'bg-blue-500 shadow-sm'
              }`}
            >
              {userRole === 'ADMIN' ? 'QT' : userRole === 'TEACHER' ? 'GV' : 'HS'}
            </div>
            <div className="text-left">
              <p className="text-xs font-black leading-tight text-white">{currentUser}</p>
              <p className="text-[10px] font-bold text-indigo-200">
                {userRole === 'ADMIN'
                  ? 'Cô Vũ Thị Thanh Tâm • Quản trị viên'
                  : userRole === 'TEACHER'
                  ? `Mã GV: ${userCode}`
                  : `Mã HS: ${userCode}`}
              </p>
            </div>
            <RefreshCw className="w-3.5 h-3.5 text-white/70 hover:rotate-180 transition-transform ml-0.5" />
          </div>

          {/* 3. AI Studio GV Bộ Môn (Chỉ hiển thị cho Giáo viên hoặc Admin Cô Tâm) */}
          {userRole !== 'STUDENT' ? (
            <button
              onClick={() => {
                soundEffects.playPop();
                onOpenTeacherAiStudio();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs shadow-md transition-all border ${
                currentView === 'teacher-clil'
                  ? 'bg-amber-400 text-amber-950 border-amber-300 ring-2 ring-amber-200 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/50 shadow-purple-900/30 active:scale-95'
              }`}
              title="AI Studio dành cho giáo viên các môn học nâng cao kỹ năng nói tiếng Anh (A1, A2, B1)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span className="text-sm">👩‍🏫</span>
              <span className="inline">AI Studio GV Bộ Môn</span>
              <span className="text-[10px] bg-white/20 px-1 rounded-md text-amber-200 hidden xl:inline">
                A1-B1
              </span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/30 border border-blue-300/40 text-blue-100 text-xs font-black shadow-sm">
              <span>🎙️ Sân Khấu Luyện Nói Học Sinh</span>
            </div>
          )}

          {userRole === 'ADMIN' && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/30 border border-rose-300/40 text-rose-100 text-xs font-extrabold shadow-sm">
              <span>👑 Studio Quản Trị</span>
            </div>
          )}

          {/* 4. Bảng Vàng */}
          <button
            onClick={() => {
              soundEffects.playPop();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs border border-white/20 transition-all shadow-sm"
            title="Bảng vàng vinh danh & Thống kê kết quả luyện nói Học sinh, Giáo viên Ái Mộ"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span className="inline">Bảng Vàng</span>
          </button>

          {/* 5. 3 Ngày (Streak) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-extrabold shadow-sm">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
            <span>{streakDays} Ngày</span>
          </div>

          {/* 6. 15 Sao */}
          <div 
            onClick={() => soundEffects.playStarPing()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-transform"
            title="Số sao tích lũy được qua các bài luyện nói"
          >
            <span className="text-base">⭐</span>
            <span>{stars}</span>
            <span className="text-[11px] font-bold text-amber-900">Sao</span>
          </div>

          {/* 7. Vòng Quay */}
          <button
            onClick={() => {
              soundEffects.playPop();
              onOpenWheel();
            }}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-purple-900/30 transition-all border border-purple-400/40"
            title="Mở Vòng quay may mắn nhận sao thưởng"
          >
            <span className="text-sm">🎡</span>
            <span className="inline">Vòng Quay</span>
            {spinTickets > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-indigo-900 animate-pulse">
                {spinTickets}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
