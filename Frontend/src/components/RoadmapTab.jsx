import { useState } from 'react';
import { motion } from 'framer-motion';
import RoadmapDayModal from './RoadmapDayModal';

export default function RoadmapTab({
  roadmapField,
  setRoadmapField,
  roadmapDuration,
  setRoadmapDuration,
  roadmapSkillLevel,
  setRoadmapSkillLevel,
  roadmapDailyTime,
  setRoadmapDailyTime,
  roadmap,
  generateRoadmap,
  isLoading,
  roadmapProgress,
  markDayComplete
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (day) => {
    // Check if previous day is completed (unless it's day 1)
    if (day.day > 1) {
      const previousDayCompleted = roadmapProgress && roadmapProgress.completedDays &&
        roadmapProgress.completedDays.includes(day.day - 1);
      if (!previousDayCompleted) {
        // Could add a toast notification here, but for now just prevent click
        return;
      }
    }
    setSelectedDay(day);
    setShowModal(true);
  };

  const isDayClickable = (day) => {
    // Day 1 is always clickable
    if (day.day === 1) return true;
    // Other days are clickable only if previous day is completed
    return roadmapProgress && roadmapProgress.completedDays &&
      roadmapProgress.completedDays.includes(day.day - 1);
  };

  const fields = [
    'DevOps', 'Software Development', 'AI/ML', 'Frontend', 'Backend', 'Data Science',
    'Full Stack', 'Mobile Development', 'Cybersecurity', 'Cloud Computing', 'Blockchain',
    'Game Development', 'Embedded Systems', 'IoT', 'Big Data', 'Machine Learning',
    'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Robotics',
    'Quantum Computing', 'Bioinformatics', 'Geospatial Analysis', 'Augmented Reality',
    'Virtual Reality', 'UX/UI Design', 'Product Management', 'Agile/Scrum',
    'System Administration', 'Network Engineering', 'Database Administration',
    'Web Development', 'API Development', 'Microservices', 'Serverless', 'Containerization',
    'Kubernetes', 'Docker', 'CI/CD', 'Testing', 'Quality Assurance', 'Performance Optimization',
    'Security', 'Cryptography', 'Ethical Hacking', 'Penetration Testing', 'Forensics',
    'Compliance', 'GDPR', 'HIPAA', 'Finance', 'Healthcare', 'Education', 'E-commerce',
    'Marketing', 'Sales', 'HR', 'Operations', 'Supply Chain', 'Logistics', 'Real Estate',
    'Legal', 'Consulting', 'Entrepreneurship', 'Startup', 'Innovation', 'Research',
    'Academia', 'Teaching', 'Mentoring', 'Coaching', 'Leadership', 'Management',
    'Project Management', 'Risk Management', 'Change Management', 'Communication',
    'Negotiation', 'Conflict Resolution', 'Team Building', 'Collaboration', 'Remote Work',
    'Work-Life Balance', 'Personal Development', 'Career Development', 'Skill Development',
    'Learning', 'Education Technology', 'Online Learning', 'MOOCs', 'Certification',
    'Bootcamps', 'Coding Bootcamps', 'Data Bootcamps', 'Design Bootcamps', 'Business Bootcamps', 'Other'
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roadmap Generator */}
        <div className="card animate-fade-in">
          <h3 className="card-title">Generate Learning Roadmap</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Field of Interest</label>
              <select
                value={roadmapField}
                onChange={(e) => setRoadmapField(e.target.value)}
                className="form-select"
              >
                {fields.map(field => (
                  <option key={field} value={field} style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration</label>
              <select
                value={roadmapDuration}
                onChange={(e) => setRoadmapDuration(e.target.value)}
                className="form-select"
              >
                <option value="7">7 Days</option>
                <option value="15">15 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Skill Level</label>
              <select
                value={roadmapSkillLevel}
                onChange={(e) => setRoadmapSkillLevel(e.target.value)}
                className="form-select"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Daily Available Time (optional)</label>
              <input
                type="text"
                placeholder="e.g., 2 hours"
                value={roadmapDailyTime}
                onChange={(e) => setRoadmapDailyTime(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              onClick={generateRoadmap}
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Generate Roadmap'
              )}
            </button>
          </div>
        </div>

        {/* Roadmap Display */}
        <div className="card animate-slide-in">
          <h3 className="card-title">Your Learning Roadmap</h3>
          <div className="h-[500px] overflow-y-auto">
            {roadmap ? (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-neon-cyan">
                  {roadmap.totalDays} Days - {roadmap.field} ({roadmap.skillLevel})
                </h4>
                <div className="roadmap-grid">
                  {roadmap.map((day) => {
                    const isCompleted = roadmapProgress && roadmapProgress.completedDays &&
                      roadmapProgress.completedDays.includes(day.day);
                    const clickable = isDayClickable(day);
                    return (
                      <div
                        key={day.day}
                        className={`roadmap-card-3d ${isCompleted ? 'roadmap-card-completed' : 'roadmap-card-pending'} ${!clickable ? 'roadmap-card-locked' : ''}`}
                        onClick={() => clickable && handleCardClick(day)}
                        style={{ cursor: clickable ? 'pointer' : 'not-allowed' }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-bold text-neon-cyan text-lg">Day {day.day}</h5>
                          {isCompleted && <span className="text-green-400 text-xl">✓</span>}
                          {!clickable && !isCompleted && <span className="text-gray-500 text-xl">🔒</span>}
                        </div>
                        <h6 className="font-semibold text-white mb-3">{day.title}</h6>

                        <div className="space-y-2 text-sm">
                          <div>
                            <strong className="text-neon-purple">Objectives:</strong>
                            <ul className="list-disc list-inside text-gray-300 ml-3 mt-1">
                              {day.objectives.slice(0, 2).map((obj, i) => <li key={i}>{obj}</li>)}
                              {day.objectives.length > 2 && <li className="text-gray-400">+{day.objectives.length - 2} more...</li>}
                            </ul>
                          </div>

                          <div>
                            <strong className="text-neon-purple">Task:</strong>
                            <p className="text-gray-300 mt-1 line-clamp-2">{day.task}</p>
                          </div>

                          <div>
                            <strong className="text-neon-purple">Resources:</strong>
                            <div className="mt-1">
                              {day.resources.slice(0, 1).map((res, i) => (
                                <a key={i} href={res} target="_blank" rel="noopener noreferrer"
                                   className="text-neon-cyan hover:text-neon-purple transition-colors text-xs block truncate">
                                  {res}
                                </a>
                              ))}
                              {day.resources.length > 1 && <span className="text-gray-400 text-xs">+{day.resources.length - 1} more</span>}
                            </div>
                          </div>
                        </div>

                        {isCompleted && (
                          <div className="mt-4 text-center">
                            <span className="text-green-400 font-medium">✓ Completed</span>
                          </div>
                        )}
                        {!clickable && !isCompleted && (
                          <div className="mt-4 text-center">
                            <span className="text-gray-500 font-medium">Complete Day {day.day - 1} first</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic text-center animate-pulse">
                Select options and generate your personalized learning roadmap...
              </p>
            )}
          </div>
        </div>
      </div>

      <RoadmapDayModal
        showModal={showModal}
        setShowModal={setShowModal}
        day={selectedDay}
        markDayComplete={markDayComplete}
        isCompleted={selectedDay && roadmapProgress && roadmapProgress.completedDays &&
          roadmapProgress.completedDays.includes(selectedDay.day)}
      />
    </>
  );
}
