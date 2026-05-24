import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, Check, X, Award, Search, Filter } from 'lucide-react';

interface Flashcard {
  word: string;
  translation: string;
  pos: string;
  example: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
}

const vocabulary: Flashcard[] = [
  // A1 Nouns
  { word: 'apple', translation: 'алим', pos: 'noun', example: 'I eat an apple every day.', level: 'A1', category: 'Nouns' },
  { word: 'book', translation: 'ном', pos: 'noun', example: 'She is reading an interesting book.', level: 'A1', category: 'Nouns' },
  { word: 'school', translation: 'сургууль', pos: 'noun', example: 'The children go to school by bus.', level: 'A1', category: 'Nouns' },
  { word: 'teacher', translation: 'багш', pos: 'noun', example: 'Our English teacher is very kind.', level: 'A1', category: 'Nouns' },
  { word: 'family', translation: 'гэр бүл', pos: 'noun', example: 'I love spending time with my family.', level: 'A1', category: 'Nouns' },
  { word: 'friend', translation: 'найз', pos: 'noun', example: 'He is my best friend from childhood.', level: 'A1', category: 'Nouns' },
  { word: 'house', translation: 'байшин', pos: 'noun', example: 'We live in a small but cozy house.', level: 'A1', category: 'Nouns' },
  { word: 'water', translation: 'ус', pos: 'noun', example: 'Please drink plenty of water.', level: 'A1', category: 'Nouns' },
  { word: 'food', translation: 'хоол', pos: 'noun', example: 'The food at this restaurant is delicious.', level: 'A1', category: 'Nouns' },
  { word: 'cat', translation: 'муур', pos: 'noun', example: 'My cat likes to sleep on the sofa.', level: 'A1', category: 'Nouns' },
  { word: 'dog', translation: 'нохой', pos: 'noun', example: 'The dog is barking at the stranger.', level: 'A1', category: 'Nouns' },
  { word: 'milk', translation: 'сүү', pos: 'noun', example: 'I usually drink milk in the morning.', level: 'A1', category: 'Nouns' },
  { word: 'bread', translation: 'талх', pos: 'noun', example: 'I need to buy some fresh bread.', level: 'A1', category: 'Nouns' },
  { word: 'garden', translation: 'цэцэрлэг', pos: 'noun', example: 'My mother grows flowers in the garden.', level: 'A1', category: 'Nouns' },
  // A1 Verbs
  { word: 'read', translation: 'унших', pos: 'verb', example: 'I like to read before bed.', level: 'A1', category: 'Verbs' },
  { word: 'write', translation: 'бичих', pos: 'verb', example: 'Write your name on the paper.', level: 'A1', category: 'Verbs' },
  { word: 'speak', translation: 'ярих', pos: 'verb', example: 'Can you speak English?', level: 'A1', category: 'Verbs' },
  { word: 'eat', translation: 'идэх', pos: 'verb', example: 'Let\'s eat lunch together.', level: 'A1', category: 'Verbs' },
  { word: 'drink', translation: 'уух', pos: 'verb', example: 'I want to drink some orange juice.', level: 'A1', category: 'Verbs' },
  { word: 'sleep', translation: 'унтах', pos: 'verb', example: 'The baby is sleeping.', level: 'A1', category: 'Verbs' },
  { word: 'walk', translation: 'алхах', pos: 'verb', example: 'We walk in the park every evening.', level: 'A1', category: 'Verbs' },
  { word: 'help', translation: 'туслах', pos: 'verb', example: 'Can you help me with this bag?', level: 'A1', category: 'Verbs' },
  { word: 'listen', translation: 'сонсох', pos: 'verb', example: 'Listen to the music.', level: 'A1', category: 'Verbs' },
  { word: 'run', translation: 'гүйх', pos: 'verb', example: 'The children run in the garden.', level: 'A1', category: 'Verbs' },
  // A1 Adjectives
  { word: 'big', translation: 'том', pos: 'adj', example: 'He has a big car.', level: 'A1', category: 'Adjectives' },
  { word: 'small', translation: 'жижиг', pos: 'adj', example: 'It is a small cat.', level: 'A1', category: 'Adjectives' },
  { word: 'happy', translation: 'аз жаргалтай', pos: 'adj', example: 'I am so happy to see you.', level: 'A1', category: 'Adjectives' },
  { word: 'good', translation: 'сайн', pos: 'adj', example: 'This is a good book.', level: 'A1', category: 'Adjectives' },
  { word: 'hot', translation: 'халуун', pos: 'adj', example: 'The coffee is very hot.', level: 'A1', category: 'Adjectives' },
  { word: 'cold', translation: 'хүйтэн', pos: 'adj', example: 'It is very cold today.', level: 'A1', category: 'Adjectives' },
  { word: 'new', translation: 'шинэ', pos: 'adj', example: 'I have a new phone.', level: 'A1', category: 'Adjectives' },
  { word: 'old', translation: 'хуучин', pos: 'adj', example: 'That building is very old.', level: 'A1', category: 'Adjectives' },
  // A1 Time
  { word: 'today', translation: 'өнөөдөр', pos: 'time', example: 'Today is Monday.', level: 'A1', category: 'Time' },
  { word: 'tomorrow', translation: 'маргааш', pos: 'time', example: 'I will see you tomorrow.', level: 'A1', category: 'Time' },
  { word: 'yesterday', translation: 'өчигдөр', pos: 'time', example: 'Yesterday was a beautiful day.', level: 'A1', category: 'Time' },
  { word: 'morning', translation: 'өглөө', pos: 'time', example: 'I work in the morning.', level: 'A1', category: 'Time' },
  { word: 'evening', translation: 'орой', pos: 'time', example: 'We watch TV in the evening.', level: 'A1', category: 'Time' },
  { word: 'week', translation: 'долоо хоног', pos: 'time', example: 'There are seven days in a week.', level: 'A1', category: 'Time' },

  // A2 Nouns
  { word: 'hospital', translation: 'эмнэлэг', pos: 'noun', example: 'My sister works at the local hospital.', level: 'A2', category: 'Nouns' },
  { word: 'library', translation: 'номын сан', pos: 'noun', example: 'I usually study at the university library.', level: 'A2', category: 'Nouns' },
  { word: 'mountain', translation: 'уул', pos: 'noun', example: 'They love hiking in the mountains.', level: 'A2', category: 'Nouns' },
  { word: 'river', translation: 'гол', pos: 'noun', example: 'The river flows through the city.', level: 'A2', category: 'Nouns' },
  { word: 'memory', translation: 'ой санамж', pos: 'noun', example: 'She has a very good memory for names.', level: 'A2', category: 'Nouns' },
  { word: 'experience', translation: 'туршлага', pos: 'noun', example: 'I had a great experience traveling abroad.', level: 'A2', category: 'Nouns' },
  { word: 'education', translation: 'боловсрол', pos: 'noun', example: 'Education is very important for the future.', level: 'A2', category: 'Nouns' },
  { word: 'information', translation: 'мэдээлэл', pos: 'noun', example: 'I need more information about the course.', level: 'A2', category: 'Nouns' },
  { word: 'journey', translation: 'аялал', pos: 'noun', example: 'The journey to the capital took five hours.', level: 'A2', category: 'Nouns' },
  { word: 'interview', translation: 'ярилцлага', pos: 'noun', example: 'I have a job interview tomorrow morning.', level: 'A2', category: 'Nouns' },
  // A2 Verbs
  { word: 'travel', translation: 'аялах', pos: 'verb', example: 'I want to travel around the world.', level: 'A2', category: 'Verbs' },
  { word: 'improve', translation: 'сайжруулах', pos: 'verb', example: 'I practice every day to improve my speaking.', level: 'A2', category: 'Verbs' },
  { word: 'explain', translation: 'тайлбарлах', pos: 'verb', example: 'Can you explain this grammar rule again?', level: 'A2', category: 'Verbs' },
  { word: 'decide', translation: 'шийдэх', pos: 'verb', example: 'It was difficult to decide which one to buy.', level: 'A2', category: 'Verbs' },
  { word: 'describe', translation: 'дүрслэх', pos: 'verb', example: 'Can you describe your hometown?', level: 'A2', category: 'Verbs' },
  { word: 'compare', translation: 'харьцуулах', pos: 'verb', example: 'Compare these two pictures.', level: 'A2', category: 'Verbs' },
  { word: 'believe', translation: 'итгэх', pos: 'verb', example: 'I believe that anything is possible.', level: 'A2', category: 'Verbs' },
  { word: 'imagine', translation: 'төсөөлөх', pos: 'verb', example: 'Imagine living on a deserted island.', level: 'A2', category: 'Verbs' },
  // A2 Adjectives
  { word: 'interesting', translation: 'сонирхолтой', pos: 'adj', example: 'This is an interesting story.', level: 'A2', category: 'Adjectives' },
  { word: 'expensive', translation: 'үнэтэй', pos: 'adj', example: 'That watch is too expensive for me.', level: 'A2', category: 'Adjectives' },
  { word: 'important', translation: 'чухал', pos: 'adj', example: 'It is important to study every day.', level: 'A2', category: 'Adjectives' },
  { word: 'different', translation: 'өөр', pos: 'adj', example: 'People have different opinions.', level: 'A2', category: 'Adjectives' },
  { word: 'famous', translation: 'алдартай', pos: 'adj', example: 'He is a famous actor in my country.', level: 'A2', category: 'Adjectives' },
  { word: 'modern', translation: 'орчин үеийн', pos: 'adj', example: 'Ulaanbaatar is a modern city.', level: 'A2', category: 'Adjectives' },
  { word: 'careful', translation: 'болгоомжтой', pos: 'adj', example: 'Be careful when crossing the street.', level: 'A2', category: 'Adjectives' },
  // A2 Adverbs
  { word: 'always', translation: 'үргэлж', pos: 'adv', example: 'I always drink coffee in the morning.', level: 'A2', category: 'Adverbs' },
  { word: 'sometimes', translation: 'заримдаа', pos: 'adv', example: 'Sometimes I go for a walk in the evening.', level: 'A2', category: 'Adverbs' },
  { word: 'never', translation: 'хэзээ ч', pos: 'adv', example: 'I have never been to America.', level: 'A2', category: 'Adverbs' },
  { word: 'already', translation: 'хэдийнэ', pos: 'adv', example: 'I have already finished my homework.', level: 'A2', category: 'Adverbs' },
  { word: 'together', translation: 'хамтдаа', pos: 'adv', example: 'Let\'s go to the cinema together.', level: 'A2', category: 'Adverbs' },

  // B1 Academic Selection
  { word: 'achieve', translation: 'хүрэх', pos: 'verb', example: 'You can achieve anything if you work hard.', level: 'B1', category: 'Academic' },
  { word: 'advantage', translation: 'давуу тал', pos: 'noun', example: 'He has an advantage because he speaks three languages.', level: 'B1', category: 'Academic' },
  { word: 'affect', translation: 'нөлөөлөх', pos: 'verb', example: 'The weather often affects my mood.', level: 'B1', category: 'Academic' },
  { word: 'behavior', translation: 'зан байдал', pos: 'noun', example: 'The teacher praised the children\'s behavior.', level: 'B1', category: 'Academic' },
  { word: 'confident', translation: 'өөртөө итгэлтэй', pos: 'adj', example: 'She is confident about passing her driving test.', level: 'B1', category: 'Academic' },
  { word: 'environment', translation: 'хүрээлэн буй орчин', pos: 'noun', example: 'We must protect our environment.', level: 'B1', category: 'Academic' },
  { word: 'consequence', translation: 'үр дагавар', pos: 'noun', example: 'Climate change has serious consequences.', level: 'B1', category: 'Academic' },
  { word: 'establish', translation: 'байгуулах', pos: 'verb', example: 'The company was established in 1990.', level: 'B1', category: 'Academic' },
  { word: 'flexible', translation: 'уян хатан', pos: 'adj', example: 'We need to be flexible about our plans.', level: 'B1', category: 'Academic' },
  { word: 'guarantee', translation: 'баталгаа', pos: 'noun/verb', example: 'I can guarantee that you will like it.', level: 'B1', category: 'Academic' },
  { word: 'identity', translation: 'хэн болох', pos: 'noun', example: 'Music is an important part of her identity.', level: 'B1', category: 'Academic' },
  { word: 'justify', translation: 'зөвтгөх', pos: 'verb', example: 'How can you justify such a high cost?', level: 'B1', category: 'Academic' },
  { word: 'knowledge', translation: 'мэдлэг', pos: 'noun', example: 'He has an extensive knowledge of history.', level: 'B1', category: 'Academic' },
  { word: 'logical', translation: 'логиктой', pos: 'adj', example: 'It was a logical conclusion to the argument.', level: 'B1', category: 'Academic' },
  { word: 'maintain', translation: 'хэвээр хадгалах', pos: 'verb', example: 'You must maintain a healthy lifestyle.', level: 'B1', category: 'Academic' },
  { word: 'objective', translation: 'зорилго', pos: 'noun', example: 'The main objective is to finish on time.', level: 'B1', category: 'Academic' },
  { word: 'participate', translation: 'оролцох', pos: 'verb', example: 'She loves to participate in discussions.', level: 'B1', category: 'Academic' },
  { word: 'react', translation: 'хариу үйлдэл үзүүлэх', pos: 'verb', example: 'How did he react to the news?', level: 'B1', category: 'Academic' },
  { word: 'specific', translation: 'тодорхой', pos: 'adj', example: 'Could you be more specific about the problem?', level: 'B1', category: 'Academic' },
  { word: 'theory', translation: 'онол', pos: 'noun', example: 'Darwin formulated the theory of evolution.', level: 'B1', category: 'Academic' },
  { word: 'analyze', translation: 'шинжлэх', pos: 'verb', example: 'We need to analyze the data carefully.', level: 'B1', category: 'Academic' },
  { word: 'benefit', translation: 'ашиг тус', pos: 'noun', example: 'There are many benefits to exercise.', level: 'B1', category: 'Academic' },
  { word: 'complex', translation: 'нарийн төвөгтэй', pos: 'adj', example: 'The situation is very complex.', level: 'B1', category: 'Academic' },
  { word: 'data', translation: 'өгөгдөл', pos: 'noun', example: 'The data suggests a trend.', level: 'B1', category: 'Academic' },
  { word: 'evidence', translation: 'баримт', pos: 'noun', example: 'There is no evidence to support that.', level: 'B1', category: 'Academic' },
  { word: 'factor', translation: 'хүчин зүйл', pos: 'noun', example: 'Price is a major factor in our decision.', level: 'B1', category: 'Academic' },
  { word: 'global', translation: 'дэлхийн', pos: 'adj', example: 'Pollution is a global problem.', level: 'B1', category: 'Academic' },
  { word: 'income', translation: 'орлого', pos: 'noun', example: 'The family has a low income.', level: 'B1', category: 'Academic' },
  { word: 'legal', translation: 'хууль ёсны', pos: 'adj', example: 'He is seeking legal advice.', level: 'B1', category: 'Academic' },
  { word: 'method', translation: 'арга барил', pos: 'noun', example: 'We used a new method of teaching.', level: 'B1', category: 'Academic' },
  { word: 'normal', translation: 'хэвийн', pos: 'adj', example: 'It is normal to feel nervous.', level: 'B1', category: 'Academic' },
  { word: 'occur', translation: 'тохиолдох', pos: 'verb', example: 'The accident occurred at midnight.', level: 'B1', category: 'Academic' },
  { word: 'period', translation: 'хугацаа', pos: 'noun', example: 'The class starts after a short period.', level: 'B1', category: 'Academic' },
  { word: 'policy', translation: 'бодлого', pos: 'noun', example: 'The company has a strict policy.', level: 'B1', category: 'Academic' },
  { word: 'research', translation: 'судалгаа', pos: 'noun/verb', example: 'I am doing research on history.', level: 'B1', category: 'Academic' },
  { word: 'source', translation: 'эх сурвалж', pos: 'noun', example: 'What is the source of the information?', level: 'B1', category: 'Academic' },
  { word: 'status', translation: 'статус', pos: 'noun', example: 'What is the status of your application?', level: 'B1', category: 'Academic' },
  { word: 'task', translation: 'даалгавар', pos: 'noun', example: 'Finish the task before you leave.', level: 'B1', category: 'Academic' },
  { word: 'unique', translation: 'цорын ганц', pos: 'adj', example: 'Every person is unique.', level: 'B1', category: 'Academic' },
  { word: 'variable', translation: 'хувьсагч', pos: 'noun', example: 'There are many variables to consider.', level: 'B1', category: 'Academic' },

  // B2 Academic Selection
  { word: 'analyze', translation: 'дүн шинжилгээ хийх', pos: 'verb', example: 'Scientists analyze data to find patterns.', level: 'B2', category: 'Academic' },
  { word: 'circumstance', translation: 'нөхцөл байдал', pos: 'noun', example: 'Under no circumstances should you open that door.', level: 'B2', category: 'Academic' },
  { word: 'contradict', translation: 'зөрчилдөх', pos: 'verb', example: 'His actions contradict his words.', level: 'B2', category: 'Academic' },
  { word: 'elaborate', translation: 'нарийвчлан тайлбарлах', pos: 'verb', example: 'Could you elaborate on that point?', level: 'B2', category: 'Academic' },
  { word: 'significant', translation: 'ач холбогдолтой', pos: 'adj', example: 'There has been a significant increase in sales.', level: 'B2', category: 'Academic' },
  { word: 'ambiguous', translation: 'тодорхойгүй', pos: 'adj', example: 'His response was somewhat ambiguous.', level: 'B2', category: 'Academic' },
  { word: 'capacity', translation: 'хүчин чадал', pos: 'noun', example: 'The stadium has a seating capacity of 50,000.', level: 'B2', category: 'Academic' },
  { word: 'deduce', translation: 'дүгнэлт хийх', pos: 'verb', example: 'What can we deduce from these results?', level: 'B2', category: 'Academic' },
  { word: 'equate', translation: 'адилтгах', pos: 'verb', example: 'You cannot equate money with happiness.', level: 'B2', category: 'Academic' },
  { word: 'fluctuate', translation: 'хэлбэлзэх', pos: 'verb', example: 'Oil prices often fluctuate widely.', level: 'B2', category: 'Academic' },
  { word: 'hypothesis', translation: 'таамаглал', pos: 'noun', example: 'We need to test our hypothesis.', level: 'B2', category: 'Academic' },
  { word: 'implement', translation: 'хэрэгжүүлэх', pos: 'verb', example: 'The new policy will be implemented next month.', level: 'B2', category: 'Academic' },
  { word: 'legislate', translation: 'хууль тогтоох', pos: 'verb', example: 'The government will legislate against smoking.', level: 'B2', category: 'Academic' },
  { word: 'parameter', translation: 'параметр', pos: 'noun', example: 'We must work within the set parameters.', level: 'B2', category: 'Academic' },
  { word: 'rationalize', translation: 'утга учиртай болгох', pos: 'verb', example: 'He tried to rationalize his behavior.', level: 'B2', category: 'Academic' },
  { word: 'simulate', translation: 'дуурайлгах', pos: 'verb', example: 'The computer can simulate flight conditions.', level: 'B2', category: 'Academic' },
  { word: 'ultimately', translation: 'эцэст нь', pos: 'adv', example: 'Ultimately, it is your decision.', level: 'B2', category: 'Academic' },
  { word: 'validate', translation: 'баталгаажуулах', pos: 'verb', example: 'We need to validate the original data.', level: 'B2', category: 'Academic' },
  { word: 'whereby', translation: 'үүгээр', pos: 'adv', example: 'It is a system whereby everyone contributes.', level: 'B2', category: 'Academic' },
  { word: 'abstract', translation: 'хийсвэр', pos: 'adj', example: 'The idea is too abstract for me.', level: 'B2', category: 'Academic' },
  { word: 'adjacent', translation: 'зэргэлдээ', pos: 'adj', example: 'The two houses are adjacent.', level: 'B2', category: 'Academic' },
  { word: 'advocate', translation: 'өмгөөлөх', pos: 'verb/noun', example: 'She advocates for human rights.', level: 'B2', category: 'Academic' },
  { word: 'aggregate', translation: 'нийт', pos: 'adj/noun', example: 'The aggregate score was 5-4.', level: 'B2', category: 'Academic' },
  { word: 'behalf', translation: 'өмнөөс', pos: 'noun', example: 'I am speaking on behalf of my family.', level: 'B2', category: 'Academic' },
  { word: 'comprise', translation: 'бүрдэх', pos: 'verb', example: 'The team comprises five members.', level: 'B2', category: 'Academic' },
  { word: 'empirical', translation: 'туршлагад суурилсан', pos: 'adj', example: 'We need empirical evidence.', level: 'B2', category: 'Academic' },
  { word: 'finite', translation: 'хязгаартай', pos: 'adj', example: 'The world has finite resources.', level: 'B2', category: 'Academic' },
  { word: 'hierarchy', translation: 'шатлал', pos: 'noun', example: 'The company has a clear hierarchy.', level: 'B2', category: 'Academic' },
  { word: 'implicit', translation: 'шууд бус', pos: 'adj', example: 'It was an implicit agreement.', level: 'B2', category: 'Academic' },
  { word: 'intrinsic', translation: 'төрөлхийн', pos: 'adj', example: 'It has an intrinsic value.', level: 'B2', category: 'Academic' },
  { word: 'paradigm', translation: 'загвар', pos: 'noun', example: 'We need a new paradigm for education.', level: 'B2', category: 'Academic' },
  { word: 'qualitative', translation: 'чанарын', pos: 'adj', example: 'We are doing qualitative research.', level: 'B2', category: 'Academic' },
  { word: 'scope', translation: 'цар хүрээ', pos: 'noun', example: 'The scope of the project is wide.', level: 'B2', category: 'Academic' },
  { word: 'underlie', translation: 'үндэс болох', pos: 'verb', example: 'This principle underlies the theory.', level: 'B2', category: 'Academic' },

  // C1 Academic Selection
  { word: 'ambiguity', translation: 'тодорхой бус байдал', pos: 'noun', example: 'The law was criticized for its ambiguity.', level: 'C1', category: 'Academic' },
  { word: 'astute', translation: 'овсгоотой', pos: 'adj', example: 'He made an astute observation.', level: 'C1', category: 'Academic' },
  { word: 'benchmark', translation: 'жишиг', pos: 'noun', example: 'This project sets a new benchmark for excellence.', level: 'C1', category: 'Academic' },
  { word: 'explicit', translation: 'тодорхой', pos: 'adj', example: 'I gave you explicit instructions.', level: 'C1', category: 'Academic' },
  { word: 'meticulous', translation: 'маш нарийн', pos: 'adj', example: 'She is meticulous about her records.', level: 'C1', category: 'Academic' },
  { word: 'anomaly', translation: 'гажиг', pos: 'noun', example: 'There is an anomaly in the data.', level: 'C1', category: 'Academic' },
  { word: 'bolster', translation: 'дэмжих', pos: 'verb', example: 'The study bolsters the case for reform.', level: 'C1', category: 'Academic' },
  { word: 'compelling', translation: 'итгэл төрүүлсэн', pos: 'adj', example: 'He gave a compelling reason for his absence.', level: 'C1', category: 'Academic' },
  { word: 'deleterious', translation: 'хор хөнөөлтэй', pos: 'adj', example: 'Smocking has a deleterious effect on health.', level: 'C1', category: 'Academic' },
  { word: 'eloquent', translation: 'уран илтгэгч', pos: 'adj', example: 'She gave an eloquent speech.', level: 'C1', category: 'Academic' },
  { word: 'fastidious', translation: 'шаардлага өндөртэй', pos: 'adj', example: 'He is fastidious about his appearance.', level: 'C1', category: 'Academic' },
  { word: 'gratuitous', translation: 'шалтгаангүй', pos: 'adj', example: 'There was a lot of gratuitous violence.', level: 'C1', category: 'Academic' },
  { word: 'hegemony', translation: 'давамгайлал', pos: 'noun', example: 'The country sought to maintain its hegemony.', level: 'C1', category: 'Academic' },
  { word: 'impetuous', translation: 'бодлогогүй', pos: 'adj', example: 'He made an impetuous decision.', level: 'C1', category: 'Academic' },
  { word: 'judicious', translation: 'хэрсүү', pos: 'adj', example: 'We should make a judicious choice.', level: 'C1', category: 'Academic' },
  { word: 'lucrative', translation: 'ашигтай', pos: 'adj', example: 'He made a lucrative business deal.', level: 'C1', category: 'Academic' },
  { word: 'nominal', translation: 'нэр төдий', pos: 'adj', example: 'There is a nominal fee for the course.', level: 'C1', category: 'Academic' },
  { word: 'oscillate', translation: 'хэлбэлзэх', pos: 'verb', example: 'The stock market continues to oscillate.', level: 'C1', category: 'Academic' },
  { word: 'partisan', translation: 'тал засагч', pos: 'adj', example: 'It was a highly partisan report.', level: 'C1', category: 'Academic' },
  { word: 'superfluous', translation: 'илүүц', pos: 'adj', example: 'Avoid superfluous words in your writing.', level: 'C1', category: 'Academic' },
  { word: 'tenacious', translation: 'цурхираа', pos: 'adj', example: 'She is a tenacious negotiator.', level: 'C1', category: 'Academic' },
  { word: 'ubiquitous', translation: 'хаа сайгүй', pos: 'adj', example: 'Smartphones are ubiquitous these days.', level: 'C1', category: 'Academic' },
  { word: 'venerable', translation: 'хүндлэгдсэн', pos: 'adj', example: 'He was a venerable professor.', level: 'C1', category: 'Academic' },
  { word: 'wary', translation: 'болгоомжтой', pos: 'adj', example: 'Be wary of strangers offering gifts.', level: 'C1', category: 'Academic' },
  { word: 'zealous', translation: 'улайрсан', pos: 'adj', example: 'He is a zealous supporter of the cause.', level: 'C1', category: 'Academic' },

  // C2 Academic Selection
  { word: 'abstruse', translation: 'ойлгомжгүй', pos: 'adj', example: 'The professor\'s lecture was abstruse.', level: 'C2', category: 'Academic' },
  { word: 'cogent', translation: 'үнэмшилтэй', pos: 'adj', example: 'She presented a cogent argument.', level: 'C2', category: 'Academic' },
  { word: 'egregious', translation: 'онцгүй', pos: 'adj', example: 'It was an egregious error in judgment.', level: 'C2', category: 'Academic' },
  { word: 'inexorable', translation: 'зогсолтгүй', pos: 'adj', example: 'The inexorable rise of the sea level.', level: 'C2', category: 'Academic' },
  { word: 'obfuscate', translation: 'будлиантуулах', pos: 'verb', example: 'They tried to obfuscate the issue.', level: 'C2', category: 'Academic' },
  { word: 'anachronism', translation: 'цаг үедээ тохирохгүй зүйл', pos: 'noun', example: 'His views on women are an anachronism.', level: 'C2', category: 'Academic' },
  { word: 'burgeon', translation: 'хурдацтай өсөх', pos: 'verb', example: 'The market for organic food is burgeoning.', level: 'C2', category: 'Academic' },
  { word: 'cacophony', translation: 'бөөн шуугиан', pos: 'noun', example: 'A cacophony of horns filled the air.', level: 'C2', category: 'Academic' },
  { word: 'didactic', translation: 'сургамж өгөх', pos: 'adj', example: 'The book had a didactic intent.', level: 'C2', category: 'Academic' },
  { word: 'enervate', translation: 'бие сулруулах', pos: 'verb', example: 'The hot weather enervated him.', level: 'C2', category: 'Academic' },
  { word: 'fecund', translation: 'үржил шимтэй', pos: 'adj', example: 'He has a fecund imagination.', level: 'C2', category: 'Academic' },
  { word: 'garrulous', translation: 'чалчаа', pos: 'adj', example: 'He was a garrulous old man.', level: 'C2', category: 'Academic' },
  { word: 'histrionic', translation: 'жүжиглэсэн', pos: 'adj', example: 'She made a histrionic outburst.', level: 'C2', category: 'Academic' },
  { word: 'incendiary', translation: 'гал өдөөсөн', pos: 'adj', example: 'The politician gave an incendiary speech.', level: 'C2', category: 'Academic' },
  { word: 'jejune', translation: 'сонирхолгүй', pos: 'adj', example: 'The lecture was jejune and bored everyone.', level: 'C2', category: 'Academic' },
  { word: 'knell', translation: 'оршуулгын хонх', pos: 'noun', example: 'The news sounded the death knell for the project.', level: 'C2', category: 'Academic' },
  { word: 'limpid', translation: 'тунгалаг', pos: 'adj', example: 'The water was limpid and clear.', level: 'C2', category: 'Academic' },
  { word: 'malediction', translation: 'хараал', pos: 'noun', example: 'The witch uttered a malediction.', level: 'C2', category: 'Academic' },
  { word: 'nascent', translation: 'дөнгөж үүсэж буй', pos: 'adj', example: 'The nascent democracy was fragile.', level: 'C2', category: 'Academic' },
  { word: 'obsequious', translation: 'тал засагч', pos: 'adj', example: 'The assistants were obsequious.', level: 'C2', category: 'Academic' },
  { word: 'panacea', translation: 'бүхнийг анагаагч', pos: 'noun', example: 'There is no panacea for the world\'s problems.', level: 'C2', category: 'Academic' },
  { word: 'quixotic', translation: 'бодит бус', pos: 'adj', example: 'It was a quixotic quest.', level: 'C2', category: 'Academic' },
  { word: 'recalcitrant', translation: 'зөрүүд', pos: 'adj', example: 'A class of recalcitrant teenagers.', level: 'C2', category: 'Academic' },
  { word: 'sanguine', translation: 'найдвар дүүрэн', pos: 'adj', example: 'He is sanguine about the futuro.', level: 'C2', category: 'Academic' },
  { word: 'turgid', translation: 'хавдсан/нүсэр', pos: 'adj', example: 'The turgid river overflowed.', level: 'C2', category: 'Academic' },
];

