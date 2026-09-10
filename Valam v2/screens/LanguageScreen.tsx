import { useApp } from '../context';
import { Language } from '../types';
import valamLogo from '../imports/WhatsApp_Image_2026-09-10_at_12.25.49_AM.jpeg';
import { applyGooglePageTranslation } from '../googleTranslate';

const LANGUAGES: { code: Language; native: string; english: string; script: string; desc: string }[] = [
  { code: 'en', native: 'English', english: 'English', script: 'Aa', desc: 'Default language' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', script: 'அ', desc: 'தமிழ்நாடு' },
  { code: 'hi', native: 'हिंदी', english: 'Hindi', script: 'अ', desc: 'भारत की भाषा' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu', script: 'అ', desc: 'భారత భాష' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada', script: 'ಅ', desc: 'ಭಾರತದ ಭಾಷೆ' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam', script: 'അ', desc: 'ഇന്ത്യയുടെ ഭാഷ' },
];

export default function LanguageScreen() {
  const { language, setLanguage, navigate } = useApp();

  const handleSelect = async (lang: Language) => {
    await setLanguage(lang);
    if (lang === language) navigate('auth');
    else applyGooglePageTranslation(lang);
  };

  return (
    <div className="min-h-full bg-background flex flex-col">
      {/* Hero */}
      <div className="bg-primary text-white px-6 pt-16 pb-12 text-center">
        <div className="w-16 h-16 rounded-[20px] overflow-hidden mx-auto mb-4">
          <img src={valamLogo} alt="VALAM" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-black font-display mb-1">VALAM</h1>
        <p className="text-white/75 text-sm">Your Smart Farming Companion</p>
      </div>

      {/* Language selection */}
      <div className="flex-1 px-5 pt-8 pb-6 flex flex-col gap-4 max-w-sm mx-auto w-full">
        <h2 className="text-lg font-bold text-text text-center mb-2">Choose your language<br /><span className="text-muted text-base font-normal">மொழியை தேர்ந்தெடுக்கவும் / भाषा चुनें / మీ భాషను ఎంచుకోండి</span></h2>

        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`w-full flex items-center gap-4 p-4 rounded-[18px] border-2 transition-all active:scale-[0.98] ${
              language === lang.code
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-white hover:border-primary/40'
            }`}
          >
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center font-black text-2xl flex-shrink-0 ${
              language === lang.code ? 'bg-primary text-white' : 'bg-surface-2 text-text'
            }`}>
              {lang.script}
            </div>
            <div className="text-left flex-1">
              <div className="font-bold text-text text-base">{lang.native}</div>
              <div className="text-muted text-xs">{lang.english} · {lang.desc}</div>
            </div>
            {language === lang.code && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            )}
          </button>
        ))}

        <button
          onClick={() => handleSelect(language)}
          className="mt-4 w-full bg-primary text-white font-bold py-3.5 rounded-[16px] text-base min-h-[52px] hover:bg-primary-dark transition-all active:scale-[0.98] shadow-sm"
        >
          {language === 'en' ? 'Continue in English' : language === 'ta' ? 'தமிழில் தொடர்' : language === 'hi' ? 'हिंदी में जारी रखें' : language === 'te' ? 'తెలుగులో కొనసాగించండి' : language === 'kn' ? 'ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ' : 'മലയാളത്തിൽ തുടരുക'}
        </button>
      </div>
    </div>
  );
}
