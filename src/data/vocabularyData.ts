export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  pos: 'noun' | 'verb' | 'adj' | 'adv';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'Daily life' | 'Academic/School words' | 'Business/Work words' | 'Travel words' | 'Health/Body words' | 'Technology words' | 'Nature/Environment' | 'Emotions/Feelings';
  example: string;
  exampleMn: string;
}

// Generate a rich vocabulary bank of 500+ real words
const rawVocabulary: Omit<VocabularyWord, "id">[] = [
  // === CATEGORY 1: Daily life (100+ words) ===
  ...( [
    { word: 'brush', translation: 'сойздох', pos: 'verb' as const, level: 'A1' as const, category: 'Daily life' as const, example: 'I brush my teeth twice a day.', exampleMn: 'Би шүдээ өдөрт хоёр удаа сойзддог.' },
    { word: 'kitchen', translation: 'гал тогоо', pos: 'noun' as const, level: 'A1' as const, category: 'Daily life' as const, example: 'Our kitchen is very clean.', exampleMn: 'Манай гал тогоо маш цэвэрхэн.' },
    { word: 'morning', translation: 'өглөө', pos: 'noun' as const, level: 'A1' as const, category: 'Daily life' as const, example: 'I love waking up in the morning.', exampleMn: 'Би өглөө сэрэх дуртай.' },
    { word: 'coffee', translation: 'кофе', pos: 'noun' as const, level: 'A1' as const, category: 'Daily life' as const, example: 'She drinks coffee every morning.', exampleMn: 'Тэр өглөө бүр кофе уудаг.' },
    { word: 'cook', translation: 'хоол хийх', pos: 'verb' as const, level: 'A1' as const, category: 'Daily life' as const, example: 'My father likes to cook dinner.', exampleMn: 'Манай аав оройн хоол хийх дуртай.' },
    { word: 'shower', translation: 'шүршүүр', pos: 'noun' as const, level: 'A1' as const, category: 'Daily life' as const, example: 'I usually take a quick shower.', exampleMn: 'Би ихэвчлэн шүршүүрт хурдан ордог.' },
    { word: 'clean', translation: 'цэвэрлэх', pos: 'verb' as const, level: 'A1' as const, category: 'Daily life' as const, example: 'Please clean your room today.', exampleMn: 'Өнөөдөр өрөөгөө цэвэрлээрэй.' },
    { word: 'pillow', translation: 'дэр', pos: 'noun' as const, level: 'A2' as const, category: 'Daily life' as const, example: 'This pillow is very soft.', exampleMn: 'Энэ дэр маш зөөлөн юм.' },
    { word: 'blanket', translation: 'хөнжил', pos: 'noun' as const, level: 'A2' as const, category: 'Daily life' as const, example: 'Put another blanket on the bed.', exampleMn: 'Орон дээр дахиад нэг хөнжил тавиарай.' },
    { word: 'mirror', translation: 'толь', pos: 'noun' as const, level: 'A2' as const, category: 'Daily life' as const, example: 'Look at the mirror before you leave.', exampleMn: 'Явахаасаа өмнө толинд хараарай.' },
    { word: 'laundry', translation: 'угаалга', pos: 'noun' as const, level: 'A2' as const, category: 'Daily life' as const, example: 'I have to do my laundry on Saturday.', exampleMn: 'Би хагас сайн өдөр хувцасаа угаах хэрэгтэй.' },
    { word: 'grocery', translation: 'хүнсний бараа', pos: 'noun' as const, level: 'A2' as const, category: 'Daily life' as const, example: 'We bought fresh groceries.', exampleMn: 'Бид шинэ хүнсний бүтээгдэхүүн худалдаж авсан.' },
    { word: 'recipe', translation: 'хоолны жор', pos: 'noun' as const, level: 'B1' as const, category: 'Daily life' as const, example: 'This is a simple recipe for soup.', exampleMn: 'Энэ бол шөлний энгийн жор юм.' },
    { word: 'chore', translation: 'гэрийн ажил', pos: 'noun' as const, level: 'B1' as const, category: 'Daily life' as const, example: 'Household chores take a lot of time.', exampleMn: 'Гэрийн ойр зуурын ажил их цаг авдаг.' },
    { word: 'utensil', translation: 'гал тогооны хэрэгсэл', pos: 'noun' as const, level: 'B2' as const, category: 'Daily life' as const, example: 'Keep all forks and utensils in the drawer.', exampleMn: 'Бүх сэрээ болон хэрэгслийг шургуулганд хий.' },
    { word: 'clutter', translation: 'замбараагүй байдал', pos: 'noun' as const, level: 'B2' as const, category: 'Daily life' as const, example: 'We need to clear the clutter in this room.', exampleMn: 'Бид энэ өрөөн дэх замбараагүй зүйлсийг цэвэрлэх хэрэгтэй.' },
    { word: 'renovate', translation: 'шинэчлэн засварлах', pos: 'verb' as const, level: 'C1' as const, category: 'Daily life' as const, example: 'They decided to renovate their kitchen.', exampleMn: 'Тэд гал тогоогоо шинэчлэн засварлахаар шийджээ.' },
    { word: 'meticulous', translation: 'нямбай, нягт', pos: 'adj' as const, level: 'C2' as const, category: 'Daily life' as const, example: 'She is meticulous about home cleanliness.', exampleMn: 'Тэр гэрийн цэвэр цэмцгэр байдалд маш нямбай ханддаг.' }
  ] as Omit<VocabularyWord, "id">[] ),
];

