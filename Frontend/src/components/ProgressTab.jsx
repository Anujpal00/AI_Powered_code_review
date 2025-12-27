import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

ProgressTab.propTypes = {
  roadmapProgress: PropTypes.shape({
    completedDays: PropTypes.arrayOf(PropTypes.number).isRequired,
    totalDays: PropTypes.number.isRequired,
  }),
};

export default function ProgressTab({ roadmapProgress }) {
  if (!roadmapProgress || !roadmapProgress.completedDays) {
    return (
      <div className="card animate-fade-in text-center">
        <h3 className="card-title">Progress Dashboard</h3>
        <p className="text-gray-400 animate-pulse">
          No roadmap progress available. Generate a roadmap first to track your progress.
        </p>
      </div>
    );
  }

  const progressPercentage = (roadmapProgress.completedDays.length / roadmapProgress.totalDays) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="card animate-fade-in">
        <h3 className="card-title">Roadmap Progress</h3>

        {/* Circular Progress */}
        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-primary-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#greenGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${(progressPercentage / 100) * 283} 283`}
                className="progress-ring-circle"
              />
              <defs>
                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-cyan">{Math.round(progressPercentage)}%</div>
                  <div className="text-sm text-gray-400">Complete</div>
                </div>
              </div>
            </svg>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-primary-700 rounded-full h-6 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-center text-sm text-gray-400 mb-6">
          Progress: {Math.round(progressPercentage)}% Complete
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-primary-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-neon-purple">{roadmapProgress.completedDays.length}</div>
            <div className="text-sm text-gray-400">Days Completed</div>
          </div>
          <div className="bg-primary-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-neon-cyan">{roadmapProgress.totalDays - roadmapProgress.completedDays.length}</div>
            <div className="text-sm text-gray-400">Days Remaining</div>
          </div>
        </div>
      </div>

      {/* Completed Days List */}
      <div className="card animate-slide-in">
        <h3 className="card-title">Completed Days</h3>
        {roadmapProgress.completedDays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmapProgress.completedDays.map((day, index) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-bold text-green-400">Day {day}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic text-center animate-pulse">
            No days completed yet. Start marking days as complete in your roadmap!
          </p>
        )}
      </div>

      {/* Motivational Message */}
      <div className="card animate-fade-in text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-4xl mb-4"
        >
          🚀
        </motion.div>
        <h4 className="text-lg font-bold text-neon-cyan mb-2">
          {progressPercentage === 100 ? "Congratulations! 🎉" : "Keep Going!"}
        </h4>
        <p className="text-gray-300">
          {progressPercentage === 100
            ? "You've completed your entire learning roadmap! Time to tackle a new challenge."
            : `You're ${Math.round(progressPercentage)}% through your journey. Every step counts!`
          }
        </p>
      </div>
    </div>
  );
}
