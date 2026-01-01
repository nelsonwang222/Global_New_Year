
import React, { useState, useEffect } from 'react';
import { LANGUAGES } from './constants';
import { generatePostTemplate, editPostTemplate } from './services/geminiService';

// The 'aistudio' object is provided globally by the environment.
// We remove the manual 'declare global' to avoid conflicts with existing definitions.

const App: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [location, setLocation] = useState<string>('');
  const [culturalInfo, setCulturalInfo] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Cast window to any to access aistudio which is injected by the platform
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // Cast window to any to access aistudio which is injected by the platform
    await (window as any).aistudio.openSelectKey();
    // Proceed assuming selection was successful to mitigate race conditions
    setHasApiKey(true);
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
      setError("Please select a valid API key first.");
      return;
    }
    if (!location) {
      setError("Please specify a location to help the AI identify cultural symbols.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const languageObj = LANGUAGES.find(l => l.code === selectedLang);
      const languageName = languageObj ? languageObj.name : 'English';
      const base64 = await generatePostTemplate(languageName, location, culturalInfo);
      setGeneratedImage(base64);
    } catch (err: any) {
      console.error(err);
      // Handle key expiration or invalidity as per guidelines
      if (err.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setError("Your API key session might have expired or is invalid. Please select it again.");
      } else {
        setError("Failed to generate template. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!generatedImage || !editPrompt) return;
    setError(null);
    setIsEditing(true);
    try {
      const base64 = await editPostTemplate(generatedImage, editPrompt);
      setGeneratedImage(base64);
      setEditPrompt('');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setError("Your API key session might have expired or is invalid. Please select it again.");
      } else {
        setError("Failed to edit template. Please try again.");
      }
    } finally {
      setIsEditing(false);
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Gemini Pro Activation</h2>
          <p className="text-slate-600 mb-8">
            This high-quality image generator uses Gemini 3 Pro. To continue, please select a paid API key from your Google Cloud project.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg instagram-gradient hover:opacity-90 transition-all mb-4"
          >
            Select API Key
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            Learn about API billing
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <div className="inline-block p-2 px-4 rounded-full bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-widest mb-4">
          Powered by Gemini 3 Pro
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
          Global <span className="text-transparent bg-clip-text instagram-gradient">New Year</span> 
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Create premium Instagram templates with the message "Wishing you a happy new year" 
          in any of the world's top 100+ languages.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Controls */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
          <section className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">1. Choose Language</label>
              <select 
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.native})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">2. Where are you located?</label>
              <input 
                type="text" 
                placeholder="City or Country (e.g., Hong Kong, Taipei, London)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">3. Cultural Symbols (Optional)</label>
              <textarea 
                placeholder="Mention specific elements like 'Red envelopes', 'Orchid flowers', or 'Lanterns'..."
                value={culturalInfo}
                onChange={(e) => setCulturalInfo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all h-24 resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-2 italic">
                The AI will automatically include symbols based on your language/location if left blank.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg instagram-gradient hover:opacity-90 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Designing in High Quality...
                </span>
              ) : 'Generate Template'}
            </button>
          </section>

          {generatedImage && (
            <section className="mt-10 pt-8 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">✨</span> Refine with Pro AI
              </h3>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder='e.g. "Add more gold accents", "Change font style"...'
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button 
                  onClick={handleEdit}
                  disabled={isEditing || !editPrompt}
                  className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {isEditing ? 'Editing...' : 'Apply Pro Edits'}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="flex flex-col items-center justify-center lg:sticky lg:top-8">
          <div className="w-full max-w-[450px] aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden relative group border border-slate-100">
            {generatedImage ? (
              <>
                <img 
                  src={`data:image/png;base64,${generatedImage}`} 
                  alt="New Year Template" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <a 
                    href={`data:image/png;base64,${generatedImage}`}
                    download="new-year-wish.png"
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                   >
                     Download Post
                   </a>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center bg-slate-50">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <p className="font-semibold text-slate-600 text-lg">Pro Preview Canvas</p>
                <p className="text-sm mt-2 text-slate-400">Experience superior quality with Gemini 3 Pro.</p>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="inline-block animate-bounce mb-2 text-4xl">🎆</div>
                  <div className="font-bold text-slate-800 text-xl">High-Res Rendering...</div>
                  <p className="text-sm text-slate-500 mt-2">Gemini 3 Pro is processing your vision</p>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="text-center text-white">
                  <div className="inline-block animate-pulse mb-2 text-4xl">🪄</div>
                  <div className="font-bold text-xl">Applying Pro Refinements...</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-8 w-full max-w-[450px]">
            <div className="text-center">
              <span className="block text-2xl font-bold text-slate-800">3.0</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Pro Model</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-slate-800">1:1</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Insta Ratio</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-slate-800">1K</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Resolution</span>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-20 py-10 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} Global New Year Post Generator.</p>
        <div className="mt-4">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600"
          >
            Billing Requirements
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
