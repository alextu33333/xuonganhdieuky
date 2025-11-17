import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';

export const Introduction: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-amber-500/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-xl font-bold text-amber-300"
      >
        <span>Hướng Dẫn Giới Thiệu</span>
        <ChevronDownIcon
          className={`h-6 w-6 transition-transform duration-300 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1000px] mt-4' : 'max-h-0 mt-0'
        }`}
      >
        <div className="text-gray-300 space-y-4 pt-2">
            <p>
                Chào mừng bạn đến với <strong>Xưởng Ảnh Diệu Kỳ</strong>! Ứng dụng này sử dụng AI để biến những bức ảnh bình thường của bé thành các tác phẩm nghệ thuật độc đáo và đầy sáng tạo.
            </p>
            <h4 className="text-lg font-semibold text-amber-400">Cách Sử Dụng:</h4>
            <ol className="list-decimal list-inside space-y-2">
                <li>
                    <strong>Tải Ảnh Gốc:</strong> Chọn một bức ảnh chân dung rõ mặt, chính diện và chất lượng cao để AI có thể nhận diện tốt nhất. Đây là bước quan trọng nhất!
                </li>
                <li>
                    <strong>Tùy Chỉnh Ảnh:</strong> Trong mục số 2, hãy chọn kích thước, số lượng ảnh, độ phân giải, phong cách nghệ thuật và các hiệu ứng khác theo ý muốn.
                </li>
                <li>
                    <strong>Chọn Kịch Bản:</strong> Trong mục số 3, bạn có thể chọn bối cảnh và trang phục từ thư viện có sẵn, hoặc bật chế độ "Tự Tạo Bối Cảnh" để viết mô tả chi tiết cho ý tưởng của riêng mình.
                </li>
                <li>
                    <strong>Bắt Đầu Sáng Tạo:</strong> Khi đã hoàn tất, nhấn nút "Tạo Ra Điều Kỳ Diệu" và chờ trong giây lát để AI thực hiện phép màu!
                </li>
            </ol>
            <div className="text-sm text-gray-400 border-t border-gray-700 pt-3 mt-4">
                <p><strong className="text-amber-300">Mẹo nhỏ:</strong> AI rất sáng tạo! Nếu kết quả lần đầu chưa hoàn toàn như ý, đừng ngần ngại thử lại với các tùy chọn khác nhau. Mỗi sự kết hợp mới có thể mang lại một kiệt tác bất ngờ.</p>
            </div>
        </div>
      </div>
    </div>
  );
};