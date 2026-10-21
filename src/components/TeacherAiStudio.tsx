import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TeacherLessonItem, TeacherSubject, CefrLevel, PronunciationResult, ClassroomCommandItem } from '../types';
import {
  TEACHER_SUBJECTS,
  INITIAL_TEACHER_CURRICULUM,
  SubjectMeta,
  getUnitOverview,
  CLASSROOM_COMMANDS,
  COMMAND_CATEGORIES,
  convertCommandToTeacherLesson,
} from '../data/teacherCurriculum';
import { TeacherUnitOverviewModal } from './TeacherUnitOverviewModal';
import { ClassroomCommandsModal } from './ClassroomCommandsModal';
import { soundEffects } from '../utils/audioSynthesizer';
import { playEnglishAudio, evaluateSpeechAccuracy } from '../utils/speechUtils';
import {
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  GraduationCap,
  Layers,
  Search,
  Copy,
  Check,
  Megaphone,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { UserRole } from '../types';

interface TeacherAiStudioProps {
  onBackToStudentView: () => void;
  userRole?: UserRole;
  onOpenAdminStudio?: () => void;
}

export const TeacherAiStudio: React.FC<TeacherAiStudioProps> = ({
  onBackToStudentView,
  userRole = 'TEACHER',
  onOpenAdminStudio,
}) => {
  // Practice Track: 'SUBJECT' (bộ môn CLIL) hoặc 'COMMANDS' (bảng mệnh lệnh lớp học)
  const [practiceTrack, setPracticeTrack] = useState<'SUBJECT' | 'COMMANDS'>('SUBJECT');
  const [selectedSubject, setSelectedSubject] = useState<TeacherSubject>('Math');
  const [selectedCommandCategory, setSelectedCommandCategory] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | 'ALL'>('A1');

  const [lessons, setLessons] = useState<TeacherLessonItem[]>(() => {
    const saved = localStorage.getItem('speaking_teacher_lessons_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const newItems = INITIAL_TEACHER_CURRICULUM.filter((item) => !existingIds.has(item.id));
          return [...parsed, ...newItems];
        }
      } catch (e) {}
    }
    return INITIAL_TEACHER_CURRICULUM;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(0.9);

  // Speech recognition
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<PronunciationResult | null>(null);

  // Teacher recorded voice playback
  const [teacherAudioUrl, setTeacherAudioUrl] = useState<string | null>(null);
  const [isPlayingTeacherVoice, setIsPlayingTeacherVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingActiveRef = useRef<boolean>(false);
  const teacherAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const teacherAudioUrlRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Modal & Overview states
  const [isUnitOverviewModalOpen, setIsUnitOverviewModalOpen] = useState(false);
  const [isClassroomCommandsModalOpen, setIsClassroomCommandsModalOpen] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);
  const [isCommandKnowledgeExpanded, setIsCommandKnowledgeExpanded] = useState(true);

  // AI Gen state
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [customScenarioTopic, setCustomScenarioTopic] = useState('');

  // Phrasebook search state
  const [phraseSearch, setPhraseSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('speaking_teacher_lessons_v2', JSON.stringify(lessons));
  }, [lessons]);

  // Clean up streams & audio URLs on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (teacherAudioUrlRef.current) {
        try {
          URL.revokeObjectURL(teacherAudioUrlRef.current);
        } catch (e) {}
      }
    };
  }, []);

  // Pre-convert all classroom commands to teacher practice lessons
  const commandLessons = useMemo(() => {
    return CLASSROOM_COMMANDS.map(convertCommandToTeacherLesson);
  }, []);

  // Filter lessons based on practice track
  const filteredLessons = useMemo(() => {
    if (practiceTrack === 'COMMANDS') {
      return commandLessons.filter((l) => {
        const originalCmd = CLASSROOM_COMMANDS.find((c) => `cmd-lesson-${c.id}` === l.id);
        if (selectedCommandCategory !== 'ALL' && originalCmd && originalCmd.category !== selectedCommandCategory) {
          return false;
        }
        if (selectedLevel !== 'ALL' && l.cefrLevel !== selectedLevel) {
          return false;
        }
        return true;
      });
    }

    return lessons.filter((l) => {
      if (l.subject !== selectedSubject) return false;
      if (selectedLevel !== 'ALL' && l.cefrLevel !== selectedLevel) return false;
      return true;
    });
  }, [practiceTrack, commandLessons, selectedCommandCategory, selectedLevel, lessons, selectedSubject]);

  const activeLesson: TeacherLessonItem | undefined =
    filteredLessons[currentIndex] || filteredLessons[0];

  const currentUnitOverview = selectedLevel !== 'ALL' ? getUnitOverview(selectedSubject, selectedLevel) : getUnitOverview(selectedSubject, 'A1');
  const currentCommandCategoryMeta = COMMAND_CATEGORIES.find((c) => c.code === selectedCommandCategory);
  const featuredCommandsForKnowledge = useMemo(() => {
    return CLASSROOM_COMMANDS.filter((cmd) => {
      if (selectedCommandCategory !== 'ALL' && cmd.category !== selectedCommandCategory) return false;
      if (selectedLevel !== 'ALL' && cmd.level !== selectedLevel) return false;
      return true;
    }).slice(0, 6);
  }, [selectedCommandCategory, selectedLevel]);

  useEffect(() => {
    setCurrentIndex(0);
    resetAttempt();
  }, [practiceTrack, selectedSubject, selectedLevel, selectedCommandCategory]);

  const resetAttempt = () => {
    setSpokenTranscript('');
    setEvaluation(null);
    setTeacherAudioUrl(null);
    if (teacherAudioUrlRef.current) {
      try {
        URL.revokeObjectURL(teacherAudioUrlRef.current);
      } catch (e) {}
      teacherAudioUrlRef.current = null;
    }
    if (teacherAudioPlayerRef.current) {
      teacherAudioPlayerRef.current.pause();
      teacherAudioPlayerRef.current.currentTime = 0;
    }
    setIsPlayingTeacherVoice(false);
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
    stopMediaRecording();
  };

  const handlePlayModelAudio = () => {
    if (!activeLesson) return;
    soundEffects.playPop();
    setIsPlayingAudio(true);
    playEnglishAudio(activeLesson.englishPrompt, audioSpeed, 1.0, () => {
      setIsPlayingAudio(false);
    });
  };

  // Student reaction voice playback (simulated dialogue)
  const handlePlayStudentReaction = () => {
    if (!activeLesson || !activeLesson.studentReaction) return;
    soundEffects.playPop();
    // Play with higher pitch like child's voice
    playEnglishAudio(activeLesson.studentReaction, 0.9, 1.25);
  };

  // Detect supported audio mime types across Chrome, Safari, Edge, Android
  const getSupportedAudioMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/wav',
      '',
    ];
    for (const c of candidates) {
      if (!c || (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(c))) {
        return c;
      }
    }
    return '';
  };

  // Start media recorder
  const startMediaRecording = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    isRecordingActiveRef.current = true;
    audioChunksRef.current = [];

    try {
      let stream = streamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;
      }

      if (!isRecordingActiveRef.current) return;

      const mimeType = getSupportedAudioMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const actualType = recorder.mimeType || mimeType || 'audio/webm';
        const totalSize = audioChunksRef.current.reduce((acc, c) => acc + c.size, 0);
        if (totalSize > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: actualType });
          const url = URL.createObjectURL(audioBlob);
          if (teacherAudioUrlRef.current) {
            try {
              URL.revokeObjectURL(teacherAudioUrlRef.current);
            } catch (e) {}
          }
          teacherAudioUrlRef.current = url;
          setTeacherAudioUrl(url);
        }
      };

      recorder.start(100);
    } catch (err) {
      console.warn('Microphone recording not allowed for playback:', err);
    }
  };

  const stopMediaRecording = () => {
    isRecordingActiveRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {}
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Vui lòng sử dụng Google Chrome hoặc Microsoft Edge để luyện phát âm.');
      return;
    }

    soundEffects.playPop();
    resetAttempt();

    // Start recording immediately
    startMediaRecording();

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        if (activeLesson) {
          const res = evaluateSpeechAccuracy(transcript, activeLesson.englishPrompt);
          setEvaluation(res);
          if (res.similarityScore >= 70) {
            soundEffects.playVictoryFanfare();
            confetti({ particleCount: 50, spread: 70 });
          } else {
            soundEffects.playEncouragingChime();
          }
        }
      };

      rec.onerror = () => {
        setIsListening(false);
        stopMediaRecording();
      };

      rec.onend = () => {
        setIsListening(false);
        stopMediaRecording();
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      setIsListening(false);
      stopMediaRecording();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    stopMediaRecording();
  };

  const handlePlayTeacherVoice = () => {
    if (isPlayingTeacherVoice) {
      if (teacherAudioPlayerRef.current) {
        teacherAudioPlayerRef.current.pause();
        teacherAudioPlayerRef.current.currentTime = 0;
      }
      setIsPlayingTeacherVoice(false);
      return;
    }

    if (teacherAudioUrl && teacherAudioPlayerRef.current) {
      setIsPlayingTeacherVoice(true);
      teacherAudioPlayerRef.current.currentTime = 0;
      teacherAudioPlayerRef.current
        .play()
        .then(() => {})
        .catch((err) => {
          console.warn('Teacher playback failed, fallback to TTS:', err);
          if (spokenTranscript) {
            playEnglishAudio(spokenTranscript, 0.9, 1.0, () => setIsPlayingTeacherVoice(false));
          } else if (activeLesson) {
            playEnglishAudio(activeLesson.englishPrompt, 0.9, 1.0, () => setIsPlayingTeacherVoice(false));
          } else {
            setIsPlayingTeacherVoice(false);
          }
        });
    } else if (spokenTranscript) {
      setIsPlayingTeacherVoice(true);
      playEnglishAudio(spokenTranscript, 0.9, 1.0, () => setIsPlayingTeacherVoice(false));
    } else if (activeLesson) {
      setIsPlayingTeacherVoice(true);
      playEnglishAudio(activeLesson.englishPrompt, 0.9, 1.0, () => setIsPlayingTeacherVoice(false));
    }
  };

  // Generate new scenario with AI
  const handleGenerateAiScenario = async () => {
    setIsAiGenerating(true);
    soundEffects.playPop();

    try {
      const res = await fetch('/api/ai/generate-teacher-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          cefrLevel: selectedLevel,
          count: 2,
        }),
      });

      const data = await res.json();
      if (data.scenarios && data.scenarios.length > 0) {
        const currentSubMeta = TEACHER_SUBJECTS.find((s) => s.code === selectedSubject);
        const mapped: TeacherLessonItem[] = data.scenarios.map((sc: any, idx: number) => ({
          ...sc,
          id: `ai-teacher-${Date.now()}-${idx}`,
          subject: selectedSubject,
          subjectNameVi: currentSubMeta?.nameVi || selectedSubject,
          cefrLevel: (selectedLevel === 'ALL' ? 'A1' : selectedLevel) as CefrLevel,
          emoji: sc.emoji || currentSubMeta?.icon || '👩‍🏫',
          keyTerms: sc.keyTerms || ['Classroom', 'Instruction'],
        }));

        setLessons((prev) => [...mapped, ...prev]);
        soundEffects.playVictoryFanfare();
        confetti({ particleCount: 60, spread: 80 });
        alert(`🎉 AI đã tạo thành công ${mapped.length} tình huống sư phạm mới cho môn ${currentSubMeta?.nameVi}!`);
      } else {
        createLocalTeacherFallback();
      }
    } catch (err) {
      createLocalTeacherFallback();
    } finally {
      setIsAiGenerating(false);
    }
  };

  const createLocalTeacherFallback = () => {
    const currentSubMeta = TEACHER_SUBJECTS.find((s) => s.code === selectedSubject);
    const targetCefr: CefrLevel = selectedLevel === 'ALL' ? 'A1' : selectedLevel;
    const newLocal: TeacherLessonItem = {
      id: `local-teacher-${Date.now()}`,
      subject: selectedSubject,
      subjectNameVi: currentSubMeta?.nameVi || selectedSubject,
      cefrLevel: targetCefr,
      scenario: customScenarioTopic.trim() || `Tình huống sư phạm môn ${currentSubMeta?.nameVi}`,
      englishPrompt:
        targetCefr === 'A1'
          ? `Please open your book to page ten and look at the first example.`
          : targetCefr === 'A2'
          ? `Before we begin our exercise, make sure you have all required materials ready on your desk.`
          : `Observe the pattern carefully and explain to your partner why this solution is effective.`,
      phonetic: '/pliːz ˈəʊ.pən jɔːr bʊk/',
      vietnameseMeaning: 'Các em hãy mở sách trang số 10 và xem ví dụ đầu tiên nhé.',
      teachingContext: 'Tình huống hướng dẫn học sinh trong giờ học.',
      keyTerms: ['Materials', 'Example', 'Observe'],
      studentReaction: 'Học sinh: "Yes, teacher! We are ready."',
      pedagogicalNote: 'Nói rõ ràng, ánh mắt bao quát cả lớp học.',
      emoji: currentSubMeta?.icon || '👩‍🏫',
    };

    setLessons((prev) => [newLocal, ...prev]);
    soundEffects.playVictoryFanfare();
    confetti({ particleCount: 60, spread: 70 });
    alert(`🎉 Đã thêm tình huống sư phạm môn ${currentSubMeta?.nameVi} vào kho bài!`);
  };

  const handleCopyPhrase = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePracticeSpecificCommand = (cmdText: string, meaningVi?: string) => {
    soundEffects.playPop();
    setPracticeTrack('COMMANDS');
    setSelectedCommandCategory('ALL');
    const target = cmdText.trim().toLowerCase();
    const foundIdx = commandLessons.findIndex(
      (cl) => cl.englishPrompt.toLowerCase() === target
    );
    if (foundIdx >= 0) {
      setCurrentIndex(foundIdx);
    } else {
      const customCmd: ClassroomCommandItem = {
        id: `custom-cmd-${Date.now()}`,
        category: 'SubjectSpecific',
        categoryVi: currentSubjectMeta?.nameVi || 'Môn học',
        level: selectedLevel !== 'ALL' ? selectedLevel : 'A1',
        commandEn: cmdText,
        phonetic: '',
        meaningVi: meaningVi || cmdText,
        situation: `Khẩu lệnh giảng dạy môn ${currentSubjectMeta?.nameVi}`,
        subject: selectedSubject,
        icon: currentSubjectMeta?.icon || '📢',
      };
      const customLesson = convertCommandToTeacherLesson(customCmd);
      setLessons((prev) => [customLesson, ...prev]);
    }
    resetAttempt();
    setTimeout(() => {
      document.getElementById('teacher-speaking-stage')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const currentSubjectMeta = TEACHER_SUBJECTS.find((s) => s.code === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Studio for Subject Teachers */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white p-5 sm:p-7 rounded-3xl shadow-xl border-4 border-indigo-400/40 relative overflow-hidden">
        <div className="max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Studio • Đào Tạo Giáo Viên Bộ Môn (CLIL / EMI)</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            NÂNG CAO NĂNG LỰC NÓI TIẾNG ANH CHO GIÁO VIÊN TIỂU HỌC
          </h2>
          <p className="text-xs sm:text-sm font-bold text-indigo-200 mt-1 max-w-2xl leading-relaxed">
            Dành cho giáo viên các môn: <strong>Toán, Khoa học, Tin học, Mỹ thuật, Âm nhạc, Thể dục, Lịch sử - Địa lý</strong> theo Khung tham chiếu Châu Âu (CEFR: A1, A2, B1) chuẩn GDPT 2018.
          </p>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {userRole === 'ADMIN' ? (
              <>
                <button
                  onClick={onBackToStudentView}
                  className="px-4 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 border border-blue-300/40 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 text-white"
                  title="Cô Admin chuyển sang Sân Khấu Luyện Nói Học Sinh"
                >
                  <span>🎙️</span>
                  <span>Sang Sân Khấu Luyện Nói Học Sinh</span>
                </button>
                {onOpenAdminStudio && (
                  <button
                    onClick={onOpenAdminStudio}
                    className="px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 border border-rose-300/40 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 text-white"
                    title="Cô Admin chuyển sang Studio Quản Trị"
                  >
                    <span>👑</span>
                    <span>Sang Studio Quản Trị</span>
                  </button>
                )}
              </>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-amber-400/20 border border-amber-300/40 text-xs font-black text-amber-200 flex items-center gap-1.5">
                <span>👩‍🏫</span>
                <span>AI Studio GV Bộ Môn</span>
              </div>
            )}

            <button
              onClick={() => {
                soundEffects.playPop();
                setIsClassroomCommandsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>📢 Bảng Mệnh Lệnh Lớp Học (77+ Khẩu Lệnh)</span>
            </button>

            {practiceTrack === 'SUBJECT' && (
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setIsUnitOverviewModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 border border-indigo-400/40"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📋 Tổng Quan Bài Học</span>
              </button>
            )}

            <button
              onClick={handleGenerateAiScenario}
              disabled={isAiGenerating}
              className={`px-4 py-2 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all ${
                isAiGenerating
                  ? 'bg-purple-400 text-white cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAiGenerating ? 'AI Đang sinh tình huống...' : '✨ AI Sinh Tình Huống Giảng Dạy Mới'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TRACK SELECTOR: MÔN HỌC vs MỆNH LỆNH LỚP HỌC */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-3xl shadow-sm border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2.5">
        <button
          onClick={() => {
            soundEffects.playPop();
            setPracticeTrack('SUBJECT');
          }}
          className={`w-full sm:flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            practiceTrack === 'SUBJECT'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md ring-2 ring-indigo-200'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>BÀI GIẢNG THEO MÔN HỌC (8 MÔN CLIL)</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playPop();
            setPracticeTrack('COMMANDS');
          }}
          className={`w-full sm:flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            practiceTrack === 'COMMANDS'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 shadow-md ring-2 ring-amber-300'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-700" />
          <span>BẢNG MỆNH LỆNH LỚP HỌC ({CLASSROOM_COMMANDS.length}+ KHẨU LỆNH)</span>
        </button>
      </div>

      {/* 1. SELECTION BAR: SUBJECT OR COMMAND CATEGORIES */}
      {practiceTrack === 'SUBJECT' ? (
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                1. Chọn Môn Học Cần Luyện Nói Tiếng Anh:
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {TEACHER_SUBJECTS.length} Môn học tiểu học
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {TEACHER_SUBJECTS.map((sub) => {
              const isSelected = selectedSubject === sub.code;
              return (
                <button
                  key={sub.code}
                  onClick={() => {
                    soundEffects.playPop();
                    setSelectedSubject(sub.code);
                  }}
                  className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-200 scale-102'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">{sub.icon}</span>
                  <span className={`text-xs font-black leading-tight ${isSelected ? 'text-indigo-950 font-black' : 'text-slate-700'}`}>
                    {sub.nameVi}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    {sub.nameEn.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {currentSubjectMeta && (
            <p className="text-xs font-bold text-indigo-700 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-center gap-2">
              <span>💡 <strong>{currentSubjectMeta.nameVi} ({currentSubjectMeta.nameEn}):</strong> {currentSubjectMeta.description}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                1. Chọn Danh Mục Mệnh Lệnh Lớp Học Để Luyện Nói:
              </h3>
            </div>
            <button
              onClick={() => setIsClassroomCommandsModalOpen(true)}
              className="text-xs font-black text-amber-700 hover:text-amber-800 underline flex items-center gap-1"
            >
              <span>Xem dạng sổ tay tra cứu →</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => {
                soundEffects.playPop();
                setSelectedCommandCategory('ALL');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCommandCategory === 'ALL'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Tất cả ({CLASSROOM_COMMANDS.length})
            </button>
            {COMMAND_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                onClick={() => {
                  soundEffects.playPop();
                  setSelectedCommandCategory(cat.code);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCommandCategory === cat.code
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.nameVi}</span>
              </button>
            ))}
          </div>

          <p className="text-xs font-bold text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
            <span>📢 <strong>Luyện nói khẩu lệnh:</strong> Hệ thống tự động chuyển toàn bộ khẩu lệnh điều hành lớp học thành các bài luyện nói trực quan với giọng đọc mẫu, nhận diện giọng nói và chấm điểm tức thì!</span>
          </p>
        </div>
      )}

      {/* 2. CHỌN KHUNG NĂNG LỰC CEFR (A1, A2, B1, TẤT CẢ) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => {
            soundEffects.playPop();
            setSelectedLevel('ALL');
          }}
          className={`p-3 rounded-2xl border-2 text-left transition-all ${
            selectedLevel === 'ALL'
              ? 'border-indigo-600 bg-indigo-50/90 shadow-md ring-2 ring-indigo-200'
              : 'border-slate-200 bg-white hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs sm:text-sm font-black text-indigo-900">✨ TẤT CẢ</span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              Mọi Cấp Độ
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 leading-tight">
            Luyện tập liên tục không giới hạn trình độ.
          </p>
        </button>

        <button
          onClick={() => {
            soundEffects.playPop();
            setSelectedLevel('A1');
          }}
          className={`p-3 rounded-2xl border-2 text-left transition-all ${
            selectedLevel === 'A1'
              ? 'border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-200'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs sm:text-sm font-black text-emerald-800">🌱 CẤP ĐỘ A1</span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Cơ Bản
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 leading-tight">
            Khẩu lệnh ngắn, từ vựng trực quan dễ hiểu.
          </p>
        </button>

        <button
          onClick={() => {
            soundEffects.playPop();
            setSelectedLevel('A2');
          }}
          className={`p-3 rounded-2xl border-2 text-left transition-all ${
            selectedLevel === 'A2'
              ? 'border-blue-500 bg-blue-50/90 shadow-md ring-2 ring-blue-200'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs sm:text-sm font-black text-blue-800">🌿 CẤP ĐỘ A2</span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Sơ Cấp
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 leading-tight">
            Chỉ dẫn 2-3 bước, câu hỏi tương tác tự nhiên.
          </p>
        </button>

        <button
          onClick={() => {
            soundEffects.playPop();
            setSelectedLevel('B1');
          }}
          className={`p-3 rounded-2xl border-2 text-left transition-all ${
            selectedLevel === 'B1'
              ? 'border-purple-500 bg-purple-50/90 shadow-md ring-2 ring-purple-200'
              : 'border-slate-200 bg-white hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs sm:text-sm font-black text-purple-800">🌳 CẤP ĐỘ B1</span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Trung Cấp
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 leading-tight">
            Giảng giải bản chất, thuyết trình & phân tích.
          </p>
        </button>
      </div>

      {/* 2.5A BẢNG TỔNG QUAN KIẾN THỨC BÀI HỌC (UNIT OVERVIEW) - CHỈ HIỂN THỊ CHO TRACK BÀI GIẢNG 8 MÔN CLIL */}
      {practiceTrack === 'SUBJECT' && currentUnitOverview && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-indigo-400/40 relative overflow-hidden space-y-4">
          {/* Top header with badges & toggle */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-indigo-800/60">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <FileText className="w-3.5 h-3.5" />
                <span>TỔNG QUAN KIẾN THỨC BÀI HỌC (UNIT OVERVIEW)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-extrabold text-xs border border-indigo-300/30">
                {currentSubjectMeta?.icon} {currentUnitOverview.subjectNameVi} • Cấp độ {currentUnitOverview.cefrLevel}
              </span>
              <span className="text-xs text-indigo-300 font-medium hidden md:inline">
                (Trình bày trước bài luyện nói giúp giáo viên bộ môn nắm chắc bài giảng)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setIsUnitOverviewModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                title="Mở toàn cảnh tóm tắt bài học"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Xem Toàn Cảnh Modal</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playPop();
                  setIsClassroomCommandsModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                title="Mở sổ tay mệnh lệnh lớp học"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Mệnh Lệnh Lớp Học (77+)</span>
              </button>

              <button
                onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 text-xs font-bold transition-all"
                title={isOverviewExpanded ? 'Thu gọn tóm tắt' : 'Mở rộng tóm tắt'}
              >
                {isOverviewExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible Overview Content */}
          {isOverviewExpanded && (
            <div className="space-y-4 pt-1 animate-fadeIn">
              {/* Unit Title & Objectives */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                    CHỦ ĐỀ TIẾT DẠY:
                  </span>
                  <h4 className="text-base font-black text-white leading-tight">
                    {currentUnitOverview.unitTheme}
                  </h4>
                  <p className="text-xs text-indigo-200 font-medium">
                    Chuẩn GDPT 2018 định hướng giáo dục tích hợp CLIL / EMI.
                  </p>
                </div>

                <div className="md:col-span-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>MỤC TIÊU KIẾN THỨC & NĂNG LỰC SƯ PHẠM:</span>
                  </span>
                  <ul className="space-y-1 text-xs text-indigo-100 font-medium">
                    {currentUnitOverview.lessonObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-black">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Vocabulary & Upcoming Words Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <span>🔤</span>
                    <span>TỪ VỰNG & THUẬT NGỮ TRỌNG TÂM TRONG TIẾT HỌC (BẤM ĐỂ NGHE PHÁT ÂM):</span>
                  </span>
                  <button
                    onClick={() => setIsUnitOverviewModalOpen(true)}
                    className="text-[11px] font-black text-amber-300 hover:text-amber-200 underline"
                  >
                    Xem chi tiết phiên âm & câu ví dụ →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {currentUnitOverview.keyVocabulary.map((v, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between gap-1 group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{v.term}</span>
                          <button
                            onClick={() => playEnglishAudio(v.term)}
                            className="p-1 rounded-md bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-300 block">{v.phonetic}</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-200 truncate">{v.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Classroom Commands for this subject */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>MỆNH LỆNH LỚP HỌC GỢI Ý CHO MÔN {currentSubjectMeta?.nameVi.toUpperCase()}:</span>
                  </span>
                  <button
                    onClick={() => setIsClassroomCommandsModalOpen(true)}
                    className="text-xs font-black text-amber-300 hover:text-amber-200 underline"
                  >
                    Mở kho 77+ khẩu lệnh lớp học →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentUnitOverview.essentialCommands.map((cmd, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-black text-white">"{cmd.commandEn}"</p>
                        <p className="text-[11px] text-amber-200/90 font-medium">👉 {cmd.meaningVi}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => playEnglishAudio(cmd.commandEn)}
                          className="p-1.5 rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 transition-colors"
                          title="Nghe khẩu lệnh"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePracticeSpecificCommand(cmd.commandEn, cmd.meaningVi)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] flex items-center gap-1 transition-colors active:scale-95 shadow-sm"
                          title="Luyện nói khẩu lệnh này trong Studio"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Luyện nói</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2.5B BẢNG KIẾN THỨC MỆNH LỆNH LỚP HỌC (CHỈ DÀNH CHO TRACK BẢNG MỆNH LỆNH LỚP HỌC 77+ KHẨU LỆNH - BỎ TỔNG QUAN BÀI HỌC) */}
      {practiceTrack === 'COMMANDS' && (
        <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-amber-400/40 relative overflow-hidden space-y-4">
          {/* Top header with badges & toggle */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-amber-800/60">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Megaphone className="w-3.5 h-3.5" />
                <span>KIẾN THỨC MỆNH LỆNH LỚP HỌC (CLASSROOM COMMANDS)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-extrabold text-xs border border-amber-300/30">
                {currentCommandCategoryMeta ? `${currentCommandCategoryMeta.icon} ${currentCommandCategoryMeta.nameVi}` : '📢 Tất Cả 77+ Khẩu Lệnh'}
              </span>
              <span className="text-xs text-amber-200/90 font-medium hidden md:inline">
                (Kiến thức & kỹ năng điều hành lớp học bằng tiếng Anh chuẩn GDPT 2018)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setIsClassroomCommandsModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                title="Mở sổ tay tra cứu 77+ khẩu lệnh"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Xem Sổ Tay 77+ Khẩu Lệnh</span>
              </button>

              <button
                onClick={() => setIsCommandKnowledgeExpanded(!isCommandKnowledgeExpanded)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-bold transition-all"
                title={isCommandKnowledgeExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                {isCommandKnowledgeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible Command Knowledge Content */}
          {isCommandKnowledgeExpanded && (
            <div className="space-y-4 pt-1 animate-fadeIn">
              {/* 3 Core Pillars of Classroom Commands */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-amber-400/20 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                    <span>🎯</span>
                    <span>1. NGUYÊN TẮC RÕ RÀNG & DỨT KHOÁT:</span>
                  </span>
                  <p className="text-xs text-amber-100 font-medium leading-relaxed">
                    Sử dụng thể mệnh lệnh trực tiếp (Imperative verbs) như <em>"Stand up"</em>, <em>"Open your book"</em>. Câu ngắn từ 3-7 từ, phát âm dứt khoát giúp học sinh lớp 1-5 hiểu ngay lập tức.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-amber-400/20 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. PHỐI HỢP CỬ CHỈ & LÀM MẪU:</span>
                  </span>
                  <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                    Luôn kết hợp khẩu lệnh với ngôn ngữ cơ thể (Gestures), ánh mắt và hành động làm mẫu (Demonstration) để học sinh nắm bắt ý định mà không cần dịch từng từ sang tiếng Việt.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-amber-400/20 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-sky-300 tracking-wider flex items-center gap-1">
                    <span>🌟</span>
                    <span>3. NGỮ ĐIỆU SƯ PHẠM THÂN THIỆN:</span>
                  </span>
                  <p className="text-xs text-sky-100 font-medium leading-relaxed">
                    Xuống giọng ở cuối câu mệnh lệnh để tạo sự uy nghiêm, nhưng giữ ngữ điệu ấm áp và lịch sự với <em>"please"</em>. Luôn khen ngợi kịp thời <em>"Good job!"</em> khi học sinh hoàn thành.
                  </p>
                </div>
              </div>

              {/* Key Commands Showcase in Selected Category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>CÁC MẪU KHẨU LỆNH TRỌNG TÂM ĐỂ LUYỆN NÓI (BẤM ĐỂ LUYỆN TRỰC TIẾP TRÊN SÂN KHẤU):</span>
                  </span>
                  <button
                    onClick={() => setIsClassroomCommandsModalOpen(true)}
                    className="text-[11px] font-black text-amber-300 hover:text-amber-200 underline"
                  >
                    Xem tất cả 77+ khẩu lệnh →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {featuredCommandsForKnowledge.map((cmd) => (
                    <div
                      key={cmd.id}
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between gap-2 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-black text-white group-hover:text-amber-200 transition-colors">
                            "{cmd.commandEn}"
                          </p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                            cmd.level === 'A1'
                              ? 'bg-emerald-400/30 text-emerald-200 border border-emerald-300/30'
                              : cmd.level === 'A2'
                              ? 'bg-blue-400/30 text-blue-200 border border-blue-300/30'
                              : 'bg-purple-400/30 text-purple-200 border border-purple-300/30'
                          }`}>
                            {cmd.level}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-amber-200/80">{cmd.phonetic}</p>
                        <p className="text-xs font-bold text-amber-300">👉 {cmd.meaningVi}</p>
                        <p className="text-[11px] text-slate-300 font-medium">💡 {cmd.situation}</p>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/10">
                        <button
                          onClick={() => playEnglishAudio(cmd.commandEn)}
                          className="p-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-200 hover:text-amber-950 transition-colors"
                          title="Nghe giọng bản xứ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePracticeSpecificCommand(cmd.commandEn, cmd.meaningVi)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
                          title="Luyện nói ngay trên sân khấu"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Luyện nói</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SÂN KHẤU LUYỆN NÓI TIẾNG ANH NGHỀ NGHIỆP SƯ PHẠM */}
      {!activeLesson ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center text-3xl mb-3">
            👩‍🏫
          </div>
          <h3 className="text-lg font-black text-slate-800">
            Chưa có tình huống mẫu cho bộ môn hoặc danh mục này ở cấp độ đã chọn.
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-1 max-w-md mx-auto">
            Thầy/Cô hãy thử đổi cấp độ CEFR sang "Tất cả" hoặc bấm nút <strong>"AI Sinh Tình Huống Mới"</strong> để Gemini tự động soạn bài tập nhé!
          </p>
          <button
            onClick={handleGenerateAiScenario}
            className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-md"
          >
            ✨ Tạo tình huống bằng AI ngay
          </button>
        </div>
      ) : (
        <div
          id="teacher-speaking-stage"
          className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-slate-200/80 relative overflow-hidden"
        >
          {/* Header tags */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-black text-indigo-700">
                {activeLesson.emoji} {activeLesson.subjectNameVi} • CEFR {activeLesson.cefrLevel}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
                Tình huống: {activeLesson.scenario}
              </span>
            </div>

            <span className="text-xs font-black text-slate-400">
              Bài {currentIndex + 1} / {filteredLessons.length}
            </span>
          </div>

          {/* Real classroom context */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm flex-shrink-0 font-black shadow-sm">
              🏫
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Ngữ cảnh sư phạm trong lớp học:</p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">{activeLesson.teachingContext}</p>
            </div>
          </div>

          {/* Main prompt for teacher */}
          <div className="text-center my-6">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
              Câu Tiếng Anh Giáo Viên Cần Phát Âm:
            </p>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 max-w-3xl mx-auto leading-relaxed">
              "{activeLesson.englishPrompt}"
            </h2>

            {activeLesson.phonetic && (
              <p className="text-xs sm:text-sm font-mono text-indigo-600 mt-2 bg-indigo-50/70 px-3 py-1 rounded-lg border border-indigo-100 inline-block">
                {activeLesson.phonetic}
              </p>
            )}

            <p className="text-sm sm:text-base font-bold text-slate-600 mt-3 max-w-2xl mx-auto">
              👉 Nghĩa tiếng Việt: <span className="text-slate-800">{activeLesson.vietnameseMeaning}</span>
            </p>

            {/* Key Terms pills */}
            {activeLesson.keyTerms && activeLesson.keyTerms.length > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap mt-3">
                <span className="text-[11px] font-bold text-slate-400">Thuật ngữ trọng tâm:</span>
                {activeLesson.keyTerms.map((term, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-black text-[11px] border border-indigo-200"
                  >
                    {term}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Simulated Student Reaction Box */}
          {activeLesson.studentReaction && (
            <div className="max-w-xl mx-auto mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center text-base shadow-sm">
                  👧👦
                </div>
                <div>
                  <p className="text-[11px] font-black text-amber-900">Phản xạ của học sinh tiểu học:</p>
                  <p className="text-xs font-bold text-slate-800 italic">"{activeLesson.studentReaction}"</p>
                </div>
              </div>

              <button
                onClick={handlePlayStudentReaction}
                className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-black text-[11px] flex items-center gap-1 transition-colors"
                title="Bấm để nghe học sinh đáp lại"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe đáp</span>
              </button>
            </div>
          )}

          {/* Interactive controls */}
          <div className="flex flex-col items-center justify-center gap-4 my-6">
            {/* Speed toggle */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setAudioSpeed(0.8);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  audioSpeed === 0.8 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                🐢 0.8x (Nghe chuẩn từng âm)
              </button>
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setAudioSpeed(1.0);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  audioSpeed === 1.0 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                🐰 1.0x (Tốc độ giảng tự nhiên)
              </button>
            </div>

            {/* Listen & Mic Buttons */}
            <div className="flex items-center justify-center gap-5 sm:gap-8">
              <button
                onClick={handlePlayModelAudio}
                disabled={isPlayingAudio}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center gap-1 shadow-lg border-2 border-indigo-200 transition-transform active:scale-90 ${
                  isPlayingAudio
                    ? 'bg-indigo-300 text-white animate-pulse'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:scale-105'
                }`}
                title="Nghe phát âm chuẩn sư phạm"
              >
                <Volume2 className="w-7 h-7 sm:w-8 sm:h-8" />
                <span className="text-[10px] font-black">NGHE MẪU</span>
              </button>

              <button
                onClick={toggleListening}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center gap-1 shadow-xl transition-all active:scale-95 border-4 border-white ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse-mic ring-8 ring-red-200 scale-105'
                    : 'bg-gradient-to-tr from-red-500 to-rose-600 hover:from-red-400 text-white shadow-red-500/40 hover:scale-105'
                }`}
                title="Thầy cô bấm để phát âm câu giảng"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
                    <span className="text-[10px] font-black uppercase">ĐANG THU</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
                    <span className="text-[10px] font-black uppercase">BẤM ĐỂ NÓI</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePlayTeacherVoice}
                disabled={(!teacherAudioUrl && !spokenTranscript) || isPlayingTeacherVoice}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center gap-1 shadow-md border-2 transition-all ${
                  teacherAudioUrl || spokenTranscript
                    ? isPlayingTeacherVoice
                      ? 'bg-emerald-400 text-white animate-pulse border-emerald-500 scale-105 ring-4 ring-emerald-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-60'
                }`}
                title={
                  teacherAudioUrl || spokenTranscript
                    ? 'Nghe lại giọng giảng của Thầy/Cô'
                    : 'Hãy bấm nói vào micro trước để nghe lại'
                }
              >
                <Play className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="text-[9px] font-black leading-tight text-center">
                  {isPlayingTeacherVoice ? 'ĐANG PHÁT' : 'GIỌNG THẦY/CÔ'}
                </span>
              </button>
            </div>
          </div>

          {/* Evaluation card */}
          {evaluation && (
            <div
              className={`w-full max-w-2xl mx-auto rounded-3xl p-5 border-2 transition-all ${
                evaluation.similarityScore >= 70
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-amber-50 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-black text-slate-800">
                    Độ chính xác phát âm: <strong className="text-indigo-700">{evaluation.similarityScore}%</strong>
                  </span>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-white border border-slate-200">
                  {evaluation.similarityScore >= 80 ? 'Chuẩn Sư Phạm 🌟' : 'Khá Tốt 👍'}
                </span>
              </div>

              {/* Word by word breakdown */}
              <div className="flex flex-wrap gap-1.5 my-2">
                {evaluation.wordEvaluations.map((w, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      w.accuracy >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : w.accuracy >= 45
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {w.word}
                  </span>
                ))}
              </div>

              {spokenTranscript && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 flex-wrap gap-2">
                  <p className="text-xs font-medium text-slate-600">
                    Máy nhận diện: <strong className="text-slate-800 italic">"{spokenTranscript}"</strong>
                  </p>
                  <button
                    onClick={handlePlayTeacherVoice}
                    disabled={isPlayingTeacherVoice}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                      isPlayingTeacherVoice
                        ? 'bg-emerald-400 text-white animate-pulse'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                    }`}
                    title="Bấm để nghe lại giọng phát âm của Thầy/Cô"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isPlayingTeacherVoice ? 'Đang phát...' : '🔊 Nghe lại giọng Thầy/Cô'}</span>
                  </button>
                </div>
              )}

              {activeLesson.pedagogicalNote && (
                <p className="text-xs font-bold text-indigo-900 bg-white/70 p-2.5 rounded-xl border border-indigo-100 mt-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Lưu ý sư phạm: {activeLesson.pedagogicalNote}</span>
                </p>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                soundEffects.playPop();
                if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
                resetAttempt();
              }}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                currentIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{practiceTrack === 'COMMANDS' ? 'Khẩu Lệnh Trước' : 'Tình Huống Trước'}</span>
            </button>

            <button
              onClick={resetAttempt}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Luyện Lại</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playPop();
                if (currentIndex < filteredLessons.length - 1) {
                  setCurrentIndex((prev) => prev + 1);
                } else {
                  soundEffects.playVictoryFanfare();
                  confetti({ particleCount: 70, spread: 80 });
                  alert(`🎉 Thầy/Cô đã hoàn thành tất cả các bài luyện trong danh mục này!`);
                  setCurrentIndex(0);
                }
                resetAttempt();
              }}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <span>
                {currentIndex < filteredLessons.length - 1
                  ? practiceTrack === 'COMMANDS'
                    ? 'Khẩu Lệnh Tiếp Theo'
                    : 'Tình Huống Tiếp Theo'
                  : 'Hoàn Thành!'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. SỔ TAY MẪU CÂU TIẾNG ANH LỚP HỌC (CLASSROOM ENGLISH PHRASEBOOK) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
              {practiceTrack === 'COMMANDS'
                ? 'SỔ TAY MỆNH LỆNH LỚP HỌC (TRA CỨU & NGHE PHÁT ÂM NHANH)'
                : `SỔ TAY MẪU CÂU GIẢNG DẠY MÔN ${currentSubjectMeta?.nameVi.toUpperCase()} (PHRASEBOOK)`}
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={phraseSearch}
              onChange={(e) => setPhraseSearch(e.target.value)}
              placeholder="Tìm kiếm mẫu câu..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-indigo-600 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {filteredLessons
            .filter(
              (l) =>
                !phraseSearch ||
                l.englishPrompt.toLowerCase().includes(phraseSearch.toLowerCase()) ||
                l.vietnameseMeaning.toLowerCase().includes(phraseSearch.toLowerCase())
            )
            .map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs hover:border-amber-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {item.cefrLevel}
                    </span>
                    <span className="text-xs font-black text-slate-800">{item.scenario}</span>
                  </div>
                  <p className="font-bold text-indigo-900 italic">"{item.englishPrompt}"</p>
                  <p className="text-[11px] text-slate-600">{item.vietnameseMeaning}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => playEnglishAudio(item.englishPrompt)}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handlePracticeSpecificCommand(item.englishPrompt, item.vietnameseMeaning)}
                    className="p-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200"
                    title="Luyện nói câu này"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopyPhrase(item.englishPrompt, item.id)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                    title="Sao chép mẫu câu"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Hidden audio element for teacher voice playback */}
      <audio
        ref={teacherAudioPlayerRef}
        src={teacherAudioUrl || undefined}
        preload="auto"
        onPlay={() => setIsPlayingTeacherVoice(true)}
        onEnded={() => setIsPlayingTeacherVoice(false)}
        onPause={() => setIsPlayingTeacherVoice(false)}
        onError={() => {
          setIsPlayingTeacherVoice(false);
          if (spokenTranscript) {
            playEnglishAudio(spokenTranscript, 0.9, 1.0);
          }
        }}
      />

      {/* Unit Overview Modal for Teachers */}
      {currentUnitOverview && (
        <TeacherUnitOverviewModal
          overview={currentUnitOverview}
          isOpen={isUnitOverviewModalOpen}
          onClose={() => setIsUnitOverviewModalOpen(false)}
          onOpenClassroomCommands={() => {
            setIsUnitOverviewModalOpen(false);
            setIsClassroomCommandsModalOpen(true);
          }}
          onSelectCommandPractice={(commandEn, meaningVi) => {
            handlePracticeSpecificCommand(commandEn, meaningVi);
          }}
        />
      )}

      {/* Classroom Commands Modal */}
      <ClassroomCommandsModal
        isOpen={isClassroomCommandsModalOpen}
        onClose={() => setIsClassroomCommandsModalOpen(false)}
        currentSubject={selectedSubject}
        onSelectForStudioPractice={(cmd) => {
          soundEffects.playPop();
          setPracticeTrack('COMMANDS');
          setSelectedCommandCategory('ALL');
          const targetPrompt = cmd.commandEn.toLowerCase();
          const foundIdx = commandLessons.findIndex(
            (cl) => cl.englishPrompt.toLowerCase() === targetPrompt
          );
          if (foundIdx >= 0) {
            setCurrentIndex(foundIdx);
          }
          setIsClassroomCommandsModalOpen(false);
          resetAttempt();
          setTimeout(() => {
            document.getElementById('teacher-speaking-stage')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
        onStartAllCommandsPractice={() => {
          soundEffects.playPop();
          setPracticeTrack('COMMANDS');
          setSelectedCommandCategory('ALL');
          setCurrentIndex(0);
          setIsClassroomCommandsModalOpen(false);
          resetAttempt();
          setTimeout(() => {
            document.getElementById('teacher-speaking-stage')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
      />
    </div>
  );
};

