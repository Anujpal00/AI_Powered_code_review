import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeGenTab({
  problem,
  setProblem,
  selectedLanguage,
  setSelectedLanguage,
  chatMessages,
  generateCode,
  isLoading,
  copyToClipboard
}) {
  const languages = [
    'javascript', 'python', 'java', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust', 'swift',
    'kotlin', 'typescript', 'html', 'css', 'sql', 'bash', 'r', 'scala', 'perl', 'lua',
    'dart', 'haskell', 'clojure', 'erlang', 'elixir', 'fsharp', 'vbnet', 'matlab',
    'objectivec', 'assembly', 'fortran', 'cobol', 'pascal', 'ada', 'prolog', 'scheme',
    'smalltalk', 'tcl', 'verilog', 'vhdl', 'other'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <div className="card animate-fade-in">
        <h3 className="card-title">Code Generation</h3>
        <div className="space-y-4">
          <textarea
            placeholder="Describe the code you want to generate..."
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={6}
            className="form-textarea"
          />

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="form-select"
          >
            {languages.map(lang => (
              <option key={lang} value={lang} style={{ backgroundColor: 'var(--bg-secondary)' }}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={generateCode}
            disabled={isLoading || !problem.trim()}
            className="btn btn-primary w-full"
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Generate Code'
            )}
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="card animate-slide-in">
        <h3 className="card-title">AI Assistant</h3>
        <div className="h-[500px] overflow-y-auto space-y-4 p-2">
          {chatMessages.length === 0 ? (
            <p className="text-gray-400 italic text-center animate-pulse">
              Start a conversation by describing what code you need...
            </p>
          ) : (
            chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg animate-fade-in ${
                  msg.role === 'user'
                    ? 'bg-neon-purple/20 border-l-4 border-neon-purple ml-4'
                    : 'bg-primary-700/50 border-l-4 border-neon-cyan mr-4'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {msg.role === 'user' && (
                  <p className="text-white mb-2">
                    <strong className="text-neon-purple">You:</strong> {msg.content}
                  </p>
                )}
                {msg.role === 'assistant' && (
                  <>
                    <p className="text-white mb-2">
                      <strong className="text-neon-cyan">Assistant:</strong> {msg.content}
                    </p>
                    {msg.code && (
                      <div className="relative mt-4">
                        <SyntaxHighlighter
                          language={msg.language}
                          style={oneDark}
                          className="rounded-lg"
                        >
                          {msg.code}
                        </SyntaxHighlighter>
                        <button
                          onClick={() => copyToClipboard(msg.code)}
                          className="copy-btn"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
