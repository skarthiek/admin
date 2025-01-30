import React, { useState, useEffect } from "react";
import "./App.css";

const Admin = () => {
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [showFeedback, setShowFeedback] = useState(false); // State to toggle feedback section
  const [feedback, setFeedback] = useState([]); // State to store feedback data

  // Fetch colleges and programs
  useEffect(() => {
    fetch("https://mernbackend-87en.onrender.com/api/college")
      .then((response) => response.json())
      .then((data) => setColleges(data))
      .catch((error) => console.error("Error fetching colleges:", error));
  }, []);

  // Fetch feedback
  useEffect(() => {
    if (showFeedback) {
      fetch("https://mernbackend-87en.onrender.com/api/feedback")
        .then((response) => response.json())
        .then((data) => setFeedback(data))
        .catch((error) => console.error("Error fetching feedback:", error));
    }
  }, [showFeedback]);

  const handleCollegeChange = (e) => {
    setSelectedCollege(e.target.value);
    setSelectedProgram(""); // Reset program when college changes
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
  };

  return (
    <div className="admin-sectionr">
      <h1>Admin Dashboard</h1>
      <nav>
        <button onClick={() => setShowFeedback(false)}>Manage Colleges</button>
        <button onClick={() => setShowFeedback(true)}>View Feedback</button>
      </nav>

      {!showFeedback ? (
        <>
          <div className="selection-form">
            <label>College:</label>
            <select value={selectedCollege} onChange={handleCollegeChange} required>
              <option value="">Select College</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.college}>
                  {college.college}
                </option>
              ))}
            </select>

            <label>Program:</label>
            <select value={selectedProgram} onChange={handleProgramChange} required>
              <option value="">Select Program</option>
              {colleges
                .find((college) => college.college === selectedCollege)
                ?.program.map((program, index) => (
                  <option key={index} value={program}>
                    {program}
                  </option>
                ))}
            </select>
          </div>

          {selectedCollege && selectedProgram && (
            <>
              <PrerequisitesAdmin college={selectedCollege} program={selectedProgram} />
              <TasksAdmin college={selectedCollege} program={selectedProgram} />
              <NotesAdmin college={selectedCollege} program={selectedProgram} />
              <ResourcesAdmin college={selectedCollege} program={selectedProgram} />
            </>
          )}

          <AddCollegeAndProgram />
        </>
      ) : (
        <FeedbackSection feedback={feedback} />
      )}
    </div>
  );
};

// Add College and Program Section
const AddCollegeAndProgram = () => {
  const [newCollege, setNewCollege] = useState("");
  const [newProgram, setNewProgram] = useState("");

  const handleAddCollegeAndProgram = async () => {
    try {
      const response = await fetch("https://mernbackend-87en.onrender.com/api/college", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          college: newCollege,
          program: [newProgram],
        }),
      });

      if (response.ok) {
        alert("College and Program added successfully!");
        setNewCollege("");
        setNewProgram("");
      } else {
        console.error("Failed to add college and program");
      }
    } catch (error) {
      console.error("Error adding college and program:", error);
    }
  };

  return (
    <section className="admin-section">
      <h2>Add College and Program</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="College Name"
          value={newCollege}
          onChange={(e) => setNewCollege(e.target.value)}
        />
        <input
          type="text"
          placeholder="Program Name"
          value={newProgram}
          onChange={(e) => setNewProgram(e.target.value)}
        />
        <button onClick={handleAddCollegeAndProgram}>Add College and Program</button>
      </div>
    </section>
  );
};

// Feedback Section
const FeedbackSection = ({ feedback }) => {
  return (
    <section className="admin-section">
      <h2>Feedback</h2>
      <ul>
        {feedback.map((fb) => (
          <li key={fb.id}>
            <strong>{fb.college} - {fb.program}</strong>: {fb.content} (Rating: {fb.rating})
          </li>
        ))}
      </ul>
    </section>
  );
};