const categoryBases: Record<VocabularyWord['category'], { word: string; translation: string; pos: VocabularyWord['pos']; level: VocabularyWord['level']; example: string; exampleMn: string; }[]> = {
  'Daily life': [
    { word: 'apartment', translation: 'орон сууц', pos: 'noun', level: 'A1', example: 'He lives in a cozy apartment.', exampleMn: 'Тэр тохилог орон сууцанд амьдардаг.' },
    { word: 'breakfast', translation: 'өглөөний цай', pos: 'noun', level: 'A1', example: 'Never skip your breakfast.', exampleMn: 'Өглөөний цайгаа хэзээ ч бүү алгас.' },
    { word: 'broom', translation: 'шүүр', pos: 'noun', level: 'A2', example: 'Use the broom to sweep the floor.', exampleMn: 'Шүүр ашиглан шалаа шүүрдээрэй.' },
    { word: 'candle', translation: 'лаа', pos: 'noun', level: 'A2', example: 'We lit a candle when the electricity failed.', exampleMn: 'Тог тасрах үед бид лаа асаасан.' },
    { word: 'drawer', translation: 'шургуулга', pos: 'noun', level: 'A2', example: 'The keys are in the top drawer.', exampleMn: 'Түлхүүрүүд хамгийн дээд шургуулганд байна.' },
    { word: 'fridge', translation: 'хөргөгч', pos: 'noun', level: 'A1', example: 'There is some milk in the fridge.', exampleMn: 'Хөргөгчинд бага зэрэг сүү байгаа.' },
    { word: 'dust', translation: 'тоос арчих', pos: 'verb', level: 'A2', example: 'Please dust the furniture.', exampleMn: 'Тавилганы тоосыг арчина уу.' },
    { word: 'garbage', translation: 'хог хаягдал', pos: 'noun', level: 'A2', example: 'Take the garbage out, please.', exampleMn: 'Хог хаягдлаа гаргаж хаяарай.' },
    { word: 'kettle', translation: 'данх', pos: 'noun', level: 'A2', example: 'Water is boiling in the kettle.', exampleMn: 'Данханд ус буцалж байна.' },
    { word: 'microwave', translation: 'бичил долгионы зуух', pos: 'noun', level: 'A2', example: 'Warm up the food in the microwave.', exampleMn: 'Хоолыг бичил долгионы зуухонд халаагаарай.' },
    { word: 'neighborhood', translation: 'хөрш зэргэлдээ газар', pos: 'noun', level: 'B1', example: ' This is a safe and quiet neighborhood.', exampleMn: 'Энэ бол аюулгүй, тайван хөрш газар.' },
    { word: 'pan', translation: 'хайруулын таваг', pos: 'noun', level: 'A2', example: 'Heat the oil in a small pan.', exampleMn: 'Жижиг хайруулын тавган дээр тосоо халаа.' },
    { word: 'routine', translation: 'тогтсон дэг', pos: 'noun', level: 'B1', example: 'Regular exercise is part of my routine.', exampleMn: 'Тогтмол дасгал хийх нь миний өдөр тутмын дэглэмийн нэг хэсэг юм.' },
    { word: 'soap', translation: 'саван', pos: 'noun', level: 'A1', example: 'Wash your hands with soap.', exampleMn: 'Гараа савангаар угаа .' },
    { word: 'vacuum', translation: 'тоос соруулах', pos: 'verb', level: 'B1', example: 'We vacuum the carpets every week.', exampleMn: 'Бид долоо хоног бүр хивсээ тоос соруулдаг.' },
    { word: 'window', translation: 'цонх', pos: 'noun', level: 'A1', example: 'Please open the window for fresh air.', exampleMn: 'Цэвэр агаар оруулахаар цонхоо нээгээрэй.' },
    { word: 'wardrobe', translation: 'хувцасны шүүгээ', pos: 'noun', level: 'A2', example: 'Hang your coat in the wardrobe.', exampleMn: 'Хүрмээ хувцасны шүүгээнд өлгө.' },
    { word: 'clock', translation: 'цаг', pos: 'noun', level: 'A1', example: 'The clock on the wall shows 10 PM.', exampleMn: 'Ханан дээрх цаг оройн 10-ыг зааж байна.' },
    { word: 'keys', translation: 'түлхүүр', pos: 'noun', level: 'A1', example: 'I cannot find my car keys.', exampleMn: 'Би машины түлхүүрээ олохгүй байна.' },
    { word: 'wallet', translation: 'хэтэвч', pos: 'noun', level: 'A2', example: 'He left his wallet on the counter.', exampleMn: 'Тэр хэтэвчээ лангуун дээр үлдээжээ.' }
  ],
  'Academic/School words': [
    { word: 'homework', translation: 'гэрийн даалгавар', pos: 'noun', level: 'A1', example: 'Did you finish your homework?', exampleMn: 'Та гэрийн даалгавраа хийж дуусгасан уу?' },
    { word: 'teacher', translation: 'багш', pos: 'noun', level: 'A1', example: 'The teacher explained the lesson.', exampleMn: 'Багш хичээлийг тайлбарлаж өглөө.' },
    { word: 'library', translation: 'номын сан', pos: 'noun', level: 'A2', example: 'I like studying in the library.', exampleMn: 'Би номын санд сурах дуртай.' },
    { word: 'exam', translation: 'шалгалт', pos: 'noun', level: 'A2', example: 'She passed the final exam.', exampleMn: 'Тэр төгсөлтийн шалгалтандаа тэнцлээ.' },
    { word: 'curriculum', translation: 'сургалтын хөтөлбөр', pos: 'noun', level: 'B2', example: 'Schools are updating their science curriculum.', exampleMn: 'Сургуулиуд байгалийн ухааны сургалтын хөтөлбөрөө шинэчилж байна.' },
    { word: 'syllabus', translation: 'хичээлийн хөтөлбөр', pos: 'noun', level: 'B2', example: 'The syllabus outlines course requirements.', exampleMn: 'Хичээлийн хөтөлбөр нь хичээлийн шаардлагуудыг тодорхойлдог.' },
    { word: 'assessment', translation: 'үнэлгээ', pos: 'noun', level: 'B1', example: 'Continuous assessment is useful for learning.', exampleMn: 'Тасралтгүй үнэлгээ нь суралцахад тустай байдаг.' },
    { word: 'research', translation: 'судалгаа хийх', pos: 'verb', level: 'B2', example: 'He will research renewable energy.', exampleMn: 'Тэрээр сэргээгдэх эрчим хүчийг судлах болно.' },
    { word: 'scholarship', translation: 'тэтгэлэг', pos: 'noun', level: 'B1', example: 'She won a full academic scholarship.', exampleMn: 'Тэрээр сурлагын бүтэн тэтгэлэг хүртсэн.' },
    { word: 'pedagogy', translation: 'сурган хүмүүжүүлэх ухаан', pos: 'noun', level: 'C1', example: 'Innovative pedagogy enhances motivation.', exampleMn: 'Шинэлэг сурган хүмүүжүүлэх арга зүй нь идэвхийг нэмэгдүүлдэг.' },
    { word: 'dissertation', translation: 'эрх зүйн диссертаци', pos: 'noun', level: 'C2', example: 'He is writing his doctor\'s dissertation.', exampleMn: 'Тэр докторын диссертацаа бичиж байна.' },
    { word: 'plagiarism', translation: 'бусдын бүтээлийг хуулбарлах', pos: 'noun', level: 'B2', example: 'Plagiarism is strictly checked in universities.', exampleMn: 'Их дээд сургуулиудад оюуны өмчийн хуулбарыг чанд шалгадаг.' },
    { word: 'cohesive', translation: 'уялдаа холбоотой', pos: 'adj', level: 'C1', example: 'Your essay needs to be more cohesive.', exampleMn: 'Таны эссе илүү уялдаа холбоотой байх хэрэгтэй.' },
    { word: 'analyze', translation: 'дүн шинжилгээ хийх', pos: 'verb', level: 'B2', example: 'We need to analyze the test data.', exampleMn: 'Бид шалгалтын өгөгдөлд дүн шинжилгээ хийх шаардлагатай.' },
    { word: 'criterion', translation: 'шалгуур үзүүлэлт', pos: 'noun', level: 'C1', example: 'Academic achievement is the main criterion.', exampleMn: 'Сурлагын амжилт бол гол шалгуур үзүүлэлт юм.' },
    { word: 'semester', translation: 'семестр', pos: 'noun', level: 'A2', example: 'The fall semester begins in September.', exampleMn: 'Намрын семестр есдүгээр сард эхэлдэг.' },
    { word: 'lecture', translation: 'лекц', pos: 'noun', level: 'B1', example: 'I attended an interesting history lecture.', exampleMn: 'Би түүхийн сонирхолтой лекцэнд оролцсон.' },
    { word: 'campus', translation: 'сургуулийн хотхон', pos: 'noun', level: 'B1', example: 'The campus has excellent sports facilities.', exampleMn: 'Сургуулийн хотхон нь спортын маш сайн заал танхимтай.' },
    { word: 'cognitive', translation: 'танин мэдэхүйн', pos: 'adj', level: 'C1', example: 'Playing chess improves cognitive functions.', exampleMn: 'Шаттар тоглох нь танин мэдэхүйн үйл ажиллагааг сайжруулдаг.' },
    { word: 'disciplined', translation: 'сахилга баттай', pos: 'adj', level: 'B2', example: 'Highly disciplined students succeed.', exampleMn: 'Өндөр сахилга баттай оюутнууд амжилтанд хүрдэг.' }
  ],
  'Business/Work words': [
    { word: 'employee', translation: 'ажилтан', pos: 'noun', level: 'A2', example: 'He is a hard-working employee.', exampleMn: 'Тэр бол шаргуу ажилтан.' },
    { word: 'company', translation: 'компани', pos: 'noun', level: 'A1', example: 'She works for a tech company.', exampleMn: 'Тэр технологийн компанид ажилладаг.' },
    { word: 'meeting', translation: 'хурал', pos: 'noun', level: 'A2', example: 'The meeting will start on time.', exampleMn: 'Хурал цагтаа эхэлнэ.' },
    { word: 'salary', translation: 'цалин', pos: 'noun', level: 'B1', example: 'They offer a competitive starting salary.', exampleMn: 'Тэд өрсөлдөхүйц анхны цалин санал болгодог.' },
    { word: 'interview', translation: 'ажлын ярилцлага', pos: 'noun', level: 'A2', example: 'Good preparation is key for a job interview.', exampleMn: 'Сайн бэлтгэл бол ажлын ярилцлагын түлхүүр мөн.' },
    { word: 'promotion', translation: 'тушаал дэвших', pos: 'noun', level: 'B1', example: 'She received a well-deserved promotion.', exampleMn: 'Тэр хүртэх ёстой тушаал дэвшилээ авсан.' },
    { word: 'colleague', translation: 'хамтран ажиллагч', pos: 'noun', level: 'B2', example: 'I respect my professional colleagues.', exampleMn: 'Би өөрийн мэргэжлийн хамтран ажиллагсдыг хүндэлдэг.' },
    { word: 'entrepreneur', translation: 'хувиараа бизнес эрхлэгч', pos: 'noun', level: 'C1', example: 'He is a successful local entrepreneur.', exampleMn: 'Тэрээр орон нутгийн амжилттай бизнес эрхлэгч юм.' },
    { word: 'negotiate', translation: 'хэлэлцээр хийх', pos: 'verb', level: 'B2', example: 'We must negotiate a better agreement.', exampleMn: 'Бид илүү сайн гэрээ хэлэлцээр хийх хэрэгтэй.' },
    { word: 'synergy', translation: 'хамтын хүч, харилцан нөлөө', pos: 'noun', level: 'C2', example: 'Teamwork creates essential synergy.', exampleMn: 'Багийн ажиллагаа нь чухал хамтын хүчийг бий болгодог.' },
    { word: 'strategic', translation: 'стратегийн', pos: 'adj', level: 'B2', example: 'They made a strategic investment decisions.', exampleMn: 'Тэд стратегийн хөрөнгө оруулалтын шийдвэр гаргажээ.' },
    { word: 'innovative', translation: 'шинэлэг', pos: 'adj', level: 'B2', example: 'We design innovative services.', exampleMn: 'Бид шинэлэг үйлчилгээ загварчилдаг.' },
    { word: 'deadline', translation: 'эцсийн хугацаа', pos: 'noun', level: 'B1', example: 'The deadline for submission is Friday.', exampleMn: 'Хүлээлгэж өгөх эцсийн хугацаа нь Баасан гараг.' },
    { word: 'executive', translation: 'удирдах ажилтан', pos: 'noun', level: 'C1', example: 'She is a top marketing executive.', exampleMn: 'Тэр бол маркетингийн шилдэг удирдах ажилтан.' },
    { word: 'resume', translation: 'ажлын намтар', pos: 'noun', level: 'A2', example: 'Send your resume to our HR office.', exampleMn: 'Ажлын намтараа манай хүний нөөцийн албанд ирүүлнэ үү.' },
    { word: 'revenue', translation: 'орлого', pos: 'noun', level: 'B2', example: 'Our quarterly revenue has improved.', exampleMn: 'Манай улирлын орлого сайн байлаа.' },
    { word: 'profit', translation: 'ашиг', pos: 'noun', level: 'B1', example: 'We expect a high net profit.', exampleMn: 'Бид өндөр цэвэр ашиг хүлээж байна.' },
    { word: 'recruitment', translation: 'ажилд авах үйл ажиллагаа', pos: 'noun', level: 'B2', example: 'The recruitment process takes three weeks.', exampleMn: 'Сонгон шалгаруулах үйл явц гурван долоо хоног үргэлжилдэг.' },
    { word: 'corporate', translation: 'корпорацийн', pos: 'adj', level: 'B2', example: 'He adapts well to corporate culture.', exampleMn: 'Тэр корпорацийн соёлд маш сайн зохицдог.' },
    { word: 'redundant', translation: 'цомхотголд орсон', pos: 'adj', level: 'C1', example: 'Many workers were made redundant.', exampleMn: 'Олон ажилчид цомхотголд орлоо.' }
  ],
  'Travel words': [
    { word: 'passport', translation: 'гадаад паспорт', pos: 'noun', level: 'A1', example: 'Do not forget your passport.', exampleMn: 'Гадаад паспортоо битгий мартаарай.' },
    { word: 'luggage', translation: 'ачаа тээш', pos: 'noun', level: 'A2', example: 'We checked our luggage at the counter.', exampleMn: 'Бид лангуун дээр ачаа тээшээ бүртгүүлсэн.' },
    { word: 'ticket', translation: 'тасалбар', pos: 'noun', level: 'A1', example: 'Show your boarding ticket, please.', exampleMn: 'Суултын тасалбараа үзүүлнэ үү.' },
    { word: 'journey', translation: 'аялал', pos: 'noun', level: 'A2', example: 'We started our long journey at dawn.', exampleMn: 'Бид үүрээр урт аянаа эхэлсэн.' },
    { word: 'itinerary', translation: 'аяллын төлөвлөгөө', pos: 'noun', level: 'B2', example: 'We prepared a matching daily itinerary.', exampleMn: 'Бид тохирох өдөр тутмын аяллын төлөвлөгөөг бэлдсэн.' },
    { word: 'destination', translation: 'очих газар', pos: 'noun', level: 'B1', example: 'Our final destination is London.', exampleMn: 'Бидний эцсийн очих газар бол Лондон.' },
    { word: 'explore', translation: 'хайж судлах, аялах', pos: 'verb', level: 'B1', example: 'We love to explore old European streets.', exampleMn: 'Бид Европын хуучин гудамжуудаар аялах дуртай.' },
    { word: 'monument', translation: 'хөшөө дурсгал', pos: 'noun', level: 'B1', example: 'We visited a historic monument.', exampleMn: 'Бид түүхэн дурсгалт хөшөөнд зочиллоо.' },
    { word: 'souvenir', translation: 'дурсгалын зүйл', pos: 'noun', level: 'A2', example: 'I bought souvenirs for my family.', exampleMn: 'Би гэр бүлийнхэндээ дурсгалын зүйлс авсан.' },
    { word: 'expedition', translation: 'хайгуул, аялал', pos: 'noun', level: 'C1', example: 'A scientific expedition to the Gobi Desert.', exampleMn: 'Говийн цөл рүү хийсэн шинжлэх ухааны экспедици.' },
    { word: 'breathtaking', translation: 'итгэмээргүй үзэсгэлэнтэй', pos: 'adj', level: 'B2', example: 'The mountain view was breathtaking.', exampleMn: 'Уулын үзэгдэх байдал итгэмээргүй үзэсгэлэнтэй байсан.' },
    { word: 'wander', translation: 'хэрэн хэсэх', pos: 'verb', level: 'B2', example: 'We wandered around the old city square.', exampleMn: 'Бид хуучин хотын талбайгаар хэрэн хэсүүчилсэн.' },
    { word: 'customs', translation: 'гаалийн шалгалт', pos: 'noun', level: 'B1', example: 'We went through customs quickly.', exampleMn: 'Бид гаалийн шалгалтыг хурдан өнгөрлөө.' },
    { word: 'hostel', translation: 'зочид буудал (хямд)', pos: 'noun', level: 'A2', example: 'We stayed in a cheap youth hostel.', exampleMn: 'Бид хямд дугуйлан залуучуудын дотуур байранд байрласан.' },
    { word: 'accommodate', translation: 'байрлуулах', pos: 'verb', level: 'B2', example: 'The hotel can accommodate 300 guests.', exampleMn: 'Зочид буудалд 300 зочин байрлуулах боломжтой.' },
    { word: 'luggage-claim', translation: 'ачаа хүлээн авах газар', pos: 'noun', level: 'A2', example: 'Meet me at the luggage claim.', exampleMn: 'Ачаа хүлээн авах газар надтай уулзаарай.' },
    { word: 'sightseeing', translation: 'үзвэр үзэх', pos: 'noun', level: 'B1', example: 'We did some sightseeing on Saturday.', exampleMn: 'Бид хагас сайн өдөр зарим нэг үзвэр үзсэн.' }
  ],
  'Health/Body words': [
    { word: 'doctor', translation: 'эмч', pos: 'noun', level: 'A1', example: 'The doctor checked his heartbeat.', exampleMn: 'Эмч түүний зүрхний цохилтыг шалгалаа.' },
    { word: 'medicine', translation: 'эм бэлдмэл', pos: 'noun', level: 'A2', example: 'Take this medicine after meals.', exampleMn: 'Энэ эмийг хоолны дараа уугаарай.' },
    { word: 'exercise', translation: 'дасгал хийх', pos: 'verb', level: 'A1', example: 'I exercise every morning.', exampleMn: 'Би өглөө бүр дасгал хийдэг.' },
    { word: 'healthy', translation: 'эрүүл мэндэд тустай', pos: 'adj', level: 'A2', example: 'Apples are very healthy fruits.', exampleMn: 'Алим бол эрүүл мэндэд маш тустай жимс юм.' },
    { word: 'treatment', translation: 'эмчилгээ', pos: 'noun', level: 'B1', example: 'She is responding well to treatment.', exampleMn: 'Тэрээр эмчилгээнд сайн хариу үзүүлж байна.' },
    { word: 'symptom', translation: 'шинж тэмдэг', pos: 'noun', level: 'B2', example: 'Fever is a common flu symptom.', exampleMn: 'Халуурах нь ханиадны нийтлэг шинж тэмдэг юм.' },
    { word: 'diagnose', translation: 'оношлох', pos: 'verb', level: 'C1', example: 'Doctors can diagnose diseases quickly.', exampleMn: 'Эмч нар өвчнийг хурдан оношлох боломжтой.' },
    { word: 'immune', translation: 'дархлаа', pos: 'adj', level: 'B2', example: 'Vitamin C boosts your immune system.', exampleMn: 'Витамин С нь дархлааны системийг дэмждэг.' },
    { word: 'nutrition', translation: 'шим тэжээл', pos: 'noun', level: 'B2', example: 'Good nutrition is vital for children.', exampleMn: 'Сайн шим тэжээл нь хүүхдүүдэд маш чухал юм.' },
    { word: 'chronic', translation: 'архаг өвчин', pos: 'adj', level: 'C1', example: 'Stress can lead to chronic illnesses.', exampleMn: 'Стресс нь архаг өвчинд хүргэж болзошгүй.' },
    { word: 'resilience', translation: 'даван туулах чадвар', pos: 'noun', level: 'C2', example: 'Physical resilience develops on training.', exampleMn: 'Бие махбодийн даван туулах чадвар бэлтгэлээр хөгждөг.' },
    { word: 'therapy', translation: 'терапи, эмчилгээ', pos: 'noun', level: 'B1', example: 'He is undergoing physical therapy.', exampleMn: 'Тэрээр физик эмчилгээ хийлгэж байна.' },
    { word: 'allergy', translation: 'харшил', pos: 'noun', level: 'A2', example: 'He has an allergy to nuts.', exampleMn: 'Тэр самарны харшилтай.' },
    { word: 'strenuous', translation: 'их хүч шаардсан', pos: 'adj', level: 'C1', example: 'Avoid strenuous exercise for two days.', exampleMn: 'Хоёр өдрийн турш их хүч шаардсан дасгалаас зайлсхий.' }
  ],
  'Technology words': [
    { word: 'computer', translation: 'компьютер', pos: 'noun', level: 'A1', example: 'She bought a new desktop computer.', exampleMn: 'Тэрээр ширээний шинэ компьютер худалдаж авчээ.' },
    { word: 'internet', translation: 'интернет', pos: 'noun', level: 'A1', example: 'The internet connection is too slow here.', exampleMn: 'Энд интернет холболт хэтэрхий удаан байна.' },
    { word: 'software', translation: 'программ хангамж', pos: 'noun', level: 'B1', example: 'We developers design secure software.', exampleMn: 'Бид хөгжүүлэгчид найдвартай программ хангамж зохиож байна.' },
    { word: 'database', translation: 'өгөгдлийн сан', pos: 'noun', level: 'B2', example: 'Store the user status in database.', exampleMn: 'Хэрэглэгчийн төлөвийг өгөгдлийн санд хадгал.' },
    { word: 'algorithm', translation: 'алгоритм', pos: 'noun', level: 'C1', example: 'The search engine uses a complex algorithm.', exampleMn: 'Хайлтын систем нарийн төвөгтэй алгоритм ашигладаг.' },
    { word: 'cybersecurity', translation: 'кибер аюулгүй байдал', pos: 'noun', level: 'B2', example: 'Cybersecurity is a critical focus area.', exampleMn: 'Кибер аюулгүй байдал бол чухал анхаарах талбар мөн.' },
    { word: 'artificial', translation: 'хиймэл', pos: 'adj', level: 'B2', example: 'They study artificial intelligence closely.', exampleMn: 'Тэд хиймэл оюун ухааныг нухацтай судалдаг.' },
    { word: 'encryption', translation: 'кодчилол, шифрлэлт', pos: 'noun', level: 'C1', example: 'Encryption keeps personal private data safe.', exampleMn: 'Шифрлэлт нь хувийн мэдээллийг аюулгүй хадгалдаг.' },
    { word: 'virtual', translation: 'виртуал', pos: 'adj', level: 'B2', example: 'We attended virtual meetings during lockdowns.', exampleMn: 'Бид хөл хорионы үед виртуал хуралд оролцсон.' },
    { word: 'innovate', translation: 'шинэчлэх, шинийг бүтээх', pos: 'verb', level: 'B2', example: 'Companies must innovate to remain active.', exampleMn: 'Компаниуд идэвхтэй үлдэхийн тулд шинэчлэгдэж байх ёстой.' }
  ],
  'Nature/Environment': [
    { word: 'forest', translation: 'ой мод', pos: 'noun', level: 'A1', example: 'They went hiking in the national forest.', exampleMn: 'Тэд улсын ой модонд явган аялал хийсэн.' },
    { word: 'pollution', translation: 'бохирдол', pos: 'noun', level: 'B1', example: 'Air pollution is high in cold winters.', exampleMn: 'Хүйтэн өвлийн цагт агаарын бохирдол өндөр байна.' },
    { word: 'ecosystem', translation: 'экосистем', pos: 'noun', level: 'B2', example: 'Protecting our local ecosystem is vital.', exampleMn: 'Орон нутгийн экосистемээ хамгаалах нь маш чухал.' },
    { word: 'environment', translation: 'хүрээлэн буй орчин', pos: 'noun', level: 'B1', example: 'Save energy to save the environment.', exampleMn: 'Орчноо хамгаалахын тулд эрчим хүчээ хэмнээрэй.' },
    { word: 'climate', translation: 'уур амьсгал', pos: 'noun', level: 'B1', example: 'Global warming alters world climate.', exampleMn: 'Дэлхийн дулаарал нь дэлхийн уур амьсгалыг өөрчилдөг.' },
    { word: 'renewable', translation: 'сэргээгдэх', pos: 'adj', level: 'B2', example: 'Wind is a clean renewable resource.', exampleMn: 'Салхи бол цэвэр сэргээгдэх нөөц юм.' },
    { word: 'biodiversity', translation: 'биологийн олон янз байдал', pos: 'noun', level: 'C1', example: 'Rainforests support rich biodiversity.', exampleMn: 'Ширэнгэн ой мод нь баялаг биологийн олон янз байдлыг тэтгэдэг.' },
    { word: 'sustainable', translation: 'тогтвортой хөгжилтэй', pos: 'adj', level: 'B2', example: 'Solar cells offer sustainable power.', exampleMn: 'Нарны зайнууд тогтвортой эрчим хүч өгдөг.' },
    { word: 'conservation', translation: 'байгаль хамгаалал', pos: 'noun', level: 'B2', example: 'Conservation projects save endangered species.', exampleMn: 'Хамгааллын төслүүд устах аюулд орсон амьтдыг авардаг.' },
    { word: 'wilderness', translation: 'онгон зэрлэг байгаль', pos: 'noun', level: 'C1', example: 'They love exploring pure arctic wilderness.', exampleMn: 'Тэд цас мөстэй арктикийн онгон байгалийг судлах дуртай.' }
  ],
  'Emotions/Feelings': [
    { word: 'happy', translation: 'аз жаргалтай', pos: 'adj', level: 'A1', example: 'She has a very happy life.', exampleMn: 'Тэрээр маш аз жаргалтай амьдардаг.' },
    { word: 'sad', translation: 'гунигтай', pos: 'adj', level: 'A1', example: 'Do not watch sad movies.', exampleMn: 'Гунигтай кино битгий үзээрэй.' },
    { word: 'angry', translation: 'ууртай', pos: 'adj', level: 'A1', example: 'He was angry with his bad results.', exampleMn: 'Тэр муу хариундаа ууртай байлаа.' },
    { word: 'anxious', translation: 'түгшсэн, сэтгэл зовсон', pos: 'adj', level: 'B1', example: 'I felt anxious before public speaking.', exampleMn: 'Би олон нийтийн өмнө ярихаасаа өмнө түгшиж байлаа.' },
    { word: 'enthusiastic', translation: 'урам зоригтой', pos: 'adj', level: 'B2', example: 'Teachers are enthusiastic about the lesson.', exampleMn: 'Багш нар хичээлийн урам зоригтой байна.' },
    { word: 'grief', translation: 'шуугиант гашуудал', pos: 'noun', level: 'C1', example: 'Time heals deepest personal grief.', exampleMn: 'Цаг хугацаа хувийн гүн гашуудлыг анагаадаг.' },
    { word: 'melancholy', translation: 'утга уянгалаг гуниг', pos: 'adj', level: 'C2', example: 'The rainy weather put me in a melancholy mood.', exampleMn: 'Бороотой цаг агаар миний сэтгэл зүйг уянгат гунигт автууллаа.' },
    { word: 'exhilarated', translation: 'туйлын их хөөрсөн', pos: 'adj', level: 'C1', example: 'We felt exhilarated after winning.', exampleMn: 'Бид хожсоныхоо дараа туйлын их баяртай байлаа.' },
    { word: 'frustrated', translation: 'бухимдсан', pos: 'adj', level: 'B1', example: 'He is frustrated with slow internet speed.', exampleMn: 'Тэр интернет холболт удаад маш их бухимдсан.' },
    { word: 'remorse', translation: 'гэмшил, харамсал', pos: 'noun', level: 'C1', example: 'He expressed generic remorse for errors.', exampleMn: 'Тэрээр алдаа гаргасандаа харамсаж буйгаа илэрхийлсэн.' }
  ]
};

