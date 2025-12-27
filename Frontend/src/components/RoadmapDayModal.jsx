import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function RoadmapDayModal({ showModal, setShowModal, day, markDayComplete, isCompleted }) {
  if (!day) return null;

  return (
    <>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content roadmap-day-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center justify-between w-full">
                <h2 className="modal-title">Day {day.day}: {day.title}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="modal-close-btn"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="space-y-6">
                {/* Objectives */}
                <div className="roadmap-section">
                  <h3 className="section-title">
                    <span className="section-icon">🎯</span>
                    Objectives
                  </h3>
                  <ul className="objectives-list">
                    {day.objectives.map((obj, i) => (
                      <li key={i} className="objective-item">
                        <span className="objective-bullet">•</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Task */}
                <div className="roadmap-section">
                  <h3 className="section-title">
                    <span className="section-icon">📋</span>
                    Task
                  </h3>
                  <p className="task-description">{day.task}</p>
                </div>

                {/* Resources */}
                <div className="roadmap-section">
                  <h3 className="section-title">
                    <span className="section-icon">📚</span>
                    Resources
                  </h3>
                  <div className="resources-list">
                    {day.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        <span className="resource-icon">🔗</span>
                        {res}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Practice Questions */}
                <div className="roadmap-section">
                  <h3 className="section-title">
                    <span className="section-icon">❓</span>
                    Practice Questions
                  </h3>
                  <ul className="practice-list">
                    {day.practiceQuestions.map((q, i) => (
                      <li key={i} className="practice-item">
                        <span className="practice-number">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tip */}
                <div className="roadmap-section">
                  <h3 className="section-title">
                    <span className="section-icon">💡</span>
                    Tip
                  </h3>
                  <div className="tip-box">
                    {day.tip}
                  </div>
                </div>

                {/* Next Day Hint */}
                <div className="roadmap-section">
                  <h3 className="section-title">
                    <span className="section-icon">🔮</span>
                    Next Day Hint
                  </h3>
                  <div className="hint-box">
                    {day.nextDayHint}
                  </div>
                </div>

                {/* Action Button */}
                <div className="modal-actions">
                  <button
                    onClick={() => !isCompleted && markDayComplete(day.day)}
                    disabled={isCompleted}
                    className={`complete-btn ${isCompleted ? 'completed' : ''}`}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
