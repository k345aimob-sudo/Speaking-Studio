import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, CognitiveLevel, ExerciseItem } from './types';
import { INITIAL_CURRICULUM } from './data/curriculum';
import { soundEffects } from './utils/audioSynthesizer';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { LuckyWheel } from './components/LuckyWheel';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GuideModal } from './components/GuideModal';
import { PracticeStage } from './components/PracticeStage';
import { TeacherStudio } from './components/TeacherStudio';
import { TeacherAiStudio } from './components/TeacherAiStudio';
import { Sparkles, Award, GraduationCap, BookOpen, Layers } from 'lucide-react';

export default function App() {
  // Login status state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('speaking_is_logged_in') === 'true';
  });

  // Persistent user state
  const [userCode, setUserCode] = useState<string>(() => {
    return localStorage.getItem('speaking_user_code') || 'H901';
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('speaking_user_name') || 'Học sinh H901';
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('speaking_user_role') as UserRole) || 'STUDENT';
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('speaking_user_avatar') || '🦁';
  });
  const [stars, setStars] = useState<number>(() => {
    return parseInt(localStorage.getItem('speaking_user_stars') || '15', 10);
  });
  const [streakDays, setStreakDays] = useState<number>(() => {
    return parseInt(localStorage.getItem('speaking_streak_days') || '3', 10);
  });
  const [spinTickets, setSpinTickets] = useState<number>(() => {
    return parseInt(localStorage.getItem('speaking_spin_tickets') || '2', 10);
  });

  // Curriculum state
  const [curriculum, setCurriculum] = useState<ExerciseItem[]>(() => {
    const saved = localStorage.getItem('speaking_curriculum_v13');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_CURRICULUM;
  });

  // Mode state: 'student' | 'teacher-clil' | 'teacher-studio'
  const [mainMode, setMainMode] = useState<'student' | 'teacher-clil' | 'teacher-studio'>('student');

  // Navigation state for Student practice
  const [currentGrade, setCurrentGrade] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [currentLevel, setCurrentLevel] = useState<CognitiveLevel>('NhanBiet');

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showWheelModal, setShowWheelModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('speaking_user_code', userCode);
    localStorage.setItem('speaking_user_name', userName);
    localStorage.setItem('speaking_user_role', userRole);
    localStorage.setItem('speaking_user_avatar', userAvatar);
    localStorage.setItem('speaking_user_stars', stars.toString());
    localStorage.setItem('speaking_streak_days', streakDays.toString());
    localStorage.setItem('speaking_spin_tickets', spinTickets.toString());
  }, [userCode, userName, userRole, userAvatar, stars, streakDays, spinTickets]);

  useEffect(() => {
    localStorage.setItem('speaking_curriculum_v13', JSON.stringify(curriculum));
  }, [curriculum]);

  // Strict role-based portal enforcement:
  // - STUDENT: Only access 'student' portal
  // - TEACHER: Only access 'teacher-clil' portal
  // - ADMIN: Full access to all 3 portals
  useEffect(() => {
    if (userRole === 'STUDENT' && mainMode !== 'student') {
      setMainMode('student');
    } else if (userRole === 'TEACHER' && mainMode !== 'teacher-clil') {
      setMainMode('teacher-clil');
    }
  }, [userRole, mainMode]);

  // Login handler with identifier code only
  const handleLogin = (code: string, name: string, role: UserRole, avatar: string, grade = 1) => {
    setUserCode(code);
    setUserName(name);
    setUserRole(role);
    setUserAvatar(avatar);
    setCurrentGrade(grade);
    setIsLoggedIn(true);
    localStorage.setItem('speaking_is_logged_in', 'true');
    setShowLoginModal(false);
    if (role === 'ADMIN') {
      setMainMode('teacher-studio');
    } else if (role === 'TEACHER') {
      setMainMode('teacher-clil');
    } else {
      setMainMode('student');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('speaking_is_logged_in');
    setShowLoginModal(true);
  };

  // Rewards
  const handleRewardStars = (earned: number) => {
    setStars((prev) => prev + earned);
    soundEffects.playStarPing();
  };

  const handleRewardTicket = () => {
    setSpinTickets((prev) => prev + 1);
    soundEffects.playStarPing();
  };

  // Exercise completed
  const handleCompleteExercise = (exerciseId: string, earnedStars: number, score: number) => {
    if (earnedStars > 0) {
      setStars((prev) => prev + earnedStars);
    }
    // Grant spin ticket if student scored high
    if (score >= 80) {
      setSpinTickets((prev) => prev + 1);
    }
  };

  // Grade change handler resets unit filter
  const handleGradeChange = (newGrade: number) => {
    setCurrentGrade(newGrade);
    setSelectedUnit('ALL');
  };

  // Teacher studio actions
  const handleAddExercise = (item: ExerciseItem) => {
    setCurriculum((prev) => [item, ...prev]);
  };

  const handleImportExercises = (items: ExerciseItem[]) => {
    setCurriculum((prev) => [...items, ...prev]);
  };

  const handleDeleteExercise = (id: string) => {
    setCurriculum((prev) => prev.filter((q) => q.id !== id));
  };

  const handleResetDefaultCurriculum = () => {
    if (confirm('Cô có chắc chắn muốn khôi phục kho bài học gốc của chương trình?')) {
      setCurriculum(INITIAL_CURRICULUM);
      localStorage.setItem('speaking_curriculum_v13', JSON.stringify(INITIAL_CURRICULUM));
      alert('Đã khôi phục thành công kho bài học gốc!');
    }
  };

  // Filter questions for active grade, unit, and level (memoized for reference stability)
  const allGradeQuestions = useMemo(() => {
    return curriculum.filter((q) => q.grade === currentGrade);
  }, [curriculum, currentGrade]);

  const activeQuestions = useMemo(() => {
    return allGradeQuestions.filter((q) => {
      const matchesLevel = q.level === currentLevel;
      if (!matchesLevel) return false;
      if (selectedUnit === 'ALL') return true;
      if (q.unit) return q.unit.toLowerCase() === selectedUnit.toLowerCase();
      if (q.topic) return q.topic.toLowerCase().startsWith(selectedUnit.toLowerCase());
      return false;
    });
  }, [allGradeQuestions, currentLevel, selectedUnit]);

  // FIRST PAGE: Login with Identifier Code (Student / Teacher) without display name or auto kid names
  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        currentCode={userCode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4fc] flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header bar */}
      <Header
        currentUser={userName}
        userRole={userRole}
        userCode={userCode}
        stars={stars}
        streakDays={streakDays}
        spinTickets={spinTickets}
        onOpenWheel={() => setShowWheelModal(true)}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        onSwitchUser={handleLogout}
        onOpenTeacherAiStudio={() => setMainMode('teacher-clil')}
        currentView={mainMode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-6">
        {/* TOP NAVIGATION SEGMENTED TABS: ROLE-BASED ACCESS CONTROL */}
        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
          {userRole === 'ADMIN' ? (
            /* ADMIN (Cô Vũ Thị Thanh Tâm): TOÀN QUYỀN TRUY CẬP CẢ 3 CỔNG */
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              <div className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-950 font-black text-xs hidden lg:flex items-center gap-1.5 border border-rose-200 mr-1">
                <span>👑</span>
                <span>Toàn quyền 3 Cổng:</span>
              </div>

              {/* Tab 1: Student Speaking */}
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setMainMode('student');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all ${
                  mainMode === 'student'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>🎙️</span>
                <span>Sân Khấu Luyện Nói Học Sinh</span>
              </button>

              {/* Tab 2: AI Studio for Subject Teachers */}
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setMainMode('teacher-clil');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all ${
                  mainMode === 'teacher-clil'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-300'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Studio GV Bộ Môn</span>
              </button>

              {/* Tab 3: Teacher Admin Studio Cô Tâm */}
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setMainMode('teacher-studio');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all ${
                  mainMode === 'teacher-studio'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-300'
                    : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <span>👑</span>
                <span>Studio Quản Trị</span>
              </button>
            </div>
          ) : userRole === 'TEACHER' ? (
            /* TEACHER: CHỈ TRUY CẬP CỔNG AI GIÁO VIÊN BỘ MÔN */
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg font-black shadow-sm">
                👩‍🏫
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-purple-950 uppercase tracking-tight">
                    AI Studio GV Bộ Môn
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-sm">
                    Giáo Viên
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-500">
                  {userName} ({userCode}) • Luyện nói tiếng Anh 8 môn học & 65+ khẩu lệnh lớp học
                </p>
              </div>
            </div>
          ) : (
            /* STUDENT: CHỈ TRUY CẬP CỔNG SÂN KHẤU LUYỆN NÓI HỌC SINH (LỚP 1-5) */
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-black shadow-sm">
                🎙️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-blue-950 uppercase tracking-tight">
                    Sân Khấu Luyện Nói Học Sinh
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 shadow-sm">
                    Học sinh: {userCode}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-500">
                  Chương trình GDPT 2018 • Tiếng Anh Global Success • Khối Lớp {currentGrade}
                </p>
              </div>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Tiểu học Ái Mộ • GDPT 2018</span>
          </div>
        </div>

        {/* ACTIVE VIEW CONTENT */}
        {mainMode === 'teacher-clil' ? (
          <TeacherAiStudio
            onBackToStudentView={() => setMainMode('student')}
            userRole={userRole}
            onOpenAdminStudio={() => setMainMode('teacher-studio')}
          />
        ) : mainMode === 'teacher-studio' ? (
          <TeacherStudio
            curriculum={curriculum}
            onAddExercise={handleAddExercise}
            onImportExercises={handleImportExercises}
            onDeleteExercise={handleDeleteExercise}
            onResetDefaultCurriculum={handleResetDefaultCurriculum}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Primary Speaking Stage (3 columns on desktop) */}
            <div className="lg:col-span-3">
              <PracticeStage
                currentGrade={currentGrade}
                currentLevel={currentLevel}
                selectedUnit={selectedUnit}
                onGradeChange={handleGradeChange}
                onLevelChange={setCurrentLevel}
                onUnitChange={setSelectedUnit}
                questions={activeQuestions}
                allGradeQuestions={allGradeQuestions}
                onCompleteExercise={handleCompleteExercise}
              />
            </div>

            {/* Sidebar Widgets (1 column on desktop) */}
            <div className="space-y-5">
              {/* If user is Admin visiting student portal: show admin shortcut card */}
              {userRole === 'ADMIN' ? (
                <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-5 shadow-lg border-2 border-purple-400/40 text-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 mx-auto flex items-center justify-center text-2xl shadow-md mb-2">
                    👑
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    Quyền Quản Trị Viên
                  </span>
                  <h4 className="text-base font-black mt-2 text-white">
                    Điều Hành Các Cổng Khác
                  </h4>
                  <p className="text-xs font-bold text-indigo-100 mt-1 mb-3">
                    Cô Tâm có thể chuyển đổi nhanh sang AI Studio GV Bộ Môn hoặc Studio Quản Trị:
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        soundEffects.playPop();
                        setMainMode('teacher-clil');
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md active:scale-95 transition-all"
                    >
                      👩‍🏫 Sang AI Studio GV Bộ Môn
                    </button>
                    <button
                      onClick={() => {
                        soundEffects.playPop();
                        setMainMode('teacher-studio');
                      }}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md active:scale-95 transition-all"
                    >
                      👑 Sang Studio Quản Trị
                    </button>
                  </div>
                </div>
              ) : (
                /* Student Dedicated Card (Học sinh chỉ học cổng sân khấu Lớp 1-5) */
                <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 text-white rounded-3xl p-5 shadow-lg border-2 border-blue-400/40 text-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 mx-auto flex items-center justify-center text-2xl shadow-md mb-2">
                    🎙️
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    Học Sinh Ái Mộ
                  </span>
                  <h4 className="text-base font-black mt-2 text-white">
                    Sân Khấu Luyện Nói Học Sinh
                  </h4>
                  <p className="text-xs font-bold text-blue-100 mt-1 mb-3">
                    Luyện phát âm chuẩn theo SGK Global Success, nhận điểm AI tức thì và tích lũy sao thưởng!
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-xs font-extrabold text-amber-200 border border-white/20">
                    ⭐ 3 Cấp độ: Nhận biết • Thông hiểu • Vận dụng
                  </div>
                </div>
              )}

              {/* Lucky Wheel Teaser Card */}
              <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-amber-200 text-center relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 mx-auto flex items-center justify-center text-3xl shadow-md mb-2 animate-float">
                  🎡
                </div>
                <h3 className="text-base font-black text-slate-800">VÒNG QUAY MAY MẮN</h3>
                <p className="text-xs font-bold text-slate-500 mt-1 mb-3">
                  Quay nhận thêm sao thưởng và vé thử thách phát âm!
                </p>
                <button
                  onClick={() => {
                    soundEffects.playPop();
                    setShowWheelModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs shadow-md shadow-amber-500/30 active:scale-95 transition-all"
                >
                  🎯 Mở Vòng Quay ({spinTickets} Vé)
                </button>
              </div>

              {/* Slogan & Motto Widget */}
              <div className="bg-gradient-to-br from-indigo-700 to-blue-800 text-white rounded-3xl p-5 shadow-lg border-2 border-indigo-400/40 relative overflow-hidden">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                  Khẩu Hiệu Luyện Nói
                </span>
                <h4 className="text-lg font-black mt-2 text-amber-200">
                  "Speak Up, Level Up!"
                </h4>
                <p className="text-xs font-bold text-blue-100 mt-1">
                  Mạnh dạn nói – Tiến bộ mỗi ngày!
                </p>
                <p className="text-[11px] text-indigo-200 mt-2 leading-relaxed">
                  Trường Tiểu học Ái Mộ luôn đồng hành cùng các em trên hành trình phát âm chuẩn bản ngữ.
                </p>
              </div>

              {/* Quick Leaderboard Mini-Preview */}
              <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Bảng Vàng & Thống Kê</span>
                  </h4>
                  <button
                    onClick={() => setShowLeaderboardModal(true)}
                    className="text-[11px] font-black text-indigo-600 hover:underline"
                  >
                    Xem chi tiết →
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-200/60 font-bold">
                    <div className="flex items-center gap-1.5 truncate">
                      <span>🥇</span>
                      <span className="truncate">Học sinh HS01</span>
                      <span className="text-[10px] bg-blue-100 text-blue-900 px-1 rounded font-mono font-black">
                        Mã HS: HS01
                      </span>
                    </div>
                    <span className="text-amber-600 font-black flex-shrink-0">⭐ 920</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 font-bold">
                    <div className="flex items-center gap-1.5 truncate">
                      <span>🥈</span>
                      <span className="truncate">Thầy Minh</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-1 rounded font-mono font-black">
                        Mã GV: GV-TOAN
                      </span>
                    </div>
                    <span className="text-amber-600 font-black flex-shrink-0">⭐ 890</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-200/60 font-bold">
                    <div className="flex items-center gap-1.5 truncate">
                      <span>🥉</span>
                      <span className="truncate">Học sinh HS02</span>
                      <span className="text-[10px] bg-blue-100 text-blue-900 px-1 rounded font-mono font-black">
                        Mã HS: HS02
                      </span>
                    </div>
                    <span className="text-amber-600 font-black flex-shrink-0">⭐ 850</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowLeaderboardModal(true)}
                  className="w-full mt-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[11px] transition-colors text-center block"
                >
                  📊 Mở Bảng Thống Kê Xếp Hạng Đầy Đủ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-center text-xs text-slate-500 font-bold">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 Speaking Studio • <strong>Cô Vũ Thị Thanh Tâm</strong> • Trường Tiểu học Ái Mộ
          </p>
          <p className="text-indigo-600 font-black">
            Bám sát Chương trình GDPT 2018 & SGK Global Success (Lớp 1 - 5) • CLIL / EMI A1 - B1
          </p>
        </div>
      </footer>

      {/* MODALS */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onLogin={handleLogin}
          currentCode={userCode}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      <LuckyWheel
        isOpen={showWheelModal}
        onClose={() => setShowWheelModal(false)}
        spinTickets={spinTickets}
        onRewardStars={handleRewardStars}
        onRewardTicket={handleRewardTicket}
      />

      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        currentUserCode={userCode}
        currentUserName={userName}
        currentUserStars={stars}
        userRole={userRole}
        streakDays={streakDays}
      />

      <GuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
