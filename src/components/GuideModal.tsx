import React from 'react';
import { X, BookOpen, CheckCircle2, Sparkles, Star, Mic, Volume2 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-4 border-indigo-100 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl shadow-md">
              📖
            </div>
            <div>
              <h2 className="text-lg font-black uppercase">
                HƯỚNG DẪN SƯ PHẠM & SỬ DỤNG SPEAKING STUDIO
              </h2>
              <p className="text-xs font-bold text-amber-200">
                Cô Vũ Thị Thanh Tâm • Trường Tiểu học Ái Mộ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm font-medium">
          {/* Slogan & Philosophy */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <h3 className="text-sm font-black text-amber-900 mb-1 flex items-center gap-1.5">
              <span>🌟 KHẨU HIỆU & SỨ MỆNH:</span>
            </h3>
            <p className="font-extrabold text-amber-800 text-base mb-1">
              "Speak Up, Level Up! – Mạnh dạn nói – Tiến bộ mỗi ngày!"
            </p>
            <p className="text-slate-600 leading-relaxed">
              Ứng dụng được thiết kế bởi <strong>Cô giáo Vũ Thị Thanh Tâm</strong> dành riêng cho các em học sinh <strong>Trường Tiểu học Ái Mộ</strong> nhằm giải quyết rào cản ngại nói tiếng Anh, giúp các con tự tin phát âm chuẩn bản ngữ ngay từ lứa tuổi tiểu học (Lớp 1 đến Lớp 5) theo Chương trình Giáo dục Phổ thông 2018.
            </p>
          </div>

          {/* 3 Cognitive Levels */}
          <div>
            <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-1.5">
              <span>🌱 MA TRẬN 3 MỨC ĐỘ SƯ PHẠM (GDPT 2018):</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-black text-emerald-800">1. NHẬN BIẾT</span>
                <p className="text-[11px] font-bold text-slate-600 mt-1">
                  (Listen & Repeat) Nghe từ vựng chuẩn, xem hình minh họa và nhại lại âm thanh chính xác.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-xs font-black text-blue-800">2. THÔNG HIỂU</span>
                <p className="text-[11px] font-bold text-slate-600 mt-1">
                  (Q&A Reflex) Lắng nghe câu hỏi từ cô/bạn học và phản xạ câu trả lời đúng ngữ cảnh, ngữ pháp.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-xs font-black text-purple-800">3. VẬN DỤNG</span>
                <p className="text-[11px] font-bold text-slate-600 mt-1">
                  (Role-play & Mini Speech) Đóng vai giao tiếp, miêu tả tranh và đối thoại tự nhiên cùng AI.
                </p>
              </div>
            </div>
          </div>

          {/* Practice Steps for Students */}
          <div>
            <h3 className="text-sm font-black text-slate-800 mb-2">
              🎯 3 BƯỚC LUYỆN NÓI HIỆU QUẢ DÀNH CHO BÉ:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <span>
                  Bấm <strong className="text-indigo-600">NGHE MẪU</strong> để nghe phát âm chuẩn bản ngữ (có thể chọn chế độ 🐢 0.75x để nghe chậm).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <span>
                  Bấm nút <strong className="text-red-600">BẤM ĐỂ NÓI</strong> màu đỏ, nhìn câu và phát âm dõng dạc, to rõ ràng vào micro.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <span>
                  Xem ngay tỷ lệ chính xác %, nhận sao vàng ⭐, và bấm nút <strong className="text-emerald-700">GIỌNG CỦA CON</strong> để nghe lại giọng mình so sánh với phát âm mẫu!
                </span>
              </li>
            </ul>
          </div>

          {/* Teacher AI Studio CLIL Guide */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
            <h3 className="text-sm font-black text-purple-900 mb-1 flex items-center gap-1.5">
              <span>🤖 AI STUDIO GIÁO VIÊN BỘ MÔN (CLIL / EMI A1, A2, B1):</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Mục chuyên biệt hỗ trợ giáo viên các môn: <strong>Toán học, Khoa học & STEM, Tin học, Mỹ thuật, Âm nhạc, Giáo dục thể chất, Lịch sử - Địa lý</strong> rèn luyện khả năng giảng dạy song ngữ và phản xạ tiếng Anh nghề nghiệp:
              <br />• <strong>Cấp độ A1 (Cơ bản):</strong> Câu khẩu lệnh ngắn gọn, từ vựng trực quan, hiệu lệnh lớp học.
              <br />• <strong>Cấp độ A2 (Sơ cấp):</strong> Hướng dẫn các bước bài tập, đặt câu hỏi kiểm tra bài, khuyến khích học sinh.
              <br />• <strong>Cấp độ B1 (Trung cấp):</strong> Thuyết trình song ngữ, giải thích bản chất khái niệm, đối thoại tương tác đa chiều cùng AI.
              <br />• <strong>Thu âm giọng thầy cô:</strong> Nghe lại và tự đánh giá ngữ điệu giảng dạy của chính mình.
            </p>
          </div>

          {/* 3 Cổng Đăng Nhập Hệ Thống */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-indigo-200 space-y-2.5">
            <h3 className="text-sm font-black text-indigo-950 mb-1 flex items-center gap-1.5">
              <span>🔑 3 CỔNG ĐĂNG NHẬP THEO PHÂN HỆ:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <p className="font-black text-blue-900 flex items-center gap-1">
                  <span>👦</span>
                  <span>1. Học sinh</span>
                </p>
                <p className="text-[11px] text-blue-800 mt-1">
                  Nhập mã định danh học sinh: Vào ngay <strong>Sân Khấu Luyện Nói Học Sinh</strong> (Lớp 1-5 Global Success theo 3 cấp độ).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <p className="font-black text-amber-950 flex items-center gap-1">
                  <span>👩‍🏫</span>
                  <span>2. Giáo viên</span>
                </p>
                <p className="text-[11px] text-amber-900 mt-1">
                  Nhập mã giáo viên: Vào <strong>AI Studio GV Bộ Môn</strong> (8 môn CLIL A1-B1, 65+ khẩu lệnh lớp học thực chiến).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <p className="font-black text-rose-950 flex items-center gap-1">
                  <span>👑</span>
                  <span>3. Quản trị</span>
                </p>
                <p className="text-[11px] text-rose-900 mt-1">
                  Dành riêng cho Quản trị viên: Nhập tên đăng nhập quản trị bảo mật để mở <strong>Studio Quản Trị</strong> và điều hành cả 3 cổng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            Đã Hiểu - Bắt Đầu Luyện Nói! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
