import React, { useState, useRef } from 'react';
import { ExerciseItem, CognitiveLevel } from '../types';
import { GRADE_UNITS, UnitDefinition } from '../data/curriculum';
import { soundEffects } from '../utils/audioSynthesizer';
import { playEnglishAudio } from '../utils/speechUtils';
import {
  PlusCircle,
  Sparkles,
  Download,
  Upload,
  Mic,
  MicOff,
  Play,
  Trash2,
  Users,
  Layers,
  BookCheck,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TeacherStudioProps {
  curriculum: ExerciseItem[];
  onAddExercise: (item: ExerciseItem) => void;
  onImportExercises: (items: ExerciseItem[]) => void;
  onDeleteExercise: (id: string) => void;
  onResetDefaultCurriculum: () => void;
}

export const TeacherStudio: React.FC<TeacherStudioProps> = ({
  curriculum,
  onAddExercise,
  onImportExercises,
  onDeleteExercise,
  onResetDefaultCurriculum,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'ai-gen' | 'json' | 'students'>('create');

  // Form states
  const [grade, setGrade] = useState<number>(1);
  const [level, setLevel] = useState<CognitiveLevel>('NhanBiet');
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('Unit 1');
  const [topic, setTopic] = useState('Unit 1: In the school playground');
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [meaning, setMeaning] = useState('');
  const [emoji, setEmoji] = useState('🍎');
  const [dialoguePartner, setDialoguePartner] = useState('');
  const [vietnameseHint, setVietnameseHint] = useState('');

  // Voice recording for Cô Tâm
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [teacherAudioBlobUrl, setTeacherAudioBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // AI Gen state
  const [aiGrade, setAiGrade] = useState<number>(1);
  const [aiUnitCode, setAiUnitCode] = useState<string>('Unit 1');
  const [aiTopic, setAiTopic] = useState('In the school playground');
  const [aiLevel, setAiLevel] = useState<CognitiveLevel>('NhanBiet');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // JSON Import state
  const [jsonInput, setJsonInput] = useState('');

  // When grade changes in form, update selected unit & topic
  const handleGradeChange = (newGrade: number) => {
    setGrade(newGrade);
    const units = GRADE_UNITS[newGrade] || [];
    if (units.length > 0) {
      setSelectedUnitCode(units[0].unitCode);
      setTopic(units[0].fullTopic);
    }
  };

  const handleUnitSelect = (unitCode: string) => {
    setSelectedUnitCode(unitCode);
    const units = GRADE_UNITS[grade] || [];
    const found = units.find((u) => u.unitCode === unitCode);
    if (found) {
      setTopic(found.fullTopic);
    }
  };

  const handleAiGradeChange = (newGrade: number) => {
    setAiGrade(newGrade);
    const units = GRADE_UNITS[newGrade] || [];
    if (units.length > 0) {
      setAiUnitCode(units[0].unitCode);
      setAiTopic(units[0].title);
    }
  };

  const handleAiUnitSelect = (unitCode: string) => {
    setAiUnitCode(unitCode);
    const units = GRADE_UNITS[aiGrade] || [];
    const found = units.find((u) => u.unitCode === unitCode);
    if (found) {
      setAiTopic(found.title);
    }
  };

  // Recording Cô Tâm voice
  const startRecordingTeacher = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setTeacherAudioBlobUrl(reader.result as string);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecordingVoice(true);
    } catch (e) {
      alert('Không thể mở micro để thu âm giọng mẫu!');
    }
  };

  const stopRecordingTeacher = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
  };

  const handleSaveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) {
      alert('Vui lòng nhập từ/câu tiếng Anh và nghĩa tiếng Việt!');
      return;
    }

    const unitMatch = topic.match(/Unit\s+(\d+)/i);
    const unitNum = unitMatch ? parseInt(unitMatch[1], 10) : undefined;
    const unitStr = unitMatch ? `Unit ${unitMatch[1]}` : selectedUnitCode;

    const newItem: ExerciseItem = {
      id: `custom-${Date.now()}`,
      grade,
      level,
      unit: unitStr,
      unitNumber: unitNum,
      topic: topic.trim() || `Unit Lớp ${grade}`,
      word: word.trim(),
      phonetic: phonetic.trim() || undefined,
      meaning: meaning.trim(),
      emoji: emoji.trim() || '🌟',
      dialoguePartner: dialoguePartner.trim() || undefined,
      vietnameseHint: vietnameseHint.trim() || undefined,
      audioModelUrl: teacherAudioBlobUrl || undefined,
      points: level === 'NhanBiet' ? 10 : level === 'ThongHieu' ? 15 : 20,
    };

    onAddExercise(newItem);
    soundEffects.playVictoryFanfare();
    confetti({ particleCount: 50, spread: 60 });
    alert('✅ Đã lưu bài tập mới vào hệ thống thành công!');

    // Reset fields
    setWord('');
    setMeaning('');
    setPhonetic('');
    setDialoguePartner('');
    setVietnameseHint('');
    setTeacherAudioBlobUrl(null);
  };

  // AI Generator via server endpoint or smart local fallback
  const handleGenerateWithAi = async () => {
    setIsAiLoading(true);
    soundEffects.playPop();

    try {
      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: aiGrade,
          level: aiLevel,
          topic: `${aiUnitCode}: ${aiTopic}`,
          count: 3,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        const mapped = data.questions.map((q: any, i: number) => ({
          ...q,
          id: `ai-${Date.now()}-${i}`,
          grade: aiGrade,
          unit: aiUnitCode,
          unitNumber: parseInt(aiUnitCode.replace(/\D/g, ''), 10) || 1,
          topic: q.topic || `${aiUnitCode}: ${aiTopic}`,
          points: aiLevel === 'NhanBiet' ? 10 : aiLevel === 'ThongHieu' ? 15 : 20,
        }));
        onImportExercises(mapped);
        soundEffects.playVictoryFanfare();
        confetti({ particleCount: 60, spread: 70 });
        alert(`🎉 AI Gemini đã tạo thành công ${mapped.length} bài tập cho ${aiUnitCode} (Lớp ${aiGrade})!`);
      } else {
        // Fallback generator
        generateLocalFallback();
      }
    } catch (err) {
      generateLocalFallback();
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateLocalFallback = () => {
    const fallbackBank: Record<string, Partial<ExerciseItem>[]> = {
      'In the school playground': [
        { word: 'Ball', phonetic: '/bɔːl/', meaning: 'Quả bóng', emoji: '⚽', vietnameseHint: 'Tròn môi đọc /ɔː/ và uốn lưỡi nhẹ.' },
        { word: 'I have a red ball', phonetic: '/aɪ hæv ə red bɔːl/', meaning: 'Tớ có một quả bóng màu đỏ', emoji: '🔴⚽', vietnameseHint: 'Nói vui vẻ, nhấn vào red ball!' }
      ],
      'At my birthday party': [
        { word: 'Party', phonetic: '/ˈpɑː.ti/', meaning: 'Bữa tiệc', emoji: '🎉', vietnameseHint: 'Bật hơi âm /p/ thật dứt khoát.' },
        { word: 'Let us celebrate the party together!', meaning: 'Hãy cùng nhau chúc mừng bữa tiệc nào!', emoji: '🥳', vietnameseHint: 'Nói hào hứng, tươi vui!' }
      ],
    };

    const items = fallbackBank[aiTopic] || [
      { word: 'Hello', phonetic: '/həˈləʊ/', meaning: 'Xin chào', emoji: '👋', vietnameseHint: 'Nhấn vào âm thứ 2 "lầu".' },
      { word: 'This is my lesson', phonetic: '/ðɪs ɪz maɪ ˈles.ən/', meaning: 'Đây là bài học của tớ', emoji: '📖', vietnameseHint: 'Âm /ð/ để lưỡi giữa hai hàm răng nhé.' },
    ];

    const generated: ExerciseItem[] = items.map((it, idx) => ({
      id: `ai-local-${Date.now()}-${idx}`,
      grade: aiGrade,
      unit: aiUnitCode,
      unitNumber: parseInt(aiUnitCode.replace(/\D/g, ''), 10) || 1,
      level: aiLevel,
      topic: `${aiUnitCode}: ${aiTopic}`,
      word: it.word || 'Hello world',
      phonetic: it.phonetic,
      meaning: it.meaning || '',
      emoji: it.emoji || '🌟',
      vietnameseHint: it.vietnameseHint || 'Con nhớ phát âm to và rõ ràng nhé!',
      points: 15,
    }));

    onImportExercises(generated);
    soundEffects.playVictoryFanfare();
    confetti({ particleCount: 60, spread: 70 });
    alert(`🎉 Đã thêm ${generated.length} bài tập cho ${aiUnitCode}: "${aiTopic}" vào kho bài của Cô Tâm!`);
  };

  // Import JSON from Google AI Studio / textbook export
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated: ExerciseItem[] = parsed.map((item, index) => ({
          id: item.id || `imported-${Date.now()}-${index}`,
          grade: Number(item.grade) || 1,
          level: item.level || 'NhanBiet',
          topic: item.topic || 'Unit bổ sung',
          word: String(item.word || ''),
          phonetic: item.phonetic || undefined,
          meaning: String(item.meaning || ''),
          emoji: item.emoji || '📖',
          dialoguePartner: item.dialoguePartner || undefined,
          vietnameseHint: item.vietnameseHint || undefined,
          points: item.points || 10,
        }));

        onImportExercises(validated);
        soundEffects.playVictoryFanfare();
        confetti({ particleCount: 70, spread: 80 });
        alert(`🎉 Đã nạp thành công ${validated.length} bài tập từ dữ liệu JSON!`);
        setJsonInput('');
      } else {
        alert('Dữ liệu JSON phải là mảng [] chứa các câu hỏi!');
      }
    } catch (e: any) {
      alert('Định dạng JSON chưa đúng cú pháp. Vui lòng kiểm tra lại!');
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(curriculum, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `Speaking_Studio_Curriculum_TH_AiMo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-4 border-indigo-100">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-amber-950 flex items-center justify-center text-2xl shadow-md">
            👩‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-800">
                STUDIO QUẢN TRỊ - CÔ VŨ THỊ THANH TÂM
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                <span>👑</span>
                <span>Studio Quản Trị</span>
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500">
              Quản lý kho đề phát âm SGK Global Success (Lớp 1-5), thu âm giọng mẫu, tích hợp AI Studio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất JSON Kho Đề</span>
          </button>
          <button
            onClick={onResetDefaultCurriculum}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200"
            title="Khôi phục lại kho bài mặc định của chương trình"
          >
            Khôi Phục Mặc Định
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 my-5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
            activeTab === 'create'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm Bài Luyện Mới & Thu Âm</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-gen')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
            activeTab === 'ai-gen'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>AI Gemini Tạo Bài Tự Động</span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
            activeTab === 'json'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Nhập Từ AI Studio & Sách (JSON)</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Học Sinh (Ái Mộ)</span>
        </button>
      </div>

      {/* TAB 1: THÊM BÀI TẬP MỚI VÀ THU ÂM GIỌNG CÔ TÂM */}
      {activeTab === 'create' && (
        <form onSubmit={handleSaveExercise} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                1. Khối Lớp:
              </label>
              <select
                value={grade}
                onChange={(e) => handleGradeChange(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none"
              >
                <option value={1}>Lớp 1 (Pre-A1)</option>
                <option value={2}>Lớp 2 (Pre-A1)</option>
                <option value={3}>Lớp 3 (A1)</option>
                <option value={4}>Lớp 4 (A1)</option>
                <option value={5}>Lớp 5 (A1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                2. Chọn Unit Bài Học:
              </label>
              <select
                value={selectedUnitCode}
                onChange={(e) => handleUnitSelect(e.target.value)}
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none"
              >
                {(GRADE_UNITS[grade] || []).map((u) => (
                  <option key={u.unitCode} value={u.unitCode}>
                    {u.unitCode}: {u.title}
                  </option>
                ))}
                <option value="CUSTOM">Khác (Tự nhập tên Unit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                3. Mức độ tư duy:
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CognitiveLevel)}
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none"
              >
                <option value="NhanBiet">1. Nhận biết (Listen & Repeat)</option>
                <option value="ThongHieu">2. Thông hiểu (Hỏi - đáp phản xạ)</option>
                <option value="VanDung">3. Vận dụng (Tình huống mở)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                4. Tiêu đề / Unit đầy đủ:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Unit 1: In the school playground"
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Từ / Câu Tiếng Anh Cần Nói (Target English):
              </label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="VD: Where is the cat? It is under the table."
                className="w-full p-3 rounded-xl border-2 border-slate-200 font-black text-slate-800 text-base focus:border-indigo-600 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Nghĩa Tiếng Việt:
              </label>
              <input
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="VD: Chú mèo ở đâu? Nó ở dưới bàn."
                className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Phiên âm IPA (Tùy chọn):
              </label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="VD: /weər ɪz ðə kæt/"
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-mono text-sm text-slate-800 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Emoji biểu trưng:
              </label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="VD: 🐱, 🍎, 🏫"
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-black text-slate-800 text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Câu gợi ý của bạn / giáo viên:
              </label>
              <input
                type="text"
                value={dialoguePartner}
                onChange={(e) => setDialoguePartner(e.target.value)}
                placeholder="VD: Cô giáo hỏi: Where is your book?"
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">
              Mẹo phát âm cho học sinh tiểu học (Cô Tâm dặn dò):
            </label>
            <input
              type="text"
              value={vietnameseHint}
              onChange={(e) => setVietnameseHint(e.target.value)}
              placeholder="VD: Bé nhớ bật âm /s/ nhẹ ở từ 'is' và nối âm nhẹ nhé!"
              className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Cô Tâm Microphone Model Recording */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <span>🎙️ Thu âm giọng mẫu của Cô Tâm:</span>
              </p>
              <p className="text-[11px] font-bold text-amber-700">
                Cô có thể thu âm giọng của chính mình để học sinh bấm "Nghe mẫu" sẽ được nghe giọng cô thân quen!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={isRecordingVoice ? stopRecordingTeacher : startRecordingTeacher}
                className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                  isRecordingVoice
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {isRecordingVoice ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Dừng Thu Âm</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Bấm Để Thu Giọng Cô</span>
                  </>
                )}
              </button>

              {teacherAudioBlobUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const a = new Audio(teacherAudioBlobUrl);
                    a.play();
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Nghe Lại</span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Lưu Câu Này Vào Kho Bài Dạy Của Cô Tâm</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: AI GEMINI AUTO GENERATOR */}
      {activeTab === 'ai-gen' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-black text-purple-900">
                TRỢ LÝ AI SOẠN BÀI TẬP NÓI CHUẨN GDPT 2018
              </h3>
            </div>
            <p className="text-xs font-bold text-slate-600">
              Công nghệ Google Gemini 3.8 Flash tự động tạo bộ câu hỏi phát âm phù hợp tâm sinh lý học sinh tiểu học Việt Nam.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                1. Khối Lớp:
              </label>
              <select
                value={aiGrade}
                onChange={(e) => handleAiGradeChange(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-purple-600 outline-none"
              >
                <option value={1}>Lớp 1 (Pre-A1)</option>
                <option value={2}>Lớp 2 (Pre-A1)</option>
                <option value={3}>Lớp 3 (A1)</option>
                <option value={4}>Lớp 4 (A1)</option>
                <option value={5}>Lớp 5 (A1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                2. Chọn Unit SGK:
              </label>
              <select
                value={aiUnitCode}
                onChange={(e) => handleAiUnitSelect(e.target.value)}
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-purple-600 outline-none"
              >
                {(GRADE_UNITS[aiGrade] || []).map((u) => (
                  <option key={u.unitCode} value={u.unitCode}>
                    {u.unitCode}: {u.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                3. Mức Độ Tư Duy:
              </label>
              <select
                value={aiLevel}
                onChange={(e) => setAiLevel(e.target.value as CognitiveLevel)}
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-purple-600 outline-none"
              >
                <option value="NhanBiet">1. Nhận biết (Listen & Repeat)</option>
                <option value="ThongHieu">2. Thông hiểu (Hỏi - Đáp)</option>
                <option value="VanDung">3. Vận dụng (Tình huống mở)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                4. Chủ đề bài học:
              </label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="VD: In the school playground"
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-800 text-sm focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateWithAi}
            disabled={isAiLoading}
            className={`w-full py-3.5 px-6 rounded-2xl text-white font-black text-base shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 ${
              isAiLoading
                ? 'bg-purple-400 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-600/30'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span>{isAiLoading ? '🤖 AI ĐANG TẠO BÀI TẬP THEO CHUẨN...' : '✨ BẤM ĐỂ AI TỰ ĐỘNG TẠO BÀI TẬP MỚI'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: JSON IMPORT TỪ AI STUDIO HOẶC SÁCH ĐÍNH KÈM */}
      {activeTab === 'json' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
            <h4 className="text-sm font-black text-blue-900 mb-1">
              🤖 TÍCH HỢP AI STUDIO & TÀI LIỆU SÁCH ĐÍNH KÈM
            </h4>
            <p className="text-xs font-bold text-slate-600">
              Cô Tâm có thể copy trực tiếp dữ liệu JSON từ Google AI Studio (Gemini) hoặc tài liệu đính kèm dán vào đây để nạp tự động vào kho bài:
            </p>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={5}
            placeholder={`[
  {
    "grade": 3,
    "level": "ThongHieu",
    "topic": "Unit 4: Our bodies",
    "word": "Touch your nose",
    "phonetic": "/tʌtʃ jɔːr nəʊz/",
    "meaning": "Hãy chạm vào mũi của bạn",
    "emoji": "👃",
    "vietnameseHint": "Bật âm /tʃ/ ở cuối từ 'touch' nhé!"
  }
]`}
            className="w-full p-3 rounded-2xl border-2 border-slate-200 font-mono text-xs focus:border-indigo-600 outline-none"
          />

          <button
            type="button"
            onClick={handleImportJson}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            📥 Nạp Dữ Liệu Vào Hệ Thống
          </button>
        </div>
      )}

      {/* TAB 4: DANH SÁCH HỌC SINH ÁI MỘ */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800">
              SỔ THEO DÕI NĂNG LỰC NÓI CỦA HỌC SINH (LỚP TIỂU HỌC ÁI MỘ)
            </h3>
            <span className="text-xs font-bold text-slate-500">Tổng: 5 Học sinh tiêu biểu</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs font-bold text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã HS</th>
                  <th className="p-3">Họ và Tên</th>
                  <th className="p-3">Khối Lớp</th>
                  <th className="p-3">Sao Tích Lũy</th>
                  <th className="p-3">Đánh Giá Phát Âm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-black text-indigo-700">H901</td>
                  <td className="p-3">Bé Minh Khang</td>
                  <td className="p-3">Lớp 1A1</td>
                  <td className="p-3 text-amber-600 font-black">⭐ 58 Sao</td>
                  <td className="p-3 text-emerald-600">Đạt Chuẩn (88% phản xạ tốt)</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-black text-indigo-700">H902</td>
                  <td className="p-3">Bé Bảo Châu</td>
                  <td className="p-3">Lớp 2A3</td>
                  <td className="p-3 text-amber-600 font-black">⭐ 45 Sao</td>
                  <td className="p-3 text-emerald-600">Phát âm rõ ràng (82%)</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-black text-indigo-700">H903</td>
                  <td className="p-3">Bé Tuấn Kiệt</td>
                  <td className="p-3">Lớp 3A2</td>
                  <td className="p-3 text-amber-600 font-black">⭐ 39 Sao</td>
                  <td className="p-3 text-blue-600">Tiến bộ nhanh (79%)</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-black text-indigo-700">H904</td>
                  <td className="p-3">Bé Phương Linh</td>
                  <td className="p-3">Lớp 4A1</td>
                  <td className="p-3 text-amber-600 font-black">⭐ 32 Sao</td>
                  <td className="p-3 text-blue-600">Cần chú ý âm đuôi /s/ (74%)</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-black text-indigo-700">H905</td>
                  <td className="p-3">Bé Gia Huy</td>
                  <td className="p-3">Lớp 5A4</td>
                  <td className="p-3 text-amber-600 font-black">⭐ 28 Sao</td>
                  <td className="p-3 text-amber-600">Khá tốt, cần tự tin hơn</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exercise List preview / management */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center justify-between">
          <span>KHO BÀI TẬP HIỆN CÓ ({curriculum.length} câu)</span>
          <span className="text-xs font-bold text-slate-400">Tự động lưu vào bộ nhớ máy</span>
        </h4>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {curriculum.slice(0, 15).map((q) => (
            <div
              key={q.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{q.emoji}</span>
                <div>
                  <p className="font-black text-slate-800">{q.word}</p>
                  <p className="text-[10px] font-bold text-slate-500">
                    Lớp {q.grade} • {q.level} • {q.meaning}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playEnglishAudio(q.word)}
                  className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  title="Nghe thử"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteExercise(q.id)}
                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  title="Xóa bài này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