// Prerequisites Admin Section
const PrerequisitesAdmin = ({ college, program }) => {
  const [prerequisites, setPrerequisites] = useState([]);
  const [newPrerequisite, setNewPrerequisite] = useState({ msg: "", src: "" });

  // Fetch prerequisites for the selected college and program
  useEffect(() => {
    fetch("https://mernbackend-87en.onrender.com/api/prerequisite")
      .then((response) => response.json())
      .then((data) =>
        setPrerequisites(data.filter((p) => p.college === college && p.program === program))
      )
      .catch((error) => console.error("Error fetching prerequisites:", error));
  }, [college, program]);

  // Add a new prerequisite
  const handleAddPrerequisite = async () => {
    try {
      const response = await fetch("https://mernbackend-87en.onrender.com/api/prerequisite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          college,
          program,
          msg: newPrerequisite.msg,
          src: newPrerequisite.src,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrerequisites([...prerequisites, data]);
        setNewPrerequisite({ msg: "", src: "" }); // Reset form
      } else {
        console.error("Failed to add prerequisite");
      }
    } catch (error) {
      console.error("Error adding prerequisite:", error);
    }
  };

  // Delete a prerequisite
  const handleDeletePrerequisite = async (id) => {
    try {
      const response = await fetch(`https://mernbackend-87en.onrender.com/api/prerequisite/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPrerequisites(prerequisites.filter((p) => p.id !== id));
      } else {
        console.error("Failed to delete prerequisite");
      }
    } catch (error) {
      console.error("Error deleting prerequisite:", error);
    }
  };

  return (
    <section className="admin-section">
      <h2>Manage Prerequisites</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Message"
          value={newPrerequisite.msg}
          onChange={(e) => setNewPrerequisite({ ...newPrerequisite, msg: e.target.value })}
        />
        <input
          type="text"
          placeholder="Source URL"
          value={newPrerequisite.src}
          onChange={(e) => setNewPrerequisite({ ...newPrerequisite, src: e.target.value })}
        />
        <button onClick={handleAddPrerequisite}>Add Prerequisite</button>
      </div>
      <ul>
        {prerequisites.map((prerequisite) => (
          <li key={prerequisite.id}>
            {prerequisite.msg} - <a href={prerequisite.src}>Link</a>
            <button onClick={() => handleDeletePrerequisite(prerequisite.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
};

// Tasks Admin Section
const TasksAdmin = ({ college, program }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ task: "", date: "" });

  // Fetch tasks for the selected college and program
  useEffect(() => {
    fetch("https://mernbackend-87en.onrender.com/api/task")
      .then((response) => response.json())
      .then((data) =>
        setTasks(data.filter((t) => t.college === college && t.program === program))
      )
      .catch((error) => console.error("Error fetching tasks:", error));
  }, [college, program]);

  // Add a new task
  const handleAddTask = async () => {
    try {
      const response = await fetch("https://mernbackend-87en.onrender.com/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          college,
          program,
          task: newTask.task,
          date: new Date(newTask.date).toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks([...tasks, data]);
        setNewTask({ task: "", date: "" }); // Reset form
      } else {
        console.error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`https://mernbackend-87en.onrender.com/api/task/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks(tasks.filter((t) => t.id !== id));
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <section className="admin-section">
      <h2>Manage Tasks</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Task"
          value={newTask.task}
          onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
        />
        <input
          type="date"
          value={newTask.date}
          onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.task} - {new Date(task.date).toLocaleDateString()}
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
};

// Notes Admin Section
const NotesAdmin = ({ college, program }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", link: "" });

  // Fetch notes for the selected college and program
  useEffect(() => {
    fetch("https://mernbackend-87en.onrender.com/api/notes")
      .then((response) => response.json())
      .then((data) =>
        setNotes(data.filter((n) => n.college === college && n.program === program))
      )
      .catch((error) => console.error("Error fetching notes:", error));
  }, [college, program]);

  // Add a new note
  const handleAddNote = async () => {
    try {
      const response = await fetch("https://mernbackend-87en.onrender.com/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          college,
          program,
          title: newNote.title,
          link: newNote.link,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([...notes, data]);
        setNewNote({ title: "", link: "" }); // Reset form
      } else {
        console.error("Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Delete a note
  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`https://mernbackend-87en.onrender.com/api/notes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== id));
      } else {
        console.error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <section className="admin-section">
      <h2>Manage Notes</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Link"
          value={newNote.link}
          onChange={(e) => setNewNote({ ...newNote, link: e.target.value })}
        />
        <button onClick={handleAddNote}>Add Note</button>
      </div>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.title} - <a href={note.link}>Link</a>
            <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
};

// Resources Admin Section
const ResourcesAdmin = ({ college, program }) => {
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: "", link: "" });

  // Fetch resources for the selected college and program
  useEffect(() => {
    fetch("https://mernbackend-87en.onrender.com/api/resource")
      .then((response) => response.json())
      .then((data) =>
        setResources(data.filter((r) => r.college === college && r.program === program))
      )
      .catch((error) => console.error("Error fetching resources:", error));
  }, [college, program]);

  // Add a new resource
  const handleAddResource = async () => {
    try {
      const response = await fetch("https://mernbackend-87en.onrender.com/api/resource", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          college,
          program,
          title: newResource.title,
          link: newResource.link,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResources([...resources, data]);
        setNewResource({ title: "", link: "" }); // Reset form
      } else {
        console.error("Failed to add resource");
      }
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  // Delete a resource
  const handleDeleteResource = async (id) => {
    try {
      const response = await fetch(`https://mernbackend-87en.onrender.com/api/resource/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setResources(resources.filter((r) => r.id !== id));
      } else {
        console.error("Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  return (
    <section className="admin-section">
      <h2>Manage Resources</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Title"
          value={newResource.title}
          onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Link"
          value={newResource.link}
          onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
        />
        <button onClick={handleAddResource}>Add Resource</button>
      </div>
      <ul>
        {resources.map((resource) => (
          <li key={resource.id}>
            {resource.title} - <a href={resource.link}>Link</a>
            <button onClick={() => handleDeleteResource(resource.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Admin;