export default function Flashcards() {
  const { profile } = useAuth();
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1');
  
  useEffect(() => {
    if (profile?.level) {
      setLevel(profile.level as any);
    }
  }, [profile]);

  const [category, setCategory] = useState<string>('Nouns');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Set default category based on level
  useEffect(() => {
    if (['B1', 'B2', 'C1', 'C2'].includes(level)) {
      setCategory('Academic');
    } else {
      setCategory('Nouns');
    }
  }, [level]);

  const filteredVocab = useMemo(() => {
    return vocabulary.filter(v => v.level === level && v.category === category);
  }, [level, category]);

  const currentCard = filteredVocab[currentIndex];

  const handleLevelChange = (newLevel: 'A1' | 'A2') => {
    setLevel(newLevel);
    setCategory('Nouns');
    resetSession();
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    resetSession();
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setUnknownCount(0);
    setIsComplete(false);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleMark = (known: boolean) => {
    if (known) setKnownCount(prev => prev + 1);
    else setUnknownCount(prev => prev + 1);

    if (currentIndex < filteredVocab.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  };

  const categories = level === 'A1' 
    ? ['Nouns', 'Verbs', 'Adjectives', 'Time']
    : ['Nouns', 'Verbs', 'Adjectives', 'Adverbs'];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4 italic font-serif">Vocabulary Builder</h1>
          <p className="text-slate-500 font-medium">Master essential words with interactive flashcards.</p>
        </div>

        {/* Level & Category Filters */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => (
                <button 
                  key={lvl}
                  onClick={() => handleLevelChange(lvl as any)}
                  className={`flex-1 md:px-6 py-2.5 rounded-xl text-[10px] font-black transition-all shrink-0 ${level === lvl ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto justify-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all shrink-0 ${category === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
              {['B1', 'B2', 'C1', 'C2'].includes(level) && category !== 'Academic' && (
                <button
                  onClick={() => handleCategoryChange('Academic')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all shrink-0 ${category === 'Academic' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  Academic
                </button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={`${level}-${category}-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-lg perspective-1000 mb-8 h-96">
                <motion.div
                  className="relative w-full h-full text-center transition-all duration-700 preserve-3d cursor-pointer"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  onClick={handleFlip}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-[48px] shadow-2xl border border-slate-100 flex flex-col items-center justify-center p-12 group overflow-hidden">
                    <div className="absolute top-8 left-8">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{currentCard?.pos}</span>
                    </div>
                    <button 
                      onClick={(e) => handleSpeak(e, currentCard?.word)}
                      className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      <Volume2 size={24} />
                    </button>
                    <h2 className="text-5xl font-black italic font-serif text-slate-900 group-hover:scale-110 transition-transform duration-500 tracking-tight">
                      {currentCard?.word}
                    </h2>
                    <p className="mt-6 text-slate-400 font-bold text-xs uppercase tracking-[0.3em] opacity-40">Click to reveal translation</p>
                    
                    {/* Decorative element */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-50"></div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-indigo-600 rounded-[48px] shadow-2xl text-white flex flex-col items-center justify-center p-12 rotate-y-180 overflow-hidden">
                    <div className="absolute top-8 left-8">
                       <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Translation</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight mb-6">
                      {currentCard?.translation}
                    </h2>
                    <div className="max-w-sm text-center">
                       <p className="text-indigo-100 text-sm font-medium italic leading-relaxed">
                         "{currentCard?.example}"
                       </p>
                    </div>

                    <div className="absolute bottom-8 right-8">
                      <button 
                        onClick={(e) => handleSpeak(e, currentCard?.example)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                      >
                        <Volume2 size={24} />
                      </button>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  </div>
                </motion.div>
              </div>

              {/* Progress & Controls */}
              <div className="w-full max-w-lg mb-8">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress: {currentIndex + 1} / {filteredVocab.length}</span>
                    <div className="flex gap-4">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">✓ {knownCount}</span>
                       <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">✗ {unknownCount}</span>
                    </div>
                 </div>
                 <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${((currentIndex + 1) / filteredVocab.length) * 100}%` }}
                     className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                   />
                 </div>
              </div>

              <div className="flex gap-6">
                <button 
                  onClick={() => handleMark(false)}
                  className="w-16 h-16 bg-white border border-slate-200 text-red-500 rounded-3xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all shadow-xl shadow-red-50"
                  title="Don't know it"
                >
                  <X size={32} />
                </button>
                <button 
                  onClick={() => handleMark(true)}
                  className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all shadow-2xl shadow-indigo-200"
                  title="Know it"
                >
                  <Check size={40} />
                </button>
                <button 
                  onClick={() => resetSession()}
                  className="w-16 h-16 bg-white border border-slate-200 text-slate-400 rounded-3xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-xl shadow-slate-50"
                  title="Reset"
                >
                   <RotateCcw size={28} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[48px] p-12 text-center border border-slate-200 shadow-2xl overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mx-auto mb-8 shadow-xl shadow-amber-50 animate-bounce">
                  <Award size={48} />
                </div>
                <h2 className="text-4xl font-extrabold italic font-serif mb-4 text-slate-900 tracking-tight">Round Complete!</h2>
                <p className="text-slate-500 font-medium mb-10">Amazing work. You're building a strong vocabulary.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-12 max-w-sm mx-auto">
                   <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
                      <div className="text-3xl font-black text-emerald-600 italic">{knownCount}</div>
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1">Mastered</div>
                   </div>
                   <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm">
                      <div className="text-3xl font-black text-red-600 italic">{unknownCount}</div>
                      <div className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mt-1">To Review</div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={resetSession}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => handleLevelChange(level === 'A1' ? 'A2' : 'A1')}
                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl"
                  >
                    Switch Level
                  </button>
                </div>
              </div>

              {/* Background design elements */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
