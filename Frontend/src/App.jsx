import { useState , useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import "prismjs/themes/prism-tomorrow.css";
import prism from "prismjs";
import Editor from "react-simple-code-editor";
import './App.css';
import axios from 'axios';
import Markdown from "react-markdown";
import rehypeHightlight from 'rehype-highlight';
import "highlight.js/styles/github-dark.css";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Set axios default headers
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function App() {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState('review');
  const [code, setcode] = useState(`function sum(){
    return 1+1}`);
  const [review, setreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [codegenHistory, setCodegenHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [problem, setProblem] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const updateAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    updateAuthHeaders();
  }, []);

  useEffect(() => {
    prism.highlightAll();
  });

  async function reviewCode() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3002/ai/get-review', { code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setreview(response.data.review);
      // Add to history
      await axios.post('http://localhost:3002/api/history/add', {
        codeSnippet: code,
        issues: response.data.issues,
        suggestions: response.data.suggestions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error('Review failed:', error);
      setreview("Error generating review. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchHistory() {
    const res = await axios.get('http://localhost:3002/api/history');
    setHistory(res.data);
    setCodegenHistory(res.data.filter(item => item.type === 'codegen'));
  }

  async function deleteHistory(index) {
    await axios.delete(`http://localhost:3002/api/history/${index}`);
    fetchHistory(); // Refresh
  }

  useEffect(() => {
    if (authenticated) {
      fetchHistory();
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <>
        {showSignup ? (
          <Signup onSignup={() => setShowSignup(false)} onToggleLogin={() => setShowSignup(false)} />
        ) : (
          <Login onLogin={() => {
            updateAuthHeaders();
            setAuthenticated(true);
          }} onToggleSignup={() => setShowSignup(true)} />
        )}
      </>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setAuthenticated(false);
    setHistory([]);
    setCodegenHistory([]);
    setChatMessages([]);
  };

  async function generateCode() {
    if (isLoading || !problem.trim()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3002/ai/generate-code', { problem, language: selectedLanguage }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newMessage = { role: 'assistant', content: response.data.explanation, code: response.data.code, language: selectedLanguage };
      setChatMessages(prev => [...prev, { role: 'user', content: problem }, newMessage]);
      // Add to history
      await axios.post('http://localhost:3002/api/history/add', {
        type: 'codegen',
        query: problem,
        language: selectedLanguage,
        generatedCode: response.data.code,
        explanation: response.data.explanation
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh history
      fetchHistory();
      setProblem('');
    } catch (error) {
      console.error('Code generation failed:', error);
      setChatMessages(prev => [...prev, { role: 'user', content: problem }, { role: 'assistant', content: 'Error generating code. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
        <h1>AI Code Review Bot</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <div className="tabs">
        <button className={activeTab === 'review' ? 'active' : ''} onClick={() => setActiveTab('review')}>Code Review</button>
        <button className={activeTab === 'codegen' ? 'active' : ''} onClick={() => setActiveTab('codegen')}>Code Chatbot</button>
      </div>
      <main>
        {activeTab === 'review' && (
          <>
            <div className="left">
              <div className="code">
                <Editor
                  value={code}
                  onValueChange={code => setcode(code)}
                  highlight={code => prism.highlight(code, prism.languages.javascript, 'javascript')}
                  padding={10}
                  style={{
                    fontSize: 16,
                    fontFamily: '"Fira Code","Fira Mono", monospace',
                    width: '100%',
                    height: '100%',
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                />
              </div>
              <div onClick={reviewCode} className="review">{isLoading ? 'Reviewing...' : 'Review'}</div>
            </div>
            <div className="right">
              <Markdown rehypePlugins={[rehypeHightlight]}>{review}</Markdown>
            </div>
          </>
        )}
        {activeTab === 'codegen' && (
          <>
            <div className="left">
              <div className="codegen-form">
                <textarea
                  placeholder="Describe the code you want to generate..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={5}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ marginTop: '10px', padding: '5px' }}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="swift">Swift</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="typescript">TypeScript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="bash">Bash</option>
                  <option value="r">R</option>
                  <option value="scala">Scala</option>
                  <option value="perl">Perl</option>
                  <option value="lua">Lua</option>
                  <option value="dart">Dart</option>
                  <option value="haskell">Haskell</option>
                  <option value="clojure">Clojure</option>
                  <option value="erlang">Erlang</option>
                  <option value="elixir">Elixir</option>
                  <option value="fsharp">F#</option>
                  <option value="vbnet">VB.NET</option>
                  <option value="matlab">MATLAB</option>
                  <option value="objectivec">Objective-C</option>
                  <option value="assembly">Assembly</option>
                  <option value="fortran">Fortran</option>
                  <option value="cobol">COBOL</option>
                  <option value="pascal">Pascal</option>
                  <option value="ada">Ada</option>
                  <option value="prolog">Prolog</option>
                  <option value="scheme">Scheme</option>
                  <option value="smalltalk">Smalltalk</option>
                  <option value="tcl">Tcl</option>
                  <option value="verilog">Verilog</option>
                  <option value="vhdl">VHDL</option>
                  <option value="other">Other</option>
                </select>
                <button onClick={generateCode} disabled={isLoading} style={{ marginTop: '10px', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
                  {isLoading ? 'Generating...' : 'Generate Code'}
                </button>
              </div>
            </div>
            <div className="right">
              <div className="chat">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    {msg.role === 'user' && <p><strong>You:</strong> {msg.content}</p>}
                    {msg.role === 'assistant' && (
                      <>
                        <p><strong>Assistant:</strong> {msg.content}</p>
                        {msg.code && (
                          <div className="code-block">
                            <SyntaxHighlighter language={msg.language} style={oneDark}>
                              {msg.code}
                            </SyntaxHighlighter>
                            <button onClick={() => copyToClipboard(msg.code)} className="copy-btn">Copy Code</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      <div style={{ textAlign: 'center', margin: '1rem' }}>
        <button onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>
      {showHistory && (
        <section className="history">
          <h2>{activeTab === 'review' ? 'Review History' : 'Code Generation History'}</h2>
          {(activeTab === 'review' ? history.filter(item => item.type !== 'codegen') : codegenHistory).length === 0 ? <p>No history yet.</p> : (activeTab === 'review' ? history.filter(item => item.type !== 'codegen') : codegenHistory).map((item, index) => (
            <div key={index} className="history-item">
              {item.type === 'review' ? (
                <>
                  <pre>{item.codeSnippet}</pre>
                  <h3>Issues:</h3>
                  <ul>{item.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
                  <h3>Suggestions:</h3>
                  <ul>{item.suggestions.map((sug, i) => <li key={i}>{sug}</li>)}</ul>
                </>
              ) : (
                <>
                  <p><strong>Query:</strong> {item.query}</p>
                  <p><strong>Language:</strong> {item.language}</p>
                  <div className="code-block">
                    <SyntaxHighlighter language={item.language} style={oneDark}>
                      {item.generatedCode}
                    </SyntaxHighlighter>
                    <button onClick={() => copyToClipboard(item.generatedCode)} className="copy-btn">Copy Code</button>
                  </div>
                  <p><strong>Explanation:</strong> {item.explanation}</p>
                </>
              )}
              <p>{new Date(item.timestamp).toLocaleString()}</p>
              <button onClick={() => deleteHistory(index)}>Delete</button>
            </div>
          ))}
        </section>
      )}
    </>
  );
}



export default App
