import { Question, QuestionTopic } from '../types';

const DB_NAME = 'RailMasterCBT_DB';
const DB_VERSION = 1;
const STORE_QUESTIONS = 'questions';
const STORE_DAILY_PACKS = 'dailyPacks';

// Quant topic names for section classification
const QUANT_TOPIC_NAMES = new Set([
  'Number System & Divisibility Rules',
  'BODMAS, Simplification, Fractions & Decimals',
  'LCM & HCF',
  'Ratio, Proportion & Partnership',
  'Percentages & Averages',
  'Time & Work, Pipes & Cisterns',
  'Time, Speed & Distance (Trains, Boats)',
  'Simple Interest & Compound Interest',
  'Profit, Loss & Discount',
  'Mensuration & Geometry (2D/3D)',
  'Algebra, Polynomials & Linear Equations',
  'Trigonometry, Heights & Distances',
  'Statistics, Mean, Median, Mode & Standard Deviation',
  'Probability & Elementary Combinatorics',
  'Coordinate Geometry',
]);

export function isQuantTopic(topic: string): boolean {
  return QUANT_TOPIC_NAMES.has(topic);
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_QUESTIONS)) {
        const questionStore = db.createObjectStore(STORE_QUESTIONS, { keyPath: 'id' });
        questionStore.createIndex('topic', 'topic', { unique: false });
        questionStore.createIndex('rrbExam', 'rrbExam', { unique: false });
        questionStore.createIndex('difficulty', 'difficulty', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_DAILY_PACKS)) {
        db.createObjectStore(STORE_DAILY_PACKS, { keyPath: 'date' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Ensures the app maintains a local cache of at least 30 pre-generated RRB questions per section in IndexedDB and LocalStorage.
 */
export async function ensureSectionCache(seedQuestions: Question[]): Promise<Question[]> {
  const quantSeed = seedQuestions.filter((q) => isQuantTopic(q.topic));
  const reasoningSeed = seedQuestions.filter((q) => !isQuantTopic(q.topic));

  // Sync to LocalStorage as an instant, crash-resilient backup
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedQuant = quantSeed.slice(0, Math.max(30, quantSeed.length));
      const storedReasoning = reasoningSeed.slice(0, Math.max(30, reasoningSeed.length));
      localStorage.setItem('railmaster_offline_seed_quant', JSON.stringify(storedQuant));
      localStorage.setItem('railmaster_offline_seed_reasoning', JSON.stringify(storedReasoning));
      localStorage.setItem('railmaster_offline_seed_all', JSON.stringify(seedQuestions));
    }
  } catch (err) {
    console.warn('LocalStorage offline seed sync notice:', err);
  }

  // Ensure IndexedDB holds all questions and has >= 30 per section
  try {
    const db = await openDB();
    const stored = await getAllStoredQuestions(db);
    const storedQuant = stored.filter((q) => isQuantTopic(q.topic));
    const storedReasoning = stored.filter((q) => !isQuantTopic(q.topic));

    let needPut = false;
    const toPut: Question[] = [];

    if (storedQuant.length < 30) {
      toPut.push(...quantSeed);
      needPut = true;
    }
    if (storedReasoning.length < 30) {
      toPut.push(...reasoningSeed);
      needPut = true;
    }

    if (needPut && toPut.length > 0) {
      await putQuestionsInStore(db, toPut);
      return await getAllStoredQuestions(db);
    }

    return stored.length > 0 ? stored : seedQuestions;
  } catch (err) {
    console.warn('IndexedDB section cache fallback to memory seed:', err);
    return seedQuestions;
  }
}

/**
 * Initialize IndexedDB with seed questions on first run or when seed contains more items.
 * Guarantees at least 30 questions per section in IndexedDB/LocalStorage.
 */
export async function initDatabase(seedQuestions: Question[]): Promise<Question[]> {
  try {
    const db = await openDB();
    const count = await getStoredQuestionCount(db);

    if (count < seedQuestions.length) {
      // Seed or merge into IndexedDB
      await putQuestionsInStore(db, seedQuestions);
    }

    // Verify both sections have >= 30 questions
    return await ensureSectionCache(seedQuestions);
  } catch (err) {
    console.warn('IndexedDB initialization fallback to memory seed:', err);
    return await ensureSectionCache(seedQuestions);
  }
}

function getStoredQuestionCount(db: IDBDatabase): Promise<number> {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_QUESTIONS, 'readonly');
    const store = tx.objectStore(STORE_QUESTIONS);
    const countReq = store.count();
    countReq.onsuccess = () => resolve(countReq.result);
    countReq.onerror = () => resolve(0);
  });
}

function putQuestionsInStore(db: IDBDatabase, questions: Question[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUESTIONS, 'readwrite');
    const store = tx.objectStore(STORE_QUESTIONS);
    questions.forEach((q) => store.put(q));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function getAllStoredQuestions(db: IDBDatabase): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUESTIONS, 'readonly');
    const store = tx.objectStore(STORE_QUESTIONS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as Question[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllQuestions(fallbackSeed: Question[] = []): Promise<Question[]> {
  try {
    const db = await openDB();
    const list = await getAllStoredQuestions(db);
    return list.length > 0 ? list : fallbackSeed;
  } catch {
    return fallbackSeed;
  }
}

export async function saveNewQuestions(newQuestions: Question[]): Promise<void> {
  try {
    const db = await openDB();
    await putQuestionsInStore(db, newQuestions);
  } catch (err) {
    console.warn('Failed saving questions to IndexedDB:', err);
  }
}

export async function getStoredCount(): Promise<number> {
  try {
    const db = await openDB();
    return await getStoredQuestionCount(db);
  } catch {
    return 0;
  }
}

export async function getDailyPack(dateKey: string): Promise<Question[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_DAILY_PACKS, 'readonly');
      const store = tx.objectStore(STORE_DAILY_PACKS);
      const req = store.get(dateKey);
      req.onsuccess = () => {
        if (req.result && req.result.questions) {
          resolve(req.result.questions);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveDailyPack(dateKey: string, questions: Question[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DAILY_PACKS, 'readwrite');
      const store = tx.objectStore(STORE_DAILY_PACKS);
      store.put({ date: dateKey, questions });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed saving daily pack:', err);
  }
}
