import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function Task({ startTime, endTime, taskName, taskDetails, taskIcon }) {
  const [isTaskDetailsShowing, setIsTaskDetailsShowing] = useState(false);

  function handleShowDetails() {
    setIsTaskDetailsShowing(!isTaskDetailsShowing);
  }

  return (
    <div className="task-container">
      <div className="task-title-container">
        <div className="task-icon">
          <span>{taskIcon}</span>
        </div>
        <input type="checkbox" />
        <div className="task-details">
          <div>
            {startTime} - {endTime}
          </div>
          <div>{taskName}</div>
        </div>
        {isTaskDetailsShowing ? (
          <ChevronUp onClick={handleShowDetails} />
        ) : (
          <ChevronDown onClick={handleShowDetails} />
        )}
      </div>
      {isTaskDetailsShowing && (
        <div>
          <p>{taskDetails}</p>
        </div>
      )}
    </div>
  );
}

export default Task;
