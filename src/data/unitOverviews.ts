import { UnitKnowledgeOverview, TeacherSubject, CefrLevel } from '../types';

export const UNIT_KNOWLEDGE_OVERVIEWS: UnitKnowledgeOverview[] = [
  // ==================== TOÁN HỌC (MATH) ====================
  {
    subject: 'Math',
    subjectNameVi: 'Toán học',
    cefrLevel: 'A1',
    unitTheme: 'Shapes, Numbers & Basic Counting (Hình học, Số đếm & So sánh)',
    lessonObjectives: [
      'Nhận biết và phát âm chuẩn các hình học 2D cơ bản: Circle, Square, Triangle, Rectangle',
      'Đếm số lượng đồ vật trực quan từ 1 đến 20 và thực hiện phép cộng đơn giản trong phạm vi 10',
      'Sử dụng khẩu lệnh ngắn hướng dẫn học sinh đếm số và chỉ hình trên bảng',
    ],
    coreConcepts: [
      {
        conceptEn: '2D Geometric Shapes',
        conceptVi: 'Hình học phẳng 2 chiều',
        explanation: 'Nhận diện hình tròn (circle), hình vuông (square), hình tam giác (triangle), hình chữ nhật (rectangle) qua đồ vật thực tế.',
      },
      {
        conceptEn: 'Cardinal Numbers & Quantity',
        conceptVi: 'Số đếm và số lượng',
        explanation: 'Đếm từ 1-20, phân biệt số ít (one star) và số nhiều (five stars).',
      },
    ],
    keyVocabulary: [
      { term: 'Circle', phonetic: '/ˈsɜː.kəl/', meaning: 'Hình tròn', exampleSentence: 'A coin is a small circle.' },
      { term: 'Square', phonetic: '/skweər/', meaning: 'Hình vuông', exampleSentence: 'A square has four equal sides.' },
      { term: 'Triangle', phonetic: '/ˈtraɪ.æŋ.ɡəl/', meaning: 'Hình tam giác', exampleSentence: 'A triangle has three sharp corners.' },
      { term: 'Rectangle', phonetic: '/ˈrek.tæŋ.ɡəl/', meaning: 'Hình chữ nhật', exampleSentence: 'Our classroom door is a rectangle.' },
      { term: 'Count', phonetic: '/kaʊnt/', meaning: 'Đếm số lượng', exampleSentence: 'Count with me: one, two, three.' },
      { term: 'Plus', phonetic: '/plʌs/', meaning: 'Cộng (+)', exampleSentence: 'Two plus three equals five.' },
    ],
    standardStructures: [
      { patternEn: 'How many [objects] can you see?', meaningVi: 'Các con nhìn thấy bao nhiêu [đồ vật]?', usageTip: 'Hỏi số lượng trực quan đầu giờ.' },
      { patternEn: 'There are [number] [objects] on the board.', meaningVi: 'Có [số lượng] [đồ vật] ở trên bảng.', usageTip: 'Mẫu câu chốt kết quả đếm.' },
      { patternEn: 'What shape is this [object]?', meaningVi: 'Đồ vật này có hình dạng gì?', usageTip: 'Kiểm tra nhận biết hình học.' },
    ],
    essentialCommands: [
      { commandEn: 'Look at the board and count together.', meaningVi: 'Nhìn lên bảng và cùng đếm nào.' },
      { commandEn: 'Point to the blue square on page six.', meaningVi: 'Chỉ tay vào hình vuông màu xanh ở trang 6.' },
      { commandEn: 'Draw three circles in your notebook.', meaningVi: 'Vẽ ba hình tròn vào vở của con nhé.' },
    ],
    pedagogicalTips: [
      'Sử dụng giáo cụ trực quan nhiều màu sắc (que tính, flashcard hình học).',
      'Nhấn mạnh trọng âm từ đầu của các hình học: CIR-cle, TRI-angle, REC-tangle.',
      'Khuyến khích học sinh giơ ngón tay đếm đồng thanh để tạo không khí sôi nổi.',
    ],
  },
  {
    subject: 'Math',
    subjectNameVi: 'Toán học',
    cefrLevel: 'A2',
    unitTheme: 'Arithmetic Operations & Word Problems (Bốn phép tính & Giải toán có lời văn)',
    lessonObjectives: [
      'Phát âm chính xác các thuật ngữ phép tính: Addition, Subtraction, Multiplication, Division',
      'Hướng dẫn học sinh đọc và tóm tắt đề bài toán có lời văn bằng tiếng Anh',
      'Đặt câu hỏi gợi mở để học sinh tìm ra lời giải từng bước',
    ],
    coreConcepts: [
      {
        conceptEn: 'Four Basic Operations',
        conceptVi: 'Bốn phép tính cơ bản',
        explanation: 'Addition (+), Subtraction (-), Multiplication (×), Division (÷) và dấu bằng (equals).',
      },
      {
        conceptEn: 'Mathematical Problem Solving',
        conceptVi: 'Quy trình giải bài toán',
        explanation: 'Đọc đề (read), tìm từ khóa (find keywords: in total, left, each), lập phép tính (set equation) và trả lời (answer).',
      },
    ],
    keyVocabulary: [
      { term: 'Addition', phonetic: '/əˈdɪʃ.ən/', meaning: 'Phép cộng', exampleSentence: 'Addition helps us find the total sum.' },
      { term: 'Subtraction', phonetic: '/səbˈtræk.ʃən/', meaning: 'Phép trừ', exampleSentence: 'Subtraction shows how many are left.' },
      { term: 'Equation', phonetic: '/ɪˈkweɪ.ʒən/', meaning: 'Phép tính / Phương trình', exampleSentence: 'Write the equation neatly on your paper.' },
      { term: 'Calculate', phonetic: '/ˈkæl.kjʊ.leɪt/', meaning: 'Tính toán', exampleSentence: 'Please calculate the perimeter of this rectangle.' },
      { term: 'Left over', phonetic: '/left ˈəʊ.vər/', meaning: 'Còn lại', exampleSentence: 'How many apples are left over in the basket?' },
    ],
    standardStructures: [
      { patternEn: 'If we have [X] and add [Y], how many do we get in total?', meaningVi: 'Nếu có [X] thêm vào [Y], tổng cộng ta có bao nhiêu?', usageTip: 'Gợi mở bài toán cộng.' },
      { patternEn: 'What is the first step to solve this problem?', meaningVi: 'Bước đầu tiên để giải bài này là gì?', usageTip: 'Khuyến khích tư duy quy trình.' },
    ],
    essentialCommands: [
      { commandEn: 'Underline the numbers and the question in the problem.', meaningVi: 'Gạch chân các con số và câu hỏi trong bài toán.' },
      { commandEn: 'Double-check your calculation before raising your hand.', meaningVi: 'Kiểm tra lại phép tính trước khi giơ tay phát biểu.' },
    ],
    pedagogicalTips: [
      'Dùng sơ đồ đoạn thẳng (Bar Model) để trực quan hóa bài toán có lời văn.',
      'Phân biệt rõ âm /ʃ/ trong addition và subtraction.',
    ],
  },
  {
    subject: 'Math',
    subjectNameVi: 'Toán học',
    cefrLevel: 'B1',
    unitTheme: 'Fractions, Decimals & Geometry Reasoning (Phân số, Số thập phân & Tư duy hình học)',
    lessonObjectives: [
      'Giải thích bản chất của phân số (Numerator/Denominator) và số thập phân',
      'Hướng dẫn học sinh thảo luận và chứng minh tính chất hình học (diện tích, chu vi)',
      'Thuyết trình song ngữ giải thích các bước giải toán nâng cao',
    ],
    coreConcepts: [
      {
        conceptEn: 'Fractions & Ratios',
        conceptVi: 'Phân số và tỉ số',
        explanation: 'Numerator (tử số), denominator (mẫu số), equivalent fractions (phân số tương đương).',
      },
      {
        conceptEn: 'Geometric Measurement',
        conceptVi: 'Đo lường hình học',
        explanation: 'Perimeter (chu vi), area (diện tích), volume (thể tích).',
      },
    ],
    keyVocabulary: [
      { term: 'Numerator', phonetic: '/ˈnjuː.mə.reɪ.tər/', meaning: 'Tử số', exampleSentence: 'The numerator shows the number of parts taken.' },
      { term: 'Denominator', phonetic: '/dɪˈnɒm.ɪ.neɪ.tər/', meaning: 'Mẫu số', exampleSentence: 'The denominator cannot be zero.' },
      { term: 'Perimeter', phonetic: '/pəˈrɪm.ɪ.tər/', meaning: 'Chu vi', exampleSentence: 'Add all four sides together to get the perimeter.' },
      { term: 'Area', phonetic: '/ˈeə.ri.ə/', meaning: 'Diện tích', exampleSentence: 'Multiply length by width to compute the area.' },
      { term: 'Equivalent', phonetic: '/ɪˈkwɪv.əl.ənt/', meaning: 'Tương đương / Bằng nhau', exampleSentence: 'One half is equivalent to two quarters.' },
    ],
    standardStructures: [
      { patternEn: 'To find the [area/perimeter], we multiply [A] by [B].', meaningVi: 'Để tìm [diện tích/chu vi], ta nhân [A] với [B].', usageTip: 'Công thức toán học chuẩn.' },
      { patternEn: 'Can you explain why this fraction is greater than that one?', meaningVi: 'Con có thể giải thích tại sao phân số này lớn hơn phân số kia không?', usageTip: 'Kích thích năng lực lập luận toán học.' },
    ],
    essentialCommands: [
      { commandEn: 'Divide this circle into four equal fractions and shade one quarter.', meaningVi: 'Chia hình tròn thành 4 phần bằng nhau và tô 1/4.' },
      { commandEn: 'Explain your reasoning step by step to your group members.', meaningVi: 'Giải thích từng bước lập luận cho các bạn trong nhóm nhé.' },
    ],
    pedagogicalTips: [
      'Khuyến khích học sinh dùng từ nối: First, Next, Therefore, As a result.',
      'Dùng bánh pizza hoặc thanh sô cô la làm mô hình phân số trực quan.',
    ],
  },

  // ==================== KHOA HỌC & STEM (SCIENCE) ====================
  {
    subject: 'Science',
    subjectNameVi: 'Khoa học & STEM',
    cefrLevel: 'A1',
    unitTheme: 'Living Things, Plants & Senses (Sinh vật, Cây cối & Năm giác quan)',
    lessonObjectives: [
      'Gọi tên các bộ phận của cây xanh: Root, Stem, Leaf, Flower, Fruit',
      'Mô tả các nhu cầu sống thiết yếu: Sunlight, Water, Soil, Air',
      'Hướng dẫn quan sát thiên nhiên và nêu cảm nhận qua giác quan',
    ],
    coreConcepts: [
      {
        conceptEn: 'Parts of a Plant',
        conceptVi: 'Các bộ phận của thực vật',
        explanation: 'Roots absorb water, stem supports the plant, leaves make food via sunlight.',
      },
      {
        conceptEn: 'Living vs Non-living',
        conceptVi: 'Vật sống và vật không sống',
        explanation: 'Living things grow, breathe, and reproduce; non-living things do not.',
      },
    ],
    keyVocabulary: [
      { term: 'Root', phonetic: '/ruːt/', meaning: 'Rễ cây', exampleSentence: 'Roots take water from the soil.' },
      { term: 'Stem', phonetic: '/stem/', meaning: 'Thân cây', exampleSentence: 'The stem stands strong in the wind.' },
      { term: 'Leaf', phonetic: '/liːf/', meaning: 'Chiếc lá', exampleSentence: 'Leaves are green because of chlorophyll.' },
      { term: 'Sunlight', phonetic: '/ˈsʌn.laɪt/', meaning: 'Ánh nắng mặt trời', exampleSentence: 'Plants need warm sunlight to grow.' },
      { term: 'Soil', phonetic: '/sɔɪl/', meaning: 'Đất trồng', exampleSentence: 'Rich dark soil nourishes the plant seeds.' },
    ],
    standardStructures: [
      { patternEn: 'What do plants need to grow healthy and strong?', meaningVi: 'Cây cối cần những gì để lớn nhanh và khỏe mạnh?', usageTip: 'Câu hỏi dẫn dắt bài thực vật.' },
      { patternEn: 'Look closely at the [part]. What color and texture is it?', meaningVi: 'Nhìn kỹ vào [bộ phận]. Nó có màu gì và cảm giác thế nào?', usageTip: 'Khẩu lệnh hướng dẫn quan sát.' },
    ],
    essentialCommands: [
      { commandEn: 'Touch the leaf gently with two fingers.', meaningVi: 'Dùng hai ngón tay chạm nhẹ vào chiếc lá.' },
      { commandEn: 'Water our small classroom potted plant carefully.', meaningVi: 'Tưới nước cẩn thận cho chậu cây nhỏ của lớp mình.' },
    ],
    pedagogicalTips: [
      'Mang lá cây, hoa hoặc củ hành tây nảy mầm vào lớp để học sinh sờ và ngửi.',
      'Sử dụng điệu bộ tay mô phỏng cây nảy mầm (Total Physical Response - TPR).',
    ],
  },
  {
    subject: 'Science',
    subjectNameVi: 'Khoa học & STEM',
    cefrLevel: 'A2',
    unitTheme: 'Scientific Observation & Simple Experiments (Quan sát khoa học & Thí nghiệm)',
    lessonObjectives: [
      'Nắm vững quy trình thí nghiệm khoa học: Hypothesis, Experiment, Observe, Conclude',
      'Nhắc nhở an toàn phòng thí nghiệm và hướng dẫn đo lường chất lỏng, nhiệt độ',
      'Khuyến khích học sinh ghi chép nhật ký khoa học',
    ],
    coreConcepts: [
      {
        conceptEn: 'States of Matter',
        conceptVi: 'Ba trạng thái của vật chất',
        explanation: 'Solid (chất rắn), Liquid (chất lỏng), Gas (chất khí) và sự chuyển thể.',
      },
      {
        conceptEn: 'Scientific Method',
        conceptVi: 'Phương pháp khoa học',
        explanation: 'Đặt câu hỏi, dự đoán, tiến hành thử nghiệm và rút ra kết luận.',
      },
    ],
    keyVocabulary: [
      { term: 'Experiment', phonetic: '/ɪkˈsper.ɪ.mənt/', meaning: 'Thí nghiệm', exampleSentence: 'Today we will do an exciting water experiment.' },
      { term: 'Hypothesis', phonetic: '/haɪˈpɒθ.ə.sɪs/', meaning: 'Giả thuyết khoa học', exampleSentence: 'What is your hypothesis before we mix them?' },
      { term: 'Observe', phonetic: '/əbˈzɜːv/', meaning: 'Quan sát cẩn thận', exampleSentence: 'Observe the bubbles rising to the top.' },
      { term: 'Beaker', phonetic: '/ˈbiː.kər/', meaning: 'Cốc thủy tinh thí nghiệm', exampleSentence: 'Pour fifty milliliters of water into the beaker.' },
      { term: 'Safety goggles', phonetic: '/ˈseɪf.ti ˈɡɒɡ.əlz/', meaning: 'Kính bảo hộ', exampleSentence: 'Wear your safety goggles at all times.' },
    ],
    standardStructures: [
      { patternEn: 'What do you think will happen when we [action]?', meaningVi: 'Các con nghĩ điều gì sẽ xảy ra khi ta [hành động]?', usageTip: 'Kích thích giả thuyết.' },
      { patternEn: 'Based on our observations, what can we conclude?', meaningVi: 'Dựa trên quan sát, chúng ta có thể kết luận được gì?', usageTip: 'Tổng kết kết quả thực nghiệm.' },
    ],
    essentialCommands: [
      { commandEn: 'Put on your safety goggles before pouring the liquid.', meaningVi: 'Đeo kính bảo hộ vào trước khi rót chất lỏng.' },
      { commandEn: 'Record your findings on the observation table.', meaningVi: 'Ghi lại kết quả vào bảng quan sát.' },
    ],
    pedagogicalTips: [
      'An toàn luôn là ưu tiên hàng đầu, nhắc khẩu lệnh an toàn bằng tiếng Anh rõ ràng.',
      'Cho học sinh làm việc theo nhóm 3-4 bạn với vai trò rõ ràng (người đổ nước, người bấm giờ, người ghi chép).',
    ],
  },
  {
    subject: 'Science',
    subjectNameVi: 'Khoa học & STEM',
    cefrLevel: 'B1',
    unitTheme: 'Ecosystems, Energy & Environmental Stewardship (Hệ sinh thái, Năng lượng & Bảo vệ môi trường)',
    lessonObjectives: [
      'Thuyết trình chuỗi thức ăn (Food Chain) và mạng lưới dinh dưỡng (Food Web)',
      'Phân tích nguồn năng lượng tái tạo (Solar, Wind, Hydro) và biến đổi khí hậu',
      'Định hướng học sinh thảo luận giải pháp bảo vệ môi trường sông Hồng và Hà Nội',
    ],
    coreConcepts: [
      {
        conceptEn: 'Ecosystem Balance',
        conceptVi: 'Cân bằng sinh thái',
        explanation: 'Producers (plants), consumers (animals), and decomposers (fungi/bacteria).',
      },
      {
        conceptEn: 'Renewable Energy',
        conceptVi: 'Năng lượng tái tạo',
        explanation: 'Clean energy sources that do not pollute our planet earth.',
      },
    ],
    keyVocabulary: [
      { term: 'Ecosystem', phonetic: '/ˈiː.kəʊˌsɪs.təm/', meaning: 'Hệ sinh thái', exampleSentence: 'Every animal plays a role in the ecosystem.' },
      { term: 'Photosynthesis', phonetic: '/ˌfəʊ.təʊˈsɪn.θə.sɪs/', meaning: 'Quang hợp', exampleSentence: 'Photosynthesis produces oxygen for all living things.' },
      { term: 'Renewable', phonetic: '/rɪˈnjuː.ə.bəl/', meaning: 'Tái tạo được', exampleSentence: 'Solar and wind are clean, renewable energies.' },
      { term: 'Biodiversity', phonetic: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/', meaning: 'Đa dạng sinh học', exampleSentence: 'We must protect biodiversity in our rivers.' },
    ],
    standardStructures: [
      { patternEn: 'Energy flows from the sun to plants through the process of [process].', meaningVi: 'Năng lượng truyền từ mặt trời tới thực vật qua quá trình [quá trình].', usageTip: 'Giải thích dòng năng lượng.' },
      { patternEn: 'How does human activity affect the delicate balance of this habitat?', meaningVi: 'Hoạt động con người ảnh hưởng thế nào đến sự cân bằng này?', usageTip: 'Câu hỏi tư duy môi trường B1.' },
    ],
    essentialCommands: [
      { commandEn: 'Diagram the food chain showing energy arrows correctly.', meaningVi: 'Vẽ sơ đồ chuỗi thức ăn với các mũi tên năng lượng chính xác.' },
      { commandEn: 'Debate with your partner the benefits of solar energy.', meaningVi: 'Thảo luận với bạn về lợi ích của năng lượng mặt trời.' },
    ],
    pedagogicalTips: [
      'Khuyến khích học sinh liên hệ với thực tế Hà Nội: cây xanh Hồ Gươm, nước sông Hồng.',
      'Sử dụng thuật ngữ chính xác và khuyến khích học sinh dùng sơ đồ tư duy (Mindmap).',
    ],
  },

  // ==================== TIN HỌC & CÔNG NGHỆ (ICT) ====================
  {
    subject: 'ICT',
    subjectNameVi: 'Tin học & Công nghệ',
    cefrLevel: 'A1',
    unitTheme: 'Computer Hardware & Mouse Operations (Phần cứng & Thao tác chuột máy tính)',
    lessonObjectives: [
      'Nhận biết các bộ phận máy tính: Monitor, Keyboard, Mouse, Central Unit, Speaker',
      'Thực hiện thành thạo thao tác chuột: Left click, Right click, Double click, Drag and Drop',
      'Sử dụng khẩu lệnh điều hành phòng máy an toàn',
    ],
    coreConcepts: [
      {
        conceptEn: 'Computer Peripherals',
        conceptVi: 'Thiết bị ngoại vi máy tính',
        explanation: 'Screen (màn hình hiển thị), keyboard (bàn phím nhập liệu), mouse (chuột điều khiển).',
      },
      {
        conceptEn: 'Basic Mouse Navigation',
        conceptVi: 'Kỹ năng điều hướng chuột',
        explanation: 'Click (chọn), double click (mở ứng dụng), drag and drop (kéo thả đối tượng).',
      },
    ],
    keyVocabulary: [
      { term: 'Monitor', phonetic: '/ˈmɒn.ɪ.tər/', meaning: 'Màn hình máy tính', exampleSentence: 'Turn on the monitor with the power button.' },
      { term: 'Keyboard', phonetic: '/ˈkiː.bɔːd/', meaning: 'Bàn phím', exampleSentence: 'Place your fingers gently on the keyboard.' },
      { term: 'Mouse', phonetic: '/maʊs/', meaning: 'Chuột máy tính', exampleSentence: 'Hold the mouse with your right hand.' },
      { term: 'Click', phonetic: '/klɪk/', meaning: 'Nhấp chuột', exampleSentence: 'Click once on the icon to select it.' },
      { term: 'Drag', phonetic: '/dræɡ/', meaning: 'Kéo chuột', exampleSentence: 'Drag the blue box into the empty circle.' },
    ],
    standardStructures: [
      { patternEn: 'Hold your mouse and click on the [icon] button.', meaningVi: 'Cầm chuột và nhấp vào nút [biểu tượng].', usageTip: 'Chỉ dẫn thao tác cơ bản.' },
      { patternEn: 'Where is the [spacebar/enter key] on your keyboard?', meaningVi: 'Phím [cách/Enter] nằm ở đâu trên bàn phím của con?', usageTip: 'Kiểm tra vị trí phím.' },
    ],
    essentialCommands: [
      { commandEn: 'Double-click the blue folder on your desktop.', meaningVi: 'Nhấp đúp chuột vào thư mục màu xanh trên màn hình chính.' },
      { commandEn: 'Keep water bottles and food away from the computer desk.', meaningVi: 'Để chai nước và đồ ăn xa bàn máy tính nhé.' },
    ],
    pedagogicalTips: [
      'Cho học sinh luyện tập qua các trò chơi điều khiển chuột đơn giản.',
      'Nhắc nhở tư thế ngồi thẳng, khoảng cách mắt đến màn hình tối thiểu 40-50cm.',
    ],
  },
  {
    subject: 'ICT',
    subjectNameVi: 'Tin học & Công nghệ',
    cefrLevel: 'A2',
    unitTheme: 'Word Processing, Files & Internet Safety (Soạn thảo văn bản, Tệp tin & An toàn mạng)',
    lessonObjectives: [
      'Hướng dẫn học sinh gõ văn bản tiếng Anh, định dạng chữ: Bold, Italic, Font Size, Alignment',
      'Quản lý tệp tin và thư mục: Save, Open, Rename, Delete',
      'Nhắc nhở nguyên tắc an toàn thông tin cơ bản cho học sinh tiểu học',
    ],
    coreConcepts: [
      {
        conceptEn: 'Word Processing Formatting',
        conceptVi: 'Định dạng văn bản',
        explanation: 'Thay đổi kiểu chữ, kích cỡ, màu sắc và căn lề đoạn văn.',
      },
      {
        conceptEn: 'Online Cyber Safety',
        conceptVi: 'An toàn trên không gian mạng',
        explanation: 'Giữ kín mật khẩu cá nhân, không bấm vào đường link lạ, thông báo cho thầy cô khi gặp nguy hiểm.',
      },
    ],
    keyVocabulary: [
      { term: 'Folder', phonetic: '/ˈfəʊl.dər/', meaning: 'Thư mục chứa tệp', exampleSentence: 'Save your file inside your class folder.' },
      { term: 'Save', phonetic: '/seɪv/', meaning: 'Lưu tệp tin', exampleSentence: 'Always press Ctrl+S to save your work.' },
      { term: 'Font size', phonetic: '/fɒnt saɪz/', meaning: 'Cỡ chữ', exampleSentence: 'Change the title font size to sixteen.' },
      { term: 'Password', phonetic: '/ˈpɑːs.wɜːd/', meaning: 'Mật khẩu bảo vệ', exampleSentence: 'Keep your secret password safe from others.' },
      { term: 'Internet', phonetic: '/ˈɪn.tə.net/', meaning: 'Mạng Internet', exampleSentence: 'The Internet is full of wonderful learning resources.' },
    ],
    standardStructures: [
      { patternEn: 'To highlight the title, make it [bold/italic] and centered.', meaningVi: 'Để làm nổi bật tiêu đề, hãy in đậm và căn giữa nhé.', usageTip: 'Chỉ dẫn định dạng văn bản.' },
      { patternEn: 'Never reveal your [personal info/password] on public websites.', meaningVi: 'Không bao giờ để lộ [thông tin cá nhân/mật khẩu] trên mạng.', usageTip: 'Giáo dục an toàn số.' },
    ],
    essentialCommands: [
      { commandEn: 'Press Control and S together to save your document.', meaningVi: 'Nhấn đồng thời phím Ctrl và S để lưu tài liệu.' },
      { commandEn: 'Log out of your student account before leaving the room.', meaningVi: 'Đăng xuất khỏi tài khoản trước khi rời phòng máy nhé.' },
    ],
    pedagogicalTips: [
      'Tạo thói quen lưu bài (Ctrl+S) thường xuyên cho học sinh.',
      'Gắn bài tập gõ văn bản với các câu tiếng Anh đã học trong bài Global Success.',
    ],
  },
  {
    subject: 'ICT',
    subjectNameVi: 'Tin học & Công nghệ',
    cefrLevel: 'B1',
    unitTheme: 'Visual Block Programming & Algorithms (Lập trình khối Scratch & Thuật toán)',
    lessonObjectives: [
      'Giải thích khái niệm thuật toán tuần tự (Sequence), vòng lặp (Loop), điều kiện (If-Then)',
      'Hướng dẫn ghép khối lệnh trong Scratch hoặc phần mềm lập trình trực quan',
      'Khuyến khích học sinh tự sửa lỗi (Debugging) và sáng tạo trò chơi nhỏ',
    ],
    coreConcepts: [
      {
        conceptEn: 'Algorithm & Logic',
        conceptVi: 'Thuật toán và tư duy logic',
        explanation: 'Chuỗi các bước chỉ dẫn rõ ràng để máy tính thực thi nhiệm vụ.',
      },
      {
        conceptEn: 'Block-based Coding',
        conceptVi: 'Lập trình kéo thả theo khối',
        explanation: 'Motion blocks, Look blocks, Sound blocks, Control loops trong Scratch.',
      },
    ],
    keyVocabulary: [
      { term: 'Algorithm', phonetic: '/ˈæl.ɡə.rɪ.ðəm/', meaning: 'Thuật toán', exampleSentence: 'An algorithm is a step-by-step recipe for computers.' },
      { term: 'Loop', phonetic: '/luːp/', meaning: 'Vòng lặp', exampleSentence: 'Use a repeat loop to avoid duplicate code blocks.' },
      { term: 'Sprite', phonetic: '/spraɪt/', meaning: 'Nhân vật hoạt hình', exampleSentence: 'Make the cat sprite jump when space is pressed.' },
      { term: 'Debug', phonetic: '/diːˈbʌɡ/', meaning: 'Sửa lỗi lập trình', exampleSentence: 'Let’s debug the code to find why it stops.' },
      { term: 'Condition', phonetic: '/kənˈdɪʃ.ən/', meaning: 'Điều kiện (If/Then)', exampleSentence: 'If the sprite touches the edge, bounce back.' },
    ],
    standardStructures: [
      { patternEn: 'When the green flag is clicked, the sprite will [action].', meaningVi: 'Khi bấm vào lá cờ xanh, nhân vật sẽ thực hiện [hành động].', usageTip: 'Mẫu câu lập trình Scratch chuẩn.' },
      { patternEn: 'How can we optimize this sequence using a repeat loop?', meaningVi: 'Làm thế nào để tối ưu chuỗi lệnh này bằng vòng lặp?', usageTip: 'Kích thích tư duy tối ưu hóa mã nguồn.' },
    ],
    essentialCommands: [
      { commandEn: 'Snap the repeat block around your movement commands.', meaningVi: 'Gắn khối lệnh lặp bao quanh các lệnh di chuyển.' },
      { commandEn: 'Run your project and test every branch of your condition.', meaningVi: 'Chạy thử dự án và kiểm tra mọi nhánh điều kiện nhé.' },
    ],
    pedagogicalTips: [
      'Dạy học sinh tư duy từng bước như giải một câu đố vui.',
      'Tạo cơ hội cho các nhóm trình chiếu sản phẩm hoạt hình của mình trước lớp.',
    ],
  },

  // ==================== MỸ THUẬT & THỦ CÔNG (ART) ====================
  {
    subject: 'Art',
    subjectNameVi: 'Mỹ thuật & Thủ công',
    cefrLevel: 'A1',
    unitTheme: 'Primary Colors, Shapes & Basic Crafting (Màu cơ bản, Đường nét & Thủ công)',
    lessonObjectives: [
      'Gọi tên 3 màu gốc: Red, Blue, Yellow và các màu phụ sinh ra khi pha trộn',
      'Hướng dẫn các nét vẽ: Straight line, Curved line, Zigzag, Dot',
      'Khẩu lệnh sử dụng cọ vẽ, bút màu sáp và giữ gìn vệ sinh phòng vẽ',
    ],
    coreConcepts: [
      {
        conceptEn: 'Primary Colors',
        conceptVi: 'Các màu sắc nguyên bản (màu gốc)',
        explanation: 'Red, yellow, and blue cannot be made by mixing other colors.',
      },
      {
        conceptEn: 'Basic Lines and Strokes',
        conceptVi: 'Các nét vẽ cơ bản',
        explanation: 'Lines define shapes and give energy to drawings.',
      },
    ],
    keyVocabulary: [
      { term: 'Paintbrush', phonetic: '/ˈpeɪnt.brʌʃ/', meaning: 'Cây cọ vẽ', exampleSentence: 'Dip your paintbrush lightly into water.' },
      { term: 'Crayon', phonetic: '/ˈkreɪ.ɒn/', meaning: 'Bút màu sáp', exampleSentence: 'Color inside the lines with your wax crayon.' },
      { term: 'Mix', phonetic: '/mɪks/', meaning: 'Pha trộn màu', exampleSentence: 'Mix red and blue to make royal purple.' },
      { term: 'Palette', phonetic: '/ˈpæl.ət/', meaning: 'Bảng pha màu', exampleSentence: 'Squeeze a drop of yellow onto your palette.' },
      { term: 'Scissors', phonetic: '/ˈsɪz.əz/', meaning: 'Chiếc kéo thủ công', exampleSentence: 'Hold your safety scissors with care.' },
    ],
    standardStructures: [
      { patternEn: 'What color do we get if we mix [color A] with [color B]?', meaningVi: 'Ta sẽ được màu gì nếu pha [màu A] với [màu B]?', usageTip: 'Kích thích khám phá pha màu.' },
      { patternEn: 'Draw a gentle [line type] across your paper.', meaningVi: 'Vẽ một đường [loại đường nét] nhẹ nhàng ngang qua trang giấy.', usageTip: 'Chỉ dẫn kỹ thuật vẽ.' },
    ],
    essentialCommands: [
      { commandEn: 'Rinse your paintbrush thoroughly in the water jar.', meaningVi: 'Rửa sạch cọ vẽ trong lọ nước nhé.' },
      { commandEn: 'Wipe your hands with a damp cloth after painting.', meaningVi: 'Lau tay bằng khăn ẩm sau khi vẽ xong.' },
    ],
    pedagogicalTips: [
      'Cho học sinh thử pha màu bằng ngón tay hoặc bông tăm để tạo hứng thú.',
      'Luôn khen ngợi sự sáng tạo độc đáo của từng học sinh, không áp đặt màu sắc khuôn mẫu.',
    ],
  },
  {
    subject: 'Art',
    subjectNameVi: 'Mỹ thuật & Thủ công',
    cefrLevel: 'A2',
    unitTheme: 'Paper Folding, Symmetrical Art & Warm/Cool Hues (Gấp giấy, Trục đối xứng & Gam màu nóng/lạnh)',
    lessonObjectives: [
      'Phân biệt gam màu nóng (Warm colors: Red, Orange, Yellow) và màu lạnh (Cool colors: Blue, Green, Purple)',
      'Hướng dẫn kỹ thuật gấp giấy thủ công Origami và cắt dán họa tiết đối xứng',
      'Động viên học sinh mô tả tác phẩm mỹ thuật của bản thân bằng tiếng Anh',
    ],
    coreConcepts: [
      {
        conceptEn: 'Color Temperature',
        conceptVi: 'Sắc thái nhiệt độ màu sắc',
        explanation: 'Warm colors evoke sunshine and energy; cool colors evoke water and calmness.',
      },
      {
        conceptEn: 'Symmetry & Balance',
        conceptVi: 'Tính đối xứng và cân bằng thị giác',
        explanation: 'Folding along the midline produces matching halves.',
      },
    ],
    keyVocabulary: [
      { term: 'Symmetry', phonetic: '/ˈsɪm.ə.tri/', meaning: 'Tính đối xứng', exampleSentence: 'A butterfly has beautiful bilateral symmetry.' },
      { term: 'Fold', phonetic: '/fəʊld/', meaning: 'Gấp giấy', exampleSentence: 'Fold the square paper along the diagonal.' },
      { term: 'Origami', phonetic: '/ˌɒr.ɪˈɡɑː.mi/', meaning: 'Nghệ thuật gấp giấy', exampleSentence: 'Origami teaches us patience and precision.' },
      { term: 'Texture', phonetic: '/ˈteks.tʃər/', meaning: 'Chất cảm bề mặt', exampleSentence: 'Use crumpled paper to create a rough texture.' },
      { term: 'Pattern', phonetic: '/ˈpæt.ən/', meaning: 'Họa tiết lặp lại', exampleSentence: 'Repeat stars and dots to create a border pattern.' },
    ],
    standardStructures: [
      { patternEn: 'Does this artwork give you a [warm/peaceful] feeling?', meaningVi: 'Bức tranh này mang lại cho con cảm giác [ấm áp/bình yên] không?', usageTip: 'Phát triển cảm thụ mỹ thuật.' },
      { patternEn: 'Fold the edge carefully so the two corners meet perfectly.', meaningVi: 'Gấp mép thật cẩn thận để hai góc trùng khít nhau.', usageTip: 'Chỉ dẫn thao tác gấp giấy.' },
    ],
    essentialCommands: [
      { commandEn: 'Use glue sparingly so the paper does not wrinkle.', meaningVi: 'Bôi một lượng keo vừa phải để giấy không bị nhăn.' },
      { commandEn: 'Hold up your artwork to share with the class.', meaningVi: 'Giơ tác phẩm lên để chia sẻ cùng cả lớp nào.' },
    ],
    pedagogicalTips: [
      'Cho học sinh làm phòng trưng bày tranh nhỏ tại góc lớp (Gallery Walk).',
      'Tập cho học sinh dùng từ khen: "I love your color choice!", "Your lines are so smooth!"',
    ],
  },
  {
    subject: 'Art',
    subjectNameVi: 'Mỹ thuật & Thủ công',
    cefrLevel: 'B1',
    unitTheme: 'Perspective, Folk Heritage Art & Cultural Appreciation (Luật xa gần, Tranh dân gian & Di sản văn hóa)',
    lessonObjectives: [
      'Giải thích luật xa gần (Linear perspective, Horizon line, Vanishing point)',
      'Giới thiệu dòng tranh dân gian Đông Hồ, Hàng Trống của Việt Nam bằng tiếng Anh',
      'Tổ chức cho học sinh thuyết trình cảm thụ nghệ thuật và thông điệp bức tranh',
    ],
    coreConcepts: [
      {
        conceptEn: 'Perspective & Depth',
        conceptVi: 'Luật xa gần và chiều sâu không gian',
        explanation: 'Objects close to the viewer appear larger and clearer than distant objects.',
      },
      {
        conceptEn: 'Vietnamese Folk Art',
        conceptVi: 'Mỹ thuật dân gian Việt Nam',
        explanation: 'Dong Ho woodblock prints using natural colors on Do paper (dó paper).',
      },
    ],
    keyVocabulary: [
      { term: 'Perspective', phonetic: '/pəˈspek.tɪv/', meaning: 'Luật phối cảnh xa gần', exampleSentence: 'Perspective creates the illusion of three-dimensional depth.' },
      { term: 'Horizon line', phonetic: '/həˈraɪ.zən laɪn/', meaning: 'Đường chân trời', exampleSentence: 'Draw the horizon line across the center of your canvas.' },
      { term: 'Folk painting', phonetic: '/fəʊk ˈpeɪn.tɪŋ/', meaning: 'Tranh dân gian', exampleSentence: 'Dong Ho folk paintings depict joyful village life.' },
      { term: 'Shading', phonetic: '/ˈʃeɪ.dɪŋ/', meaning: 'Đánh bóng tạo khối sáng tối', exampleSentence: 'Add gentle shading under the tree to show the shadow.' },
    ],
    standardStructures: [
      { patternEn: 'Notice how the road becomes narrower as it approaches the vanishing point.', meaningVi: 'Hãy chú ý con đường hẹp dần khi tiến gần tới điểm tụ.', usageTip: 'Giảng dạy luật xa gần.' },
      { patternEn: 'What story or traditional value does this painting convey?', meaningVi: 'Bức tranh này truyền tải câu chuyện hoặc giá trị truyền thống nào?', usageTip: 'Câu hỏi phân tích nghệ thuật B1.' },
    ],
    essentialCommands: [
      { commandEn: 'Sketch the vanishing point lightly with your pencil.', meaningVi: 'Phác họa nhẹ điểm tụ bằng bút chì.' },
      { commandEn: 'Describe the mood of your masterpiece in three adjectives.', meaningVi: 'Mô tả cảm xúc bức tranh của con bằng ba tính từ.' },
    ],
    pedagogicalTips: [
      'Kết nối tranh dân gian với văn hóa Tết truyền thống của học sinh Việt Nam.',
      'Rèn cho học sinh kỹ năng dùng tính từ biểu cảm phong phú.',
    ],
  },

  // ==================== ÂM NHẠC (MUSIC) ====================
  {
    subject: 'Music',
    subjectNameVi: 'Âm nhạc',
    cefrLevel: 'A1',
    unitTheme: 'Pitch, Rhythm & Body Percussion (Cao độ, Nhịp điệu & Bộ gõ cơ thể)',
    lessonObjectives: [
      'Phân biệt âm cao (High pitch) và âm trầm (Low pitch)',
      'Vỗ tay theo phách nhịp 2/4 và 4/4: Beat, Rhythm, Clap, Stamp',
      'Khởi động giọng hát và hướng dẫn tư thế ca hát đúng',
    ],
    coreConcepts: [
      {
        conceptEn: 'Pitch: High vs Low',
        conceptVi: 'Cao độ: Cao và Trầm',
        explanation: 'Bird singing is high; lion roaring is low.',
      },
      {
        conceptEn: 'Pulse & Beat',
        conceptVi: 'Nhịp tim và phách nhạc',
        explanation: 'The steady heartbeat of music that stays constant.',
      },
    ],
    keyVocabulary: [
      { term: 'Rhythm', phonetic: '/ˈrɪð.əm/', meaning: 'Tiết tấu / Nhịp điệu', exampleSentence: 'Feel the bouncy rhythm of the cheerful song.' },
      { term: 'Melody', phonetic: '/ˈmel.ə.di/', meaning: 'Giai điệu', exampleSentence: 'Hum the sweet melody along with the teacher.' },
      { term: 'Beat', phonetic: '/biːt/', meaning: 'Phách nhịp', exampleSentence: 'Clap on every beat: one, two, three, four.' },
      { term: 'High pitch', phonetic: '/haɪ pɪtʃ/', meaning: 'Âm thanh cao', exampleSentence: 'A flute makes a lovely high pitch.' },
      { term: 'Low pitch', phonetic: '/ləʊ pɪtʃ/', meaning: 'Âm thanh trầm', exampleSentence: 'The big drum produces a deep, low pitch.' },
    ],
    standardStructures: [
      { patternEn: 'Listen to the sound: is it high like a bird or low like a bear?', meaningVi: 'Lắng nghe âm thanh: nó cao như chim hót hay trầm như gấu gầm?', usageTip: 'Luyện tai nghe phân biệt cao độ.' },
      { patternEn: 'Let’s clap to the steady beat together: one, two, ready, go!', meaningVi: 'Cùng vỗ tay theo nhịp đều đặn nào: một, hai, sẵn sàng, bắt đầu!', usageTip: 'Bắt nhịp bài hát.' },
    ],
    essentialCommands: [
      { commandEn: 'Sit up tall, breathe through your belly, and sing sweetly.', meaningVi: 'Ngồi thẳng người, lấy hơi bằng bụng và hát thật ngọt ngào nhé.' },
      { commandEn: 'Tap your feet lightly to keep the musical tempo.', meaningVi: 'Gõ nhẹ bàn chân để giữ nhịp bài hát.' },
    ],
    pedagogicalTips: [
      'Sử dụng body percussion: vỗ tay (clap), búng tay (snap), vỗ đùi (pat), giậm chân (stamp).',
      'Khen ngợi học sinh khi cả lớp hát đồng thanh ăn khớp về cao độ.',
    ],
  },
  {
    subject: 'Music',
    subjectNameVi: 'Âm nhạc',
    cefrLevel: 'A2',
    unitTheme: 'Musical Instruments & Dynamic Expressions (Nhạc cụ & Biểu cảm âm lượng)',
    lessonObjectives: [
      'Nhận biết các họ nhạc cụ: Strings (dây), Wind (thổi), Percussion (gõ), Keyboard (phím)',
      'Phát âm và áp dụng sắc thái âm lượng: Piano (êm dịu, nhỏ), Forte (hùng hồn, to)',
      'Hướng dẫn xướng âm các nốt nhạc Đồ - Rê - Mi - Pha - Son - La - Si',
    ],
    coreConcepts: [
      {
        conceptEn: 'Families of Instruments',
        conceptVi: 'Các bộ nhạc cụ',
        explanation: 'Dây (guitar, violin), gõ (drum, triangle), hơi (flute, recorder), phím (piano).',
      },
      {
        conceptEn: 'Musical Dynamics',
        conceptVi: 'Sắc thái âm lượng trong âm nhạc',
        explanation: 'Soft (piano - p) and loud (forte - f) create emotion in music.',
      },
    ],
    keyVocabulary: [
      { term: 'Instruments', phonetic: '/ˈɪn.strə.mənts/', meaning: 'Các loại nhạc cụ', exampleSentence: 'Which instruments can you hear in this song?' },
      { term: 'Percussion', phonetic: '/pəˈkʌʃ.ən/', meaning: 'Nhạc cụ gõ', exampleSentence: 'Tambourine and drums belong to the percussion family.' },
      { term: 'Forte', phonetic: '/ˈfɔː.teɪ/', meaning: 'Hát to, mạnh mẽ', exampleSentence: 'Sing the chorus forte with energy and joy!' },
      { term: 'Piano', phonetic: '/piˈæn.əʊ/', meaning: 'Hát nhỏ, êm dịu', exampleSentence: 'Sing the verse softly like a whisper.' },
      { term: 'Solfege', phonetic: '/ˈsɒl.feʒ/', meaning: 'Xướng âm (Do Re Mi)', exampleSentence: 'Practice the solfege hand signs as you sing.' },
    ],
    standardStructures: [
      { patternEn: 'Which family of instruments does the [guitar/flute] belong to?', meaningVi: '[Đàn ghi-ta/sáo] thuộc về họ nhạc cụ nào?', usageTip: 'Kiểm tra kiến thức nhạc cụ.' },
      { patternEn: 'Start singing softly, then gradually grow louder as the sun rises.', meaningVi: 'Bắt đầu hát êm dịu, sau đó to dần như ánh bình minh dâng lên.', usageTip: 'Chỉ dẫn sắc thái crescendo.' },
    ],
    essentialCommands: [
      { commandEn: 'Inhale deeply through your nose and sustain the note Do.', meaningVi: 'Hít sâu bằng mũi và giữ dài nốt Đô.' },
      { commandEn: 'Watch my conducting hands for tempo and dynamic changes.', meaningVi: 'Quan sát tay cô chỉ huy để nhận biết nhịp điệu và sắc thái thay đổi.' },
    ],
    pedagogicalTips: [
      'Dùng ký hiệu bàn tay Kodály cho các nốt Do, Re, Mi, Fa, Sol, La, Ti.',
      'Tập cho học sinh cảm thụ bài hát thông qua câu chuyện xúc động đằng sau giai điệu.',
    ],
  },
  {
    subject: 'Music',
    subjectNameVi: 'Âm nhạc',
    cefrLevel: 'B1',
    unitTheme: 'Vietnamese Folk Songs & Choral Harmony (Dân ca Việt Nam & Hòa ca đa bè)',
    lessonObjectives: [
      'Giới thiệu các điệu dân ca đặc sắc của Việt Nam (Lý cây bông, Trống cơm, Quan họ) bằng tiếng Anh',
      'Tổ chức hát bè đơn giản (Round / Canon singing, Two-part harmony)',
      'Phát triển khả năng cảm thụ âm nhạc đa văn hóa cho học sinh tiểu học',
    ],
    coreConcepts: [
      {
        conceptEn: 'Vietnamese Folk Melodies',
        conceptVi: 'Dân ca cổ truyền Việt Nam',
        explanation: 'Pentatonic scale (ngũ cung) with graceful ornamentation and heartfelt lyrics.',
      },
      {
        conceptEn: 'Polyphony & Rounds',
        conceptVi: 'Hát bè đuổi và hòa âm',
        explanation: 'Group A sings first, Group B enters two measures later.',
      },
    ],
    keyVocabulary: [
      { term: 'Folk song', phonetic: '/fəʊk sɒŋ/', meaning: 'Bài hát dân ca', exampleSentence: 'Trong com is a joyful northern Vietnamese folk song.' },
      { term: 'Harmony', phonetic: '/ˈhɑː.mə.ni/', meaning: 'Hòa âm đa tầng', exampleSentence: 'Singing in harmony creates rich, resonant layers.' },
      { term: 'Chorus', phonetic: '/ˈkɔː.rəs/', meaning: 'Dàn hợp xướng / Điệp khúc', exampleSentence: 'The entire chorus sang in wonderful unison.' },
      { term: 'Pentatonic', phonetic: '/ˌpen.təˈtɒn.ɪk/', meaning: 'Thang âm ngũ cung', exampleSentence: 'Traditional melodies often use a pentatonic scale.' },
    ],
    standardStructures: [
      { patternEn: 'Group A starts the verse, and Group B enters at the second bar.', meaningVi: 'Nhóm A bắt đầu câu hát, nhóm B sẽ vào ở nhịp thứ hai.', usageTip: 'Chỉ huy hát bè đuổi.' },
      { patternEn: 'How does the melody reflect the peaceful countryside of Vietnam?', meaningVi: 'Giai điệu phản ánh cảnh làng quê thanh bình của Việt Nam như thế nào?', usageTip: 'Cảm thụ âm nhạc nâng cao.' },
    ],
    essentialCommands: [
      { commandEn: 'Listen to the other group while keeping your own melodic line steady.', meaningVi: 'Lắng nghe bè bạn trong khi vẫn giữ vững giai điệu của bè mình.' },
      { commandEn: 'Convey warmth and pride in your facial expression as you sing.', meaningVi: 'Thể hiện sự ấm áp và tự hào trên nét mặt khi hát nhé.' },
    ],
    pedagogicalTips: [
      'Cho học sinh nghe bản ghi âm hòa tấu nhạc cụ dân tộc (đàn bầu, đàn tranh, sáo trúc).',
      'Giáo dục tình yêu quê hương đất nước qua lời ca tiếng hát.',
    ],
  },

  // ==================== GIÁO DỤC THỂ CHẤT (PE) ====================
  {
    subject: 'PE',
    subjectNameVi: 'Giáo dục thể chất',
    cefrLevel: 'A1',
    unitTheme: 'Formations, Warm-ups & Basic Motor Skills (Đội hình đội ngũ, Khởi động & Vận động cơ bản)',
    lessonObjectives: [
      'Khẩu lệnh tập hợp đội ngũ sân trường: Fall in, Attention, At ease, Right turn, Left turn',
      'Khởi động các khớp: Head roll, Arm circles, Knee bends, Jumping jacks',
      'Rèn luyện tác phong nhanh nhẹn, kỷ luật trên sân tập',
    ],
    coreConcepts: [
      {
        conceptEn: 'Line Formations & Posture',
        conceptVi: 'Đội hình hàng ngũ và tư thế đứng',
        explanation: 'Straight lines, head held high, chest out, eyes forward.',
      },
      {
        conceptEn: 'Joint Mobility Warm-up',
        conceptVi: 'Khởi động khớp chống chấn thương',
        explanation: 'Rotating wrists, ankles, shoulders, and hips before vigorous exercise.',
      },
    ],
    keyVocabulary: [
      { term: 'Attention', phonetic: '/əˈten.ʃən/', meaning: 'Nghiêm!', exampleSentence: 'Class, attention! Stand tall and quiet.' },
      { term: 'At ease', phonetic: '/æt iːz/', meaning: 'Nghỉ!', exampleSentence: 'At ease! Relax your left foot.' },
      { term: 'Warm up', phonetic: '/wɔːm ʌp/', meaning: 'Khởi động cơ thể', exampleSentence: 'Always warm up before running fast.' },
      { term: 'Stretch', phonetic: '/stretʃ/', meaning: 'Kéo dãn cơ bắp', exampleSentence: 'Stretch your arms up high towards the sky.' },
      { term: 'Jump', phonetic: '/dʒʌmp/', meaning: 'Nhảy bật cao', exampleSentence: 'Jump with both feet landing softly.' },
    ],
    standardStructures: [
      { patternEn: 'Class, fall in into [two/four] straight rows!', meaningVi: 'Cả lớp tập hợp thành [hai/bốn] hàng dọc!', usageTip: 'Hiệu lệnh tập hợp mở đầu.' },
      { patternEn: 'Follow my movement: arms up, breathe in, arms down, breathe out.', meaningVi: 'Làm theo động tác của thầy: giơ tay hít vào, hạ tay thở ra.', usageTip: 'Chỉ dẫn động tác điều hòa.' },
    ],
    essentialCommands: [
      { commandEn: 'Look straight ahead and keep an arm’s distance from your friend.', meaningVi: 'Nhìn thẳng về phía trước và giữ cự ly một cánh tay với bạn.' },
      { commandEn: 'Land softly on your toes to protect your knees.', meaningVi: 'Tiếp đất êm bằng mũi bàn chân để bảo vệ khớp gối.' },
    ],
    pedagogicalTips: [
      'Giọng hô to, dứt khoát, dùng còi hiệu lệnh rõ ràng.',
      'Luôn chú ý kiểm tra trang phục thể thao và giày buộc dây an toàn của học sinh.',
    ],
  },
  {
    subject: 'PE',
    subjectNameVi: 'Giáo dục thể chất',
    cefrLevel: 'A2',
    unitTheme: 'Ball Skills, Relay Races & Team Spirit (Kỹ năng bóng, Chạy tiếp sức & Tinh thần đồng đội)',
    lessonObjectives: [
      'Chỉ dẫn kỹ năng chuyền bóng, ném bóng, bắt bóng: Pass, Catch, Throw, Bounce, Dribble',
      'Tổ chức trò chơi chạy tiếp sức (Relay race) an toàn và hào hứng',
      'Xây dựng tinh thần đoàn kết, cổ vũ fair-play',
    ],
    coreConcepts: [
      {
        conceptEn: 'Ball Handling & Coordination',
        conceptVi: 'Kỹ năng khống chế và phối hợp bóng',
        explanation: 'Hand-eye coordination, catching with soft hands, passing with accuracy.',
      },
      {
        conceptEn: 'Relay & Cooperation',
        conceptVi: 'Chạy tiếp sức và hợp tác đồng đội',
        explanation: 'Passing the baton smoothly, running at full speed, cheering teammates.',
      },
    ],
    keyVocabulary: [
      { term: 'Pass', phonetic: '/pɑːs/', meaning: 'Chuyền bóng', exampleSentence: 'Pass the basketball with two hands to your partner.' },
      { term: 'Catch', phonetic: '/kætʃ/', meaning: 'Bắt bóng an toàn', exampleSentence: 'Watch the ball all the way until you catch it.' },
      { term: 'Baton', phonetic: '/ˈbæt.ɒn/', meaning: 'Gậy tiếp sức', exampleSentence: 'Hold the baton firmly without dropping it.' },
      { term: 'Teammate', phonetic: '/ˈtiːm.meɪt/', meaning: 'Đồng đội', exampleSentence: 'Cheer loudly for your hardworking teammates!' },
      { term: 'Fair play', phonetic: '/feər pleɪ/', meaning: 'Tinh thần thể thao cao thượng', exampleSentence: 'Fair play means respecting opponents and rules.' },
    ],
    standardStructures: [
      { patternEn: 'Pass the ball to the student on your right as soon as you hear the whistle.', meaningVi: 'Chuyền bóng cho bạn bên phải ngay khi nghe tiếng còi.', usageTip: 'Chỉ dẫn trò chơi bóng.' },
      { patternEn: 'High-five your partner and say "Good game!" after each round.', meaningVi: 'Đập tay với bạn và nói "Trận đấu hay lắm!" sau mỗi hiệp.', usageTip: 'Rèn luyện văn hóa thể thao.' },
    ],
    essentialCommands: [
      { commandEn: 'Ready, steady, go! Run around the yellow cone and sprint back.', meaningVi: 'Sẵn sàng, chạy! Chạy vòng qua nón vàng và bứt tốc về đích.' },
      { commandEn: 'Keep both hands ready in front of your chest to receive the pass.', meaningVi: 'Để sẵn hai tay trước ngực để nhận bóng nhé.' },
    ],
    pedagogicalTips: [
      'Tạo cơ hội cho mọi học sinh tham gia, không chỉ tập trung vào học sinh thể lực tốt.',
      'Luôn có tràng pháo tay cổ vũ cho đội về sau để khích lệ nỗ lực.',
    ],
  },
  {
    subject: 'PE',
    subjectNameVi: 'Giáo dục thể chất',
    cefrLevel: 'B1',
    unitTheme: 'Sports Strategy, Cardiovascular Health & Leadership (Chiến thuật thể thao & Sức khỏe tim mạch)',
    lessonObjectives: [
      'Giải thích lợi ích của vận động với sức khỏe tim mạch và trí tuệ',
      'Hướng dẫn chiến thuật tấn công và phòng thủ cơ bản trong bóng rổ, bóng đá mini',
      'Rèn luyện vai trò đội trưởng, giải quyết tình huống trên sân',
    ],
    coreConcepts: [
      {
        conceptEn: 'Cardiovascular Endurance',
        conceptVi: 'Sức bền tim mạch',
        explanation: 'Regular physical activity strengthens the heart and lungs.',
      },
      {
        conceptEn: 'Tactical Positioning',
        conceptVi: 'Chiến thuật vị trí sân đấu',
        explanation: 'Spacing out, defending the goal, and supporting teammates.',
      },
    ],
    keyVocabulary: [
      { term: 'Endurance', phonetic: '/ɪnˈdʒʊə.rəns/', meaning: 'Sức bền thể lực', exampleSentence: 'Jogging builds strong aerobic endurance.' },
      { term: 'Defense', phonetic: '/dɪˈfens/', meaning: 'Phòng thủ', exampleSentence: 'Stay between your opponent and our goal in defense.' },
      { term: 'Strategy', phonetic: '/ˈstræt.ə.dʒi/', meaning: 'Chiến thuật thi đấu', exampleSentence: 'Discuss your team strategy before the game starts.' },
      { term: 'Heart rate', phonetic: '/hɑːt reɪt/', meaning: 'Nhịp tim', exampleSentence: 'Feel your heart rate quicken after sprint drills.' },
    ],
    standardStructures: [
      { patternEn: 'How does regular exercise improve our focus and memory in the classroom?', meaningVi: 'Tập thể dục thường xuyên cải thiện sự tập trung và trí nhớ thế nào?', usageTip: 'Liên kết thể chất với học tập.' },
      { patternEn: 'Communicate clearly with your teammates when switching defensive positions.', meaningVi: 'Giao tiếp rõ ràng với đồng đội khi hoán đổi vị trí phòng ngự.', usageTip: 'Chỉ dẫn chiến thuật thi đấu B1.' },
    ],
    essentialCommands: [
      { commandEn: 'Check your pulse for ten seconds and calculate your heart rate.', meaningVi: 'Bắt mạch cổ tay trong 10 giây và tính nhịp tim.' },
      { commandEn: 'Show respect to the referee’s decision at all times.', meaningVi: 'Luôn tôn trọng quyết định của trọng tài.' },
    ],
    pedagogicalTips: [
      'Gắn bài học thể chất với thông điệp: "A healthy mind in a healthy body".',
      'Khuyến khích học sinh dùng tiếng Anh để cổ vũ và gọi bóng trên sân.',
    ],
  },

  // ==================== LỊCH SỬ & ĐỊA LÝ (SOCIAL STUDIES) ====================
  {
    subject: 'SocialStudies',
    subjectNameVi: 'Lịch sử & Địa lý',
    cefrLevel: 'A1',
    unitTheme: 'My School, My Neighborhood & Hanoi (Trường em, Khu phố & Thủ đô Hà Nội)',
    lessonObjectives: [
      'Giới thiệu trường tiểu học Ái Mộ, quận Long Biên và thủ đô Hà Nội',
      'Định vị 4 hướng cơ bản: North, South, East, West trên bản đồ lớp học',
      'Nhận biết các biểu tượng quen thuộc: Tháp Rùa, Hồ Gươm, Cột cờ Hà Nội',
    ],
    coreConcepts: [
      {
        conceptEn: 'School Community & Local Geography',
        conceptVi: 'Cộng đồng trường học và địa lý địa phương',
        explanation: 'Ai Mo Primary School located in Long Bien District, Hanoi Capital.',
      },
      {
        conceptEn: 'Cardinal Directions',
        conceptVi: 'Bốn phương hướng địa lý chính',
        explanation: 'North (Bắc), South (Nam), East (Đông), West (Tây).',
      },
    ],
    keyVocabulary: [
      { term: 'Capital city', phonetic: '/ˈkæp.ɪ.təl ˈsɪt.i/', meaning: 'Thủ đô', exampleSentence: 'Hanoi is the beautiful capital city of Vietnam.' },
      { term: 'Neighborhood', phonetic: '/ˈneɪ.bə.hʊd/', meaning: 'Khu phố / Khu dân cư', exampleSentence: 'Our school neighborhood has green trees and friendly shops.' },
      { term: 'Map', phonetic: '/mæp/', meaning: 'Bản đồ', exampleSentence: 'Look at the map to find your way home.' },
      { term: 'North', phonetic: '/nɔːθ/', meaning: 'Hướng Bắc', exampleSentence: 'The top of the map always points to the North.' },
      { term: 'Lake', phonetic: '/leɪk/', meaning: 'Hồ nước', exampleSentence: 'Sword Lake is located in the heart of Hanoi.' },
    ],
    standardStructures: [
      { patternEn: 'Where is our school located in Hanoi?', meaningVi: 'Trường của chúng ta nằm ở đâu tại Hà Nội?', usageTip: 'Hỏi về vị trí địa lý địa phương.' },
      { patternEn: 'This famous monument is located in the [North/South] of the city.', meaningVi: 'Di tích nổi tiếng này nằm ở phía [Bắc/Nam] của thành phố.', usageTip: 'Mô tả vị trí di tích.' },
    ],
    essentialCommands: [
      { commandEn: 'Point to Hanoi on your Vietnam wall map.', meaningVi: 'Chỉ tay vào vị trí Hà Nội trên bản đồ Việt Nam treo tường.' },
      { commandEn: 'Draw your favorite landmark in your notebook.', meaningVi: 'Vẽ danh lam thắng cảnh con yêu thích vào vở nhé.' },
    ],
    pedagogicalTips: [
      'Lấy dẫn chứng gần gũi với trường Ái Mộ: Cầu Chương Dương, Cầu Long Biên, Bồ Đề.',
      'Khơi gợi niềm tự hào của học sinh khi là cư dân thủ đô ngàn năm văn hiến.',
    ],
  },
  {
    subject: 'SocialStudies',
    subjectNameVi: 'Lịch sử & Địa lý',
    cefrLevel: 'A2',
    unitTheme: 'Vietnam Geography & Historical Landmarks (Địa lý Việt Nam & Di tích lịch sử)',
    lessonObjectives: [
      'Mô tả hình dáng dải đất hình chữ S của Việt Nam và các vùng miền',
      'Giới thiệu các danh lam thắng cảnh nổi tiếng: Vịnh Hạ Long, Tràng An, Cố đô Huế, Phố cổ Hội An',
      'Thảo luận về các vị anh hùng dân tộc trong lịch sử dựng nước và giữ nước',
    ],
    coreConcepts: [
      {
        conceptEn: 'S-shaped Peninsula of Vietnam',
        conceptVi: 'Dải đất hình chữ S của Việt Nam',
        explanation: 'From Dong Van in the North to Ca Mau Cape in the South, bordering the East Sea.',
      },
      {
        conceptEn: 'World Heritage Sites',
        conceptVi: 'Di sản thế giới tại Việt Nam',
        explanation: 'Natural and cultural treasures recognized by UNESCO.',
      },
    ],
    keyVocabulary: [
      { term: 'Landmark', phonetic: '/ˈlænd.mɑːk/', meaning: 'Danh lam thắng cảnh nổi tiếng', exampleSentence: 'Long Bien Bridge is an iconic historical landmark.' },
      { term: 'Coastline', phonetic: '/ˈkəʊst.laɪn/', meaning: 'Đường bờ biển', exampleSentence: 'Vietnam has a long coastline of over 3,260 kilometers.' },
      { term: 'Heritage', phonetic: '/ˈher.ɪ.tɪdʒ/', meaning: 'Di sản văn hóa / lịch sử', exampleSentence: 'We must preserve our rich cultural heritage.' },
      { term: 'Island', phonetic: '/ˈaɪ.lənd/', meaning: 'Hòn đảo (chú ý âm s câm)', exampleSentence: 'Phu Quoc is the largest island in Vietnam.' },
      { term: 'Dynasty', phonetic: '/ˈdɪn.ə.sti/', meaning: 'Triều đại lịch sử', exampleSentence: 'The Ly Dynasty moved the capital to Thang Long in 1010.' },
    ],
    standardStructures: [
      { patternEn: 'Vietnam is famous for its [landforms/heritage/cuisine].', meaningVi: 'Việt Nam nổi tiếng với [danh lam/di sản/ẩm thực].', usageTip: 'Mẫu câu giới thiệu đất nước.' },
      { patternEn: 'Have you ever visited [destination]? What did you see there?', meaningVi: 'Con đã từng đến thăm [điểm đến] chưa? Con đã nhìn thấy gì ở đó?', usageTip: 'Kết nối trải nghiệm thực tế học sinh.' },
    ],
    essentialCommands: [
      { commandEn: 'Trace the path of the Red River from north to south.', meaningVi: 'Dò theo dòng chảy sông Hồng từ phía bắc xuống phía nam.' },
      { commandEn: 'Work with your partner to locate three UNESCO heritage sites.', meaningVi: 'Cùng bạn xác định 3 di sản UNESCO trên bản đồ nhé.' },
    ],
    pedagogicalTips: [
      'Nhắc nhở học sinh phát âm chuẩn từ "island" /ˈaɪ.lənd/ (chữ s câm).',
      'Chiếu hình ảnh sống động về vẻ đẹp thiên nhiên Việt Nam.',
    ],
  },
  {
    subject: 'SocialStudies',
    subjectNameVi: 'Lịch sử & Địa lý',
    cefrLevel: 'B1',
    unitTheme: 'Historical Milestones & Community Traditions (Các mốc son lịch sử & Bản sắc cộng đồng)',
    lessonObjectives: [
      'Thuyết trình về mốc son lịch sử: Vua Lý Thái Tổ dời đô về Thăng Long năm 1010',
      'Phân tích truyền thống văn hóa làng nghề và phong tục ngày Tết cổ truyền',
      'Phát triển tư duy công dân toàn cầu gắn bó với cội nguồn dân tộc',
    ],
    coreConcepts: [
      {
        conceptEn: 'Thang Long - Hanoi Thousand-year Legacy',
        conceptVi: 'Thăng Long - Hà Nội nghìn năm văn hiến',
        explanation: 'King Ly Thai To saw a golden rising dragon and founded the capital in 1010.',
      },
      {
        conceptEn: 'Traditional Craft Villages',
        conceptVi: 'Làng nghề truyền thống Việt Nam',
        explanation: 'Bat Trang pottery, Van Phuc silk, Dong Ho folk woodblock prints.',
      },
    ],
    keyVocabulary: [
      { term: 'Rising Dragon', phonetic: '/ˈraɪ.zɪŋ ˈdræɡ.ən/', meaning: 'Rồng bay lên (Thăng Long)', exampleSentence: 'Thang Long literally translates to the Rising Dragon.' },
      { term: 'Pottery', phonetic: '/ˈpɒt.ər.i/', meaning: 'Gốm sứ truyền thống', exampleSentence: 'Bat Trang pottery has been renowned for centuries.' },
      { term: 'Silk', phonetic: '/sɪlk/', meaning: 'Tơ lụa mềm mại', exampleSentence: 'Van Phuc silk is famous for its smooth elegance.' },
      { term: 'Tradition', phonetic: '/trəˈdɪʃ.ən/', meaning: 'Truyền thống văn hóa', exampleSentence: 'Respecting teachers is a cherished Vietnamese tradition.' },
    ],
    standardStructures: [
      { patternEn: 'In 1010, King Ly Thai To decided to move the capital because [reason].', meaningVi: 'Năm 1010, Vua Lý Thái Tổ quyết định dời đô vì [lý do].', usageTip: 'Thuyết minh lịch sử chuẩn mực.' },
      { patternEn: 'How can our generation preserve these valuable cultural crafts?', meaningVi: 'Thế hệ chúng ta làm thế nào để bảo tồn những nghề truyền thống quý giá này?', usageTip: 'Câu hỏi tư duy xã hội B1.' },
    ],
    essentialCommands: [
      { commandEn: 'Present your group timeline of Hanoi’s historic events.', meaningVi: 'Trình bày trục thời gian các sự kiện lịch sử Hà Nội của nhóm con.' },
      { commandEn: 'Discuss how traditional values help build a strong modern community.', meaningVi: 'Thảo luận các giá trị truyền thống giúp xây dựng cộng đồng hiện đại.' },
    ],
    pedagogicalTips: [
      'Gợi mở cho học sinh về làng gốm Bát Tràng ngay tại Gia Lâm, gần Long Biên.',
      'Tập cho học sinh cách thuyết trình song ngữ tự tin trước đám đông.',
    ],
  },

  // ==================== CHỈ DẪN SƯ PHẠM CHUNG (CLASSROOM GENERAL) ====================
  {
    subject: 'ClassroomGeneral',
    subjectNameVi: 'Chỉ dẫn sư phạm chung',
    cefrLevel: 'A1',
    unitTheme: 'Daily Greetings, Transitions & Simple Routines (Chào hỏi hàng ngày, Chuyển tiếp & Nền nếp)',
    lessonObjectives: [
      'Làm chủ các khẩu lệnh chào hỏi, mở đầu và kết thúc tiết học tiếng Anh',
      'Điều hành các chuyển tiếp hoạt động mượt mà bằng hiệu lệnh 1-2 bước',
      'Tạo dựng môi trường lớp học tiếng Anh tự nhiên, thân thiện và giàu năng lượng',
    ],
    coreConcepts: [
      {
        conceptEn: 'Classroom Routines & Habits',
        conceptVi: 'Nền nếp và thói quen lớp học',
        explanation: 'Predictable signals help students settle quickly and feel secure.',
      },
      {
        conceptEn: 'Clear Single-Step Instructions',
        conceptVi: 'Khẩu lệnh một bước rõ ràng',
        explanation: 'Short, affirmative phrases paired with friendly eye contact and body language.',
      },
    ],
    keyVocabulary: [
      { term: 'Take your seat', phonetic: '/teɪk jɔːr siːt/', meaning: 'Về chỗ ngồi', exampleSentence: 'Please take your seats quickly, children.' },
      { term: 'Listen carefully', phonetic: '/ˈlɪs.ən ˈkeə.fəl.i/', meaning: 'Lắng nghe kỹ', exampleSentence: 'Listen carefully to the recording.' },
      { term: 'Repeat after me', phonetic: '/rɪˈpiːt ˈɑːf.tər miː/', meaning: 'Nhắc lại theo cô', exampleSentence: 'Repeat after me with clear voices.' },
      { term: 'Quiet please', phonetic: '/ˈkwaɪ.ət pliːz/', meaning: 'Xin trật tự', exampleSentence: 'Quiet please, voices down now.' },
      { term: 'Well done', phonetic: '/wel dʌn/', meaning: 'Làm tốt lắm', exampleSentence: 'Well done to the whole class today!' },
    ],
    standardStructures: [
      { patternEn: 'Please [action] and get ready for [activity].', meaningVi: 'Xin mời [hành động] và sẵn sàng cho [hoạt động].', usageTip: 'Khẩu lệnh điều hành chuẩn.' },
      { patternEn: 'Are you ready? (Students: Yes, we are ready!)', meaningVi: 'Các con đã sẵn sàng chưa? (Học sinh: Sẵn sàng!)', usageTip: 'Kiểm tra mức độ sẵn sàng.' },
    ],
    essentialCommands: [
      { commandEn: 'Eyes on me, eyes on the board, please.', meaningVi: 'Mắt nhìn cô, mắt nhìn bảng nào.' },
      { commandEn: 'Raise your hand if you know the answer.', meaningVi: 'Giơ tay nếu con biết câu trả lời nhé.' },
    ],
    pedagogicalTips: [
      'Sử dụng giọng nói vui tươi, mỉm cười và ánh mắt bao quát toàn thể học sinh.',
      'Dùng khẩu lệnh gọi - đáp (Call and Response) để tạo nhịp điệu sinh động.',
    ],
  },
  {
    subject: 'ClassroomGeneral',
    subjectNameVi: 'Chỉ dẫn sư phạm chung',
    cefrLevel: 'A2',
    unitTheme: 'Multi-step Tasks, Cooperative Groups & Positive Discipline (Nhiệm vụ đa bước, Hợp tác nhóm & Kỷ luật tích cực)',
    lessonObjectives: [
      'Chỉ dẫn nhiệm vụ 2-3 bước liên hoàn bằng các liên từ: First, Then, After that, Finally',
      'Tổ chức hoạt động nhóm 4 người, phân chia vai trò rõ ràng',
      'Áp dụng phương pháp kỷ luật tích cực và giải tỏa căng thẳng trong lớp học',
    ],
    coreConcepts: [
      {
        conceptEn: 'Sequential Multi-Step Direction',
        conceptVi: 'Chỉ dẫn theo trình tự đa bước',
        explanation: 'Breaking complex tasks into manageable chunks using clear transition words.',
      },
      {
        conceptEn: 'Positive Discipline',
        conceptVi: 'Kỷ luật tích cực trong sư phạm',
        explanation: 'Reinforcing good behavior through praise rather than punitive scolding.',
      },
    ],
    keyVocabulary: [
      { term: 'Work in pairs', phonetic: '/wɜːk ɪn peəz/', meaning: 'Làm việc theo cặp', exampleSentence: 'Work in pairs and practice the dialogue.' },
      { term: 'Groups of four', phonetic: '/ɡruːps əv fɔːr/', meaning: 'Nhóm 4 bạn', exampleSentence: 'Form groups of four and assign your roles.' },
      { term: 'Time is up', phonetic: '/taɪm ɪz ʌp/', meaning: 'Đã hết giờ', exampleSentence: 'Time is up! Put your pens down.' },
      { term: 'Respect', phonetic: '/rɪˈspekt/', meaning: 'Sự tôn trọng', exampleSentence: 'Listen with respect when your friend speaks.' },
      { term: 'Teamwork', phonetic: '/ˈtiːm.wɜːk/', meaning: 'Tinh thần làm việc nhóm', exampleSentence: 'Great teamwork brings great success!' },
    ],
    standardStructures: [
      { patternEn: 'First, read the instructions; then, discuss with your group; finally, write your answers.', meaningVi: 'Đầu tiên đọc đề bài; sau đó thảo luận nhóm; cuối cùng ghi đáp án.', usageTip: 'Chỉ dẫn 3 bước chuẩn mực.' },
      { patternEn: 'You have [number] minutes to finish this activity.', meaningVi: 'Các con có [số] phút để hoàn thành hoạt động này.', usageTip: 'Quản lý thời gian lớp học.' },
    ],
    essentialCommands: [
      { commandEn: 'Turn to your neighbors and form groups of four.', meaningVi: 'Quay sang các bạn bên cạnh để tạo thành nhóm 4 người.' },
      { commandEn: 'Give your classmate a thumbs up for their brave effort.', meaningVi: 'Thưởng cho bạn một ngón tay cái vì sự dũng cảm nhé.' },
    ],
    pedagogicalTips: [
      'Dùng đồng hồ đếm ngược trên màn hình để học sinh tự giác quản lý thời gian.',
      'Khi nhắc nhở kỷ luật, hãy nói nhỏ dần để cả lớp tự động im lặng lắng nghe.',
    ],
  },
  {
    subject: 'ClassroomGeneral',
    subjectNameVi: 'Chỉ dẫn sư phạm chung',
    cefrLevel: 'B1',
    unitTheme: 'Formative Assessment, In-depth Feedback & Learner Autonomy (Đánh giá vì sự tiến bộ & Tự chủ học tập)',
    lessonObjectives: [
      'Thực hiện nhận xét đánh giá thường xuyên (Formative Assessment) khích lệ năng lực học sinh',
      'Đặt câu hỏi mở kích thích tư duy phản biện bậc cao (Higher-Order Thinking Skills - HOTS)',
      'Tổng kết buổi học và trao quyền tự chủ học tập cho học sinh tiểu học',
    ],
    coreConcepts: [
      {
        conceptEn: 'Formative Feedback for Growth',
        conceptVi: 'Đánh giá vì sự tiến bộ của người học',
        explanation: 'Specific, actionable praise focusing on effort and strategy rather than just innate talent.',
      },
      {
        conceptEn: 'Metacognition & Autonomy',
        conceptVi: 'Nhận thức về tư duy và tính tự chủ',
        explanation: 'Encouraging students to reflect on their own learning process and self-correct.',
      },
    ],
    keyVocabulary: [
      { term: 'Outstanding', phonetic: '/aʊtˈstænd.ɪŋ/', meaning: 'Xuất sắc / Vượt trội', exampleSentence: 'Your presentation was truly outstanding.' },
      { term: 'Creativity', phonetic: '/ˌkriː.eɪˈtɪv.ə.ti/', meaning: 'Sự sáng tạo', exampleSentence: 'I admire the creativity in your drawings.' },
      { term: 'Reflect', phonetic: '/rɪˈflekt/', meaning: 'Suy ngẫm / Tự đánh giá', exampleSentence: 'Take a minute to reflect on today’s lessons.' },
      { term: 'Progress', phonetic: '/ˈprəʊ.ɡres/', meaning: 'Sự tiến bộ vượt bậc', exampleSentence: 'Every student has made noticeable progress.' },
      { term: 'Applause', phonetic: '/əˈplɔːz/', meaning: 'Tràng pháo tay tán thưởng', exampleSentence: 'Let’s give our presenters a warm round of applause!' },
    ],
    standardStructures: [
      { patternEn: 'What was the most challenging part of today’s lesson, and how did you overcome it?', meaningVi: 'Phần nào thử thách nhất hôm nay và con đã vượt qua nó thế nào?', usageTip: 'Kích thích suy ngẫm siêu nhận thức.' },
      { patternEn: 'I am particularly impressed by how your group supported each other throughout.', meaningVi: 'Cô đặc biệt ấn tượng bởi cách nhóm con đã hỗ trợ lẫn nhau suốt tiết học.', usageTip: 'Khen ngợi kỹ năng mềm.' },
    ],
    essentialCommands: [
      { commandEn: 'Take thirty seconds to review your partner’s work and offer one constructive tip.', meaningVi: 'Dành 30 giây xem bài của bạn và đưa ra 1 lời khuyên xây dựng.' },
      { commandEn: 'Give yourselves a big round of applause for your dedication today!', meaningVi: 'Tự thưởng cho mình một tràng pháo tay lớn vì sự nỗ lực hôm nay!' },
    ],
    pedagogicalTips: [
      'Áp dụng mô hình phản hồi 2 Stars and 1 Wish (2 lời khen và 1 mong muốn cải thiện).',
      'Tạo cho học sinh cảm giác an toàn tâm lý: "Lớp học là nơi mọi thắc mắc đều được trân trọng".',
    ],
  },
];

export const getUnitOverview = (
  subject: TeacherSubject,
  level: CefrLevel
): UnitKnowledgeOverview | undefined => {
  return (
    UNIT_KNOWLEDGE_OVERVIEWS.find((u) => u.subject === subject && u.cefrLevel === level) ||
    UNIT_KNOWLEDGE_OVERVIEWS.find((u) => u.subject === subject) ||
    UNIT_KNOWLEDGE_OVERVIEWS[0]
  );
};
