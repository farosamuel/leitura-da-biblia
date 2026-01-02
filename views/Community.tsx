
import React from 'react';
import { MOCK_POSTS, MOCK_USER, IMAGES } from '../constants';

const Community: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Side Profile Info */}
      <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <img src={MOCK_USER.avatar} alt="Profile" className="size-24 rounded-full ring-4 ring-primary-light dark:ring-primary/20 object-cover" />
            <div className="absolute bottom-1 right-1 size-5 bg-green-500 border-4 border-white dark:border-zinc-900 rounded-full" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{MOCK_USER.name}</h3>
          <p className="text-slate-500 text-sm mb-6">Leitor Dedicado</p>
          <div className="w-full grid grid-cols-2 gap-3 mb-6">
            <div className="bg-primary-light dark:bg-primary/10 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-2xl font-black text-primary">{MOCK_USER.streak}</span>
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Dias</span>
            </div>
            <div className="bg-primary-light dark:bg-primary/10 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-2xl font-black text-primary">{MOCK_USER.progress}%</span>
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Meta</span>
            </div>
          </div>
          <button className="text-sm font-bold text-primary hover:underline">Ver Perfil Completo</button>
        </div>

        <div className="bg-primary text-white rounded-3xl p-8 shadow-xl shadow-red-200 dark:shadow-none relative overflow-hidden group">
          <span className="material-symbols-outlined absolute -right-4 -top-4 text-[120px] opacity-10">groups</span>
          <h3 className="text-xl font-black mb-2 relative z-10">Convide Amigos</h3>
          <p className="text-white/80 text-sm mb-6 relative z-10 leading-relaxed">Ler em grupo é muito melhor. Traga seus amigos para o desafio da leitura anual!</p>
          <button className="bg-white text-primary text-sm font-bold py-3 px-6 rounded-2xl w-full hover:bg-slate-50 transition-colors relative z-10">Copiar Link de Convite</button>
        </div>
      </aside>

      {/* Main Feed */}
      <section className="col-span-1 lg:col-span-6 space-y-6">
        {/* Composer */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
          <div className="flex gap-4">
            <img src={MOCK_USER.avatar} className="size-12 rounded-full hidden sm:block" alt="Me" />
            <div className="flex-1 flex flex-col gap-4">
              <textarea 
                className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl p-5 text-base resize-none focus:ring-1 focus:ring-primary/20 min-h-[120px] placeholder:text-slate-400"
                placeholder="O que você aprendeu com a leitura de hoje?"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                    <span className="material-symbols-outlined">image</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                    <span className="material-symbols-outlined">bookmark</span>
                  </button>
                </div>
                <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-8 rounded-2xl shadow-lg shadow-red-100 dark:shadow-none transition-all active:scale-95">Postar</button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {['Feed Geral', 'Discussões', 'Dúvidas', 'Testemunhos'].map((f, i) => (
            <button key={f} className={`shrink-0 h-10 px-6 rounded-full text-sm font-bold transition-all ${i === 0 ? 'bg-zinc-950 text-white' : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Posts */}
        {MOCK_POSTS.map(post => (
          <article key={post.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img src={post.user.avatar} className="size-12 rounded-full object-cover" alt={post.user.name} />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white hover:underline cursor-pointer">{post.user.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">{post.category}</span>
                    <span className="text-xs text-slate-400">{post.timestamp}</span>
                  </div>
                </div>
              </div>
              <button className="text-slate-300 hover:text-slate-600">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-16 sm:pl-0">
              {post.content}
            </p>

            {post.image && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 h-64 relative group">
                <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Post attachment" />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-xs font-bold px-2">Anexo Geográfico: Antiga Mesopotâmia</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 border-t border-slate-50 dark:border-zinc-800/50 pt-4 mt-2">
              <button className="flex items-center gap-2 group">
                <span className="material-symbols-outlined text-[20px] text-primary transition-transform group-hover:scale-125 font-filled">favorite</span>
                <span className="text-sm font-bold text-primary">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-125">mode_comment</span>
                <span className="text-sm font-bold">{post.comments}</span>
              </button>
              <button className="ml-auto text-slate-300 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Right Column Widget */}
      <aside className="col-span-1 lg:col-span-3 space-y-6 lg:sticky lg:top-24">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">trophy</span>
              Ranking
            </h3>
            <span className="text-[10px] font-black text-primary/60 bg-primary/10 px-2 py-1 rounded uppercase tracking-widest">Semanal</span>
          </div>
          <div className="space-y-6">
            {[
              { name: 'Ana Clara', prog: 98, avatar: IMAGES.FRIEND_1, rank: 1, ring: 'ring-yellow-400' },
              { name: 'Carlos E.', prog: 92, avatar: IMAGES.FRIEND_2, rank: 2, ring: 'ring-slate-200' },
              { name: 'Sarah J.', prog: 85, avatar: IMAGES.FRIEND_3, rank: 3, ring: 'ring-orange-300' }
            ].map(user => (
              <div key={user.rank} className="flex items-center gap-4">
                <div className="font-black text-primary w-4 text-center">{user.rank}</div>
                <img src={user.avatar} className={`size-10 rounded-full ring-2 ${user.ring} object-cover`} alt={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${user.prog}%` }} />
                  </div>
                </div>
                <span className="text-[10px] font-black text-primary">{user.prog}%</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-xs font-black text-slate-400 hover:text-primary transition-colors tracking-widest">VER RANKING COMPLETO</button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
          <h3 className="font-black text-lg text-slate-900 dark:text-white mb-6">Tópicos em Alta</h3>
          <div className="flex flex-wrap gap-2">
            {['#Gênesis', '#Fé', '#Desafio', '#VelhoTestamento', '#Oração'].map(tag => (
              <a key={tag} href="#" className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                {tag}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Community;
