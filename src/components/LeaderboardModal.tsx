import React, { useState, useMemo } from 'react';
import {
  X,
  Award,
  Medal,
  Trophy,
  Sparkles,
  Flame,
  Search,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Mic,
  Users,
  Star,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../types';
import { soundEffects } from '../utils/audioSynthesizer';
import confetti from 'canvas-confetti';

export interface LeaderboardRecord {
  id: string;
  code: string; // "HS01", "GV-TOAN"...
  name: string;
  role: 'STUDENT' | 'TEACHER';
  avatar: string;
  category: string; // "Khối Lớp 3 (3A1)", "Môn Toán CLIL", "Môn Khoa Học CLIL"...
  practiceCount: number; // Số lượt luyện tập
  stars: number; // Số điểm sao
  accuracyRate: number; // % chuẩn âm (ví dụ: 96%)
  streakDays: number; // Chuỗi ngày liên tục
  badgeTitle: string; // Danh hiệu vinh danh
}

// Danh sách đại diện thi đua của tập thể học sinh và giáo viên Trường Tiểu học Ái Mộ (KHÔNG CÓ ADMIN)
const INITIAL_LEADERBOARD_DATA: LeaderboardRecord[] = [
  // ==================== HỌC SINH TIỂU HỌC ÁI MỘ ====================
  {
    id: 'hs-01',
    code: 'HS01',
    name: 'Học sinh HS01',
    role: 'STUDENT',
    avatar: '🦁',
    category: 'Khối Lớp 3 (3A1)',
    practiceCount: 68,
    stars: 920,
    accuracyRate: 96,
    streakDays: 5,
    badgeTitle: '🌟 Kiện tướng luyện nói',
  },
  {
    id: 'hs-02',
    code: 'HS02',
    name: 'Học sinh HS02',
    role: 'STUDENT',
    avatar: '🐰',
    category: 'Khối Lớp 4 (4A2)',
    practiceCount: 62,
    stars: 850,
    accuracyRate: 95,
    streakDays: 4,
    badgeTitle: '🚀 Tinh anh phát âm',
  },
  {
    id: 'h901',
    code: 'H901',
    name: 'Học sinh H901',
    role: 'STUDENT',
    avatar: '🐼',
    category: 'Khối Lớp 1 (1A3)',
    practiceCount: 54,
    stars: 740,
    accuracyRate: 93,
    streakDays: 7,
    badgeTitle: '🔥 Siêu sao bền bỉ',
  },
  {
    id: 'hs-03',
    code: 'HS03',
    name: 'Học sinh HS03',
    role: 'STUDENT',
    avatar: '🦊',
    category: 'Khối Lớp 5 (5A1)',
    practiceCount: 49,
    stars: 680,
    accuracyRate: 94,
    streakDays: 4,
    badgeTitle: '🎯 Phát âm chuẩn mực',
  },
  {
    id: 'h902',
    code: 'H902',
    name: 'Học sinh H902',
    role: 'STUDENT',
    avatar: '🐯',
    category: 'Khối Lớp 2 (2A4)',
    practiceCount: 43,
    stars: 610,
    accuracyRate: 91,
    streakDays: 4,
    badgeTitle: '⭐ Ngôi sao nỗ lực',
  },
  {
    id: 'hs-04',
    code: 'HS04',
    name: 'Học sinh HS04',
    role: 'STUDENT',
    avatar: '🐨',
    category: 'Khối Lớp 2 (2A1)',
    practiceCount: 37,
    stars: 520,
    accuracyRate: 90,
    streakDays: 3,
    badgeTitle: '✨ Tiến bộ vượt bậc',
  },
  {
    id: 'h903',
    code: 'H903',
    name: 'Học sinh H903',
    role: 'STUDENT',
    avatar: '🦄',
    category: 'Khối Lớp 3 (3A2)',
    practiceCount: 32,
    stars: 450,
    accuracyRate: 89,
    streakDays: 3,
    badgeTitle: '🌱 Mầm non tích cực',
  },
  {
    id: 'hs-05',
    code: 'HS05',
    name: 'Học sinh HS05',
    role: 'STUDENT',
    avatar: '🐸',
    category: 'Khối Lớp 1 (1A2)',
    practiceCount: 28,
    stars: 390,
    accuracyRate: 88,
    streakDays: 2,
    badgeTitle: '🎈 Hăng say rèn luyện',
  },
  {
    id: 'h904',
    code: 'H904',
    name: 'Học sinh H904',
    role: 'STUDENT',
    avatar: '🐶',
    category: 'Khối Lớp 4 (4A3)',
    practiceCount: 24,
    stars: 340,
    accuracyRate: 87,
    streakDays: 2,
    badgeTitle: '📚 Bạn chăm học',
  },
  {
    id: 'h905',
    code: 'H905',
    name: 'Học sinh H905',
    role: 'STUDENT',
    avatar: '🐱',
    category: 'Khối Lớp 5 (5A2)',
    practiceCount: 19,
    stars: 280,
    accuracyRate: 85,
    streakDays: 1,
    badgeTitle: '👏 Cố gắng mỗi ngày',
  },

  // ==================== GIÁO VIÊN BỘ MÔN (CLIL / EMI) ====================
  {
    id: 'gv-toan',
    code: 'GV-TOAN',
    name: 'Thầy Nguyễn Văn Minh',
    role: 'TEACHER',
    avatar: '📐',
    category: 'Môn Toán CLIL',
    practiceCount: 58,
    stars: 890,
    accuracyRate: 96,
    streakDays: 6,
    badgeTitle: '📐 Tiên phong CLIL Toán',
  },
  {
    id: 'gv-khtn',
    code: 'GV-KHTN',
    name: 'Cô Trần Phương Thảo',
    role: 'TEACHER',
    avatar: '🔬',
    category: 'Khoa Học Tự Nhiên CLIL',
    practiceCount: 51,
    stars: 810,
    accuracyRate: 95,
    streakDays: 5,
    badgeTitle: '🔬 Sáng tạo khoa học',
  },
  {
    id: 'gv-ict',
    code: 'GV-ICT',
    name: 'Thầy Hoàng Quốc Bảo',
    role: 'TEACHER',
    avatar: '💻',
    category: 'Tin Học & Công Nghệ CLIL',
    practiceCount: 45,
    stars: 730,
    accuracyRate: 94,
    streakDays: 4,
    badgeTitle: '💻 Chuyển đổi số giáo dục',
  },
  {
    id: 'gv-mythuat',
    code: 'GV-MYTHUAT',
    name: 'Cô Lê Thu Lan',
    role: 'TEACHER',
    avatar: '🎨',
    category: 'Môn Mỹ Thuật CLIL',
    practiceCount: 39,
    stars: 660,
    accuracyRate: 93,
    streakDays: 4,
    badgeTitle: '🎨 Sắc màu nghệ thuật',
  },
  {
    id: 'gv-amnhac',
    code: 'GV-AMNHAC',
    name: 'Cô Đỗ Quỳnh Nga',
    role: 'TEACHER',
    avatar: '🎵',
    category: 'Môn Âm Nhạc CLIL',
    practiceCount: 34,
    stars: 590,
    accuracyRate: 92,
    streakDays: 3,
    badgeTitle: '🎵 Giai điệu tự tin',
  },
  {
    id: 'gv-gdtc',
    code: 'GV-GDTC',
    name: 'Thầy Vũ Đức Hùng',
    role: 'TEACHER',
    avatar: '🏃',
    category: 'Giáo Dục Thể Chất CLIL',
    practiceCount: 30,
    stars: 520,
    accuracyRate: 91,
    streakDays: 2,
    badgeTitle: '⚡ Năng động thể thao',
  },
  {
    id: 'gv-lichsu',
    code: 'GV-LICHSU',
    name: 'Cô Phạm Diệu Hương',
    role: 'TEACHER',
    avatar: '🌏',
    category: 'Lịch Sử & Địa Lý CLIL',
    practiceCount: 25,
    stars: 450,
    accuracyRate: 90,
    streakDays: 2,
    badgeTitle: '🌏 Khám phá thế giới',
  },
];

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserCode: string;
  currentUserName: string;
  currentUserStars: number;
  userRole?: UserRole;
  streakDays?: number;
}

