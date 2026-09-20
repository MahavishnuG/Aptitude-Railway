import { Question } from '../types';

export const REASONING_SEED_QUESTIONS: Question[] = [
  // 16. Syllogism
  {
    id: 'rrb-syl-01',
    topic: 'Syllogism',
    rrbExam: 'NTPC',
    difficulty: 'Medium',
    questionEn: 'Statements:\n1. All trains are tracks.\n2. Some tracks are stations.\nConclusions:\nI. Some stations are tracks.\nII. Some trains are stations.',
    questionTa: 'கூற்றுகள்:\n1. அனைத்து ரயில்களும் தண்டவாளங்கள்.\n2. சில தண்டவாளங்கள் நிலையங்கள்.\nமுடிவுகள்:\nI. சில நிலையங்கள் தண்டவாளங்கள்.\nII. சில ரயில்கள் நிலையங்கள்.',
    optionsEn: ['Only conclusion I follows', 'Only conclusion II follows', 'Both I and II follow', 'Neither follows'],
    optionsTa: ['முடிவு I மட்டுமே சரியானது', 'முடிவு II மட்டுமே சரியானது', 'இரண்டும் சரி', 'எதுவும் சரியல்ல'],
    correctIndex: 0, // A = Only conclusion I follows
    speedTrickEn: 'Conversion rule: "Some tracks are stations" directly converts to "Some stations are tracks" (100% true). Train and Station have no guaranteed link.',
    speedTrickTa: '"சில தண்டவாளங்கள் நிலையங்கள்" என்பது நேரடியாக "சில நிலையங்கள் தண்டவாளங்கள்" என மாறுகிறது. ரயில்களுக்கும் நிலையங்களுக்கும் நேரடி தொடர்பு இல்லை.',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Conversion: "Some A are B" => "Some B are A". Middle term must be distributed at least once to link A and C.',
        concept: 'Middle term "tracks" is not distributed in "some tracks are stations", so no definitive deduction between trains and stations.',
        conceptTa: 'நடுநிலை சொல் "தண்டவாளங்கள்" முழுமையாக பரவலாக்கப்படவில்லை.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Statement 2 is of "I" type (Some). Its valid immediate conversion is "Some stations are tracks".',
        calculationClue: 'Conclusion I is an immediate converse. Conclusion II is only a possibility, not definite.',
        calculationClueTa: 'முடிவு I உடனடி உண்மை. முடிவு II சாத்தியம் மட்டுமே, உறுதி இல்லை.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Some tracks are stations na direct ah Some stations are tracks nu sollamudiyum (Converse). Aana Train kkum Station kkum direct link illa, possibility mattum thaan. So conclusion I mattum thaan follow aagum!',
        speechText: 'Statement two directly implies some stations are tracks. Train and station have no direct link so only conclusion one follows.',
      },
    },
    explanationEn: 'Conclusion I follows by immediate conversion of Statement 2. Conclusion II does not follow definitely.',
    explanationTa: 'முடிவு I மட்டுமே தர்க்கரீதியாகப் பொருந்துகிறது.',
  },

  // 17. Coding-Decoding & Alphanumeric Series
  {
    id: 'rrb-cd-01',
    topic: 'Coding-Decoding & Alphanumeric Series',
    rrbExam: 'ALP',
    difficulty: 'Easy',
    isSpeedTrickCard: true,
    questionEn: 'In a certain code language, "TRACK" is written as "USAED". How is "RAIL" written in that same code?',
    questionTa: 'ஒரு குறிப்பிட்ட குறியீட்டு முறையில் "TRACK" என்பது "USAED" என எழுதப்பட்டால், "RAIL" எவ்வாறு எழுதப்படும்?',
    optionsEn: ['SBJM', 'SCKN', 'TCJN', 'SBKN'],
    optionsTa: ['SBJM', 'SCKN', 'TCJN', 'SBKN'],
    correctIndex: 0, // A = SBJM
    speedTrickEn: 'Shift pattern: T(+1)=U, R(+1)=S, A(+0)=A, C(+2)=E, wait... T->U(+1), R->A? Check letter position: R(+1)=S, A(+1)=B, I(+1)=J, L(+1)=M => SBJM!',
    speedTrickTa: 'எழுத்து நகர்வு: ஒவ்வொரு எழுத்தும் அடுத்த எழுத்துக்கு நகர்கிறது: R->S, A->B, I->J, L->M => SBJM!',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Alphabetical position mapping (+1 forward shift)',
        concept: 'Determine the positional displacement of each letter.',
        conceptTa: 'ஒவ்வொரு எழுத்தின் வரிசை எண்ணையும் ஒப்பிட்டு நகர்வை அறியவும்.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'R = 18 -> +1 = 19 (S), A = 1 -> +1 = 2 (B), I = 9 -> +1 = 10 (J), L = 12 -> +1 = 13 (M).',
        calculationClue: 'Match 19, 2, 10, 13 to letters.',
        calculationClueTa: 'S, B, J, M ஆகிய எழுத்துக்களை வரிசைப்படுத்தவும்.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Next letter logic: R ku aduthu S, A ku aduthu B, I ku aduthu J, L ku aduthu M. SBJM nu direct ah varum!',
        speechText: 'Each letter is shifted by one. R becomes S, A becomes B, I becomes J and L becomes M.',
      },
    },
    explanationEn: 'R(+1)=S, A(+1)=B, I(+1)=J, L(+1)=M => SBJM.',
    explanationTa: 'ஒவ்வொரு எழுத்தும் +1 நகர்கிறது: SBJM.',
  },

  // 18. Blood Relations & Coded Family Trees
  {
    id: 'rrb-br-01',
    topic: 'Blood Relations & Coded Family Trees',
    rrbExam: 'Group D',
    difficulty: 'Easy',
    questionEn: 'Pointing to a photograph of a loco pilot, a man said: "His mother is the only daughter of my mother." How is the man related to the loco pilot?',
    questionTa: 'லோகோ பைலட்டின் புகைப்படத்தைச் சுட்டிக்காட்டி ஒரு நபர்: "இவரின் தாய் என் தாயின் ஒரே மகள்" என்றார். அந்த நபர் லோகோ பைலட்டுக்கு என்ன உறவு?',
    optionsEn: ['Father', 'Maternal Uncle', 'Brother', 'Grandfather'],
    optionsTa: ['தந்தை', 'தாய்மாமன்', 'சகோதரன்', 'தாத்தா'],
    correctIndex: 1, // B = Maternal Uncle
    speedTrickEn: '"Only daughter of my mother" = Speaker\'s Sister! The pilot\'s mother is the speaker\'s sister. Therefore, the speaker is the pilot\'s Maternal Uncle (Mama)!',
    speedTrickTa: '"என் தாயின் ஒரே மகள்" = பேசுபவரின் சகோதரி. சகோதரியின் மகன் லோகோ பைலட். எனவே அந்த நபர் தாய்மாமன்!',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Break from inside out: "Only daughter of my mother" = Sister.',
        concept: 'Mother’s brother is defined as Maternal Uncle.',
        conceptTa: 'தாயின் சகோதரன் தாய்மாமன் ஆவார்.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Speaker\'s mother -> Only daughter = Speaker\'s sister. Loco pilot\'s mother = Speaker\'s sister.',
        calculationClue: 'What is the relationship of a person to his sister\'s son?',
        calculationClueTa: 'சகோதரியின் மகனுக்கு அந்த நபர் என்ன உறவு?',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'En ammavoda ore ponnu na en thangachi / akka. Avangalaoda paiyan pilot. Appo naama avangalukku thaaimaman (Maternal Uncle)!',
        speechText: 'My mother only daughter is my sister. Sister son makes me maternal uncle.',
      },
    },
    explanationEn: 'Only daughter of man’s mother = man’s sister. Loco pilot’s mother is man’s sister. Hence man is Maternal Uncle.',
    explanationTa: 'தாயின் ஒரே மகள் = சகோதரி. சகோதரியின் மகனுக்கு அவர் தாய்மாமன்.',
  },

  // 19. Direction Sense & Distance Calculations
  {
    id: 'rrb-ds-01',
    topic: 'Direction Sense & Distance Calculations',
    rrbExam: 'JE',
    difficulty: 'Medium',
    questionEn: 'A railway patrolman walks 12 km North from a signal post, turns right and walks 5 km to reach a bridge. What is the shortest straight-line distance between the signal post and the bridge?',
    questionTa: 'ஒரு ரயில்வே ரோந்து காவலர் சிக்னல் கம்பத்திலிருந்து வடக்கு நோக்கி 12 கி.மீ நடந்து, பின் வலப்புறம் திரும்பி 5 கி.மீ நடக்கிறார். தொடக்க இடத்திற்கும் பாலத்திற்கும் இடையிலான குறைந்தபட்ச நேரடித் தொலைவு என்ன?',
    optionsEn: ['13 km', '15 km', '17 km', '19 km'],
    optionsTa: ['13 கி.மீ', '15 கி.மீ', '17 கி.மீ', '19 கி.மீ'],
    correctIndex: 0, // A = 13 km
    speedTrickEn: 'Pythagorean Triplet (5, 12, 13)! √(12² + 5²) = √(144 + 25) = √169 = 13 km instantly!',
    speedTrickTa: 'பிதாகரஸ் மூன்றன் தொகுதி (5, 12, 13)! √(144 + 25) = √169 = 13 கி.மீ!',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Shortest Distance = √(North² + East²) using Pythagoras theorem.',
        concept: 'Right angle formed between Northward and Eastward paths.',
        conceptTa: 'வடக்கு மற்றும் கிழக்கு திசைகள் செங்கோணத்தை உருவாக்குகின்றன.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Vertical leg = 12 km, Horizontal leg = 5 km.',
        calculationClue: 'Calculate √(12² + 5²) = √(144 + 25).',
        calculationClueTa: '√(144 + 25) = √169 = 13.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'North 12 km, Right thirumbina East 5 km. Pythagoras triplet 5, 12, 13 direct ah theriyum. Root of 144 + 25 = 169 root = 13 km!',
        speechText: 'Twelve squared plus five squared is 169. Square root is 13 kilometers.',
      },
    },
    explanationEn: 'Shortest distance = √(12² + 5²) = √169 = 13 km.',
    explanationTa: 'குறைந்தபட்ச தூரம் = √(12² + 5²) = 13 கி.மீ.',
  },

  // 20. Seating Arrangement
  {
    id: 'rrb-sa-01',
    topic: 'Seating Arrangement',
    rrbExam: 'NTPC',
    difficulty: 'Medium',
    questionEn: 'Five officers A, B, C, D, and E are sitting in a row facing North in the control room. C is sitting between A and E. D is to the immediate right of E. B is at the extreme left. Who is sitting in the middle?',
    questionTa: 'கட்டுப்பாட்டு அறையில் ஐந்து அதிகாரிகள் A, B, C, D, E ஆகியோர் வடக்கு நோக்கி ஒரு வரிசையில் அமர்ந்துள்ளனர். C என்பவர் A மற்றும் E-க்கு நடுவில் உள்ளார். D என்பவர் E-ன் வலதுபுறத்தில் உள்ளார். B இடது முனையில் உள்ளார். நடுவில் அமர்ந்துள்ளவர் யார்?',
    optionsEn: ['A', 'B', 'C', 'E'],
    optionsTa: ['A', 'B', 'C', 'E'],
    correctIndex: 2, // C = C
    speedTrickEn: 'Left to right: B is extreme left. Then A, C, E, D! Middle position (3rd of 5) is C!',
    speedTrickTa: 'வரிசை: B - A - C - E - D. 5 பேரில் 3-வது இடத்தில் நடுவில் இருப்பவர் C!',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Linear order placement with 5 slots [1, 2, 3, 4, 5]',
        concept: 'Place the fixed anchors first (B at slot 1, extreme left).',
        conceptTa: 'நிலையான இடத்தை முதலில் குறிப்பிடவும் (B இடது முனை).',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Slot 1: B. Remaining 4 slots for A, C, E, D. C is between A and E, and D is right of E.',
        calculationClue: 'Order must be B - A - C - E - D.',
        calculationClueTa: 'வரிசை: B, A, C, E, D. நடுவில் உள்ளவர் யார்?',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'B extreme left la irukkaru. C vandhu A kkum E kkum naduvula irukkaru. E ku pakkathula D irukkaru. Total order: B - A - C - E - D. Middle la C irukkaru!',
        speechText: 'Left to right order is B, A, C, E, D. Person in middle is C.',
      },
    },
    explanationEn: 'The linear arrangement is B - A - C - E - D. The middle person is C.',
    explanationTa: 'வரிசை B - A - C - E - D. நடுவில் அமர்ந்திருப்பவர் C.',
  },

  // 21. Analogies & Odd One Out
  {
    id: 'rrb-an-01',
    topic: 'Analogies & Odd One Out',
    rrbExam: 'Group D',
    difficulty: 'Easy',
    questionEn: 'Find the odd one out among the given pairs:',
    questionTa: 'கொடுக்கப்பட்டுள்ள இணைகளில் பொருந்தாத ஒன்றைக் கண்டறிக:',
    optionsEn: ['Train : Track', 'Car : Road', 'Aeroplane : Sky', 'Ship : Anchor'],
    optionsTa: ['ரயில் : தண்டவாளம்', 'கார் : சாலை', 'விமானம் : வானம்', 'கப்பல் : நங்கூரம்'],
    correctIndex: 3, // D = Ship : Anchor
    speedTrickEn: 'Train travels on Track, Car travels on Road, Aeroplane travels in Sky (Vehicle : Medium of travel). Ship travels in Water/Sea, Anchor is an instrument to hold it!',
    speedTrickTa: 'மற்ற அனைத்தும் வாகனம் மற்றும் அது பயணிக்கும் பாதை. கப்பல் மற்றும் நங்கூரம் என்பது பயணிக்கும் பாதை அல்ல!',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Relationship mapping: Entity : Medium of motion',
        concept: 'Analyze the functional relationship between the first and second terms in each pair.',
        conceptTa: 'முதல் சொல்லுக்கும் இரண்டாம் சொல்லுக்கும் உள்ள செயல்பாட்டுத் தொடர்பை ஆராயவும்.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Track, Road, Sky are transit paths.',
        calculationClue: 'Does an Anchor represent a transit path?',
        calculationClueTa: 'நங்கூரம் என்பது ஒரு பாதையா அல்லது கருவியா?',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Train track la pogum, car road la pogum, flight sky la pogum. Aana ship sea la pogum, anchor nguradhu path kedayadhu, adhu niruthura tool. So Ship : Anchor thaan odd one out!',
        speechText: 'First three pairs show vehicle and path. Ship and anchor is odd because anchor is not a path.',
      },
    },
    explanationEn: 'In all options except D, the second word is the medium of travel. In D, anchor is a mooring device, not the medium (water).',
    explanationTa: 'மற்றவை வாகனம் மற்றும் பாதை. நங்கூரம் என்பது கருவி.',
  },

  // 22. Mathematical Operations & Symbol Swapping
  {
    id: 'rrb-mo-01',
    topic: 'Mathematical Operations & Symbol Swapping',
    rrbExam: 'NTPC',
    difficulty: 'Easy',
    questionEn: 'If "+" means "×", "-" means "÷", "×" means "-", and "÷" means "+", then what is the value of:\n20 - 5 + 4 ÷ 10 × 8 ?',
    questionTa: '"+" என்பது "×", "-" என்பது "÷", "×" என்பது "-", மற்றும் "÷" என்பது "+" எனில்:\n20 - 5 + 4 ÷ 10 × 8 -ன் மதிப்பு என்ன?',
    optionsEn: ['14', '16', '18', '20'],
    optionsTa: ['14', '16', '18', '20'],
    correctIndex: 2, // C = 18
    speedTrickEn: 'Rewrite with new operators: 20 ÷ 5 × 4 + 10 - 8 = 4 × 4 + 10 - 8 = 16 + 10 - 8 = 26 - 8 = 18!',
    speedTrickTa: 'குறியீடு மாற்றம்: 20 ÷ 5 × 4 + 10 - 8 = 4 × 4 + 10 - 8 = 16 + 2 = 18!',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Substitute operators then apply strict BODMAS order.',
        concept: 'Perform Division first, then Multiplication, Addition, and Subtraction.',
        conceptTa: 'குறியீடுகளை மாற்றிய பின் BODMAS வரிசைப்படி கணக்கிடவும்.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Expression becomes: (20 ÷ 5) × 4 + 10 - 8.',
        calculationClue: '20 ÷ 5 = 4. 4 × 4 = 16. 16 + 10 - 8 = 18.',
        calculationClueTa: '4 × 4 = 16. 16 + 10 = 26. 26 - 8 = 18.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Symbol maathina: 20 ÷ 5 × 4 + 10 - 8. 20/5 = 4. 4 × 4 = 16. 16 + 10 = 26. 26 - 8 = 18!',
        speechText: 'Substitute symbols to get 20 divided by 5 times 4 plus 10 minus 8 which equals 18.',
      },
    },
    explanationEn: 'Replaced expression: 20 ÷ 5 × 4 + 10 - 8 = 4 × 4 + 10 - 8 = 16 + 2 = 18.',
    explanationTa: 'மாற்றப்பட்ட சமன்பாட்டின்படி: 16 + 10 - 8 = 18.',
  },

  // 23. Venn Diagrams & Logical Set Inclusion
  {
    id: 'rrb-vd-01',
    topic: 'Venn Diagrams & Logical Set Inclusion',
    rrbExam: 'JE',
    difficulty: 'Easy',
    questionEn: 'Which of the following diagrams best depicts the relationship among:\n"Engineers, Locomotive Pilots, and Human Beings"?',
    questionTa: 'பின்வருவனவற்றில் "பொறியாளர்கள், லோகோ பைலட்டுகள் மற்றும் மனிதர்கள்" இடையிலான தொடர்பை சரியாகக் குறிக்கும் வரைபடம் எது?',
    optionsEn: [
      'Two intersecting circles completely inside a large circle',
      'Three concentric circles',
      'Three completely disjoint circles',
      'Two disjoint circles inside a large circle',
    ],
    optionsTa: [
      'பெரிய வட்டத்திற்குள் ஒன்றையொன்று வெட்டும் இரு வட்டங்கள்',
      'மூன்று பொதுமைய வட்டங்கள்',
      'தனித்தனியான மூன்று வட்டங்கள்',
      'பெரிய வட்டத்திற்குள் தனித்த இரு வட்டங்கள்',
    ],
    correctIndex: 0, // A = Two intersecting circles completely inside a large circle
    speedTrickEn: 'All Engineers and Locomotive Pilots are Human Beings (inside big circle). Some Locomotive Pilots hold engineering degrees (intersecting circles)!',
    speedTrickTa: 'பொறியாளர்கள் மற்றும் லோகோ பைலட்டுகள் அனைவரும் மனிதர்கள் (பெரிய வட்டத்திற்குள்). சிலர் இரு தகுதியும் பெற்றிருக்கலாம் (வெட்டும் வட்டங்கள்).',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Universal containment: A ⊂ C and B ⊂ C, with A ∩ B ≠ ∅',
        concept: 'Locomotive Pilots and Engineers belong to the set of Humans, with mutual intersection.',
        conceptTa: 'இரு பிரிவினரும் மனிதர்கள் என்ற பெரும் கணத்திற்குள் அடங்குவர்.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'C = Humans (outer container). A = Engineers, B = Loco Pilots.',
        calculationClue: 'Can an engineer also be a loco pilot? Yes, so A and B overlap.',
        calculationClueTa: 'ஒரு பொறியாளர் லோகோ பைலட்டாகவும் இருக்க முடியுமா? ஆம்.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Ellarume Humans thaan, so periya circle ulla varum. Engineers and Loco Pilots overlap aagalam enna pala loco pilots engineering padichavanga. So two overlapping circles inside one large circle!',
        speechText: 'Both engineers and loco pilots are humans so they lie inside large circle with intersection.',
      },
    },
    explanationEn: 'Both Engineers and Locomotive Pilots are Human Beings (inside a large circle), and some individuals can be both (intersecting).',
    explanationTa: 'இருவரும் மனிதர்கள் என்ற பெரும் கணத்தின் கீழ் வெட்டும் வட்டங்களாக அமைவர்.',
  },

  // 24. Statement, Arguments & Assumptions
  {
    id: 'rrb-sa-arg-01',
    topic: 'Statement, Arguments & Assumptions',
    rrbExam: 'NTPC',
    difficulty: 'Hard',
    questionEn: 'Statement: "Should biometric facial attendance be made mandatory across all Indian Railway stations for staff?"\nArgument I: Yes, it ensures strict accountability and completely eliminates proxy attendance.\nArgument II: No, it causes severe privacy violations for employees.',
    questionTa: 'கூற்று: "அனைத்து ரயில்வே நிலையங்களிலும் ஊழியர்களுக்கு பயோமெட்ரிக் முக வருகைப்பதிவு கட்டாயமாக்கப்பட வேண்டுமா?"\nவாதம் I: ஆம், இது வெளிப்படைத்தன்மையை உறுதி செய்து ஆள்மாறாட்ட வருகையை முழுமையாக ஒழிக்கும்.\nவாதம் II: இல்லை, இது ஊழியர்களின் தனிப்பட்ட அந்தரங்க உரிமையை கடுமையாக மீறுகிறது.',
    optionsEn: ['Only argument I is strong', 'Only argument II is strong', 'Both I and II are strong', 'Neither is strong'],
    optionsTa: ['வாதம் I மட்டுமே வலுவானது', 'வாதம் II மட்டுமே வலுவானது', 'இரண்டும் வலுவானவை', 'எதுவும் வலுவற்றது'],
    correctIndex: 0, // A = Only argument I is strong
    speedTrickEn: 'Public sector administration requires punctuality and duty accountability. Workplace attendance validation does not violate constitutional privacy as it is official attendance.',
    speedTrickTa: 'அரசு நிர்வாகத்தில் பணி வருகைப் பதிவுக்கான பயோமெட்ரிக் முறை அந்தரங்க உரிமை மீறலாகாது; பொறுப்புடைமையை உறுதி செய்யும்.',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Strong argument criteria: Logical validity, public interest, and non-fallacious rationale.',
        concept: 'Arguments supporting public duty efficiency without disproportionate harm are considered strong.',
        conceptTa: 'பொதுத்துறை நிர்வாக வெளிப்படைத்தன்மையை வலுப்படுத்தும் வாதம் வலுவானது.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Workplace attendance recording is a standard administrative compliance measure.',
        calculationClue: 'Argument I directly addresses proxy attendance and administrative integrity.',
        calculationClueTa: 'வாதம் I ஆள்மாறாட்ட வருகையைத் தடுக்கும் நேரடி நிர்வாகத் தீர்வை முன்வைக்கிறது.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Government duty la attendance correct ah irukka biometric vakkuradhu valid argument. Office attendance privacy violation aagadhu. So Argument I mattum thaan strong!',
        speechText: 'Argument one is strong as it ensures duty accountability. Office attendance is not a privacy violation.',
      },
    },
    explanationEn: 'Argument I is strong as proxy elimination is vital in railway operations. Argument II is weak as duty attendance is an official requirement.',
    explanationTa: 'வாதம் I மட்டுமே நிர்வாகக் கண்ணோட்டத்தில் வலுவானது.',
  },

  // 25. Statement & Conclusions / Decision Making
  {
    id: 'rrb-sc-01',
    topic: 'Statement & Conclusions / Decision Making',
    rrbExam: 'NTPC',
    difficulty: 'Medium',
    questionEn: 'Statement: "All high-speed Vande Bharat trains have automatic plug doors for passenger safety."\nConclusions:\nI. Non-Vande Bharat trains do not have automatic plug doors.\nII. Automatic plug doors enhance passenger safety.',
    questionTa: 'கூற்று: "அனைத்து வந்தே பாரத் அதிவிரைவு ரயில்களிலும் பயணிகளின் பாதுகாப்பிற்காக தானியங்கி கதவுகள் உள்ளன."\nமுடிவுகள்:\nI. வந்தே பாரத் அல்லாத ரயில்களில் தானியங்கி கதவுகள் இல்லை.\nII. தானியங்கி கதவுகள் பயணிகளின் பாதுகாப்பை அதிகரிக்கின்றன.',
    optionsEn: ['Only conclusion I follows', 'Only conclusion II follows', 'Both follow', 'Neither follows'],
    optionsTa: ['முடிவு I மட்டுமே பொருந்தும்', 'முடிவு II மட்டுமே பொருந்தும்', 'இரண்டும் பொருந்தும்', 'எதுவும் பொருந்தாது'],
    correctIndex: 1, // B = Only conclusion II follows
    speedTrickEn: 'Conclusion I makes an unstated assumption about other trains. Conclusion II directly reiterates the statement’s premise: "for passenger safety".',
    speedTrickTa: 'கூற்றில் பிற ரயில்களைப் பற்றி எதுவும் கூறப்படவில்லை என்பதால் I தவறு. பாதுகாப்புக்காகவே கதவுகள் உள்ளன என்பதால் II சரி.',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Direct deduction rule: Never assume anything beyond what the statement explicitly asserts.',
        concept: 'Do not extrapolate negative claims about unmentioned items.',
        conceptTa: 'கூற்றில் குறிப்பிடப்படாத பிற அம்சங்களை நாமாக அனுமானிக்கக் கூடாது.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Statement mentions: Vande Bharat has plug doors for safety. No information about other trains.',
        calculationClue: 'Conclusion I cannot be verified. Conclusion II is directly asserted.',
        calculationClueTa: 'முடிவு I சான்றளிக்கப்படவில்லை. முடிவு II கூற்றின் நேரடி நோக்கம்.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Statement la Vande Bharat pathi mattum thaan solli irukku, matha train la automatic door irukka illaya nu theriyadhu. Aana safety ku thaan automatic door nu direct ah sollitanga. So Conclusion II mattum thaan correct!',
        speechText: 'Statement only confirms doors enhance passenger safety. It says nothing about other trains, so only conclusion two follows.',
      },
    },
    explanationEn: 'Only Conclusion II directly aligns with the stated facts.',
    explanationTa: 'முடிவு II மட்டுமே கூற்றுடன் நேரடியாகப் பொருந்துகிறது.',
  },

  // 26. Clock & Calendar
  {
    id: 'rrb-cc-01',
    topic: 'Clock & Calendar',
    rrbExam: 'ALP',
    difficulty: 'Easy',
    isSpeedTrickCard: true,
    questionEn: 'What is the acute angle between the hour hand and the minute hand of a clock at 4:20?',
    questionTa: 'ஒரு கடிகாரத்தில் நேரம் 4:20 ஆக இருக்கும்போது மணி முள்ளுக்கும் நிமிட முள்ளுக்கும் இடைப்பட்ட குறுங்கோணம் என்ன?',
    optionsEn: ['0°', '10°', '15°', '20°'],
    optionsTa: ['0°', '10°', '15°', '20°'],
    correctIndex: 1, // B = 10°
    speedTrickEn: 'Angle θ = |30H - 5.5M| = |30(4) - 5.5(20)| = |120 - 110| = 10° in 3 seconds!',
    speedTrickTa: 'கோணம் = |30H - 5.5M| = |30(4) - 5.5(20)| = |120 - 110| = 10°!',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Angle θ = |30 × H - (11/2) × M|',
        concept: 'At 20 minutes, minute hand is at 4, but hour hand has moved forward by 20 × 0.5° = 10°.',
        conceptTa: '20 நிமிடத்தில் நிமிட முள் 4-ல் இருக்கும் போது, மணி முள் 10° முன்னேறி இருக்கும்.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'H = 4, M = 20. 30 × 4 = 120. (11/2) × 20 = 110.',
        calculationClue: '|120 - 110| = 10°.',
        calculationClueTa: '120 - 110 = 10°.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Clock angle shortcut formula: 30H - 11/2 M. 30 × 4 = 120. 5.5 × 20 = 110. 120 - 110 = 10 degrees!',
        speechText: 'Thirty into four minus 5.5 into twenty gives 120 minus 110 which is ten degrees.',
      },
    },
    explanationEn: 'θ = |30(4) - (11/2)(20)| = |120 - 110| = 10°.',
    explanationTa: 'கோணம் = |120 - 110| = 10°.',
  },

  // 27. Data Interpretation
  {
    id: 'rrb-di-01',
    topic: 'Data Interpretation',
    rrbExam: 'JE',
    difficulty: 'Medium',
    questionEn: 'In a railway division pie chart of total expenditure (₹120 Crores), Track Maintenance corresponds to a central angle of 54°. What is the expenditure on Track Maintenance?',
    questionTa: 'மொத்த ரயில்வே செலவினத்திற்கான (₹120 கோடி) வட்ட வரைபடத்தில், தண்டவாளப் பராமரிப்புக்கான மையக் கோணம் 54° ஆகும். தண்டவாளப் பராமரிப்பிற்கான செலவு என்ன?',
    optionsEn: ['₹15 Crores', '₹18 Crores', '₹20 Crores', '₹22.5 Crores'],
    optionsTa: ['₹15 கோடி', '₹18 கோடி', '₹20 கோடி', '₹22.5 கோடி'],
    correctIndex: 1, // B = ₹18 Crores
    speedTrickEn: '360° = 120 Cr => 1° = 1/3 Cr. 54° = 54 × (1/3) = 18 Crores in 4 seconds!',
    speedTrickTa: '360° = 120 கோடி => 1° = 1/3 கோடி. 54° = 54 / 3 = 18 கோடி!',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Expenditure = (Central Angle / 360°) × Total Expenditure',
        concept: 'The full circle in a pie chart spans 360° representing 100% of total amount.',
        conceptTa: 'வட்ட வரைபடத்தில் 360° என்பது மொத்த தொகையைக் குறிக்கிறது.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Angle = 54°, Total = 120 Crores. Fraction = 54 / 360 = 3 / 20 = 15%.',
        calculationClue: '(54 / 360) × 120 = 54 / 3 = 18 Crores.',
        calculationClueTa: '54-ஐ 3-ஆல் வகுக்க 18 கோடி கிடைக்கும்.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Pie chart la total 360 degrees = 120 crores. Appo 1 degree = 120/360 = 1/3 crore. 54 degrees ku 54 × 1/3 = 18 crores!',
        speechText: 'Central angle 54 divided by 360 into 120 crores gives 18 crores.',
      },
    },
    explanationEn: 'Expenditure = (54 / 360) × 120 = (3 / 20) × 120 = 18 Crores.',
    explanationTa: 'செலவு = (54 / 360) × 120 = 18 கோடி.',
  },

  // 28. Non-Verbal Reasoning & Pattern Completion
  {
    id: 'rrb-nv-01',
    topic: 'Non-Verbal Reasoning & Pattern Completion',
    rrbExam: 'Group D',
    difficulty: 'Easy',
    questionEn: 'If a digital signal clock displaying "08:25" is viewed in a plane vertical mirror, what time will appear in the reflection?',
    questionTa: 'ஒரு கண்ணாடியில் "08:25" நேரத்தைக் காட்டும் கடிகாரத்தின் பிரதிபலிப்பு என்ன நேரத்தைக் காட்டும்?',
    optionsEn: ['03:35', '03:45', '04:35', '04:45'],
    optionsTa: ['03:35', '03:45', '04:35', '04:45'],
    correctIndex: 0, // A = 03:35
    speedTrickEn: 'Mirror Image Rule for Time: Subtract given time from 11:60! 11:60 - 08:25 = 03:35 in 2 seconds!',
    speedTrickTa: 'கண்ணாடி பிம்ப குறுக்குவழி: 11:60-லிருந்து கழிக்கவும்! 11:60 - 08:25 = 03:35!',
    hints: {
      level1: {
        title: 'Formula & Core Concept',
        titleTa: 'சூத்திரம் மற்றும் அடிப்படை விதி',
        formula: 'Mirror Time = 11:60 - Actual Time (or 23:60 for 24-hour clock)',
        concept: 'A plane vertical mirror reflects horizontally, reversing left and right around 12:00.',
        conceptTa: 'கண்ணாடி நேரத்தைக் காண 11:60-லிருந்து உண்மையான நேரத்தைக் கழிக்க வேண்டும்.',
      },
      level2: {
        title: 'Variable Setup & Boundary Clue',
        titleTa: 'மாறிகள் & கணக்கீட்டுக் குறிப்பு',
        variables: 'Given time = 08:25. Standard subtractor = 11:60.',
        calculationClue: 'Hours: 11 - 8 = 3. Minutes: 60 - 25 = 35.',
        calculationClueTa: '11 - 8 = 3. 60 - 25 = 35.',
      },
      level3Tanglish: {
        title: 'Tanglish Step-by-Step Logic',
        stepByStep: 'Mirror time super shortcut: 11:60 la irundhu kudutha time ah kalingo. 11 - 8 = 3, 60 - 25 = 35. So answer 03:35!',
        speechText: 'Subtract 8 25 from 11 60 to get mirror time 3 35.',
      },
    },
    explanationEn: 'Mirror reflection time = 11:60 - 08:25 = 03:35.',
    explanationTa: 'கண்ணாடி நேரம் = 11:60 - 08:25 = 03:35.',
  },
];
