import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface text-foreground">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-emerald-500 animate-[spin_10s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold font-sans text-gray-900 mb-2 tracking-tight">Settings Workspace</h1>
        <p className="text-emerald-600 font-medium text-sm mb-6 uppercase tracking-wider">Under Construction</p>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          The central settings panel is currently being built. Soon, you will be able to customize translations, change visual themes, and swap high-quality recitation audio right from here!
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl shadow-lg shadow-primary/30 hover:bg-emerald-600 hover:shadow-emerald-600/30 transition-all hover:-translate-y-1"
        >
          Return to Mushaf
        </Link>
      </div>
    </div>
  );
}
