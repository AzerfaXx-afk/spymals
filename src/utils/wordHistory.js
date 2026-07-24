// Utility to track played word pairs per pack so words NEVER repeat until full pack exhaustion.

const STORAGE_KEY_PREFIX = 'spymals_used_words_';

/**
 * Get used word signatures for a pack
 * @param {string} packName 
 * @returns {Set<string>}
 */
export const getUsedWords = (packName) => {
    try {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${packName}`);
        if (!stored) return new Set();
        return new Set(JSON.parse(stored));
    } catch (e) {
        console.error("Failed to read used words from localStorage", e);
        return new Set();
    }
};

/**
 * Save used word signatures for a pack
 * @param {string} packName 
 * @param {Set<string>} usedSet 
 */
export const saveUsedWords = (packName, usedSet) => {
    try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${packName}`, JSON.stringify(Array.from(usedSet)));
    } catch (e) {
        console.error("Failed to save used words to localStorage", e);
    }
};

/**
 * Reset history for a specific pack or all packs
 * @param {string} [packName] 
 */
export const resetWordHistory = (packName) => {
    try {
        if (packName) {
            localStorage.removeItem(`${STORAGE_KEY_PREFIX}${packName}`);
        } else {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(STORAGE_KEY_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        }
    } catch (e) {
        console.error("Failed to reset word history", e);
    }
};

/**
 * Picks an unused word pair from a given list for a specific pack.
 * If all words in the pack have been used, resets history and picks from full list.
 * 
 * @param {string} packName 
 * @param {Array<{civilian: string, undercover: string}>} wordList 
 * @returns {{wordPair: {civilian: string, undercover: string}, isReset: boolean}}
 */
export const getUnusedWordPair = (packName, wordList) => {
    if (!wordList || wordList.length === 0) {
        return { wordPair: { civilian: "Chat", undercover: "Chien" }, isReset: false };
    }

    let usedSet = getUsedWords(packName);
    
    // Filter available words
    const unusedWords = wordList.filter(item => {
        const signature = `${item.civilian.trim().toLowerCase()}:::${item.undercover.trim().toLowerCase()}`;
        return !usedSet.has(signature);
    });

    let isReset = false;
    let pool = unusedWords;

    // If all words are used, reset the set and use the full word list again
    if (unusedWords.length === 0) {
        usedSet.clear();
        pool = wordList;
        isReset = true;
    }

    // Pick a random word pair from pool
    const selectedPair = pool[Math.floor(Math.random() * pool.length)];

    // Mark as used
    const signature = `${selectedPair.civilian.trim().toLowerCase()}:::${selectedPair.undercover.trim().toLowerCase()}`;
    usedSet.add(signature);
    saveUsedWords(packName, usedSet);

    return { wordPair: selectedPair, isReset };
};
