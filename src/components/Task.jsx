import { ChevronDown } from "lucide-react";

function Task({ startTime, endTime, taskName }) {
  return (
    <div className="task-container">
      <div className="task-icon">icon</div>
      <input type="checkbox" />
      <div className="task-details">
        <div>
          {startTime} - {endTime}
        </div>
        <div>{taskName}</div>
      </div>
      <ChevronDown />
    </div>
  );
}

export default Task;
