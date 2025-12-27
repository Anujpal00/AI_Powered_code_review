import { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import "prismjs/themes/prism-tomorrow.css";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHightlight from 'rehype-highlight';
import "highlight.js/styles/github-dark.css";
import axios from 'axios';

// Components
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import Navigation from './components/Navigation';
import CodeReviewTab from './components/CodeReviewTab';
import CodeGenTab from './components/CodeGenTab';
import RoadmapTab from './components/RoadmapTab';
import ProgressTab from './components/ProgressTab';
import HistoryModal from './components/HistoryModal';

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
  });

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
      <AnimatedBackground />
      <div className="app-container">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="main-content">
          <Header handleLogout={handleLogout} />

          <div className="content-wrapper">
            {activeTab === 'review' && (
              <CodeReviewTab
                code={code}
                setCode={setcode}
                review={review}
                reviewCode={reviewCode}
                isLoading={isLoading}
              />
            )}
            {activeTab === 'codegen' && (
              <CodeGenTab
                problem={problem}
                setProblem={setProblem}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                chatMessages={chatMessages}
                generateCode={generateCode}
                isLoading={isLoading}
                copyToClipboard={copyToClipboard}
              />
            )}
            {activeTab === 'roadmap' && (
              <RoadmapTab
                roadmapField={roadmapField}
                setRoadmapField={setRoadmapField}
                roadmapDuration={roadmapDuration}
                setRoadmapDuration={setRoadmapDuration}
                roadmapSkillLevel={roadmapSkillLevel}
                setRoadmapSkillLevel={setRoadmapSkillLevel}
                roadmapDailyTime={roadmapDailyTime}
                setRoadmapDailyTime={setRoadmapDailyTime}
                roadmap={roadmap}
                generateRoadmap={generateRoadmap}
                isLoading={isLoading}
                roadmapProgress={roadmapProgress}
                markDayComplete={markDayComplete}
              />
            )}
            {activeTab === 'progress' && (
              <ProgressTab roadmapProgress={roadmapProgress} />
            )}
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-primary"
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 50
            }}
          >
            {showHistory ? 'Hide History' : 'View History'}
          </button>
        </div>

        <HistoryModal
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          activeTab={activeTab}
          history={history}
          codegenHistory={codegenHistory}
          deleteHistory={deleteHistory}
          copyToClipboard={copyToClipboard}
        />
      </div>
    </>
  );
}

export default App;
