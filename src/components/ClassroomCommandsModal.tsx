import React, { useState, useRef, useEffect } from 'react';
import { ClassroomCommandItem, CommandCategory, TeacherSubject, CefrLevel, PronunciationResult } from '../types';
import { CLASSROOM_COMMANDS, COMMAND_CATEGORIES } from '../data/classroomCommands';
import { soundEffects } from '../utils/audioSynthesizer';
import { playEnglishAudio, evaluateSpeechAccuracy } from '../utils/speechUtils';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  Copy,
  Check,
  Search,
  Megaphone,
  Mic,
  MicOff,
  Sparkles,
  RotateCcw,
  Play,
  ArrowRight,
  Flame,
  Award,
  Layers
} from 'lucide-react';

interface ClassroomCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject?: TeacherSubject;
  onSelectForStudioPractice?: (command: ClassroomCommandItem) => void;
  onStartAllCommandsPractice?: () => void;
}

export const ClassroomCommandsModal: React.FC<ClassroomCommandsModalProps> = ({
  isOpen,
  onClose,
  currentSubject,
  onSelectForStudioPractice,
  onStartAllCommandsPractice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // In-modal speaking practice state
  const [activePracticeCmdId, setActivePracticeCmdId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<PronunciationResult | null>(null);
  const [teacherAudioUrl, setTeacherAudioUrl] = useState<string | null>(null);
  const [isPlayingTeacherAudio, setIsPlayingTeacherAudio] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const teacherAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const teacherAudioUrlRef = useRef<string | null>(null);

  // Clean up recording & streams on unmount or close
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const cleanupRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (teacherAudioUrlRef.current) {
      try {
        URL.revokeObjectURL(teacherAudioUrlRef.current);
      } catch (e) {}
      teacherAudioUrlRef.current = null;
    }
    if (teacherAudioPlayerRef.current) {
      teacherAudioPlayerRef.current.pause();
    }
  };

  if (!isOpen) return null;

  const handlePlayAudio = (command: ClassroomCommandItem) => {
    soundEffects.playPop();
    setPlayingId(command.id);
    playEnglishAudio(command.commandEn, 0.9, 1.0, () => {
      setPlayingId(null);
    });
  };

  const handleCopy = (command: ClassroomCommandItem) => {
    navigator.clipboard.writeText(command.commandEn);
    setCopiedId(command.id);
    soundEffects.playPop();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePractice = (command: ClassroomCommandItem) => {
    soundEffects.playPop();
    if (activePracticeCmdId === command.id) {
      // Close practice
      stopPractice();
      setActivePracticeCmdId(null);
    } else {
      stopPractice();
      setActivePracticeCmdId(command.id);
      setSpokenTranscript('');
      setEvaluation(null);
      setTeacherAudioUrl(null);
    }
  };

  const stopPractice = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (teacherAudioPlayerRef.current) {
      teacherAudioPlayerRef.current.pause();
      setIsPlayingTeacherAudio(false);
    }
  };

  // Start in-modal microphone recording and speech recognition
  const startRecordingPractice = async (command: ClassroomCommandItem) => {
    soundEffects.playPop();
    setSpokenTranscript('');
    setEvaluation(null);
    setTeacherAudioUrl(null);

    // Audio stream for playback
    try {
      if (!streamRef.current || !streamRef.current.active) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      audioChunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const totalSize = audioChunksRef.current.reduce((acc, c) => acc + c.size, 0);
        if (totalSize > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
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
    } catch (e) {
      console.warn('Microphone recording not available:', e);
    }

    // Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt chưa hỗ trợ nhận diện giọng nói Web Speech. Vui lòng thử trên Chrome hoặc Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);

        const evalResult = evaluateSpeechAccuracy(transcript, command.commandEn);
        setEvaluation(evalResult);

        if (evalResult.similarityScore >= 80) {
          soundEffects.playVictoryFanfare();
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } else {
          soundEffects.playEncouragingChime();
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        stopMediaRecorderOnly();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopMediaRecorderOnly();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopMediaRecorderOnly = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const handleStopRecordingPractice = () => {
    soundEffects.playPop();
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
    stopMediaRecorderOnly();
  };

  const handlePlayTeacherAudio = () => {
    if (!teacherAudioUrl) return;
    soundEffects.playPop();

    if (!teacherAudioPlayerRef.current) {
      teacherAudioPlayerRef.current = new Audio(teacherAudioUrl);
      teacherAudioPlayerRef.current.onended = () => setIsPlayingTeacherAudio(false);
    } else {
      teacherAudioPlayerRef.current.src = teacherAudioUrl;
    }

    setIsPlayingTeacherAudio(true);
    teacherAudioPlayerRef.current.play().catch(() => setIsPlayingTeacherAudio(false));
  };

  const filteredCommands = CLASSROOM_COMMANDS.filter((cmd) => {
    if (selectedCategory !== 'ALL' && cmd.category !== selectedCategory) return false;
    if (selectedLevel !== 'ALL' && cmd.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = cmd.commandEn.toLowerCase().includes(q);
      const matchVi = cmd.meaningVi.toLowerCase().includes(q);
      const matchSit = cmd.situation.toLowerCase().includes(q);
      if (!matchEn && !matchVi && !matchSit) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 sm:p-6 flex items-start justify-between">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-white text-amber-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                <span>Classroom Commands • Khẩu Lệnh Sư Phạm</span>
              </span>
              <span className="px-3 py-0.5 rounded-full bg-amber-900/40 text-amber-100 font-extrabold text-xs border border-amber-300/30">
                {CLASSROOM_COMMANDS.length}+ Khẩu Lệnh Chuẩn GDPT 2018 & CEFR
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase shadow-sm">
                Đã tích hợp Luyện nói trực tiếp
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              BẢNG MỆNH LỆNH & KHẨU LỆNH TIẾNG ANH LỚP HỌC CHO GIÁO VIÊN BỘ MÔN
            </h2>
            <p className="text-xs text-amber-100 font-medium">
              Thực hành phát âm chuẩn, chấm điểm giọng nói tự động và nghe lại giọng nói của Thầy/Cô cho từng khẩu lệnh điều hành lớp học.
            </p>
          </div>

          <button
            onClick={() => {
              soundEffects.playPop();
              cleanupRecording();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all flex-shrink-0"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action banner: Practice all in Studio */}
        {onStartAllCommandsPractice && (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 px-4 py-2.5 text-white flex items-center justify-between gap-3 flex-wrap border-b border-indigo-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="text-xs font-bold text-indigo-100">
                Thầy/Cô muốn luyện tập toàn bộ danh mục khẩu lệnh này theo lộ trình bài bản trên sân khấu AI?
              </span>
            </div>
            <button
              onClick={() => {
                soundEffects.playPop();
                cleanupRecording();
                onStartAllCommandsPractice();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-xs shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>🎯 Luyện Toàn Bộ Mệnh Lệnh Trên AI Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filters and search */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 space-y-3">
          {/* Categories pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Tất cả ({CLASSROOM_COMMANDS.length})
            </button>
            {COMMAND_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setSelectedCategory(cat.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.code
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.nameVi}</span>
              </button>
            ))}
          </div>

          {/* Level filter & Search input */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">Khung CEFR:</span>
              {['ALL', 'A1', 'A2', 'B1'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    selectedLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl === 'ALL' ? 'Tất cả cấp độ' : lvl}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm: Tiếng Anh, tiếng Việt, tình huống..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-amber-500 outline-none bg-white shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Commands List */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3.5 flex-1 bg-slate-100/60">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-bold text-xs bg-white rounded-2xl border border-slate-200 p-6">
              Không tìm thấy mệnh lệnh nào phù hợp với từ khóa tìm kiếm của Thầy/Cô.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCommands.map((item) => {
                const isPlaying = playingId === item.id;
                const isCopied = copiedId === item.id;
                const isPracticingThis = activePracticeCmdId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-3 shadow-sm ${
                      isPracticingThis
                        ? 'border-2 border-indigo-500 ring-4 ring-indigo-100 bg-gradient-to-b from-white to-indigo-50/30'
                        : 'border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{item.icon || '📢'}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            {item.categoryVi}
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          CEFR {item.level}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        "{item.commandEn}"
                      </h4>

                      <p className="text-xs font-mono text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-md inline-block border border-amber-200/60">
                        {item.phonetic}
                      </p>

                      <p className="text-xs font-bold text-slate-700">
                        👉 Nghĩa: <span className="text-slate-950 font-semibold">{item.meaningVi}</span>
                      </p>

                      <p className="text-[11px] font-medium text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        💡 Tình huống sư phạm: {item.situation}
                      </p>
                    </div>

                    {/* Integrated In-Modal Speaking Practice Console */}
                    {isPracticingThis && (
                      <div className="mt-2 p-3.5 rounded-2xl bg-indigo-50/80 border-2 border-indigo-200 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-indigo-600" />
                            <span>PHÒNG LUYỆN NÓI KHẨU LỆNH TỨC THÌ</span>
                          </span>
                          {evaluation && (
                            <span
                              className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                                evaluation.similarityScore >= 80
                                  ? 'bg-emerald-500 text-white'
                                  : evaluation.similarityScore >= 60
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-rose-500 text-white'
                              }`}
                            >
                              Độ chuẩn: {evaluation.similarityScore}%
                            </span>
                          )}
                        </div>

                        {/* Speech recognition output */}
                        {spokenTranscript ? (
                          <div className="p-2.5 rounded-xl bg-white border border-indigo-200 text-xs space-y-1">
                            <p className="text-[11px] font-bold text-slate-500">Thầy/Cô vừa phát âm:</p>
                            <p className="font-bold text-slate-900 text-sm">"{spokenTranscript}"</p>
                            {evaluation && (
                              <p className="text-[11px] font-bold text-indigo-700">
                                💬 {evaluation.feedbackMessage}
                              </p>
                            )}
                          </div>
                        ) : isListening ? (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2 animate-pulse">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                            <span>Đang lắng nghe Thầy/Cô phát âm khẩu lệnh... Hãy nói to và rõ ràng!</span>
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-white/70 border border-indigo-100 text-[11px] text-slate-500 font-medium">
                            Bấm nút <strong>"Bắt đầu ghi âm & luyện nói"</strong> bên dưới rồi đọc khẩu lệnh tiếng Anh này.
                          </div>
                        )}

                        {/* Practice buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {!isListening ? (
                            <button
                              onClick={() => startRecordingPractice(item)}
                              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              <span>Bắt đầu nói</span>
                            </button>
                          ) : (
                            <button
                              onClick={handleStopRecordingPractice}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm animate-pulse active:scale-95 transition-all"
                            >
                              <MicOff className="w-3.5 h-3.5" />
                              <span>Dừng & Chấm điểm</span>
                            </button>
                          )}

                          {teacherAudioUrl && (
                            <button
                              onClick={handlePlayTeacherAudio}
                              disabled={isPlayingTeacherAudio}
                              className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{isPlayingTeacherAudio ? 'Đang nghe lại...' : 'Nghe lại giọng Thầy/Cô'}</span>
                            </button>
                          )}

                          {onSelectForStudioPractice && (
                            <button
                              onClick={() => {
                                soundEffects.playPop();
                                cleanupRecording();
                                onSelectForStudioPractice(item);
                              }}
                              className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-black flex items-center gap-1 transition-all active:scale-95 ml-auto"
                              title="Chuyển vào AI Studio để luyện sâu cùng học sinh mô phỏng"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                              <span>Mở AI Studio</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Standard Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePlayAudio(item)}
                          disabled={isPlaying}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
                            isPlaying
                              ? 'bg-amber-400 text-amber-950 animate-pulse'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
                          }`}
                          title="Nghe phát âm mẫu chuẩn khẩu lệnh"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{isPlaying ? 'Đang phát...' : 'Mẫu'}</span>
                        </button>

                        <button
                          onClick={() => handleTogglePractice(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                            isPracticingThis
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-950'
                          }`}
                          title="Luyện nói khẩu lệnh này trực tiếp bằng micro"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{isPracticingThis ? 'Đang luyện' : 'Luyện nói'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onSelectForStudioPractice && (
                          <button
                            onClick={() => {
                              soundEffects.playPop();
                              cleanupRecording();
                              onSelectForStudioPractice(item);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-black border border-purple-200 flex items-center gap-1 transition-all active:scale-95"
                            title="Đưa vào AI Studio để luyện tập sâu"
                          >
                            <span>Luyện sâu</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => handleCopy(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Sao chép câu tiếng Anh"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-black">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Chép</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:px-6 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-600">
            Tổng cộng: <strong>{filteredCommands.length}</strong> / {CLASSROOM_COMMANDS.length} khẩu lệnh sư phạm tiếng Anh
          </p>

          <button
            onClick={() => {
              soundEffects.playPop();
              cleanupRecording();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs shadow-md transition-all active:scale-95"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