type ModalViewTab = 'STATS_TABLE' | 'HONOR_ROLL';
type RoleFilter = 'ALL' | 'STUDENT' | 'TEACHER';
type SortCriteria = 'STARS' | 'PRACTICE' | 'ACCURACY';

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserCode,
  currentUserName,
  currentUserStars,
  userRole = 'STUDENT',
  streakDays = 3,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<ModalViewTab>('STATS_TABLE');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('STARS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAdminUser = userRole === 'ADMIN' || currentUserCode.trim().toLowerCase() === 'tracy';

  // Hợp nhất dữ liệu: KHÔNG THỐNG KÊ KẾT QUẢ VÀ ĐĂNG NHẬP CỦA ADMIN QUẢN TRỊ
  const combinedList = useMemo(() => {
    // Luôn lọc bỏ bất kỳ tài khoản admin nào khỏi danh sách thi đua
    const list = INITIAL_LEADERBOARD_DATA.filter(
      (item) => (item.role as string) !== 'ADMIN' && item.code.toLowerCase() !== 'tracy'
    );

    // Nếu tài khoản đang đăng nhập là ADMIN (Cô Vũ Thị Thanh Tâm), KHÔNG đưa admin vào bảng xếp hạng
    if (isAdminUser) {
      return list;
    }

    const userCodeClean = currentUserCode.trim().toUpperCase();
    if (!userCodeClean) return list;

    const existingIdx = list.findIndex(
      (item) => item.code.toUpperCase() === userCodeClean
    );

    if (existingIdx >= 0) {
      list[existingIdx] = {
        ...list[existingIdx],
        stars: Math.max(list[existingIdx].stars, currentUserStars),
        streakDays: Math.max(list[existingIdx].streakDays, streakDays),
        practiceCount: Math.max(list[existingIdx].practiceCount, Math.ceil(currentUserStars / 8) + 5),
      };
    } else {
      // Người dùng mới (Học sinh hoặc Giáo viên bộ môn)
      const isTeacherRole = userRole === 'TEACHER' || userCodeClean.startsWith('GV');
      list.push({
        id: `user-${userCodeClean}`,
        code: userCodeClean,
        name: currentUserName || (isTeacherRole ? `Giáo Viên ${userCodeClean}` : `Học Sinh ${userCodeClean}`),
        role: isTeacherRole ? 'TEACHER' : 'STUDENT',
        avatar: isTeacherRole ? '👩‍🏫' : '🦁',
        category: isTeacherRole ? 'Giáo Viên Bộ Môn CLIL' : 'Học Sinh • TH Ái Mộ',
        practiceCount: Math.max(12, Math.ceil(currentUserStars / 8) + 3),
        stars: currentUserStars,
        accuracyRate: 94,
        streakDays: streakDays,
        badgeTitle: '🌟 Thành viên tích cực',
      });
    }

    return list;
  }, [currentUserCode, currentUserName, currentUserStars, userRole, streakDays, isAdminUser]);

  // Lọc và Sắp xếp từ cao xuống thấp
  const sortedAndFilteredList = useMemo(() => {
    return combinedList
      .filter((item) => {
        // Lọc vai trò
        if (roleFilter === 'STUDENT' && item.role !== 'STUDENT') return false;
        if (roleFilter === 'TEACHER' && item.role !== 'TEACHER') return false;

        // Lọc tìm kiếm theo mã hoặc tên
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matchCode = item.code.toLowerCase().includes(q);
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sắp xếp kết quả từ cao xuống thấp
        if (sortCriteria === 'STARS') {
          return b.stars - a.stars;
        } else if (sortCriteria === 'PRACTICE') {
          return b.practiceCount - a.practiceCount;
        } else {
          return b.accuracyRate - a.accuracyRate;
        }
      });
  }, [combinedList, roleFilter, sortCriteria, searchQuery]);

  // Top 3 học sinh xuất sắc nhất
  const topStudents = useMemo(() => {
    return combinedList
      .filter((item) => item.role === 'STUDENT')
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 3);
  }, [combinedList]);

  // Top 3 giáo viên bộ môn xuất sắc nhất
  const topTeachers = useMemo(() => {
    return combinedList
      .filter((item) => item.role === 'TEACHER')
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 3);
  }, [combinedList]);

  // Tổng số lượt luyện tập và sao của học sinh và giáo viên toàn trường
  const totalStats = useMemo(() => {
    const totalPractice = combinedList.reduce((acc, curr) => acc + curr.practiceCount, 0);
    const totalStars = combinedList.reduce((acc, curr) => acc + curr.stars, 0);
    const totalMembers = combinedList.length;
    return { totalPractice, totalStars, totalMembers };
  }, [combinedList]);

  const handleCheer = () => {
    soundEffects.playVictoryFanfare();
    confetti({
      particleCount: 85,
      spread: 100,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border-4 border-amber-300 overflow-hidden relative animate-in fade-in zoom-in duration-150 flex flex-col max-h-[92vh]">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors z-20"
          title="Đóng bảng vàng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. TOP HEADER BANNER (VINH DANH HỌC SINH & GIÁO VIÊN ÁI MỘ) */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 sm:p-6 text-white text-center relative overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-13 h-13 rounded-2xl bg-white text-amber-500 flex items-center justify-center text-3xl shadow-lg border-2 border-amber-200 animate-bounce flex-shrink-0">
              🏆
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs">
                Trường Tiểu học Ái Mộ • TP. Hà Nội
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                BẢNG VÀNG ÁI MỘ & THỐNG KÊ LUYỆN NÓI
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-100">
                Vinh danh Học sinh và Giáo viên tích cực luyện nói Tiếng Anh mỗi ngày
              </p>
            </div>
          </div>

          {/* Quick Summary Strip (Chỉ tính học sinh & giáo viên bộ môn) */}
          <div className="mt-3 grid grid-cols-3 gap-2 max-w-xl mx-auto pt-2 border-t border-amber-400/40 text-center">
            <div className="bg-white/15 rounded-xl p-1.5 border border-white/20">
              <span className="block text-[10px] uppercase font-bold text-amber-200">👥 Học sinh & Giáo viên</span>
              <span className="text-xs sm:text-sm font-black text-white">{totalStats.totalMembers} thành viên</span>
            </div>
            <div className="bg-white/15 rounded-xl p-1.5 border border-white/20">
              <span className="block text-[10px] uppercase font-bold text-amber-200">🎙️ Tổng lượt luyện</span>
              <span className="text-xs sm:text-sm font-black text-white">{totalStats.totalPractice} lượt</span>
            </div>
            <div className="bg-white/15 rounded-xl p-1.5 border border-white/20">
              <span className="block text-[10px] uppercase font-bold text-amber-200">⭐ Tổng điểm sao</span>
              <span className="text-xs sm:text-sm font-black text-amber-200">{totalStats.totalStars.toLocaleString()} sao</span>
            </div>
          </div>
        </div>

        {/* THÔNG BÁO DÀNH CHO ADMIN: KHÔNG THỐNG KÊ VÀO BẢNG THI ĐUA */}
        {isAdminUser && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950 flex items-center justify-between gap-3 text-xs flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👑</span>
              <div>
                <p className="font-black text-rose-900">
                  Tài khoản Quản Trị Hệ Thống (Cô Vũ Thị Thanh Tâm)
                </p>
                <p className="text-[11px] text-rose-700 font-medium">
                  Tài khoản Admin không thống kê điểm số và lượt luyện tập trong bảng thi đua của Học sinh & Giáo viên.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-rose-200 text-rose-900 font-black text-[11px] flex-shrink-0">
              Quyền Quản Trị
            </span>
          </div>
        )}

        {/* 2. MODE SELECTOR TABS: THỐNG KÊ CHI TIẾT vs BẢNG VÀNG VINH DANH */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              soundEffects.playPop();
              setActiveTab('STATS_TABLE');
            }}
            className={`py-2 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'STATS_TABLE'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📊</span>
            <span>BẢNG THỐNG KÊ XẾP HẠNG (TỪ CAO XUỐNG THẤP)</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playPop();
              setActiveTab('HONOR_ROLL');
            }}
            className={`py-2 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'HONOR_ROLL'
                ? 'bg-amber-500 text-amber-950 shadow-md ring-2 ring-amber-300'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🏆</span>
            <span>BẢNG VÀNG VINH DANH (TOP TIÊU BIỂU)</span>
          </button>
        </div>

        {/* 3. MAIN SCROLLABLE CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* ================= TAB 1: BẢNG THỐNG KÊ CHI TIẾT ================= */}
          {activeTab === 'STATS_TABLE' && (
            <div className="space-y-4">
              {/* Controls bar: Filters, Sortings, Search */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                {/* Lọc đối tượng (Tất cả / Học sinh / Giáo viên) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-slate-600 flex items-center gap-1 mr-1">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lọc:</span>
                  </span>
                  <button
                    onClick={() => {
                      soundEffects.playPop();
                      setRoleFilter('ALL');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      roleFilter === 'ALL'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    ✨ Tất Cả ({combinedList.length})
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playPop();
                      setRoleFilter('STUDENT');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      roleFilter === 'STUDENT'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <span>👦 Học Sinh ({combinedList.filter((x) => x.role === 'STUDENT').length})</span>
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playPop();
                      setRoleFilter('TEACHER');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      roleFilter === 'TEACHER'
                        ? 'bg-amber-500 text-amber-950 shadow-xs'
                        : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
                    }`}
                  >
                    <span>👩‍🏫 Giáo Viên ({combinedList.filter((x) => x.role === 'TEACHER').length})</span>
                  </button>
                </div>

                {/* Sắp xếp từ cao xuống thấp & Ô tìm kiếm */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-600 flex items-center gap-1 mr-1">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                      <span>Xếp:</span>
                    </span>
                    <button
                      onClick={() => {
                        soundEffects.playPop();
                        setSortCriteria('STARS');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                        sortCriteria === 'STARS'
                          ? 'bg-amber-500 text-amber-950 shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                      title="Sắp xếp theo số điểm sao từ cao xuống thấp"
                    >
                      ⭐ Điểm Sao ↓
                    </button>
                    <button
                      onClick={() => {
                        soundEffects.playPop();
                        setSortCriteria('PRACTICE');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                        sortCriteria === 'PRACTICE'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                      title="Sắp xếp theo số lượt luyện tập từ cao xuống thấp"
                    >
                      🎙️ Lượt Luyện ↓
                    </button>
                  </div>

                  {/* Tìm kiếm */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm Mã HS / Mã GV..."
                      className="px-3 py-1.5 pl-8 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 w-36 sm:w-44"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* BẢNG THỐNG KÊ CHI TIẾT - GHI RÕ MÃ HỌC SINH VÀ MÃ GIÁO VIÊN (KHÔNG CÓ ADMIN) */}
              <div className="rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-100 via-indigo-50/50 to-slate-100 border-b-2 border-slate-200 text-slate-700 font-black uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3 text-center w-14">Hạng</th>
                        <th className="py-3 px-3 text-left">Mã Định Danh (Mã HS / Mã GV)</th>
                        <th className="py-3 px-3 text-left hidden sm:table-cell">Vai Trò</th>
                        <th className="py-3 px-3 text-center font-black text-indigo-700 bg-indigo-50/40">
                          🎙️ Số Lượt Luyện Tập
                        </th>
                        <th className="py-3 px-3 text-center font-black text-amber-700 bg-amber-50/40">
                          ⭐ Số Điểm Sao
                        </th>
                        <th className="py-3 px-3 text-center hidden md:table-cell">Chuẩn Âm / Chuỗi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {sortedAndFilteredList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                            Không tìm thấy kết quả phù hợp với từ khóa "{searchQuery}"
                          </td>
                        </tr>
                      ) : (
                        sortedAndFilteredList.map((item, index) => {
                          const isCurrentUser =
                            !isAdminUser &&
                            item.code.toUpperCase() === currentUserCode.trim().toUpperCase();
                          const rank = index + 1;

                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors ${
                                isCurrentUser
                                  ? 'bg-amber-50/90 font-bold ring-2 ring-inset ring-amber-400'
                                  : index % 2 === 0
                                  ? 'bg-white hover:bg-slate-50'
                                  : 'bg-slate-50/50 hover:bg-slate-100'
                              }`}
                            >
                              {/* Cột 1: Thứ Hạng */}
                              <td className="py-3 px-3 text-center font-black">
                                {rank === 1 ? (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400 text-amber-950 text-sm shadow-sm ring-2 ring-amber-200">
                                    🥇
                                  </span>
                                ) : rank === 2 ? (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-300 text-slate-800 text-sm shadow-sm">
                                    🥈
                                  </span>
                                ) : rank === 3 ? (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-700 text-white text-sm shadow-sm">
                                    🥉
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-bold text-xs">#{rank}</span>
                                )}
                              </td>

                              {/* Cột 2: Mã Định Danh (Ghi rõ Mã HS hoặc Mã GV) */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-base flex-shrink-0">{item.avatar}</span>
                                  {item.role === 'STUDENT' ? (
                                    <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-900 border border-blue-300 font-black text-xs tracking-wide font-mono shadow-2xs">
                                      Mã HS: {item.code}
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 font-black text-xs tracking-wide font-mono shadow-2xs">
                                      Mã GV: {item.code}
                                    </span>
                                  )}

                                  {isCurrentUser && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase shadow-xs">
                                      👉 Bạn
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Cột 3: Vai Trò */}
                              <td className="py-3 px-3 hidden sm:table-cell">
                                {item.role === 'STUDENT' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                    👦 Học Sinh
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                    👩‍🏫 GV Bộ Môn
                                  </span>
                                )}
                              </td>

                              {/* Cột 4: SỐ LƯỢT LUYỆN TẬP */}
                              <td className="py-3 px-3 text-center bg-indigo-50/20">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-100/80 text-indigo-900 font-black text-xs">
                                  <Mic className="w-3 h-3 text-indigo-600" />
                                  <span>{item.practiceCount} lượt</span>
                                </span>
                              </td>

                              {/* Cột 5: SỐ ĐIỂM SAO */}
                              <td className="py-3 px-3 text-center bg-amber-50/20">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-xs shadow-2xs">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span>{item.stars} Sao</span>
                                </span>
                              </td>

                              {/* Cột 6: Độ Chuẩn Âm & Chuỗi Ngày */}
                              <td className="py-3 px-3 text-center hidden md:table-cell">
                                <div className="flex items-center justify-center gap-2 text-[11px] font-bold">
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                    🎯 {item.accuracyRate}%
                                  </span>
                                  <span className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200 flex items-center gap-0.5">
                                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                                    <span>{item.streakDays} ngày</span>
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer chú thích bảng thống kê */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500 font-bold">
                  <span>
                    📌 Danh sách tự động xếp hạng từ cao xuống thấp theo{' '}
                    <strong>{sortCriteria === 'STARS' ? 'Điểm Sao ⭐' : 'Số Lượt Luyện Tập 🎙️'}</strong>.
                  </span>
                  <span>
                    Tổng cộng: <strong>{sortedAndFilteredList.length}</strong> thành viên (Học sinh & GV bộ môn)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BẢNG VÀNG VINH DANH ================= */}
          {activeTab === 'HONOR_ROLL' && (
            <div className="space-y-6">
              {/* TOP 3 PODIUM VINH QUANG TOÀN TRƯỜNG */}
              <div className="bg-gradient-to-b from-amber-50 to-orange-50 p-5 rounded-3xl border-2 border-amber-200">
                <div className="text-center mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-3 py-1 rounded-full">
                    ✨ TOP 3 GƯƠNG MẶT XUẤT SẮC TOÀN TRƯỜNG ✨
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-1">
                    Bục Vinh Quang Luyện Nói Tiếng Anh Ái Mộ
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto items-end pt-4">
                  {/* Hạng 2 (Silver) */}
                  {sortedAndFilteredList[1] && (
                    <div className="bg-white p-3 rounded-2xl border-2 border-slate-300 shadow-md text-center flex flex-col items-center">
                      <span className="text-2xl mb-1">🥈</span>
                      <span className="text-2xl">{sortedAndFilteredList[1].avatar}</span>
                      <span className="mt-2 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-900 font-mono text-xs font-black border border-slate-300">
                        {sortedAndFilteredList[1].role === 'STUDENT' ? 'Mã HS: ' : 'Mã GV: '}
                        {sortedAndFilteredList[1].code}
                      </span>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 truncate max-w-full">
                        {sortedAndFilteredList[1].category}
                      </p>
                      <span className="text-xs font-black text-amber-600 mt-1">
                        ⭐ {sortedAndFilteredList[1].stars} Sao
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        🎙️ {sortedAndFilteredList[1].practiceCount} lượt
                      </span>
                      <div className="w-full bg-slate-200 text-slate-700 py-1 rounded-xl text-xs font-black mt-2">
                        Á QUÂN 1
                      </div>
                    </div>
                  )}

                  {/* Hạng 1 (Gold - Cao nhất) */}
                  {sortedAndFilteredList[0] && (
                    <div className="bg-gradient-to-b from-amber-100 to-amber-50 p-4 rounded-3xl border-4 border-amber-400 shadow-xl text-center flex flex-col items-center transform -translate-y-2">
                      <span className="text-3xl mb-1 animate-bounce">👑</span>
                      <span className="text-4xl">{sortedAndFilteredList[0].avatar}</span>
                      <span className="mt-2 px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-mono text-sm font-black shadow-xs border border-amber-500/40">
                        {sortedAndFilteredList[0].role === 'STUDENT' ? 'Mã HS: ' : 'Mã GV: '}
                        {sortedAndFilteredList[0].code}
                      </span>
                      <p className="text-[11px] font-bold text-amber-900 mt-1 truncate max-w-full">
                        {sortedAndFilteredList[0].category}
                      </p>
                      <span className="text-sm font-black text-amber-700 mt-1">
                        ⭐ {sortedAndFilteredList[0].stars} Sao
                      </span>
                      <span className="text-xs text-amber-900 font-bold">
                        🎙️ {sortedAndFilteredList[0].practiceCount} lượt
                      </span>
                      <div className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-1.5 rounded-xl text-xs font-black mt-2 shadow-xs">
                        🥇 QUÁN QUÂN
                      </div>
                    </div>
                  )}

                  {/* Hạng 3 (Bronze) */}
                  {sortedAndFilteredList[2] && (
                    <div className="bg-white p-3 rounded-2xl border-2 border-amber-600/40 shadow-md text-center flex flex-col items-center">
                      <span className="text-2xl mb-1">🥉</span>
                      <span className="text-2xl">{sortedAndFilteredList[2].avatar}</span>
                      <span className="mt-2 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 font-mono text-xs font-black border border-amber-300">
                        {sortedAndFilteredList[2].role === 'STUDENT' ? 'Mã HS: ' : 'Mã GV: '}
                        {sortedAndFilteredList[2].code}
                      </span>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 truncate max-w-full">
                        {sortedAndFilteredList[2].category}
                      </p>
                      <span className="text-xs font-black text-amber-600 mt-1">
                        ⭐ {sortedAndFilteredList[2].stars} Sao
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        🎙️ {sortedAndFilteredList[2].practiceCount} lượt
                      </span>
                      <div className="w-full bg-amber-100 text-amber-900 py-1 rounded-xl text-xs font-black mt-2">
                        Á QUÂN 2
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2 CỘT VINH DANH SONG SONG: HỌC SINH TÍCH CỰC & GIÁO VIÊN TÍCH CỰC (KHÔNG CÓ ADMIN) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cột 1: Vinh danh Học sinh */}
                <div className="bg-blue-50/70 p-4 rounded-3xl border-2 border-blue-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👦</span>
                      <div>
                        <h4 className="text-sm font-black text-blue-950 uppercase">
                          Học Sinh Chăm Chỉ Luyện Nói
                        </h4>
                        <p className="text-[11px] font-bold text-blue-700">
                          Khối Lớp 1 - 5 • SGK Global Success 2018
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-800 bg-blue-200 px-2 py-0.5 rounded-lg">
                      Top 3
                    </span>
                  </div>

                  <div className="space-y-2">
                    {topStudents.map((st, i) => (
                      <div
                        key={st.id}
                        className="p-3 bg-white rounded-2xl border border-blue-200 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg font-black text-blue-800">#{i + 1}</span>
                          <span className="text-2xl">{st.avatar}</span>
                          <div>
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 text-xs font-mono font-black border border-blue-200 block w-fit">
                              Mã HS: {st.code}
                            </span>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                              {st.category} • {st.badgeTitle}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="block text-xs font-black text-amber-600">
                            ⭐ {st.stars} Sao
                          </span>
                          <span className="text-[10px] font-bold text-indigo-700">
                            🎙️ {st.practiceCount} lượt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cột 2: Vinh danh Giáo viên */}
                <div className="bg-amber-50/70 p-4 rounded-3xl border-2 border-amber-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👩‍🏫</span>
                      <div>
                        <h4 className="text-sm font-black text-amber-950 uppercase">
                          Giáo Viên Tiên Phong Luyện Nói
                        </h4>
                        <p className="text-[11px] font-bold text-amber-800">
                          8 Môn Học CLIL & Khẩu Lệnh Lớp Học
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded-lg">
                      Top 3
                    </span>
                  </div>

                  <div className="space-y-2">
                    {topTeachers.map((tc, i) => (
                      <div
                        key={tc.id}
                        className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg font-black text-amber-900">#{i + 1}</span>
                          <span className="text-2xl">{tc.avatar}</span>
                          <div>
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 text-xs font-mono font-black border border-amber-200 block w-fit">
                              Mã GV: {tc.code}
                            </span>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                              {tc.category} • {tc.badgeTitle}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="block text-xs font-black text-amber-600">
                            ⭐ {tc.stars} Sao
                          </span>
                          <span className="text-[10px] font-bold text-indigo-700">
                            🎙️ {tc.practiceCount} lượt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lời khích lệ từ Nhà trường */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-center space-y-1">
                <p className="text-xs font-black text-indigo-950">
                  🎉 "Speak Up, Level Up! – Mạnh dạn nói – Tiến bộ mỗi ngày!"
                </p>
                <p className="text-[11px] font-medium text-indigo-800">
                  Mỗi lần nhấn micro luyện phát âm là một bước tiến vững chắc trên hành trình tự tin hội nhập quốc tế của thầy trò Trường Tiểu học Ái Mộ.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={handleCheer}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
            <span>Bắn Pháo Hoa Cổ Vũ Thầy Cô & Các Bạn 🎉</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
