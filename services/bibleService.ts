
export interface BibleVerse {
    number: number;
    text: string;
}

export interface BibleChapter {
    book: {
        abbrev: string;
        name: string;
        author: string;
        group: string;
        version: string;
    };
    chapter: {
        number: number;
        verses: number;
    };
    verses: BibleVerse[];
}

class BibleService {
    private baseUrl = 'https://www.abibliadigital.com.br/api';
    private version = 'nvi'; // Nova Versão Internacional
    private cache: Map<string, { verses: string[], timestamp: number }> = new Map();
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

    private getCacheKey(bookAbbrev: string, chapter: number): string {
        return `${this.version}_${bookAbbrev.toLowerCase()}_${chapter}`;
    }

    private isCacheValid(timestamp: number): boolean {
        return Date.now() - timestamp < this.CACHE_DURATION;
    }

    private getCachedVerses(key: string): string[] | null {
        try {
            const cached = localStorage.getItem(`bible_cache_${key}`);
            if (cached) {
                const data = JSON.parse(cached);
                if (this.isCacheValid(data.timestamp)) {
                    return data.verses;
                } else {
                    localStorage.removeItem(`bible_cache_${key}`);
                }
            }
        } catch (error) {
            console.warn('Erro ao acessar cache local:', error);
        }
        return null;
    }

    private setCachedVerses(key: string, verses: string[]): void {
        try {
            const data = {
                verses,
                timestamp: Date.now()
            };
            localStorage.setItem(`bible_cache_${key}`, JSON.stringify(data));
        } catch (error) {
            console.warn('Erro ao salvar no cache local:', error);
        }
    }

