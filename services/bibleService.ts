import { supabase } from './supabaseClient';

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
    private apiBibleBaseUrl = 'https://rest.api.bible/v1';
    private defaultVersion = 'nvi'; // Nova Versão Internacional
    private supportedVersions = ['nvi', 'nvt', 'ol'] as const;
    private authToken = import.meta.env.VITE_ABIBLIA_TOKEN || '';
    private apiBibleKey = import.meta.env.VITE_API_BIBLE_KEY || '';
    private apiBibleBibleIdOverrides: Record<'nvi' | 'nvt' | 'ol', string> = {
        nvi: import.meta.env.VITE_API_BIBLE_NVI_ID || '',
        nvt: import.meta.env.VITE_API_BIBLE_NVT_ID || '',
        ol: import.meta.env.VITE_API_BIBLE_OL_ID || ''
    };
    private apiBibleBibleIdCache = new Map<string, string>();
    private cache = new Map<string, string[]>();

    async getChapterVerses(bookAbbrev: string, chapter: number, version: string = this.defaultVersion, bookName?: string): Promise<string[]> {
        const normalizedVersion = this.normalizeVersion(version);
        const cacheKey = `${bookAbbrev.toLowerCase()}-${chapter}-${normalizedVersion}`;

        if (this.cache.has(cacheKey)) {
            console.log(`[BibleService] Serving ${cacheKey} from memory cache`);
            return this.cache.get(cacheKey)!;
        }

        let fetchedVerses: string[] | null = null;
        let sourceProvider: 'api.bible' | 'abibliadigital' | 'db' | null = null;

        fetchedVerses = await this.fetchFromApiBible(bookAbbrev, chapter, normalizedVersion, bookName);
        if (fetchedVerses && fetchedVerses.length > 0) {
            sourceProvider = 'api.bible';
        }

        if (!fetchedVerses) {
            try {
                fetchedVerses = await this.fetchFromAbibliaDigital(bookAbbrev, chapter, normalizedVersion);
                if (fetchedVerses && fetchedVerses.length > 0) {
                    sourceProvider = 'abibliadigital';
                }
            } catch (apiError) {
                console.warn(`[BibleService] ABibliaDigital fail for version ${normalizedVersion}`, apiError);
            }
        }

        if (!fetchedVerses) {
            fetchedVerses = await this.getChapterVersesFromDb(bookAbbrev, chapter, normalizedVersion);
            if (fetchedVerses) {
                sourceProvider = 'db';
                console.log(`[BibleService] Serving ${cacheKey} from Supabase DB`);
            }
        }

        if (!fetchedVerses || fetchedVerses.length === 0) {
            return [];
        }

        if (sourceProvider !== 'db') {
            supabase.from('bible_chapters').upsert({
                book: bookAbbrev.toLowerCase(),
                chapter,
                version: normalizedVersion,
                content: fetchedVerses
            }, { onConflict: 'book,chapter,version' }).then(({ error }) => {
                if (error) console.error('Error caching to DB:', error);
                else console.log(`[BibleService] Cached ${cacheKey} to Supabase`);
            });
        }

        this.cache.set(cacheKey, fetchedVerses);
        return fetchedVerses;
    }

    private normalizeVersion(version: string): string {
        const normalized = (version || '').toLowerCase();
        return this.supportedVersions.includes(normalized as (typeof this.supportedVersions)[number])
            ? normalized
            : this.defaultVersion;
    }

    private async resolveApiBibleId(version: string): Promise<string | null> {
        const normalized = this.normalizeVersion(version);
        const cached = this.apiBibleBibleIdCache.get(normalized);
        if (cached) return cached;

        const overridden = this.apiBibleBibleIdOverrides[normalized as 'nvi' | 'nvt' | 'blt' | 'ol'];
        if (overridden) {
            this.apiBibleBibleIdCache.set(normalized, overridden);
            return overridden;
        }

        if (!this.apiBibleKey) return null;

        try {
            const response = await fetch(`${this.apiBibleBaseUrl}/bibles`, {
                headers: {
                    'api-key': this.apiBibleKey,
                    Accept: 'application/json'
                }
            });

            if (!response.ok) return null;
            const payload = await response.json();
            const bibles = Array.isArray(payload?.data) ? payload.data : [];

            const keywordsByVersion: Record<string, string[]> = {
                nvi: ['ptnvi', 'nvi', 'nova versao internacional'],
                nvt: ['nvt', 'nova versao transformadora'],
                ol: ['ol', 'o livro']
            };
            const wantedKeywords = keywordsByVersion[normalized] || [normalized];

            const match = bibles.find((bible: any) => {
                const haystack = this.normalizeLookup(
                    `${bible?.name || ''} ${bible?.nameLocal || ''} ${bible?.description || ''} ${bible?.abbreviation || ''} ${bible?.abbreviationLocal || ''}`
                );
                return wantedKeywords.some(keyword => haystack.includes(keyword));
            });

            if (match?.id) {
                this.apiBibleBibleIdCache.set(normalized, match.id);
                return match.id;
            }
        } catch (error) {
            console.warn(`[BibleService] Failed resolving API.Bible ID for ${normalized}`, error);
        }

        return null;
    }

    private getApiBibleBookId(bookAbbrev: string, bookName?: string): string | null {
        const byAbbrev: Record<string, string> = {
            gn: 'GEN', ex: 'EXO', lv: 'LEV', nm: 'NUM', dt: 'DEU',
            js: 'JOS', jz: 'JDG', rt: 'RUT', '1sm': '1SA', '2sm': '2SA',
            '1rs': '1KI', '2rs': '2KI', '1cr': '1CH', '2cr': '2CH',
            ne: 'NEH', et: 'EST', sl: 'PSA', pv: 'PRO', ec: 'ECC',
            ct: 'SNG', is: 'ISA', jr: 'JER', lm: 'LAM', dn: 'DAN',
            os: 'HOS', jl: 'JOL', am: 'AMO', ob: 'OBA', jn: 'JON',
            mq: 'MIC', na: 'NAM', hc: 'HAB', sf: 'ZEP', ag: 'HAG',
            zc: 'ZEC', ml: 'MAL', mt: 'MAT', mc: 'MRK', lc: 'LUK',
            at: 'ACT', rm: 'ROM', '1co': '1CO', '2co': '2CO', gl: 'GAL',
            ef: 'EPH', fp: 'PHP', cl: 'COL', '1ts': '1TH', '2ts': '2TH',
            '1ti': '1TI', '2ti': '2TI', tt: 'TIT', fm: 'PHM', hb: 'HEB',
            tg: 'JAS', '1pe': '1PE', '2pe': '2PE', '1jo': '1JN', '2jo': '2JN',
            '3jo': '3JN', jd: 'JUD', ap: 'REV'
        };

        const normalizedBookName = this.normalizeLookup(bookName || '');
        if (bookAbbrev === 'ez') {
            return normalizedBookName.includes('esdras') ? 'EZR' : 'EZK';
        }
        if (bookAbbrev === 'jo') {
            return normalizedBookName.includes('joao') ? 'JHN' : 'JOB';
        }

        return byAbbrev[bookAbbrev.toLowerCase()] || null;
    }

    private async fetchFromApiBible(bookAbbrev: string, chapter: number, version: string, bookName?: string): Promise<string[] | null> {
        if (!this.apiBibleKey) return null;

        const bibleId = await this.resolveApiBibleId(version);
        const bookId = this.getApiBibleBookId(bookAbbrev, bookName);
        if (!bibleId || !bookId) return null;

        const chapterId = `${bookId}.${chapter}`;
        const chapterParams = new URLSearchParams({
            'content-type': 'json',
            'include-notes': 'false',
            'include-titles': 'false',
            'include-chapter-numbers': 'false',
            'include-verse-numbers': 'true',
            'include-verse-spans': 'true'
        });

        try {
            const chapterResponse = await fetch(`${this.apiBibleBaseUrl}/bibles/${bibleId}/chapters/${chapterId}?${chapterParams.toString()}`, {
                headers: {
                    'api-key': this.apiBibleKey,
                    Accept: 'application/json'
                }
            });

            if (chapterResponse.ok) {
                const chapterPayload = await chapterResponse.json();
                const parsed = this.extractVersesFromApiBibleContent(chapterPayload?.data?.content);
                if (parsed && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (error) {
            console.warn(`[BibleService] API.Bible chapter endpoint failed for ${chapterId}`, error);
        }

        try {
            const versesParams = new URLSearchParams({
                'content-type': 'text',
                'include-verse-numbers': 'false',
                'include-verse-spans': 'false',
                limit: '500'
            });
            const versesResponse = await fetch(`${this.apiBibleBaseUrl}/bibles/${bibleId}/chapters/${chapterId}/verses?${versesParams.toString()}`, {
                headers: {
                    'api-key': this.apiBibleKey,
                    Accept: 'application/json'
                }
            });

            if (!versesResponse.ok) return null;
            const versesPayload = await versesResponse.json();
            const verses = Array.isArray(versesPayload?.data) ? versesPayload.data : [];
            const extracted = verses
                .map((verse: any) => {
                    const candidate = typeof verse?.text === 'string'
                        ? verse.text
                        : typeof verse?.content === 'string'
                            ? verse.content
                            : '';
                    return this.cleanVerseText(candidate);
                })
                .filter(Boolean);

            return extracted.length > 0 ? extracted : null;
        } catch (error) {
            console.warn(`[BibleService] API.Bible verses endpoint failed for ${chapterId}`, error);
            return null;
        }
    }

    private extractVersesFromApiBibleContent(content: unknown): string[] | null {
        const verseMap = new Map<number, string[]>();
        const append = (verseNumber: number | null, text: string) => {
            if (!verseNumber || verseNumber < 1) return;
            const cleaned = this.cleanVerseText(text);
            if (!cleaned) return;
            if (!verseMap.has(verseNumber)) verseMap.set(verseNumber, []);
            verseMap.get(verseNumber)!.push(cleaned);
        };

        const walk = (node: any, currentVerseNumber: number | null = null) => {
            if (node == null) return;
            if (typeof node === 'string') {
                append(currentVerseNumber, node);
                return;
            }
            if (Array.isArray(node)) {
                node.forEach(item => walk(item, currentVerseNumber));
                return;
            }
            if (typeof node !== 'object') return;

            const parsedFromNode = this.parseVerseNumber(node?.verseNumber ?? node?.verse ?? node?.number ?? node?.verse_number);
            const parsedFromAttrs = this.parseVerseNumber(node?.attrs?.number ?? node?.attrs?.verseNumber ?? node?.attrs?.['data-number']);
            const nextVerse = parsedFromNode ?? parsedFromAttrs ?? currentVerseNumber;

            if (typeof node.text === 'string') append(nextVerse, node.text);
            if (typeof node.value === 'string') append(nextVerse, node.value);
            if (typeof node.content === 'string') append(nextVerse, node.content);

            Object.values(node).forEach(value => {
                if (value && typeof value === 'object') {
                    walk(value, nextVerse);
                }
            });
        };

        walk(content, null);

        if (verseMap.size > 0) {
            return Array.from(verseMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([, parts]) => this.cleanVerseText(parts.join(' ')));
        }

        if (typeof content === 'string') {
            return this.extractVersesFromNumberedText(content);
        }

        return null;
    }

    private extractVersesFromNumberedText(content: string): string[] | null {
        const normalized = content.replace(/\u00a0/g, ' ').replace(/\r/g, '').trim();
        if (!normalized) return null;

        const markers = Array.from(normalized.matchAll(/(?:^|\n)\s*(\d{1,3})\s+/g));
        if (markers.length === 0) return null;

        const verses: string[] = [];
        for (let i = 0; i < markers.length; i++) {
            const start = (markers[i].index || 0) + markers[i][0].length;
            const end = i < markers.length - 1 ? (markers[i + 1].index || normalized.length) : normalized.length;
            const verseText = this.cleanVerseText(normalized.slice(start, end));
            if (verseText) verses.push(verseText);
        }

        return verses.length > 0 ? verses : null;
    }

    private parseVerseNumber(value: unknown): number | null {
        const numeric = parseInt(String(value ?? ''), 10);
        return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
    }

    private normalizeLookup(value: string): string {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    }

    private cleanVerseText(value: string): string {
        return value
            .replace(/\s+/g, ' ')
            .trim();
    }

    private async fetchFromAbibliaDigital(bookAbbrev: string, chapter: number, version: string): Promise<string[] | null> {
        const headers: HeadersInit = { Accept: 'application/json' };
        if (this.authToken) {
            headers.Authorization = `Bearer ${this.authToken}`;
        }

        const response = await fetch(`${this.baseUrl}/verses/${version}/${bookAbbrev.toLowerCase()}/${chapter}`, { headers });
        if (!response.ok) {
            return null;
        }

        const data: BibleChapter = await response.json();
        if (!data.verses || data.verses.length === 0) {
            return null;
        }

        return data.verses.map(v => v.text);
    }

    private async getChapterVersesFromDb(bookAbbrev: string, chapter: number, version: string): Promise<string[] | null> {
        try {
            const { data } = await supabase
                .from('bible_chapters')
                .select('content')
                .eq('book', bookAbbrev.toLowerCase())
                .eq('chapter', chapter)
                .eq('version', version.toLowerCase())
                .maybeSingle();

            if (data?.content) {
                return data.content;
            }
        } catch (dbError) {
            console.warn('[BibleService] DB check failed', dbError);
        }

        return null;
    }

    async getPassageVerses(passage: string, version: string = this.defaultVersion): Promise<string[]> {
        const { bookAbbrev, bookName, startChapter, endChapter } = this.parsePassage(passage);
        const chapters = Array.from(
            { length: endChapter - startChapter + 1 },
            (_, index) => startChapter + index
        );

        const chapterContents = await Promise.all(
            chapters.map(chapter => this.getChapterVerses(bookAbbrev, chapter, version, bookName))
        );

        return chapterContents.flat();
    }

    // Parses a passage string like "Genesis 1-3" or "Salmos 23".
    // For multi-book strings separated by "/", it uses the first segment.
    parsePassage(passage: string) {
        const primaryPassage = passage.split('/')[0].trim();
        const parts = primaryPassage.match(/^(.+?)\s+(\d+)(?:\s*[\-\u2013]\s*(\d+))?/);

        if (!parts) {
            return {
                bookName: 'Gênesis',
                bookAbbrev: 'gn',
                chapter: 1,
                startChapter: 1,
                endChapter: 1
            };
        }

        const bookName = parts[1].trim();
        const parsedStart = parseInt(parts[2], 10);
        const parsedEnd = parts[3] ? parseInt(parts[3], 10) : parsedStart;
        const startChapter = Math.min(parsedStart, parsedEnd);
        const endChapter = Math.max(parsedStart, parsedEnd);
        const chapter = startChapter;

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
            bookName,
            bookAbbrev: bookMap[bookName] || bookName.substring(0, 2).toLowerCase(),
            chapter,
            startChapter,
            endChapter
        };
    }
}
export const bibleService = new BibleService();
