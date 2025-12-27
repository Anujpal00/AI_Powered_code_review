import { useState } from 'react';
import Editor from 'react-simple-code-editor';
import prism from 'prismjs';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import '../styles/github-dark.css';

export default function CodeReviewTab({ code, setCode, review, reviewCode, isLoading }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Code Editor */}
      <div className="card animate-fade-in">
        <h3 className="card-title">Code Editor</h3>
        <div className="relative">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(code) =>
              prism.highlight(code, prism.languages.javascript, 'javascript')
            }
            padding={15}
            className="form-textarea min-h-[400px]"
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={reviewCode}
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem'
            }}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Review Code'
            )}
          </button>
        </div>
      </div>

      {/* Review Results */}
      <div className="card animate-slide-in">
        <h3 className="card-title">AI Review</h3>
        <div className="prose prose-invert max-w-none">
          {review ? (
            <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
          ) : (
            <p className="text-gray-400 italic animate-pulse">
              Paste your code and click "Review Code" to get AI-powered feedback...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
