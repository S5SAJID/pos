type Quote = {
  quote: string
  author: {
    name: string
    resource: string
  }
  urdu: string
  theme: string
  source_instagram_handle: string
  roman_urdu?: string
  arabic?: string
}
const QUOTES: Quote[] = [
  {
    quote: 'The beauty you see in me is a reflection of you.',
    author: {
      name: 'Rumi',
      resource: 'IMG_7799.PNG',
    },
    urdu: 'مجھ میں جو جمال تم کو نظر آتا ہے، وہ درحقیقت تمہارا ہی عکسِ جمیل ہے۔',
    theme: 'Self-Reflection & Beauty',
    source_instagram_handle: 'unknown',
  },
  {
    quote: "Whoever is loved is beautiful, but this doesn't mean that whoever is beautiful is loved.",
    author: {
      name: 'Rumi',
      resource: 'IMG_7807.PNG',
    },
    urdu: 'جس سے محبت کی جائے وہ خوبصورت ہو جاتا ہے، لیکن یہ لازم نہیں کہ جو خوبصورت ہو اسے محبت بھی نصیب ہو۔',
    theme: 'Love & Beauty',
    source_instagram_handle: 'unknown',
  },
  {
    quote: "Be like the night to cover other's faults.",
    author: {
      name: 'Rumi',
      resource: 'IMG_7936.PNG',
    },
    urdu: 'دوسروں کے عیب چھپانے کے لیے رات کی طرح (تاریک اور پردہ پوش) بن جاؤ۔',
    theme: 'Compassion & Privacy',
    source_instagram_handle: 'unknown',
  },
  {
    quote: 'If you want to destroy any nation without war, make adultery or nudity common in the young generation.',
    author: {
      name: 'Salahuddin Ayyubi',
      resource: 'IMG_8142.jpeg',
    },
    urdu: 'اگر تم کسی قوم کو بغیر جنگ کے تباہ کرنا چاہتے ہو، تو ان کی نوجوان نسل میں بے حیائی اور عریانی کو عام کر دو۔',
    theme: 'Social Integrity & Morality',
    source_instagram_handle: 'unknown',
  },
  {
    quote: 'The greatest distance between two people is misunderstanding.',
    author: {
      name: 'Allama Iqbal',
      resource: 'IMG_8510.PNG',
    },
    urdu: 'زمانہ ہو گیا اقبال! ہم اک ساتھ رہتے ہیں؛ تعجب ہے سمجھ پائے نہ تم ہم کو، نہ ہم تم کو۔',
    theme: 'Relationship & Understanding',
    source_instagram_handle: 'unknown',
  },
  {
    quote: 'If you love, love their darkness too. Not just their light.',
    author: {
      name: 'Unknown',
      resource: 'IMG_8686.PNG',
    },
    urdu: 'اگر محبت کرتے ہو، تو ان کی تاریکیوں سے بھی پیار کرو، صرف ان کے اجالوں سے نہیں۔',
    theme: 'Unconditional Love',
    source_instagram_handle: 'unknown',
  },
  {
    quote: 'A fool prays for an easier road, a wise man prays for stronger legs.',
    author: {
      name: 'Chinese Proverb',
      resource: 'IMG_9481.PNG',
    },
    urdu: 'نادان انسان آسان راستے کی دعا کرتا ہے، جبکہ دانا شخص مضبوط قدموں اور بلند حوصلے کی التجا کرتا ہے۔',
    theme: 'Resilience & Wisdom',
    source_instagram_handle: 'unknown',
  },
  {
    quote: 'I hate those who steal my solitude without offering me true company in return.',
    author: {
      name: 'Friedrich Nietzsche',
      resource: 'IMG_9615.PNG',
    },
    urdu: 'مجھے ان لوگوں سے سخت نفرت ہے جو مجھ سے میری تنہائی تو چھین لیتے ہیں، مگر بدلے میں سچی رفاقت پیش نہیں کرتے۔',
    theme: 'Solitude & Authenticity',
    source_instagram_handle: 'unknown',
  },
  {
    quote: 'To be trusted is a greater compliment than being loved.',
    author: {
      name: 'Leo Tolstoy',
      resource: 'IMG_9680.PNG',
    },
    urdu: 'قابلِ اعتبار و بھروسہ ہونا، محبت کیے جانے سے کہیں زیادہ بڑا اعزاز ہے۔',
    theme: 'Trust & Honor',
    source_instagram_handle: 'unknown',
  },
  {
    quote: 'To understand the core of a conversation, having a connection with your inner self is very essential.',
    author: {
      name: 'Sufi Wisdom',
      resource: './@afxaana - R⤓Download.jpeg',
    },
    urdu: 'بات کے اندر کی بات کو سمجھنے کے لیے، ذات کے اندر کی ذات سے رابطہ ہونا بہت ضروری ہے۔',
    roman_urdu: 'Baat keh andar ki baat ko samajhne keh lie, Zaat ki andar ki zaat se rabta hona zrori ha.',
    theme: 'Self-Knowledge & Insight',
    source_instagram_handle: 'afxaana',
  },
  {
    quote: 'In the right eyes, you will be art.',
    author: {
      name: 'Unknown',
      resource: './@mirsphere - R⤓Download-8.jpeg',
    },
    urdu: 'جو دیکھنا جانتی ہوں، ان نظروں میں تم ایک شاہکارِ فن (آرٹ) بن جاؤ گے۔',
    theme: 'Perception & Love',
    source_instagram_handle: 'mirsphere',
  },
  {
    quote: 'The one who throws the stone forgets; the one who is hit remembers forever.',
    author: {
      name: 'Angolan Proverb',
      resource: './@wise.arian - R⤓Download-21.jpeg',
    },
    urdu: 'پتھر پھینکنے والا تو بھول جاتا ہے، لیکن جسے وہ پتھر لگتا ہے، اسے وہ زخم زندگی بھر یاد رہتا ہے۔',
    theme: 'Harm & Memory',
    source_instagram_handle: 'wise.arian',
  },
  {
    quote: 'The tears of strangers are only water.',
    author: {
      name: 'Russian Proverb',
      resource: './@wise.arian - R⤓Download-22.jpeg',
    },
    urdu: 'اجنبیوں کی آنکھوں سے بہنے والے آنسو (بے حس نظروں کے لیے) محض پانی کے سوا کچھ نہیں۔',
    theme: 'Empathy & Estrangement',
    source_instagram_handle: 'wise.arian',
  },
  {
    quote: 'When the axe came into the forest, the trees whispered, The handle is one of us.',
    author: {
      name: 'Turkish Proverb',
      resource: './@wise.arian - R⤓Download-23.jpeg',
    },
    urdu: "جب کلہاڑی جنگل میں داخل ہوئی، تو درختوں نے آپس میں سرگوشی کی: 'اس کا دستہ تو ہم ہی میں سے ایک ہے۔'",
    theme: 'Betrayal & Unity',
    source_instagram_handle: 'wise.arian',
  },
  {
    quote: "Visit me once each year, for it's wrong to abandon people forever.",
    author: {
      name: 'Naguib Mahfouz',
      resource: './@poetryandgahwa - R⤓Download-15.jpeg',
    },
    urdu: 'برس میں کم از کم ایک بار مجھ سے ملنے آیا کرو، کیونکہ لوگوں کو ہمیشہ کے لیے ترک کر دینا سراسر زیادتی ہے۔',
    theme: 'Connection & Remembrance',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Home is not where you were born. Home is where all your attempts to escape cease.',
    author: {
      name: 'Naguib Mahfouz',
      resource: './@poetryandgahwa - R⤓Download-16.jpeg',
    },
    urdu: 'وطن (گھر) وہ جگہ نہیں جہاں تم پیدا ہوئے ہو، بلکہ وہ گوشہ ہے جہاں تمہاری فرار کی تمام کوششیں تھم جاتی ہیں۔',
    theme: 'Belonging & Peace',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Fear does not prevent death. It prevents life.',
    author: {
      name: 'Naguib Mahfouz',
      resource: './@poetryandgahwa - R⤓Download-18.jpeg',
    },
    urdu: 'خوف موت کو نہیں روکتا، بلکہ وہ زندگی کو جینے سے روک دیتا ہے۔',
    theme: 'Courage & Life',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Inside every person you know, there’s a person you don’t know.',
    author: {
      name: 'Mustafa Sadiq Al-Rafei',
      resource: './@poetryandgahwa - R⤓Download-19.jpeg',
    },
    arabic: 'داخل كل شخص تعرفه ، هناك شخص لا تعرفه',
    urdu: 'ہر اس شخص کے اندر جسے تم جانتے ہو، ایک ایسا انسان بھی پوشیدہ ہے جسے تم بالکل نہیں جانتے۔',
    theme: 'Human Nature & Mystery',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Science and art leave societies in which they are not respected.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-20.jpeg',
    },
    urdu: 'علم اور فن ان معاشروں کو خیرباد کہہ دیتے ہیں جہاں ان کی قدر و منزلت نہیں ہوتی۔',
    theme: 'Knowledge, Art & Society',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'He who knows not, and knows not that he knows not, is a fool; avoid him.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-21.jpeg',
    },
    urdu: 'جو شخص نادان ہو اور اپنی نادانی سے بھی بے خبر ہو، وہ جاہلِ مطلق ہے؛ اس سے کنارہ کشی اختیار کرو۔',
    theme: 'Ignorance & Wisdom',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'The true measure of a man is how he treats someone who can do him absolutely no good.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-22.jpeg',
    },
    urdu: 'کسی انسان کے کردار کا اصل پیمانہ یہ ہے کہ وہ اس شخص سے کیسا برتاؤ کرتا ہے جو اسے ذرہ برابر بھی فائدہ نہیں پہنچا سکتا۔',
    theme: 'Character & Altruism',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote:
      'There are no incurable diseases - only the lack of will. There are no worthless herbs - only the lack of knowledge.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-24.jpeg',
    },
    urdu: 'کوئی بیماری لا علاج نہیں ہوتی سوائے قوتِ ارادی کے فقدان کے؛ اور کوئی جڑی بوٹی بے کار نہیں ہوتی سوائے علم کی کمی کے۔',
    theme: 'Willpower & Knowledge',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'The cure for ignorance is education.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-25.jpeg',
    },
    urdu: 'جہالت کا واحد شافی علاج تعلیم و تربیت ہے۔',
    theme: 'Education & Progress',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'The only lasting beauty is the beauty of the heart.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-26.jpeg',
    },
    urdu: 'صرف وہی حسن دائمی ہے جو دل کی پاکیزگی اور روحانیت سے عبارت ہو۔',
    theme: 'Inner Beauty',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'A mind that is stretched by a new experience can never go back to its old dimensions.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-27.jpeg',
    },
    urdu: 'جو ذہن کسی نئے تجربے یا سچے ادراک سے وسعت پا جائے، وہ کبھی اپنے پرانے تنگ زاویوں میں واپس نہیں جا سکتا۔',
    theme: 'Experience & Growth',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Ignorance leads to fear, fear leads to hate, and hate leads to violence.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-28.jpeg',
    },
    urdu: 'جہالت خوف کو جنم دیتی ہے، خوف نفرت کی راہ ہموار کرتا ہے، اور نفرت بالآخر تشدد پر منتج ہوتی ہے۔',
    theme: 'Cause & Effect of Violence',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'The only true wisdom is in knowing you know nothing.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-29.jpeg',
    },
    urdu: 'حقیقی دانائی صرف اس بات کے پختہ اعتراف میں ہے کہ تم کچھ نہیں جانتے۔',
    theme: 'Humility & Wisdom',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'He who speaks well does not hear bad words from anyone.',
    author: {
      name: 'Ibn Sina',
      resource: './@poetryandgahwa - R⤓Download-30.jpeg',
    },
    urdu: 'جو شیریں کلام ہو اور بھلی بات کہے، وہ کبھی کسی سے نازیبا کلمات نہیں سنتا۔',
    theme: 'Speech & Harmony',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'What you speak becomes the house you live in.',
    author: {
      name: 'Hafez',
      resource: './@poetryandgahwa - R⤓Download-32.jpeg',
    },
    urdu: 'تم جو گفتگو کرتے ہو، وہی وہ آشیاں بن جاتی ہے جس میں تم مسکن اختیار کرتے ہو۔',
    theme: 'Power of Words',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'All roads lead to you, even those I took to forget you.',
    author: {
      name: 'Mahmoud Darwish',
      resource: './@poetryandgahwa - R⤓Download-38.jpeg',
    },
    urdu: 'تمام راستے تیری ہی طرف لے جاتے ہیں، یہاں تک کہ وہ راہیں بھی جو میں نے تجھے بھلانے کے لیے چنی تھیں۔',
    theme: 'Inevitable Love',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'On the train we swapped seats, you wanted the window and I wanted to look at you.',
    author: {
      name: 'Mahmoud Darwish',
      resource: './@poetryandgahwa - R⤓Download-39.jpeg',
    },
    urdu: 'ٹرین میں ہم نے اپنی نشستیں بدل لیں؛ تم کھڑکی سے باہر کا نظارہ دیکھنا چاہتے تھے، اور میں صرف تمہارا نظارہ کرنا چاہتا تھا۔',
    theme: 'Romantic Devotion',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: "You won't find the same person twice, not even in the same person.",
    author: {
      name: 'Mahmoud Darwish',
      resource: './@poetryandgahwa - R⤓Download-40.jpeg',
    },
    urdu: 'تمہیں ایک ہی شخص دوبارہ کبھی نہیں مل سکے گا، یہاں تک کہ اس شخص کے اپنے اندر بھی نہیں۔',
    theme: 'Human Change & Time',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Do not be absent for too long, then come and ask about how I am, details die with time and stories change.',
    author: {
      name: 'Mahmoud Darwish',
      resource: './@poetryandgahwa - R⤓Download-41.jpeg',
    },
    urdu: 'مجھ سے اتنی دیر بھی غافل نہ رہا کرو کہ پھر لوٹ کر میرا حال پوچھو؛ وقت گزرنے کے ساتھ تفصیلات دم توڑ دیتی ہیں اور کہانیاں بدل جاتی ہیں۔',
    theme: 'Time & Distance',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Maybe the moon is beautiful only because it is far.',
    author: {
      name: 'Mahmoud Darwish',
      resource: './@poetryandgahwa - R⤓Download-42.jpeg',
    },
    urdu: 'شاید چاند صرف اس لیے اس قدر حسین نظر آتا ہے کیونکہ وہ ہماری پہنچ سے بہت دور ہے۔',
    theme: 'Distance & Perception',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'He who aspires to greatness must endure sleepless nights.',
    author: {
      name: 'Arabic Proverb',
      resource: './@poetryandgahwa - R⤓Download-43.jpeg',
    },
    arabic: 'مَنْ طَلَبَ العُلَا سَهِرَ اللَّيَالِي',
    urdu: 'جسے بلندیوں اور عظمت کی تمنا ہو، اسے شب بیداریوں (سخت محنت) کی صعوبت اٹھانی ہی پڑتی ہے۔',
    theme: 'Ambition & Exertion',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'One cannot acquire knowledge without exertion.',
    author: {
      name: 'Arabic Proverb',
      resource: './@poetryandgahwa - R⤓Download-44.jpeg',
    },
    arabic: 'لَا يُنَالُ العِلْمُ بِرَاحَةِ الجِسْمِ',
    urdu: 'تن آسانی اور آرام طلبی سے علم کی دولت کبھی حاصل نہیں ہو سکتی۔',
    theme: 'Exertion & Knowledge',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Knowledge illuminates, while ignorance casts shadows.',
    author: {
      name: 'Arabic Proverb',
      resource: './@poetryandgahwa - R⤓Download-45.jpeg',
    },
    arabic: 'العِلْمُ نُورٌ وَالجَهْلُ ظَلَامٌ',
    urdu: 'علم سراسر روشنی (نور) ہے، جبکہ جہالت تاریکی (ظلمت) کا گہرا سایہ ہے۔',
    theme: 'Light & Darkness',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Not everything you know is worth saying.',
    author: {
      name: 'Arabic Proverb',
      resource: './@poetryandgahwa - R⤓Download-46.jpeg',
    },
    arabic: 'مَا كُلُّ مَا يُعْلَمُ يُقَالُ',
    urdu: 'ہر وہ سچائی یا بات جو تم جانتے ہو، زباں پر لانے کے لائق نہیں ہوتی۔',
    theme: 'Discretion & Speech',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'I’d rather you teach me how to fish than give me a fish every day.',
    author: {
      name: 'Arabic Proverb',
      resource: './@poetryandgahwa - R⤓Download-47.jpeg',
    },
    arabic: 'عَلِّمْنِي كَيْفَ أَصْطَادُ وَلَا تُعْطِنِي سَمَكَةً كُلَّ يَوْمٍ',
    urdu: 'مجھے روزانہ ایک مچھلی دان کرنے کے بجائے، کاش تم مجھے مچھلی پکڑنے کا ہنر سکھا دو۔',
    theme: 'Self-Reliance & Skill',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'With a mature mind comes less talk.',
    author: {
      name: 'Arabic Proverb',
      resource: './@poetryandgahwa - R⤓Download-48.jpeg',
    },
    arabic: 'إِذَا تَمَّ العَقْلُ نَقَصَ الكَلَامُ',
    urdu: 'جب انسان کی عقل کامل اور پختہ ہو جاتی ہے، تو کلام میں اختصار (کم گوئی) آ جاتی ہے۔',
    theme: 'Maturity & Silence',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Take wisdom from the mouth of the simple.',
    author: {
      name: 'Arabic Proverb',
      resource: './@poetryandgahwa - R⤓Download-49.jpeg',
    },
    arabic: 'خُذِ الحِكْمَةَ مِنْ أَفْوَاهِ البُسَطَاءِ',
    urdu: 'دانائی کی باتیں سادہ مزاج اور مخلص لوگوں کے کلام سے بھی حاصل کر لیا کرو۔',
    theme: 'Wisdom & Simplicity',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'He who learns a people’s language will be safe from their deceit.',
    author: {
      name: 'Arabic Proverb',
      resource: './@poetryandgahwa - R⤓Download-50.jpeg',
    },
    arabic: 'مَنْ تَعَلَّمَ لُغَةَ قَوْمٍ أَمِنَ مَكْرَهُمْ',
    urdu: 'جس نے کسی قوم کی زبان سیکھ لی، وہ ان کی چالوں اور فریب سے محفوظ ہو گیا۔',
    theme: 'Language & Defense',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Two appetites are never satisfied: the pursuit of knowledge and the pursuit of wealth.',
    author: {
      name: 'Arabic Proverb',
      resource: './@poetryandgahwa - R⤓Download-51.jpeg',
    },
    arabic: 'اثْنَانِ لَا يَشْبَعَانِ : طَالِبُ عِلْمٍ وَطَالِبُ مَالٍ',
    urdu: 'دو پیاس کبھی نہیں بجھتیں: علم کا متلاشی اور دولت کا حریص۔',
    theme: 'Desire & Knowledge',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Patience is bitter, but its fruit is sweet.',
    author: {
      name: 'Al-Ghazali',
      resource: './@poetryandgahwa - R⤓Download-54.jpeg',
    },
    urdu: 'صبر کا گھونٹ پینا نہایت کڑوا اور تلخ ہے، مگر اس کا ثمر بے حد شیریں اور لذیذ ہوتا ہے۔',
    theme: 'Patience & Reward',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'To get what you love, you must first be patient with what you hate.',
    author: {
      name: 'Al-Ghazali',
      resource: './@poetryandgahwa - R⤓Download-55.jpeg',
    },
    urdu: 'اپنی محبوب و پسندیدہ شے کو پانے کے لیے، تمہیں پہلے ان آزمائشوں پر صبر کرنا ہوگا جنہیں تم سخت ناپسند کرتے ہو۔',
    theme: 'Patience & Sacrifice',
    source_instagram_handle: 'poetryandgahwa',
  },
  {
    quote: 'Desires make slaves out of kings and patience makes kings out of slaves.',
    author: {
      name: 'Al-Ghazali',
      resource: './@poetryandgahwa - R⤓Download-56.jpeg',
    },
    urdu: 'خواہشات کی غلامی بادشاہوں کو بھی غلام بنا دیتی ہے، جبکہ صبر و ضبط غلاموں کو بادشاہی عطا کرتا ہے۔',
    theme: 'Patience, Desire & Sovereignty',
    source_instagram_handle: 'poetryandgahwa',
  },
]

export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * QUOTES.length)
  return QUOTES[randomIndex]
}