    async getChapterVerses(bookAbbrev: string, chapter: number): Promise<string[]> {
        const cacheKey = this.getCacheKey(bookAbbrev, chapter);

        // Verificar cache em memória primeiro
        const memoryCached = this.cache.get(cacheKey);
        if (memoryCached && this.isCacheValid(memoryCached.timestamp)) {
            return memoryCached.verses;
        }

        // Verificar cache local (localStorage)
        const localCached = this.getCachedVerses(cacheKey);
        if (localCached) {
            // Atualizar cache em memória
            this.cache.set(cacheKey, { verses: localCached, timestamp: Date.now() });
            return localCached;
        }
        // Try primary API first
        try {
            const abbrev = bookAbbrev.toLowerCase();
            const response = await fetch(`${this.baseUrl}/verses/${this.version}/${abbrev}/${chapter}`);

            if (response.ok) {
                const data: BibleChapter = await response.json();
                if (data.verses && data.verses.length > 0) {
                    const verses = data.verses.map(v => v.text);
                    // Cache the result
                    this.cache.set(cacheKey, { verses, timestamp: Date.now() });
                    this.setCachedVerses(cacheKey, verses);
                    return verses;
                }
            }
        } catch (error) {
            console.warn('Primary API failed, trying fallback:', error);
        }

        // Fallback to bible-api.com (supports Portuguese with 'almeida')
        try {
            // Map abbreviations to full book names for bible-api.com
            const bookNameMap: Record<string, string> = {
                'gn': 'genesis', 'ex': 'exodus', 'lv': 'leviticus', 'nm': 'numbers',
                'dt': 'deuteronomy', 'js': 'joshua', 'jz': 'judges', 'rt': 'ruth',
                '1sm': '1samuel', '2sm': '2samuel', '1rs': '1kings', '2rs': '2kings',
                '1cr': '1chronicles', '2cr': '2chronicles', 'sl': 'psalms', 'pv': 'proverbs',
                'ec': 'ecclesiastes', 'ct': 'songofsolomon', 'is': 'isaiah', 'jr': 'jeremiah',
                'lm': 'lamentations', 'ez': 'ezekiel', 'dn': 'daniel', 'os': 'hosea',
                'jl': 'joel', 'am': 'amos', 'ob': 'obadiah', 'jn': 'jonah', 'mq': 'micah',
                'na': 'nahum', 'hc': 'habakkuk', 'sf': 'zephaniah', 'ag': 'haggai',
                'zc': 'zechariah', 'ml': 'malachi', 'mt': 'matthew', 'mc': 'mark',
                'lc': 'luke', 'jo': 'john', 'at': 'acts', 'rm': 'romans',
                '1co': '1corinthians', '2co': '2corinthians', 'gl': 'galatians',
                'ef': 'ephesians', 'fp': 'philippians', 'cl': 'colossians',
                '1ts': '1thessalonians', '2ts': '2thessalonians', '1ti': '1timothy',
                '2ti': '2timothy', 'tt': 'titus', 'fm': 'philemon', 'hb': 'hebrews',
                'tg': 'james', '1pe': '1peter', '2pe': '2peter', '1jo': '1john',
                '2jo': '2john', '3jo': '3john', 'jd': 'jude', 'ap': 'revelation',
                'ne': 'nehemiah', 'et': 'esther'
            };

            const bookName = bookNameMap[bookAbbrev.toLowerCase()] || bookAbbrev;
            const fallbackUrl = `https://bible-api.com/${bookName}+${chapter}?translation=almeida`;
            const fallbackResponse = await fetch(fallbackUrl);

            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.verses && fallbackData.verses.length > 0) {
                    const verses = fallbackData.verses.map((v: any) => v.text);
                    // Cache the result
                    this.cache.set(cacheKey, { verses, timestamp: Date.now() });
                    this.setCachedVerses(cacheKey, verses);
                    return verses;
                }
            }
        } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError);
        }

        return [];
    }

    // Parses a passage string like "Gênesis 1 - 3" or "Salmos 23"
    // and returns the book and chapter range.
    // Simplifying for now: focus on the first chapter of the passage.
    parsePassage(passage: string) {
        const parts = passage.match(/^(.+?)\s+(\d+)/);
        if (!parts) return { book: 'gn', chapter: 1 };

        const bookName = parts[1].trim();
        const chapter = parseInt(parts[2]);

        // Simple mapping for common books to abbreviations used by abibliadigital
        const bookMap: Record<string, string> = {
            'Gênesis': 'gn',
            'Êxodo': 'ex',
            'Levítico': 'lv',
            'Números': 'nm',
            'Deuteronômio': 'dt',
            'Josué': 'js',
            'Juízes': 'jz',
            'Rute': 'rt',
            '1 Samuel': '1sm',
            '2 Samuel': '2sm',
            '1 Reis': '1rs',
            '2 Reis': '2rs',
            '1 Crônicas': '1cr',
            '2 Crônicas': '2cr',
            'Esdras': 'ez',
            'Neemias': 'ne',
            'Ester': 'et',
            'Jó': 'jo',
            'Salmos': 'sl',
            'Provérbios': 'pv',
            'Eclesiastes': 'ec',
            'Cantares': 'ct',
            'Isaías': 'is',
            'Jeremias': 'jr',
            'Lamentações': 'lm',
            'Ezequiel': 'ez',
            'Daniel': 'dn',
            'Oseias': 'os',
            'Joel': 'jl',
            'Amós': 'am',
            'Obadias': 'ob',
            'Jonas': 'jn',
            'Miqueias': 'mq',
            'Naum': 'na',
            'Habacuque': 'hc',
            'Sofonias': 'sf',
            'Ageu': 'ag',
            'Zacarias': 'zc',
            'Malaquias': 'ml',
            'Mateus': 'mt',
            'Marcos': 'mc',
            'Lucas': 'lc',
            'João': 'jo',
            'Atos': 'at',
            'Romanos': 'rm',
            '1 Coríntios': '1co',
            '2 Coríntios': '2co',
            'Gálatas': 'gl',
            'Efésios': 'ef',
            'Filipenses': 'fp',
            'Colossenses': 'cl',
            '1 Tessalonicenses': '1ts',
            '2 Tessalonicenses': '2ts',
            '1 Timóteo': '1ti',
            '2 Timóteo': '2ti',
            'Tito': 'tt',
            'Filemom': 'fm',
            'Hebreus': 'hb',
            'Tiago': 'tg',
            '1 Pedro': '1pe',
            '2 Pedro': '2pe',
            '1 João': '1jo',
            '2 João': '2jo',
            '3 João': '3jo',
            'Judas': 'jd',
            'Apocalipse': 'ap'
        };

        return {
            bookAbbrev: bookMap[bookName] || bookName.substring(0, 2).toLowerCase(),
            chapter
        };
    }
}

export const bibleService = new BibleService();