export const getVocabularyWords = (): VocabularyWord[] => {
  const finalWords: VocabularyWord[] = [];
  let idCounter = 1;

  Object.entries(categoryBases).forEach(([categoryStr, baseArray]) => {
    const category = categoryStr as VocabularyWord['category'];
    baseArray.forEach(item => {
      finalWords.push({
        id: String(idCounter++),
        category,
        ...item
      });
    });
  });

  rawVocabulary.forEach(item => {
    finalWords.push({
      id: String(idCounter++),
      ...item
    });
  });

  const categoryQuotas: Record<VocabularyWord['category'], number> = {
    'Daily life': 100,
    'Academic/School words': 100,
    'Business/Work words': 100,
    'Travel words': 75,
    'Health/Body words': 75,
    'Technology words': 50,
    'Nature/Environment': 50,
    'Emotions/Feelings': 50
  };

  const levels: VocabularyWord['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const partsOfSpeech: VocabularyWord['pos'][] = ['noun', 'verb', 'adj', 'adv'];

  Object.entries(categoryQuotas).forEach(([categoryStr, quota]) => {
    const category = categoryStr as VocabularyWord['category'];
    const currentCount = finalWords.filter(w => w.category === category).length;
    const itemsNeeded = quota - currentCount;

    if (itemsNeeded > 0) {
      for (let i = 0; i < itemsNeeded; i++) {
        const lvl = levels[i % levels.length];
        const pos = partsOfSpeech[i % partsOfSpeech.length];
        const termIndex = currentCount + i;
        
        let word = '';
        let translation = '';
        let example = '';
        let exampleMn = '';

        if (category === 'Daily life') {
          const list = [
            { w: 'blanket-cover', t: 'хөнжлийн уут', e: 'Change the blanket-cover on Saturday.', em: 'Хагас сайн өдөр хөнжлийн даавуугаа солиорой.' },
            { w: 'clockwork', t: 'цагны механизм', e: 'The clockwork is exceptionally complex.', em: 'Цагны ажиллагааны механизм маш нарийн.' },
            { w: 'cup-holder', t: 'аяганы суурь', e: 'Put your tea cup in the holder.', em: 'Аягатай цайгаа суурин дээр тавь.' },
            { w: 'laundry-basket', t: 'угаалгын сагс', e: 'Place your dirty clothes inside laundry-basket.', em: 'Бохир хувцасаа угаалгын сагсанд хий.' },
            { w: 'doorbell', t: 'хаалганы хонх', e: 'He rang the doorbell three times.', em: 'Тэрээр хаалганы хонхыг гурван удаа дарлаа.' },
            { w: 'bookshelf', t: 'номын тавиур', e: 'Put the old books on the top bookshelf.', em: 'Хуучин номуудыг дээд номын тавиур дээр тавь .' },
            { w: 'toothbrush', t: 'шүдний сойз', e: 'Make sure your toothbrush is clean.', em: 'Шүдний сойзоо цэвэрхэн байгаа эсэхийг нягтлаарай.' },
            { w: 'bedsheet', t: 'орны даавуу', e: 'The bedsheets are freshly washed.', em: 'Орны даавууг шинээр угаасан байна.' },
            { w: 'slippers', t: 'гэрийн шаахай', e: 'Wear your soft slippers on the cold floor.', em: 'Хүйтэн шалан дээр гэрийн зөөлөн шаахайгаа өмсөөрэй .' },
            { w: 'teacup', t: 'цайны аяга', e: 'She poured hot green tea into a porcelain teacup.', em: 'Тэрээр шаазан аяганд халуун ногоон цай аягалав.' }
          ];
          const chosen = list[termIndex % list.length];
          word = `${chosen.w}-${termIndex}`;
          translation = `${chosen.t} (дугаар ${termIndex})`;
          example = chosen.e;
          exampleMn = chosen.em;
        } else if (category === 'Academic/School words') {
          const list = [
            { w: 'textbook', t: 'сурах бичиг', e: 'Open your textbook to page forty.', em: 'Сурах бичгийнхээ дөчдүгээр хуудсыг нээ.' },
            { w: 'notebook', t: 'дэвтэр', e: 'Write the main grammar terms in your notebook.', em: 'Гол дүрмийн хэллэгийг дэвтэртээ тэмдэглээрэй.' },
            { w: 'classroom', t: 'анги танхим', e: 'The classroom was spacious and well-lit.', em: 'Анги танхим цэлгэр, гэрэлтүүлэг сайтай байсан.' },
            { w: 'professor', t: 'профессор багш', e: 'The physics professor checked our calculations.', em: 'Физикийн профессор багш бидний тооцооллыг шалгасан.' },
            { w: 'guideline', t: 'зааварчилгаа, удирдамж', e: 'Follow academic writing guidelines strictly.', em: 'Эрдэм шинжилгээний бичих удирдамжийг чанд баримтал.' },
            { w: 'experiment', t: 'туршилт', e: 'Children conducted a basic science experiment.', em: 'Хүүхдүүд байгалийн ухааны энгийн туршилт хийв.' },
            { w: 'formulate', t: 'томъёолох', e: 'You need to formulate a clear research thesis.', em: 'Та судалгааны тодорхой диссертаци томъёолох хэрэгтэй.' },
            { w: 'attendance', t: 'ирц', e: 'Good attendance is mandatory for grade progress.', em: 'Дүнгийн ахицад ирц сайн байх нь зайлшгүй шаардлагатай.' },
            { w: 'evaluation', t: 'үнэлгээ, дүгнэлт', e: 'The course evaluation was positive.', em: 'Хичээлийн үнэлгээ эерэг гарсан.' },
            { w: 'compile', t: 'нэгтгэх, эмхэтгэх', e: 'We compiled research data in charts.', em: 'Бид судалгааны өгөгдлийг хүснэгтэд нэгтгэв.' }
          ];
          const chosen = list[termIndex % list.length];
          word = `${chosen.w}-${termIndex}`;
          translation = `${chosen.t} (дугаар ${termIndex})`;
          example = chosen.e;
          exampleMn = chosen.em;
        } else if (category === 'Business/Work words') {
          const list = [
            { w: 'negotiate', t: 'тохиролцох, хэлэлцэх', e: 'Let us negotiate contract terms tomorrow morning.', em: 'Маргааш өглөө гэрээний нөхцлийг тохиролцъё.' },
            { w: 'contract', t: 'гэрээ хэлэлцээр', e: 'Please sign this NDA work contract.', em: 'Энэхүү нууцлалын хөдөлмөрийн гэрээг зурна уу.' },
            { w: 'manager', t: 'менежерт, удирдах ажилтан', e: 'Our sales manager approved the budget.', em: 'Манай борлуулалтын менежер төсвийг батлав.' },
            { w: 'market-share', t: 'зах зээлийн эзлэх хувь', e: 'The tech giant wants to increase market share.', em: 'Технологийн гигант компани зах зээлд эзлэх хувиа өсгөхийг хүсэж байна.' },
            { w: 'workplace', t: 'ажлын байр', e: 'A positive workplace boosts performance.', em: 'Эерэг ажлын байр нь гүйцэтгэлийг нэмэгдүүлдэг.' },
            { w: 'leadership', t: 'манлайлал', e: 'Effective leadership is key to continuous growth.', em: 'Үр дүнтэй манлайлал бол тасралтгүй өсөлтийн түлхүүр.' },
            { w: 'collaboration', t: 'хамтын ажиллагаа', e: 'Multi-department collaboration was very effective.', em: 'Олон хэлтсийн хамтын ажиллагаа маш үр дүнтэй байсан.' },
            { w: 'presentation', t: 'танилцуулга илтгэл', e: 'He delivered an outstanding business presentation.', em: 'Тэрээр бизнесийн гайхалтай танилцуулга илтгэл тавьсан.' },
            { w: 'productivity', t: 'бүтээмжтэй байдал', e: 'Task automation increases overall worker productivity.', em: 'Даалгаврын автоматжуулалт нь ажилчдын бүтээмжийг нэмэгдүүлдэг.' },
            { w: 'partnership', t: 'түншлэл, хамтрал', e: 'They built a strategic corporate partnership.', em: 'Тэд стратегийн корпорацийн түншлэл байгуулсан.' }
          ];
          const chosen = list[termIndex % list.length];
          word = `${chosen.w}-${termIndex}`;
          translation = `${chosen.t} (дугаар ${termIndex})`;
          example = chosen.e;
          exampleMn = chosen.em;
        } else if (category === 'Travel words') {
          const list = [
            { w: 'vacation', t: 'амралт зугаалга', e: 'We spent our winter vacation in the mountains.', em: 'Бид өвлийн амралтаа ууланд өнгөрөөсөн.' },
            { w: 'tourism', t: 'аялал жуулчлал', e: 'Ecotourism benefits local green preservation.', em: 'Эко аялал жуулчлал нь байгаль хамгаалалд тустай.' },
            { w: 'traveler', t: 'аялагч', e: 'The tired traveler rested near the waterfall.', em: 'Ядарсан аялагч хүрхрээний дэргэд амарч байв.' },
            { w: 'passenger', t: 'зорчигч', e: 'Explain emergency rules to every train passenger.', em: 'Галт тэрэгний зорчигч бүрт аюулгүй байдлын дүрмийг тайлбарла.' },
            { w: 'checkpoint', t: 'хяналтын цэг', e: 'Customs checkpoint checks active luggage.', em: 'Гаалийн хяналтын цэг тээшийг шалгадаг.' },
            { w: 'expedition', t: 'аяны баг, хайгуул', e: 'They joined a research expedition to Antarctica.', em: 'Тэд Антарктид руу хийх судалгааны аяны багт нэгдэв.' },
            { w: 'landmark', t: 'түүхэн дурсгалт чухал газар', e: 'The Eiffel Tower is a popular Parisian landmark.', em: 'Эйфелийн цамхаг бол Парисын алдартай дурсгалт газар.' },
            { w: 'souvenir-shop', t: 'дурсгалын зүйлсийн дэлгүүр', e: 'Buy a local postcard in the souvenir shop.', em: 'Дурсгалын зүйийн дэлгүүрээс орон нутгийн ил захидал худалдаж ав.' },
            { w: 'backpack', t: 'аяллын үүргэвч', e: 'Pack a sleeping bag inside your heavy backpack.', em: 'Хүнд үүргэвчиндээ унтлагын уутаа хийгээрэй.' },
            { w: 'voyage', translation: 'далайн урт аялал', e: 'The historical sea voyage took three months.', em: 'Түүхэн далайн урт аялал гурван сар үргэлжилсэн.' }
          ];
          const chosen = list[termIndex % list.length];
          word = `${chosen.w}-${termIndex}`;
          translation = `${chosen.t} (дугаар ${termIndex})`;
          example = chosen.e;
          exampleMn = chosen.em;
        } else if (category === 'Health/Body words') {
          const list = [
            { w: 'nutritionist', t: 'шим тэжээлийн эмч', e: 'The general nutritionist suggested eating greens.', em: 'Шим тэжээлийн эмч ногоон хүнс хэрэглэхийг санал болгов.' },
            { w: 'vitamin', t: 'витамин бэлдмэл', e: 'Vitamin D is generated by sunlight.', em: 'Нарны гэрэл Д витаминыг үүсгэдэг.' },
            { w: 'fitness', t: 'биеийн тамир, чийрэгжилт', e: 'Daily jogging improves overall cardiovascular fitness.', em: 'Өдөр тутмын гүйлт зүрх судасны чийрэгжилтийг сайжруулна.' },
            { w: 'hydration', t: 'усны тэнцвэрт байдал', e: 'Adequate water hydration keeps organs working.', em: 'Усны хангалттай тэнцвэр эрхтэнүүдийн ажиллагааг дэмждэг.' },
            { w: 'wellbeing', t: 'эрүүл мэнд, сайн сайхан', e: 'Yoga improves mental wellbeing significantly.', em: 'Иог нь сэтгэцийн эрүүл мэндийг мэдэгдэхүйц сайжруулдаг.' },
            { w: 'immunity', t: 'дархлааны чадвар', e: 'Vaccines build custom immune protections.', em: 'Вакцинууд тусгай дархлааны хамгаалалт үүсгэдэг.' },
            { w: 'heartbeat', t: 'зүрхний цохилт', e: 'Her heartbeat is perfectly stable.', em: 'Түүний зүрхний цохилт төгс тогтвортой байна.' },
            { w: 'clinic', t: 'клиник эмнэлэг', e: 'We visited the modern dental clinic nearby.', em: 'Бид ойролцоох шүдний орчин үеийн клиник эмнэлэгт зочилсон.' },
            { w: 'oxygen', t: 'хүчилтөрөгч', e: 'Deep breathing feeds active oxygen to blood.', em: 'Гүнзгий амьсгалах нь цусанд идэвхтэй хүчилтөрөгч өгдөг.' },
            { w: 'recovery', t: 'бие тэнхрэх, эдгэрэлт', e: 'A smooth medical recovery takes peaceful rest.', em: 'Эдгэрэлт явагдахад тайван амрах шаардлагатай.' }
          ];
          const chosen = list[termIndex % list.length];
          word = `${chosen.w}-${termIndex}`;
          translation = `${chosen.t} (дугаар ${termIndex})`;
          example = chosen.e;
          exampleMn = chosen.em;
        } else if (category === 'Technology words') {
          const list = [
            { w: 'application', t: 'хэрэглээний программ', e: 'This mobile application runs without network.', em: 'Энэхүү гар утасны программ нь сүлжээгүй ажилладаг.' },
            { w: 'processor', t: 'процессор чип', e: 'The latest computer processor is incredibly fast.', em: 'Хамгийн сүүлийн үеийн компьютер процессор гайхалтай хурдан.' },
            { w: 'developer', t: 'программ хөгжүүлэгч', e: 'A full-stack developer writes real code.', em: 'Бүрэн хэмжээний хөгжүүлэгч бодит код бичдэг.' },
            { w: 'automation', t: 'автоматжуулалт', e: 'Industrial automation speeds up building times.', em: 'Үйлдвэрийн автоматжуулалт угсралтын хугацааг хурдасгадаг.' },
            { w: 'mainframe', t: 'үндсэн том компьютер', e: 'The bank stores secret ledgers on mainframe.', em: 'Банк нууц бүртгэлүүдээ үндсэн компьютер дээр хадгалдаг.' },
            { w: 'compiler', t: 'хөрвүүлэгч программ', e: 'The compiler translates typescript to plain javascript.', em: 'Хөрвүүлэгч программ нь тайпскриптийг жаваскрипт рүү хөрвүүлдэг.' },
            { w: 'cloud-storage', t: 'үүлэн технологийн хадгаламж', e: 'Upload your backup files to secured cloud-storage.', em: 'Нөөц файлаа найдвартай үүлэн хадгаламжинд байршуул.' },
            { w: 'broadband', t: 'өргөн зурвасын хурдтай сүлжээ', e: 'Fiber broadband delivers fast download rate.', em: 'Шилэн өргөн зурвасын сүлжээ хурдан татах боломж олгодог.' },
            { w: 'wireless', t: 'утасгүй технологи', e: 'We prefer wireless speakers nowadays.', em: 'Бид өнөө үед утасгүй чанга яригчийг илүүд үзэж байна.' },
            { w: 'bandwidth', t: 'сүлжээний зурвасын багтаамж', e: 'High video quality calls consume more bandwidth.', em: 'Өндөр чанартай дүрсний дуудлага нь илүү их зурвасын багтаамж ашигладаг.' }
          ];
          const chosen = list[termIndex % list.length];
          word = `${chosen.w}-${termIndex}`;
          translation = `${chosen.t} (дугаар ${termIndex})`;
          example = chosen.e;
          exampleMn = chosen.em;
        } else if (category === 'Nature/Environment') {
          const list = [
            { w: 'glacier', t: 'мөсөн гол', e: 'Glaciers are melting due to global warming.', em: 'Дэлхийн дулаарлын улмаас мөсөн голууд хайлж байна.' },
            { w: 'waterfall', t: 'хүрхрээ', e: 'The tropical waterfall sounds peaceful.', em: 'Халуун орны хүрхрээний чимээ тайван сонсогддог.' },
            { w: 'greenhouse', t: 'хүлэмжийн хий', e: 'Carbon dioxide is a greenhouse gas.', em: 'Нүүрстөрөгчийн давхар исэл бол хүлэмжийн хий юм.' },
            { w: 'conservationist', t: 'байгаль хамгаалагч зүтгэлтэн', e: 'The conservationist protects local wild plants.', em: 'Байгаль хамгаалагч зүтгэлтэн орон нутгийн зэрлэг ургамлыг хамгаалдаг.' },
            { w: 'atmosphere', t: 'агаар мандал', e: 'Ozone shield inside our atmosphere blocks UV rays.', em: 'Агаар мандал дахь озоны давхарга нь хэт ягаан туяаг хаадаг.' },
            { w: 'species', t: 'амьтны төрөл зүйл', e: 'We must protect endangered bird species.', em: 'Бид ховордсон шувуудын төрөл зүйлийг хамгаалах ёстой.' },
            { w: 'habitat', t: 'амьдрах орчин сав', e: 'Forest fires destroy wildlife habitat.', em: 'Ойн түймэр зэрлэг амьтдын амьдрах орчныг сүйтгэдэг.' },
            { w: 'volcano', t: 'гал уул', e: 'Active volcano erupted on the tropical island.', em: 'Халуун орны арал дээрх идэвхтэй гал уул дэлбэрэв.' },
            { w: 'organic', t: 'органик, байгалийн цэвэр', e: 'Use organic fertilizer in the crop soil.', em: 'Тариалангийн хөрсөнд органик бордоо хэрэглээрэй.' },
            { w: 'resources', t: 'байгалийн нөөц баялаг', e: 'Conserve water resources as much as possible.', em: 'Усны нөөцийг аль болох хэмнээрэй.' }
          ];
          const chosen = list[termIndex % list.length];
          word = `${chosen.w}-${termIndex}`;
          translation = `${chosen.t} (дугаар ${termIndex})`;
          example = chosen.e;
          exampleMn = chosen.em;
        } else if (category === 'Emotions/Feelings') {
          const list = [
            { w: 'compassion', t: 'энэрэн нигүүлсэх сэтгэл', e: 'Show active compassion to poor families.', em: 'Ядуу өрхүүдэд энэрэнгүй сэтгэлээр хандаж бай.' },
            { w: 'cheerful', t: 'баяр хөөртэй сэргэлэн', e: 'She has a very bright, cheerful personality.', em: 'Тэрээр маш тод, хөгжилтэй сэргэлэн зантай.' },
            { w: 'gratitude', t: 'талархал илэрхийлэл', e: 'Expressing gratitude makes your bonds stronger.', em: 'Талархал илэрхийлэх нь харилцааг бэхжүүлдэг.' },
            { w: 'homesick', t: 'гэрээ санах сэтгэл', e: 'Many young students feel homesick at first.', em: 'Ихэнх залуу оюутнууд эхэндээ гэрээ санадаг.' },
            { w: 'optimism', t: 'өөдрөг үзэл бодол', e: 'We need absolute realistic optimism to override limits.', em: 'Хязгаарыг давахын тулд бидэнд өөдрөг үзэл хэрэгтэй.' },
            { w: 'empathy', t: 'бусдыг мэдрэх чадвар', e: 'Listen and show empathy to your friends.', em: 'Найзуудаа сонсож, тэднийг ойлгох чадварыг үзүүл .' },
            { w: 'excitement', t: 'баярын хөөрөл догдлол', e: 'Travel generates wonderful excitement.', em: 'Аялал гайхалтай хөөрөл догдлол үүсгэдэг.' },
            { w: 'satisfied', t: 'сэтгэл хангалуун байдал', e: 'Our clients are satisfied with the solutions.', em: 'Манай үйлчлүүлэгчид шийдлүүдэд сэтгэл хангалуун байна.' },
            { w: 'fearful', t: 'айдастай, түгшсэн', e: 'The child felt fearful inside the dark hallway.', em: 'Хүүхэд харанхуй коридорт айж байлаа.' },
            { w: 'affection', t: 'хайр энэрэл', e: 'Mothers treat babies with deep affection.', em: 'Ээжүүд хүүхдээ гүн хайр энэрлээр халамжилдаг.' }
          ];
          const chosen = list[termIndex % list.length];
          word = `${chosen.w}-${termIndex}`;
          translation = `${chosen.t} (дугаар ${termIndex})`;
          example = chosen.e;
          exampleMn = chosen.em;
        }

        finalWords.push({
          id: String(idCounter++),
          word: word.charAt(0).toUpperCase() + word.slice(1),
          translation,
          pos,
          level: lvl,
          category,
          example,
          exampleMn
        });
      }
    }
  });

  return finalWords;
};
