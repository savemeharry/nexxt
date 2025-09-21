import React from 'react';

interface LoginOverlayProps {
  onGoogleSignIn: () => void;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ onGoogleSignIn }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 rockstar:bg-black">
      <div className="relative w-full max-w-md mx-auto px-6">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md shadow-2xl p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-logo text-transparent bg-clip-text bg-gradient-to-r from-rockstar-400 to-rockstar-purple tracking-wider">nexxt</span>
              <span className="text-sm px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">Pro Business Copilot</span>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Вход через Google</h1>
            <button
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 mt-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.23 3.6l6.9-6.9C35.9 2.6 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.05 6.25C12.31 13.58 17.67 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.2-.44-4.7H24v9h12.7c-.55 2.97-2.2 5.49-4.7 7.19l7.18 5.57C43.6 37.35 46.5 31.4 46.5 24.5z"/>
                <path fill="#FBBC05" d="M10.61 28.47c-.5-1.48-.78-3.06-.78-4.72s.28-3.24.78-4.72l-8.05-6.25C1.02 15.68 0 19.71 0 23.75S1.02 31.82 2.56 36.21l8.05-6.25z"/>
                <path fill="#34A853" d="M24 47.5c6.48 0 11.93-2.13 15.9-5.78l-7.18-5.57c-2 1.35-4.58 2.15-8.72 2.15-6.33 0-11.69-4.08-13.39-9.97l-8.05 6.25C6.51 42.62 14.62 47.5 24 47.5z"/>
              </svg>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Войти</span>
            </button>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-500 mt-2 leading-snug">
              Нажимая «Войти», вы подтверждаете участие в раннем тестировании и даёте согласие на сбор ограниченных диагностических данных и метрик использования, необходимых для улучшения приложения. По поводу регистрации на тестирование свяжитесь с 
              <a
                href="https://t.me/savemeharry"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 font-medium text-transparent bg-clip-text bg-gradient-to-r from-rockstar-400 to-rockstar-purple underline underline-offset-2"
              >
                t.me/savemeharry
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginOverlay;


