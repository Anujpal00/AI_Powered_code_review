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
const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
const token = getToken();
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function App() {
  const [authenticated, setAuthenticated] = useState(!!getToken());
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
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapField, setRoadmapField] = useState('DevOps');
  const [roadmapDuration, setRoadmapDuration] = useState('7');
  const [roadmapSkillLevel, setRoadmapSkillLevel] = useState('Beginner');
  const [roadmapDailyTime, setRoadmapDailyTime] = useState('');
  const [roadmapProgress, setRoadmapProgress] = useState(null);

  async function fetchRoadmapProgress() {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3002/ai/get-roadmap-progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoadmapProgress(response.data);
    } catch (error) {
      console.error('Error fetching roadmap progress:', error);
    }
  }

  async function markDayComplete(day) {
    try {
      const token = getToken();
      await axios.post('http://localhost:3002/ai/mark-day-complete', { day }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Day ${day} marked as complete!`);
      fetchRoadmapProgress(); // Refresh progress
    } catch (error) {
      console.error('Error marking day complete:', error);
      alert('Error marking day complete. Please try again.');
    }
  }

  useEffect(() => {
    if (authenticated && (activeTab === 'roadmap' || activeTab === 'progress')) {
      fetchRoadmapProgress();
    }
  }, [authenticated, activeTab]);

  const updateAuthHeaders = () => {
    const token = getToken();
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
      const token = getToken();
      if (!token) {
        setreview("Please log in to use the review feature.");
        setIsLoading(false);
        return;
      }
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
      if (error.response && error.response.status === 401) {
        setreview("Session expired. Please log in again.");
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setAuthenticated(false);
      } else {
        setreview("Error generating review. Please try again.");
      }
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
    sessionStorage.removeItem('token');
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
      const token = getToken();
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

  async function generateRoadmap() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await axios.post('http://localhost:3002/ai/generate-roadmap', {
        field: roadmapField,
        duration: roadmapDuration,
        skillLevel: roadmapSkillLevel,
        dailyTime: roadmapDailyTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoadmap(response.data);
      fetchRoadmapProgress(); // Load progress after generation
    } catch (error) {
      console.error('Roadmap generation failed:', error);
      alert('Error generating roadmap. Please try again.');
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
        <button className={activeTab === 'roadmap' ? 'active' : ''} onClick={() => setActiveTab('roadmap')}>Learning Roadmap</button>
        <button className={activeTab === 'progress' ? 'active' : ''} onClick={() => setActiveTab('progress')}>Progress Dashboard</button>
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
        {activeTab === 'roadmap' && (
          <>
            <div className="left">
              <div className="roadmap-form">
                <label>Field of Interest:</label>
                <select value={roadmapField} onChange={(e) => setRoadmapField(e.target.value)} style={{ marginBottom: '10px', padding: '5px', width: '100%' }}>
                  <option value="DevOps">DevOps</option>
                  <option value="Software Development">Software Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Full Stack">Full Stack</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="Game Development">Game Development</option>
                  <option value="Embedded Systems">Embedded Systems</option>
                  <option value="IoT">IoT</option>
                  <option value="Big Data">Big Data</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Deep Learning">Deep Learning</option>
                  <option value="Natural Language Processing">Natural Language Processing</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Quantum Computing">Quantum Computing</option>
                  <option value="Bioinformatics">Bioinformatics</option>
                  <option value="Geospatial Analysis">Geospatial Analysis</option>
                  <option value="Augmented Reality">Augmented Reality</option>
                  <option value="Virtual Reality">Virtual Reality</option>
                  <option value="UX/UI Design">UX/UI Design</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Agile/Scrum">Agile/Scrum</option>
                  <option value="System Administration">System Administration</option>
                  <option value="Network Engineering">Network Engineering</option>
                  <option value="Database Administration">Database Administration</option>
                  <option value="Web Development">Web Development</option>
                  <option value="API Development">API Development</option>
                  <option value="Microservices">Microservices</option>
                  <option value="Serverless">Serverless</option>
                  <option value="Containerization">Containerization</option>
                  <option value="Kubernetes">Kubernetes</option>
                  <option value="Docker">Docker</option>
                  <option value="CI/CD">CI/CD</option>
                  <option value="Testing">Testing</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Performance Optimization">Performance Optimization</option>
                  <option value="Security">Security</option>
                  <option value="Cryptography">Cryptography</option>
                  <option value="Ethical Hacking">Ethical Hacking</option>
                  <option value="Penetration Testing">Penetration Testing</option>
                  <option value="Forensics">Forensics</option>
                  <option value="Compliance">Compliance</option>
                  <option value="GDPR">GDPR</option>
                  <option value="HIPAA">HIPAA</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Supply Chain">Supply Chain</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Legal">Legal</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Startup">Startup</option>
                  <option value="Innovation">Innovation</option>
                  <option value="Research">Research</option>
                  <option value="Academia">Academia</option>
                  <option value="Teaching">Teaching</option>
                  <option value="Mentoring">Mentoring</option>
                  <option value="Coaching">Coaching</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Management">Management</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Risk Management">Risk Management</option>
                  <option value="Change Management">Change Management</option>
                  <option value="Communication">Communication</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Conflict Resolution">Conflict Resolution</option>
                  <option value="Team Building">Team Building</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Remote Work">Remote Work</option>
                  <option value="Work-Life Balance">Work-Life Balance</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Career Development">Career Development</option>
                  <option value="Skill Development">Skill Development</option>
                  <option value="Learning">Learning</option>
                  <option value="Education Technology">Education Technology</option>
                  <option value="Online Learning">Online Learning</option>
                  <option value="MOOCs">MOOCs</option>
                  <option value="Certification">Certification</option>
                  <option value="Bootcamps">Bootcamps</option>
                  <option value="Coding Bootcamps">Coding Bootcamps</option>
                  <option value="Data Bootcamps">Data Bootcamps</option>
                  <option value="Design Bootcamps">Design Bootcamps</option>
                  <option value="Business Bootcamps">Business Bootcamps</option>
                  <option value="Other">Other</option>
                </select>
                <label>Duration:</label>
                <select value={roadmapDuration} onChange={(e) => setRoadmapDuration(e.target.value)} style={{ marginBottom: '10px', padding: '5px', width: '100%' }}>
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                </select>
                <label>Skill Level:</label>
                <select value={roadmapSkillLevel} onChange={(e) => setRoadmapSkillLevel(e.target.value)} style={{ marginBottom: '10px', padding: '5px', width: '100%' }}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <label>Daily Available Time (optional):</label>
                <input type="text" placeholder="e.g., 2 hours" value={roadmapDailyTime} onChange={(e) => setRoadmapDailyTime(e.target.value)} style={{ marginBottom: '10px', padding: '5px', width: '100%' }} />
                <button onClick={generateRoadmap} disabled={isLoading} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', width: '100%' }}>
                  {isLoading ? 'Generating...' : 'Generate Roadmap'}
                </button>
              </div>
            </div>
            <div className="right">
              {roadmap ? (
                <div className="roadmap-display">
                  <h2>{roadmap.totalDays} Days - {roadmap.field} ({roadmap.skillLevel})</h2>
                  {roadmap.map((day) => {
                    const isCompleted = roadmapProgress && roadmapProgress.completedDays && roadmapProgress.completedDays.includes(day.day);
                    return (
                      <div key={day.day} className="day">
                        <h3>Day {day.day}: {day.title}</h3>
                        <p><strong>Objectives:</strong></p>
                        <ul>
                          {day.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                        </ul>
                        <p><strong>Task:</strong> {day.task}</p>
                        <p><strong>Resources:</strong></p>
                        <ul>
                          {day.resources.map((res, i) => <li key={i}><a href={res} target="_blank" rel="noopener noreferrer">{res}</a></li>)}
                        </ul>
                        <p><strong>Practice Questions:</strong></p>
                        <ul>
                          {day.practiceQuestions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                        <p><strong>Tip:</strong> {day.tip}</p>
                        <p><strong>Next Day Hint:</strong> {day.nextDayHint}</p>
                        <button onClick={() => !isCompleted && markDayComplete(day.day)} disabled={isCompleted}>
                          {isCompleted ? 'Completed' : 'Mark as Complete'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>Select options and generate your personalized learning roadmap.</p>
              )}
            </div>
          </>
        )}
        {activeTab === 'progress' && (
          <div className="right">
            {roadmapProgress && roadmapProgress.completedDays ? (
              <div className="progress-dashboard">
                <h2>Roadmap Progress</h2>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(roadmapProgress.completedDays.length / roadmapProgress.totalDays) * 100}%` }}></div>
                </div>
                <p>{roadmapProgress.completedDays.length} / {roadmapProgress.totalDays} days completed</p>
                <div className="completed-days-list">
                  <h3>Completed Days</h3>
                  <ul>
                    {roadmapProgress.completedDays.map(day => (
                      <li key={day}>Day {day}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p>No roadmap progress available. Generate a roadmap first.</p>
            )}
          </div>
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
