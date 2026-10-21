import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// API: Check Gemini capability
app.get('/api/ai/status', (_req, res) => {
  res.json({
    hasKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-3.8-flash'
  });
});

// API: Teacher - Generate Lesson Questions via Gemini
app.post('/api/ai/generate-lesson', async (req, res) => {
  const { grade = 1, level = 'NhanBiet', topic = 'Starter', count = 3 } = req.body;

  if (!aiClient || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(200).json({
      fallback: true,
      message: 'Gemini API Key chưa cấu hình hoặc chạy chế độ cục bộ. Đã dùng bộ bài tập mẫu chuẩn Global Success.',
      questions: []
    });
  }

  try {
    const levelLabel = level === 'NhanBiet' 
      ? 'Mức độ 1: Nhận biết (Từ vựng, phát âm từng từ, ngữ âm cơ bản)'
      : level === 'ThongHieu'
      ? 'Mức độ 2: Thông hiểu (Câu ngắn, mẫu câu hỏi - đáp đơn giản, phản xạ)'
      : 'Mức độ 3: Vận dụng (Giao tiếp mở, hội thoại ngắn 2 câu hoặc miêu tả tranh/bản thân)';

    const prompt = `Bạn là cố vấn chuyên môn Tiếng Anh Tiểu học chuẩn chương trình GDPT 2018 (SGK Global Success).
Hãy tạo ${count} bài tập luyện nói Tiếng Anh cho học sinh Lớp ${grade}, chủ đề "${topic}", ở "${levelLabel}".

YÊU CẦU ĐỊNH DẠNG: Chỉ trả về một JSON array hợp lệ, KHÔNG bọc trong markdown code block, KHÔNG thêm lời dẫn giải:
[
  {
    "grade": ${grade},
    "level": "${level}",
    "topic": "${topic}",
    "word": "từ hoặc câu tiếng Anh cần nói chuẩn",
    "phonetic": "phiên âm IPA dễ đọc cho học sinh",
    "meaning": "nghĩa tiếng Việt dễ hiểu",
    "emoji": "biểu tượng cảm xúc hoặc minh họa",
    "vietnameseHint": "mẹo phát âm cho học sinh tiểu học Việt Nam (VD: chú ý âm đuôi /s/, /t/)",
    "dialoguePartner": "nếu là Thông hiểu/Vận dụng thì đây là câu hỏi mẫu của giáo viên/bạn học (hoặc rỗng)"
  }
]`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text?.trim() || '[]';
    // Clean any accidental markdown backticks
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const questions = JSON.parse(cleaned);

    return res.json({
      success: true,
      questions
    });
  } catch (error: any) {
    console.error('Error generating lesson with Gemini:', error);
    return res.status(500).json({
      error: 'Không thể sinh bài tập từ AI: ' + (error.message || 'Lỗi không xác định'),
    });
  }
});

