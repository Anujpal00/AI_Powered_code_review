import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function HistoryModal({ showHistory, setShowHistory, activeTab, history, codegenHistory, deleteHistory, copyToClipboard }) {
  const currentHistory = activeTab === 'review' ? history.filter(item => item.type !== 'codegen') : codegenHistory;

  return (
    <>
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {activeTab === 'review' ? 'Review History' : 'Code Generation History'}
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {currentHistory.length === 0 ? (
                <p className="text-gray-400 italic text-center animate-pulse">
                  No history yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {currentHistory.map((item, index) => (
                    <div
                      key={index}
                      className="history-item"
                    >
                      {item.type === 'review' ? (
                        <>
                          <div className="mb-4">
                            <h3 className="font-bold text-neon-purple mb-2">Code Snippet:</h3>
                            <pre className="bg-primary-800 p-3 rounded text-sm overflow-x-auto text-gray-300">
                              {item.codeSnippet}
                            </pre>
                          </div>

                          <div className="mb-4">
                            <h3 className="font-bold text-neon-cyan mb-2">Issues:</h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                              {item.issues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="mb-4">
                            <h3 className="font-bold text-neon-cyan mb-2">Suggestions:</h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                              {item.suggestions.map((sug, i) => (
                                <li key={i}>{sug}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-4">
                            <h3 className="font-bold text-neon-purple mb-2">Query:</h3>
                            <p className="text-gray-300">{item.query}</p>
                          </div>

                          <div className="mb-4">
                            <h3 className="font-bold text-neon-cyan mb-2">Language:</h3>
                            <span className="bg-neon-purple/20 text-neon-purple px-2 py-1 rounded text-sm">
                              {item.language}
                            </span>
                          </div>

                          <div className="mb-4">
                            <h3 className="font-bold text-neon-cyan mb-2">Generated Code:</h3>
                            <div className="relative">
                              <SyntaxHighlighter
                                language={item.language}
                                style={oneDark}
                                className="rounded-lg text-sm"
                              >
                                {item.generatedCode}
                              </SyntaxHighlighter>
                              <button
                                onClick={() => copyToClipboard(item.generatedCode)}
                                className="copy-btn"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h3 className="font-bold text-neon-cyan mb-2">Explanation:</h3>
                            <p className="text-gray-300">{item.explanation}</p>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
                        <span className="text-sm text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <button
                          onClick={() => deleteHistory(index)}
                          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
