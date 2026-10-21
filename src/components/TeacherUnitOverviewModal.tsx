import React, { useState } from 'react';
import { UnitKnowledgeOverview, TeacherSubject, CefrLevel } from '../types';
import { soundEffects } from '../utils/audioSynthesizer';
import { playEnglishAudio } from '../utils/speechUtils';
import {
  X,
  BookOpen,
  Volume2,
  Copy,
  Check,
  Search,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Bookmark,
  Share2,
  Mic,
} from 'lucide-react';

interface TeacherUnitOverviewModalProps {
  overview: UnitKnowledgeOverview;
  isOpen: boolean;
  onClose: () => void;
  onSelectVocabularyToPractice?: (phrase: string) => void;
  onOpenClassroomCommands?: () => void;
  onSelectCommandPractice?: (commandEn: string, meaningVi: string) => void;
}

export const TeacherUnitOverviewModal: React.FC<TeacherUnitOverviewModalProps> = ({
  overview,
  isOpen,
  onClose,
  onSelectVocabularyToPractice,
  onOpenClassroomCommands,
  onSelectCommandPractice,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'vocab' | 'structures' | 'commands' | 'concepts'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    soundEffects.playPop();
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePlayAudio = (text: string, rate: number = 0.9) => {
    soundEffects.playPop();
    setPlayingAudio(text);
    playEnglishAudio(text, rate, 1.0, () => {
      setPlayingAudio(null);
    });
  };

  const filteredVocab = overview.keyVocabulary.filter(
    (v) =>
      !searchTerm ||
      v.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.exampleSentence.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStructures = overview.standardStructures.filter(
    (s) =>
      !searchTerm ||
      s.patternEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.meaningVi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCommands = overview.essentialCommands.filter(
    (c) =>
      !searchTerm ||
      c.commandEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.meaningVi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-indigo-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 flex items-start justify-between relative">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider">
                Unit Overview • Tổng Quan Bài Học
              </span>
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/40 text-indigo-100 font-extrabold text-xs border border-indigo-300/30">
                {overview.subjectNameVi} • CEFR {overview.cefrLevel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {overview.unitTheme}
            </h2>
            <p className="text-xs text-indigo-200 font-medium">
              Tóm tắt toàn diện mục tiêu sư phạm, từ vựng trọng tâm, mẫu câu giảng dạy và khẩu lệnh trước khi vào bài luyện nói.
            </p>
          </div>

          <button
            onClick={() => {
              soundEffects.playPop();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all flex-shrink-0"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar: Search & Tab filters */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Tất cả ({overview.keyVocabulary.length + overview.standardStructures.length + overview.essentialCommands.length})
            </button>
            <button
              onClick={() => setActiveTab('vocab')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'vocab'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Từ vựng ({overview.keyVocabulary.length})
            </button>
            <button
              onClick={() => setActiveTab('structures')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'structures'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Mẫu câu giảng ({overview.standardStructures.length})
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'commands'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Khẩu lệnh ({overview.essentialCommands.length})
            </button>
            <button
              onClick={() => setActiveTab('concepts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'concepts'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Khái niệm ({overview.coreConcepts.length})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm từ vựng, mẫu câu..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-indigo-600 outline-none bg-white"
            />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Lesson Objectives */}
          {(activeTab === 'all' || activeTab === 'concepts') && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-700" />
                <h3 className="text-xs sm:text-sm font-black uppercase text-indigo-950 tracking-wider">
                  MỤC TIÊU BÀI HỌC (LESSON OBJECTIVES - GDPT 2018):
                </h3>
              </div>
              <ul className="space-y-1.5 pl-2">
                {overview.lessonObjectives.map((obj, i) => (
                  <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                    <span className="text-indigo-600 font-black">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 2: Core Concepts */}
          {(activeTab === 'all' || activeTab === 'concepts') && overview.coreConcepts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <h3 className="text-xs sm:text-sm font-black uppercase text-slate-800 tracking-wider">
                  KHÁI NIỆM & KIẾN THỨC CỐT LÕI (CORE CONCEPTS):
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {overview.coreConcepts.map((concept, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-indigo-950 text-xs sm:text-sm">{concept.conceptEn}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {concept.conceptVi}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{concept.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Key Vocabulary with native audio */}
          {(activeTab === 'all' || activeTab === 'vocab') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔤</span>
                  <h3 className="text-xs sm:text-sm font-black uppercase text-slate-800 tracking-wider">
                    TỪ VỰNG & THUẬT NGỮ CHUYÊN MÔN SẮP HỌC (UPCOMING KEY VOCABULARY):
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {filteredVocab.length} thuật ngữ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredVocab.map((item, idx) => {
                  const isAudioActive = playingAudio === item.term || playingAudio === item.exampleSentence;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-sm transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-indigo-950">{item.term}</span>
                          <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {item.phonetic}
                          </span>
                        </div>
                        <p className="text-xs font-black text-slate-700">
                          👉 Nghĩa: <span className="text-indigo-900 font-bold">{item.meaning}</span>
                        </p>
                        <p className="text-xs italic text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          "{item.exampleSentence}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePlayAudio(item.term)}
                            disabled={isAudioActive}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black flex items-center gap-1 transition-colors"
                            title="Nghe từ vựng"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe từ</span>
                          </button>
                          <button
                            onClick={() => handlePlayAudio(item.exampleSentence)}
                            disabled={isAudioActive}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Nghe cả câu ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Nghe câu</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleCopy(`${item.term} (${item.phonetic}): ${item.meaning}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Sao chép từ vựng"
                        >
                          {copiedText?.includes(item.term) ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4: Standard Teaching Structures */}
          {(activeTab === 'all' || activeTab === 'structures') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <h3 className="text-xs sm:text-sm font-black uppercase text-slate-800 tracking-wider">
                    MẪU CÂU GIẢNG BÀI CHUẨN MỰC (STANDARD TEACHING STRUCTURES):
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {filteredStructures.length} mẫu câu
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredStructures.map((struct, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-black text-indigo-950">"{struct.patternEn}"</p>
                      <p className="font-bold text-slate-700">👉 {struct.meaningVi}</p>
                      <p className="text-[11px] font-medium text-indigo-700 bg-white/80 px-2.5 py-1 rounded-lg border border-indigo-100 inline-block">
                        💡 Lưu ý: {struct.usageTip}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handlePlayAudio(struct.patternEn)}
                        className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                        title="Nghe mẫu câu"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(struct.patternEn)}
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                        title="Sao chép mẫu câu"
                      >
                        {copiedText === struct.patternEn ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Essential Classroom Commands */}
          {(activeTab === 'all' || activeTab === 'commands') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📢</span>
                  <h3 className="text-xs sm:text-sm font-black uppercase text-slate-800 tracking-wider">
                    MỆNH LỆNH LỚP HỌC KHUYÊN DÙNG (CLASSROOM COMMANDS):
                  </h3>
                </div>
                {onOpenClassroomCommands && (
                  <button
                    onClick={() => {
                      soundEffects.playPop();
                      onOpenClassroomCommands();
                    }}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Xem toàn bộ 77+ khẩu lệnh →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredCommands.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-black text-amber-950">"{cmd.commandEn}"</p>
                      <p className="text-[11px] font-bold text-slate-600">{cmd.meaningVi}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handlePlayAudio(cmd.commandEn)}
                        className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                        title="Nghe khẩu lệnh"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      {onSelectCommandPractice && (
                        <button
                          onClick={() => {
                            soundEffects.playPop();
                            onClose();
                            onSelectCommandPractice(cmd.commandEn, cmd.meaningVi);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1 transition-colors active:scale-95 shadow-sm"
                          title="Luyện nói khẩu lệnh này trong Studio"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Luyện nói</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Pedagogical Tips */}
          {(activeTab === 'all' || activeTab === 'concepts') && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-emerald-700" />
                <h3 className="text-xs sm:text-sm font-black uppercase text-emerald-950 tracking-wider">
                  CHIẾN LƯỢC SƯ PHẠM CLIL DÀNH CHO GIÁO VIÊN:
                </h3>
              </div>
              <ul className="space-y-1 pl-2">
                {overview.pedagogicalTips.map((tip, idx) => (
                  <li key={idx} className="text-xs font-bold text-emerald-900 flex items-start gap-2">
                    <span className="text-emerald-600 font-black">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs font-bold text-slate-500 hidden sm:block">
            Thầy/Cô đã nắm vững kiến thức? Hãy bắt đầu bài luyện phát âm ngay bên dưới!
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onOpenClassroomCommands && (
              <button
                onClick={() => {
                  soundEffects.playPop();
                  onOpenClassroomCommands();
                }}
                className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-black text-xs transition-all shadow-sm"
              >
                📢 Mở Bảng Mệnh Lệnh Lớp Học
              </button>
            )}

            <button
              onClick={() => {
                soundEffects.playVictoryFanfare();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              🚀 Bắt Đầu Luyện Nói Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
