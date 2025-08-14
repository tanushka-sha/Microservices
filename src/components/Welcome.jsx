export default function Welcome({ userName = 'Ethan', toolName = 'AI Studio', tagline = "We couldn't create this, this, this in this AI tool.", onClickPrompt, onClickImage }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-200/60 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-3xl text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">Welcome to {toolName}!</h1>
        <p className="text-xl sm:text-2xl text-slate-900/90">Hi, {userName} <span aria-hidden>👋</span></p>
        <p className="text-slate-600 max-w-2xl mx-auto">{tagline}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2">
          <button
            onClick={onClickPrompt}
            className="w-full sm:w-64 rounded-xl bg-blue-600 text-white px-6 py-3 text-base sm:text-lg font-medium shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Prompt
          </button>
          <button
            onClick={onClickImage}
            className="w-full sm:w-64 rounded-xl bg-slate-200 text-slate-900 px-6 py-3 text-base sm:text-lg font-medium shadow-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Text to Image Generation
          </button>
        </div>

        <p className="pt-4 text-slate-700 text-sm sm:text-base">
          <strong>Expert in</strong> text or image generation
        </p>
      </div>
    </div>
  )
}


