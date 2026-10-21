import React, { useState, useEffect, useRef } from 'react';
import { ExerciseItem, CognitiveLevel, PronunciationResult } from '../types';
import { UnitDefinition, GRADE_UNITS } from '../data/curriculum';
import { soundEffects } from '../utils/audioSynthesizer';
import { playEnglishAudio, evaluateSpeechAccuracy } from '../utils/speechUtils';
import {
  Mic,
  MicOff,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Filter,
  Layers,
  Star,
  Trophy,
  X,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeStageProps {
  currentGrade: number;
  currentLevel: CognitiveLevel;
  selectedUnit: string;
  onGradeChange: (g: number) => void;
  onLevelChange: (l: CognitiveLevel) => void;
  onUnitChange: (unit: string) => void;
  questions: ExerciseItem[];
  allGradeQuestions: ExerciseItem[];
  onCompleteExercise: (exerciseId: string, stars: number, score: number) => void;
}

export const PracticeStage: React.FC<PracticeStageProps> = ({
  currentGrade,
  currentLevel,
  selectedUnit,
  onGradeChange,
  onLevelChange,
  onUnitChange,
  questions,
  allGradeQuestions,
  onCompleteExercise,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(0.85); // 0.75x turtle or 0.85x / 1.0x
  
  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<PronunciationResult | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  // Celebratory effect for stars / high score
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    stars: number;
    score: number;
    targetWord: string;
    spokenText: string;
    isCompleteUnit?: boolean;
  } | null>(null);

  // Student recorded voice playback
  const [studentAudioUrl, setStudentAudioUrl] = useState<string | null>(null);
  const [isPlayingStudentVoice, setIsPlayingStudentVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingActiveRef = useRef<boolean>(false);
  const studentAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const studentAudioUrlRef = useRef<string | null>(null);

  // Recognition ref & anti-race locks
  const recognitionRef = useRef<any>(null);
  const isStartingListeningRef = useRef<boolean>(false);
  const listeningTimeoutRef = useRef<any>(null);

  // Previous filters ref to ONLY reset currentIndex when filters genuinely change
  const prevFilterRef = useRef({
    grade: currentGrade,
    level: currentLevel,
    unit: selectedUnit,
  });

  // Available units for current grade
  const availableUnits: UnitDefinition[] = GRADE_UNITS[currentGrade] || [];

  // Safe question access
  const safeIndex = questions.length > 0 ? Math.min(currentIndex, questions.length - 1) : 0;
  const currentQ: ExerciseItem | undefined = questions[safeIndex] || questions[0];

  // ONLY reset currentIndex to 0 when Grade, Level, or Unit filter genuinely changes
  useEffect(() => {
    const prev = prevFilterRef.current;
    const filterChanged =
      prev.grade !== currentGrade ||
      prev.level !== currentLevel ||
      prev.unit !== selectedUnit;

    if (filterChanged) {
      prevFilterRef.current = {
        grade: currentGrade,
        level: currentLevel,
        unit: selectedUnit,
      };
      setCurrentIndex(0);
      resetAttempt();
      setMicNotice(null);
      setCelebrationData(null);
    }
  }, [currentGrade, currentLevel, selectedUnit]);

  // Clamp currentIndex if question list shrinks
  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      setCurrentIndex(Math.max(0, questions.length - 1));
    }
  }, [questions.length, currentIndex]);

  // Clean up media stream, timeouts, and recognition on unmount
  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (studentAudioUrlRef.current) {
        try {
          URL.revokeObjectURL(studentAudioUrlRef.current);
        } catch (e) {}
      }
    };
  }, []);

  const resetAttempt = () => {
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
    setSpokenTranscript('');
    setEvaluation(null);
    setStudentAudioUrl(null);
    if (studentAudioUrlRef.current) {
      try {
        URL.revokeObjectURL(studentAudioUrlRef.current);
      } catch (e) {}
      studentAudioUrlRef.current = null;
    }
    if (studentAudioPlayerRef.current) {
      studentAudioPlayerRef.current.pause();
      studentAudioPlayerRef.current.currentTime = 0;
    }
    setIsPlayingStudentVoice(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    isStartingListeningRef.current = false;
    stopMediaRecording();
  };

  // Play model audio (either teacher custom audio or Web Speech TTS)
  const handlePlayModelAudio = () => {
    if (!currentQ) return;
    soundEffects.playPop();

    if (currentQ.audioModelUrl) {
      const audio = new Audio(currentQ.audioModelUrl);
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play().catch(() => {
        // Fallback to TTS if blob fails
        playEnglishAudio(currentQ.word, audioSpeed, 1.05, () => setIsPlayingAudio(false));
      });
      return;
    }

    setIsPlayingAudio(true);
    playEnglishAudio(currentQ.word, audioSpeed, 1.05, () => {
      setIsPlayingAudio(false);
    });
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

  // Start student media recording (for voice playback)
  const startMediaRecording = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    isRecordingActiveRef.current = true;
    audioChunksRef.current = [];

    try {
      let stream = streamRef.current;
      const isStreamAlive = stream && stream.active && stream.getAudioTracks().some((t) => t.readyState === 'live');
      if (!isStreamAlive) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;
      }

      // If user speech already ended while awaiting mic stream
      if (!isRecordingActiveRef.current || !stream) return;

      const mimeType = getSupportedAudioMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const actualType = recorder.mimeType || mimeType || 'audio/webm';
        const totalSize = audioChunksRef.current.reduce((acc, c) => acc + c.size, 0);
        if (totalSize > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: actualType });
          const url = URL.createObjectURL(audioBlob);
          if (studentAudioUrlRef.current) {
            try {
              URL.revokeObjectURL(studentAudioUrlRef.current);
            } catch (e) {}
          }
          studentAudioUrlRef.current = url;
          setStudentAudioUrl(url);
        }
      };

      // 100ms timeslice ensures chunks arrive continuously even for short single-word utterances
      recorder.start(100);
    } catch (err) {
      console.warn('Microphone recording error for playback:', err);
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

  // Toggle Speech Recognition
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
      setMicNotice(
        '⚠️ Trình duyệt của bạn chưa bật Web Speech API. Bé hãy mở trên Google Chrome hoặc Microsoft Edge để luyện phát âm nhé!'
      );
      return;
    }

    if (isStartingListeningRef.current || isListening) {
      return;
    }
    isStartingListeningRef.current = true;
    setMicNotice(null);

    soundEffects.playPop();

    // Cleanly abort previous session to avoid InvalidStateError in Chromium
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    resetAttempt();

    // Start microphone recording pipeline for student voice playback
    startMediaRecording();

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        isStartingListeningRef.current = false;

        // Auto 12s safety timeout if user stays completely silent
        if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
        listeningTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (e) {}
          }
          setIsListening(false);
          stopMediaRecording();
          setMicNotice('⏰ Hết thời gian chờ. Con hãy bấm lại micro và nói to dõng dạc câu tiếng Anh nhé!');
        }, 12000);
      };

      rec.onresult = (event: any) => {
        if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        handleEvaluate(transcript);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
        setIsListening(false);
        isStartingListeningRef.current = false;
        stopMediaRecording();

        if (event.error === 'no-speech') {
          setMicNotice('🔇 Micro chưa nghe rõ tiếng con. Con hãy bấm lại và nói to dõng dạc hơn nhé!');
        } else if (event.error === 'not-allowed') {
          setMicNotice('⚠️ Trình duyệt chưa được cấp quyền Micro. Con hãy bấm cho phép (Allow) Micro trên thanh địa chỉ nhé!');
        } else if (event.error === 'network') {
          setMicNotice('🌐 Nhận diện giọng nói cần kết nối internet. Bé kiểm tra lại WiFi/kết nối mạng nhé!');
        } else if (event.error === 'audio-capture') {
          setMicNotice('🎙️ Không tìm thấy thiết bị micro hoặc micro đang bị ứng dụng khác khóa!');
        } else if (event.error !== 'aborted') {
          setMicNotice('💡 Chưa nhận diện được giọng nói. Con bấm lại để thử lại nhé!');
        }
      };

      rec.onend = () => {
        if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
        setIsListening(false);
        isStartingListeningRef.current = false;
        stopMediaRecording();
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      isStartingListeningRef.current = false;
      stopMediaRecording();
      setMicNotice('⚠️ Không thể khởi động micro. Bé hãy thử bấm lại nhé!');
    }
  };

  const stopListening = () => {
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    isStartingListeningRef.current = false;
    stopMediaRecording();
  };

  // Evaluate student speech and celebrate correct pronunciation & earned stars
  const handleEvaluate = (spoken: string) => {
    if (!currentQ) return;
    const result = evaluateSpeechAccuracy(spoken, currentQ.word);
    setEvaluation(result);

    if (result.earnedStars > 0 || result.similarityScore >= 65) {
      // 1. Victory fanfare audio arpeggio + Star ding
      soundEffects.playVictoryFanfare();
      setTimeout(() => soundEffects.playStarPing(), 450);

      // 2. Double confetti fireworks cannon
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { x: 0.15, y: 0.65 },
        colors: ['#fbbf24', '#f59e0b', '#3b82f6', '#10b981', '#ec4899'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 65,
          origin: { x: 0.85, y: 0.65 },
          colors: ['#fbbf24', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e'],
        });
      }, 200);

      // 3. Open celebratory star modal
      setCelebrationData({
        isOpen: true,
        stars: result.earnedStars,
        score: result.similarityScore,
        targetWord: currentQ.word,
        spokenText: spoken,
        isCompleteUnit: false,
      });

      onCompleteExercise(currentQ.id, result.earnedStars, result.similarityScore);
    } else {
      soundEffects.playEncouragingChime();
      if (result.earnedStars > 0) {
        onCompleteExercise(currentQ.id, result.earnedStars, result.similarityScore);
      }
    }

    // Try requesting deep coach feedback from backend if available
    tryFetchAiCoach(currentQ.word, spoken);
  };

  const tryFetchAiCoach = async (target: string, spoken: string) => {
    try {
      setIsAiAnalyzing(true);
      const res = await fetch('/api/ai/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetWord: target, spokenText: spoken, grade: currentGrade }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.feedback && data.tips) {
          setEvaluation((prev) =>
            prev
              ? {
                  ...prev,
                  feedbackMessage: data.feedback,
                  tips: data.tips,
                }
              : null
          );
        }
      }
    } catch (e) {
      // Ignore background network failure, local evaluation is already present
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Play student's recorded audio (with multi-layer fallback so student always hears their voice clearly)
  const handlePlayStudentVoice = () => {
    if (isPlayingStudentVoice) {
      if (studentAudioPlayerRef.current) {
        studentAudioPlayerRef.current.pause();
        studentAudioPlayerRef.current.currentTime = 0;
      }
      setIsPlayingStudentVoice(false);
      return;
    }

    // Layer 1: Native recorded voice from studentAudioPlayerRef
    if (studentAudioUrl && studentAudioPlayerRef.current) {
      setIsPlayingStudentVoice(true);
      studentAudioPlayerRef.current.currentTime = 0;
      studentAudioPlayerRef.current
        .play()
        .then(() => {
          // Playing successfully
        })
        .catch((err) => {
          console.warn('Direct media playback failed, falling back to speech synthesis:', err);
          // Layer 2: Speech synthesis of the recognized words with child pitch
          if (spokenTranscript) {
            playEnglishAudio(spokenTranscript, 0.85, 1.25, () => {
              setIsPlayingStudentVoice(false);
            });
          } else if (currentQ) {
            playEnglishAudio(currentQ.word, 0.85, 1.25, () => {
              setIsPlayingStudentVoice(false);
            });
          } else {
            setIsPlayingStudentVoice(false);
          }
        });
    } else if (spokenTranscript) {
      // Layer 2 Fallback: If recorder didn't save blob, play student's recognized words immediately
      setIsPlayingStudentVoice(true);
      playEnglishAudio(spokenTranscript, 0.85, 1.25, () => {
        setIsPlayingStudentVoice(false);
      });
    } else if (currentQ) {
      // Layer 3: Play target word in student voice pitch
      setIsPlayingStudentVoice(true);
      playEnglishAudio(currentQ.word, 0.85, 1.25, () => {
        setIsPlayingStudentVoice(false);
      });
    }
  };

  const handleNext = () => {
    soundEffects.playPop();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetAttempt();
      setMicNotice(null);
    } else {
      soundEffects.playVictoryFanfare();
      confetti({ particleCount: 80, spread: 85 });
      setCelebrationData({
        isOpen: true,
        stars: 3,
        score: 100,
        targetWord: currentQ?.word || '',
        spokenText: spokenTranscript || '',
        isCompleteUnit: true,
      });
    }
  };

  const handlePrev = () => {
    soundEffects.playPop();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetAttempt();
      setMicNotice(null);
    }
  };

  const handleCelebrationContinueNext = () => {
    setCelebrationData(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetAttempt();
      setMicNotice(null);
    } else {
      setCurrentIndex(0);
      resetAttempt();
      setMicNotice(null);
    }
  };

  // Helper to count questions in a unit
  const countUnitQuestions = (unitCode: string) => {
    return allGradeQuestions.filter((q) => {
      if (q.unit) return q.unit.toLowerCase() === unitCode.toLowerCase();
      if (q.topic) return q.topic.toLowerCase().startsWith(unitCode.toLowerCase());
      return false;
    }).length;
  };

  return (
    <div className="space-y-4">
      {/* 1. KHỐI LỚP (GRADE SELECTOR 1 -> 5) */}
      <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {[1, 2, 3, 4, 5].map((g) => (
            <button
              key={g}
              onClick={() => {
                soundEffects.playPop();
                onGradeChange(g);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                currentGrade === g
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lớp {g} {g <= 2 ? '(Pre-A1)' : '(A1)'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>SGK Global Success • Lớp {currentGrade}</span>
        </div>
      </div>

      {/* 2. CHỌN TỪNG UNIT BÀI HỌC (UNIT SELECTOR CAROUSEL) */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">📚</span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Chọn Unit Bài Học (Lớp {currentGrade}):
            </span>
          </div>

          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
            {selectedUnit === 'ALL'
              ? `Tất cả (${allGradeQuestions.length} câu)`
              : `${selectedUnit} (${questions.length} câu)`}
          </span>
        </div>

        {/* Scrollable Unit Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {/* All Units option */}
          <button
            onClick={() => {
              soundEffects.playPop();
              onUnitChange('ALL');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0 ${
              selectedUnit === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
            }`}
          >
            <span>🌟</span>
            <span>Tất cả Unit</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedUnit === 'ALL' ? 'bg-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
              {allGradeQuestions.length}
            </span>
          </button>

          {/* Individual Units */}
          {availableUnits.map((u) => {
            const isSelected = selectedUnit === u.unitCode;
            const qCount = countUnitQuestions(u.unitCode);
            return (
              <button
                key={u.unitCode}
                onClick={() => {
                  soundEffects.playPop();
                  onUnitChange(u.unitCode);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                }`}
                title={u.fullTopic}
              >
                <span>{u.themeIcon}</span>
                <span>{u.unitCode}: {u.title}</span>
                {u.phonicsFocus && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md hidden sm:inline ${
                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200/70 text-slate-500'
                  }`}>
                    {u.phonicsFocus}
                  </span>
                )}
                {qCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {qCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MA TRẬN 3 CẤP ĐỘ (NHẬN BIẾT - THÔNG HIỂU - VẬN DỤNG) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          onClick={() => {
            soundEffects.playPop();
            onLevelChange('NhanBiet');
          }}
          className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all ${
            currentLevel === 'NhanBiet'
              ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-200'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-emerald-800">🌱 1. NHẬN BIẾT</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Listen & Repeat
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-1">Từ vựng & Ngữ âm chuẩn</p>
        </button>

        <button
          onClick={() => {
            soundEffects.playPop();
            onLevelChange('ThongHieu');
          }}
          className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all ${
            currentLevel === 'ThongHieu'
              ? 'border-blue-500 bg-blue-50/80 shadow-md ring-2 ring-blue-200'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-blue-800">🌿 2. THÔNG HIỂU</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Q&A Reflex
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-1">Phản xạ câu hỏi hoàn chỉnh</p>
        </button>

        <button
          onClick={() => {
            soundEffects.playPop();
            onLevelChange('VanDung');
          }}
          className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all ${
            currentLevel === 'VanDung'
              ? 'border-purple-500 bg-purple-50/80 shadow-md ring-2 ring-purple-200'
              : 'border-slate-200 bg-white hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-purple-800">🌳 3. VẬN DỤNG</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Role-Play
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-1">Giao tiếp tình huống mở</p>
        </button>
      </div>

      {/* SÂN KHẤU LUYỆN NÓI CHÍNH */}
      {!currentQ ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center text-3xl mb-3">
            📖
          </div>
          <h3 className="text-lg font-black text-slate-800">
            Chưa có bài tập cho {selectedUnit === 'ALL' ? `Lớp ${currentGrade}` : selectedUnit} ở mức độ này
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-1 max-w-md mx-auto">
            Bé hãy bấm chuyển sang mức độ khác hoặc chọn <strong>"Tất cả Unit"</strong> để tiếp tục luyện phát âm nhé!
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={() => onLevelChange('NhanBiet')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-md"
            >
              🌱 Thử mức Nhận biết
            </button>
            <button
              onClick={() => onUnitChange('ALL')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-md"
            >
              🌟 Xem tất cả Unit Lớp {currentGrade}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-slate-200/80 relative overflow-hidden">
          {/* Decorative corner aura */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-amber-200 to-indigo-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

          {/* Top meta tags */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-black text-indigo-700">
              <span>📖 {currentQ.topic}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400">
                Câu {currentIndex + 1} / {questions.length}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold flex items-center gap-1">
                ⭐ +{currentQ.points || 10} điểm
              </span>
            </div>
          </div>

          {/* Dialogue prompt for Mức 2 & 3 */}
          {currentQ.dialoguePartner && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
                👩‍🏫
              </div>
              <div>
                <p className="text-xs font-black text-amber-900">Cô Tâm / Bạn học đặt câu hỏi:</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5 italic">"{currentQ.dialoguePartner}"</p>
              </div>
            </div>
          )}

          {/* Central Display: Mascot emoji + English phrase + IPA */}
          <div className="flex flex-col items-center text-center my-4">
            {/* Mascot emoji */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-slate-50 to-blue-50 border-4 border-slate-100 flex items-center justify-center text-6xl sm:text-7xl shadow-inner mb-4 animate-float">
              {currentQ.emoji || '🌟'}
            </div>

            {/* Target English Sentence */}
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 max-w-2xl leading-snug">
              {currentQ.word}
            </h2>

            {/* Phonetic transcription (IPA) */}
            {currentQ.phonetic && (
              <p className="text-sm sm:text-base font-semibold text-indigo-600 mt-1 font-mono tracking-wide bg-indigo-50/80 px-3 py-0.5 rounded-lg border border-indigo-100 inline-block">
                {currentQ.phonetic}
              </p>
            )}

            {/* Vietnamese meaning */}
            <p className="text-base sm:text-lg font-bold text-slate-500 mt-2">
              {currentQ.meaning}
            </p>
          </div>

          {/* Phonetic Tip from Cô Tâm */}
          {currentQ.vietnameseHint && (
            <div className="max-w-xl mx-auto my-3 p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-900 flex items-center gap-2.5">
              <Lightbulb className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>Mẹo cô Tâm: {currentQ.vietnameseHint}</span>
            </div>
          )}

          {/* Hidden audio element for student voice playback */}
          <audio
            ref={studentAudioPlayerRef}
            src={studentAudioUrl || undefined}
            preload="auto"
            onPlay={() => setIsPlayingStudentVoice(true)}
            onEnded={() => setIsPlayingStudentVoice(false)}
            onPause={() => setIsPlayingStudentVoice(false)}
            onError={() => {
              setIsPlayingStudentVoice(false);
              if (spokenTranscript) {
                playEnglishAudio(spokenTranscript, 0.85, 1.25);
              }
            }}
          />

          {/* Interactive Controls Row */}
          <div className="flex flex-col items-center justify-center gap-4 my-6">
            {/* Speed controls */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setAudioSpeed(0.75);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  audioSpeed === 0.75
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                🐢 0.75x (Nghe Chậm)
              </button>
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setAudioSpeed(0.9);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  audioSpeed === 0.9
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                🐰 1.0x (Tự Nhiên)
              </button>
            </div>

            {/* Audio & Mic Action Buttons */}
            <div className="flex items-center justify-center gap-5 sm:gap-8">
              {/* Listen Button */}
              <button
                onClick={handlePlayModelAudio}
                disabled={isPlayingAudio}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center gap-1 shadow-lg border-2 border-indigo-200 transition-transform active:scale-90 ${
                  isPlayingAudio
                    ? 'bg-indigo-300 text-white animate-pulse'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:scale-105'
                }`}
                title="Nghe phát âm chuẩn tiếng Anh"
              >
                <Volume2 className="w-7 h-7 sm:w-8 sm:h-8" />
                <span className="text-[10px] font-black">NGHE MẪU</span>
              </button>

              {/* Speaking / Mic Button (Centerpiece) */}
              <button
                onClick={toggleListening}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center gap-1 shadow-xl transition-all active:scale-95 border-4 border-white ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse-mic ring-8 ring-red-200 scale-105'
                    : 'bg-gradient-to-tr from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white shadow-red-500/40 hover:scale-105'
                }`}
                title="Bấm để phát âm"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-wider">ĐANG NGHE</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
                    <span className="text-[10px] font-black uppercase tracking-wider">BẤM ĐỂ NÓI</span>
                  </>
                )}
              </button>

              {/* Listen back to Student's own voice (with guaranteed playback) */}
              <button
                onClick={handlePlayStudentVoice}
                disabled={(!studentAudioUrl && !spokenTranscript) || isPlayingStudentVoice}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center gap-1 shadow-md border-2 transition-all ${
                  studentAudioUrl || spokenTranscript
                    ? isPlayingStudentVoice
                      ? 'bg-emerald-400 text-white animate-pulse border-emerald-500 scale-105 ring-4 ring-emerald-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-60'
                }`}
                title={
                  studentAudioUrl || spokenTranscript
                    ? 'Bấm để nghe lại giọng con vừa nói'
                    : 'Hãy nói vào micro trước để nghe lại giọng con'
                }
              >
                <Play className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="text-[9px] font-black leading-tight text-center">
                  {isPlayingStudentVoice ? 'ĐANG PHÁT' : 'GIỌNG CỦA CON'}
                </span>
              </button>
            </div>
          </div>

          {/* Micro Notice or Error Guidance */}
          {micNotice && (
            <div className="w-full max-w-2xl mx-auto bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold leading-relaxed">{micNotice}</span>
              </div>
              <button
                onClick={() => setMicNotice(null)}
                className="text-amber-700 hover:text-amber-950 font-black p-1 hover:bg-amber-100 rounded-lg text-xs flex-shrink-0"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* FEEDBACK & EVALUATION BOX */}
          <div
            className={`w-full max-w-2xl mx-auto rounded-3xl p-5 border-2 transition-all ${
              evaluation
                ? evaluation.similarityScore >= 70
                  ? 'bg-emerald-50/90 border-emerald-300'
                  : evaluation.similarityScore >= 40
                  ? 'bg-amber-50/90 border-amber-300'
                  : 'bg-rose-50/90 border-rose-300'
                : isListening
                ? 'bg-red-50 border-red-200'
                : 'bg-slate-50 border-dashed border-slate-300'
            }`}
          >
            {isListening ? (
              <div className="text-center py-2">
                <p className="text-base font-black text-red-600 animate-pulse flex items-center justify-center gap-2">
                  <span>🎙️ Đang lắng nghe giọng của bé...</span>
                </p>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  Con hãy nói thật to và rõ ràng câu: "{currentQ.word}"
                </p>
              </div>
            ) : evaluation ? (
              <div className="space-y-3">
                {/* Score header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {evaluation.similarityScore >= 70 ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                    )}
                    <div>
                      <h4 className="text-base font-black text-slate-800">
                        {evaluation.feedbackMessage}
                      </h4>
                      <p className="text-xs font-bold text-slate-500">
                        Độ chính xác âm thanh: <span className="font-black text-indigo-700">{evaluation.similarityScore}%</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-400 text-amber-950 font-black px-3 py-1 rounded-xl text-xs shadow-sm">
                    <span>+{evaluation.earnedStars} ⭐</span>
                  </div>
                </div>

                {/* Word-by-word visual breakdown */}
                <div className="bg-white/80 p-3 rounded-2xl border border-slate-200">
                  <p className="text-[11px] font-black uppercase text-slate-400 mb-1.5">
                    Chi tiết từng từ con đã nói:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.wordEvaluations.map((w, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 ${
                          w.accuracy >= 75
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : w.accuracy >= 45
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        <span>{w.word}</span>
                        <span className="text-[10px] opacity-70">
                          {w.accuracy >= 75 ? '✓' : `${w.accuracy}%`}
                        </span>
                      </span>
                    ))}
                  </div>
                  {spokenTranscript && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 flex-wrap gap-2">
                      <p className="text-xs font-bold text-slate-600">
                        Máy nghe được: <span className="italic font-bold text-slate-800">"{spokenTranscript}"</span>
                      </p>
                      <button
                        onClick={handlePlayStudentVoice}
                        disabled={isPlayingStudentVoice}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                          isPlayingStudentVoice
                            ? 'bg-emerald-400 text-white animate-pulse'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                        }`}
                        title="Bấm để nghe lại giọng con vừa nói"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isPlayingStudentVoice ? 'Đang phát...' : '🔊 Nghe lại giọng con'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Pedagogical Tip */}
                <p className="text-xs font-bold text-indigo-900 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                  💡 {evaluation.tips}
                </p>
              </div>
            ) : (
              <div className="text-center py-2 text-slate-500">
                <p className="text-sm font-bold">
                  👉 Nhấn nút <strong className="text-indigo-600">NGHE MẪU</strong> để nghe âm chuẩn, rồi nhấn nút <strong className="text-red-500">BẤM ĐỂ NÓI</strong> nhé!
                </p>
              </div>
            )}
          </div>

          {/* Navigation buttons: Prev / Next */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                currentIndex === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100 active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu Trước</span>
            </button>

            <button
              onClick={resetAttempt}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              title="Thử lại câu này"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Luyện Lại</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <span>{currentIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành!'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CELEBRATORY STAR & VICTORY MODAL */}
      {celebrationData?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-md w-full bg-gradient-to-b from-amber-400 via-amber-300 to-yellow-200 rounded-3xl p-1 shadow-2xl text-center transform scale-100 transition-all">
            <div className="bg-white rounded-[22px] p-6 pt-5 space-y-4 shadow-inner relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={() => setCelebrationData(null)}
                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Sparkle decorative icon */}
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center text-3xl animate-bounce">
                {celebrationData.isCompleteUnit ? '🏆' : '🌟'}
              </div>

              {/* Animated Glowing Stars */}
              <div className="flex items-center justify-center gap-2 my-2">
                {celebrationData.stars >= 1 && (
                  <span className="text-4xl sm:text-5xl animate-bounce drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]">
                    ⭐
                  </span>
                )}
                {celebrationData.stars >= 2 && (
                  <span className="text-5xl sm:text-6xl animate-bounce delay-100 drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]">
                    ⭐
                  </span>
                )}
                {celebrationData.stars >= 3 && (
                  <span className="text-4xl sm:text-5xl animate-bounce delay-200 drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]">
                    ⭐
                  </span>
                )}
              </div>

              {/* Header Title */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-amber-950 uppercase tracking-tight">
                  {celebrationData.isCompleteUnit
                    ? '🎉 HOÀN THÀNH UNIT BÀI HỌC!'
                    : celebrationData.stars === 3
                    ? '🎉 XUẤT SẮC! +3 SAO VÀNG!'
                    : celebrationData.stars === 2
                    ? '👏 RẤT GIỎI! +2 SAO VÀNG!'
                    : '💪 TIẾN BỘ! +1 SAO!'}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1">
                  {celebrationData.isCompleteUnit
                    ? 'Con đã xuất sắc chinh phục tất cả câu trong phần luyện tập này!'
                    : `Con đã phát âm chuẩn xác câu: "${celebrationData.targetWord}"`}
                </p>
              </div>

              {/* Score and Reward Pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>Điểm: {celebrationData.score}%</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>+{celebrationData.stars} Sao tích lũy ⭐</span>
                </div>
                {celebrationData.score >= 80 && (
                  <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-300 text-purple-900 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
                    <span>🎟️ +1 Vé Vòng Quay May Mắn</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleCelebrationContinueNext}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {celebrationData.isCompleteUnit
                      ? 'Luyện lại từ đầu 🔄'
                      : currentIndex < questions.length - 1
                      ? 'Luyện câu tiếp theo ➔'
                      : 'Hoàn thành phần này 🏆'}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handlePlayStudentVoice();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Nghe giọng con 🎙️</span>
                  </button>

                  <button
                    onClick={() => setCelebrationData(null)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs transition-all"
                  >
                    Ở lại câu này
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