// API: AI Speaking Coach feedback
app.post('/api/ai/analyze-speech', async (req, res) => {
  const { targetWord, spokenText, grade = 1 } = req.body;

  if (!aiClient || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      feedback: 'Em phát âm khá tốt! Hãy lắng nghe lại âm mẫu để nói rõ hơn nữa nhé.',
      tips: 'Mẹo: Để ý mở khẩu hình tròn và phát âm to, rõ ràng từng âm tiết.'
    });
  }

  try {
    const prompt = `Học sinh tiểu học lớp ${grade} đang luyện nói tiếng Anh:
- Từ/Câu mục tiêu: "${targetWord}"
- Câu nhận diện từ micro học sinh: "${spokenText}"

Hãy đóng vai Cô Vũ Thị Thanh Tâm (giáo viên tiếng Anh Trường Tiểu học Ái Mộ, tâm huyết, thân thiện, khích lệ học sinh tiểu học).
Viết lời khen ngắn gọn (1-2 câu tiếng Việt) và 1 mẹo nhỏ dễ thương (chú ý âm đuôi, ngữ điệu) giúp bé tiến bộ. Khẩu hiệu: "Speak Up, Level Up!".
Trả về định dạng JSON:
{
  "feedback": "lời khen ấm áp, động viên",
  "tips": "mẹo phát âm dễ thương cho học sinh tiểu học"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text?.trim() || '{}';
    const result = JSON.parse(text);
    return res.json(result);
  } catch (err: any) {
    return res.json({
      feedback: 'Em phát âm rất đáng khen! Hãy giữ vững tinh thần Speak Up, Level Up nhé!',
      tips: 'Bé nhớ nhấn trọng âm và nói tự tin hơn nữa nhé!'
    });
  }
});

// API: Teacher CLIL - Generate English speaking scenarios for subject teachers (A1, A2, B1)
app.post('/api/ai/generate-teacher-lesson', async (req, res) => {
  const { subject = 'Math', cefrLevel = 'A1', count = 2 } = req.body;

  if (!aiClient || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(200).json({
      fallback: true,
      message: 'Gemini API Key chưa cấu hình hoặc chạy cục bộ.',
      scenarios: []
    });
  }

  try {
    const subjectNames: Record<string, string> = {
      Math: 'Toán học (Mathematics)',
      Science: 'Khoa học & STEM (Science)',
      ICT: 'Tin học & Công nghệ (ICT & Computing)',
      Art: 'Mỹ thuật & Thủ công (Art & Crafts)',
      Music: 'Âm nhạc (Music Education)',
      PE: 'Giáo dục thể chất (Physical Education)',
      SocialStudies: 'Lịch sử & Địa lý (Social Studies)',
      ClassroomGeneral: 'Tiếng Anh chỉ dẫn sư phạm chung (Classroom English)',
    };

    const prompt = `Bạn là chuyên gia đào tạo Tiếng Anh chuyên ngành giảng dạy (CLIL / EMI - English as a Medium of Instruction) cho giáo viên tiểu học Việt Nam theo chương trình GDPT 2018.
Hãy tạo ${count} tình huống luyện nói tiếng Anh cho giáo viên dạy môn "${subjectNames[subject] || subject}" ở trình độ Khung tham chiếu Châu Âu CEFR: "${cefrLevel}".

Tiêu chí trình độ:
- A1: Khẩu lệnh ngắn gọn, từ vựng trực quan, câu đơn giản dưới 12 từ.
- A2: Hướng dẫn 2 bước, kiểm tra sự hiểu biết, khuyến khích học sinh, câu từ 12-20 từ.
- B1: Giảng giải bản chất khái niệm, tổ chức hoạt động phức hợp hoặc thảo luận, câu tự nhiên trôi chảy từ 20-30 từ.

YÊU CẦU: Trả về một mảng JSON thuần túy (không markdown, không giải thích):
[
  {
    "scenario": "Tên tình huống sư phạm ngắn gọn",
    "englishPrompt": "Câu tiếng Anh chuẩn mực sư phạm giáo viên cần nói",
    "phonetic": "Phiên âm IPA chuẩn cho cả câu",
    "vietnameseMeaning": "Nghĩa tiếng Việt rõ ràng",
    "teachingContext": "Ngữ cảnh thực tế trong lớp học",
    "keyTerms": ["Từ vựng 1", "Từ vựng 2"],
    "studentReaction": "Câu trả lời hoặc phản ứng mẫu của học sinh",
    "pedagogicalNote": "Lưu ý sư phạm về ngữ điệu, cử chỉ hoặc mẹo phát âm",
    "emoji": "2 emoji biểu trưng"
  }
]`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text?.trim() || '[]';
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const scenarios = JSON.parse(cleaned);

    return res.json({
      success: true,
      scenarios
    });
  } catch (error: any) {
    console.error('Error generating teacher CLIL scenarios:', error);
    return res.status(500).json({
      error: 'Không thể sinh bài tập giáo viên: ' + (error.message || 'Lỗi không xác định')
    });
  }
});


// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Speaking Studio Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
