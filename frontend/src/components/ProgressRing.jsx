import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ProgressRing = ({ percentage, size = 120 }) => {
  const getColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow/orange
    return '#ef4444'; // red
  };

  return (
    <div style={{ width: size, height: size }}>
      <CircularProgressbar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({
          textSize: '24px',
          pathColor: getColor(percentage),
          textColor: '#fff',
          trailColor: '#1f2937',
          pathTransitionDuration: 0.5,
        })}
      />
    </div>
  );
};

export default ProgressRing;
