import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, push, remove, update } from "firebase/database";
import { toast, Toaster } from "sonner";
import "./firebaseSDK";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [input, setInput] = useState("");
  const [Edit, setEdit] = useState(false);
  const [EditText, setEditText] = useState("");
  const db = getDatabase();
  const SubmitData = (e) => {
    e.preventDefault();
    if (input == "") {
      toast.error("Cannot be empty");
      return;
    } else {
      if (Edit) {
        // Update existing task
        update(ref(db, `test/${EditText}`), {
          fullname: input
        })
          .then(() => {
            toast.success("Task updated successfully!");
            setEdit(false);
            setInput("");
          })
          .catch((error) => {
            toast.error("Error updating task: " + error.message);
          });
      } else {
        // Add new task
        push(ref(db, "test/"), {
          fullname: input,
          done: false,
        }).then(() => {
          toast.success("Task added successfully!");
          setInput("");
        }).catch((error) => {
          toast.error("Error adding task: " + error.message);
        });
      }
    }
  };
  //edit button
  const handleEdit = (taskId, taskName) => {
    setEdit(!Edit);
    setInput(taskName);
    setEditText(taskId);
  };
  //* delete data from firebase */
  const DeleteButton = (id) => {
    toast(
      "Are you sure you want to delete this task?",
      {
        action: {
          label: "Delete",
          onClick: () => {
            toast.promise(
              remove(ref(db, `test/${id}`)),
              {
                loading: "Deleting task...",
                success: "Task deleted successfully",
                error: (error) => `Error deleting task: ${error.message}`
              }
            );
          }
        },
        cancel: {
          label: "Cancel",
          onClick: () => {
            toast.info("Delete operation cancelled");
          }
        },
        duration: 5000
      }
    );
  };

  //* fetch data from firebase */
  useEffect(() => {

    const dbRef = ref(db, "test");
    //* Listen for real-time updates
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const dataList = snapshot.val();
        //* Transform data into an array of objects
        const taskList = Object.keys(dataList).map((key) => ({
          id: key,
          done: dataList[key].done,
          name: dataList[key].fullname,
        }));
        setData(taskList);
        console.log("Updated Data:", taskList);
      } else {
        console.log("No data available");
        setData([]);
      }
    });
  }, []);


  const handleDone = (id, currentStatus) => {
    update(ref(db, `test/${id}`), {
      done: !currentStatus
    });
  };

  return (
    <div className="container">
      <Toaster position="bottom-right" richColors />
      <h1>Todo List App</h1>
      <div className="input-container">
        <form onSubmit={SubmitData}>
          <div className="form-group">
            <input
              type="text"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Enter a task..."
              className="task-input"
            />
            <button className="btn btn-primary">{Edit ? "Update" : "Add"}</button>
            {Edit && (
              <button
                type="button"
                onClick={() => {
                  setEdit(false);
                  setInput("");
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="tasks-container">
        {data.length === 0 ? (
          <p className="no-tasks">No tasks yet. Add a task to get started!</p>
        ) : (
          data.map((item) => (
            <div className="task-item" key={item.id}>
              <div className="task-content">
                <p className={item.done ? "task-name-done " : "task-name"}>{item.name}</p>

              </div>
              <div className="task-actions">
                <button
                  onClick={() => handleDone(item.id, item.done)}
                  className="btn btn-done"
                >
                  {item.done ?
                    <p>  Undo</p>

                    : 
                     
                      <p>Done</p>
                  }
                </button>
                <button
                  onClick={() => handleEdit(item.id, item.name)}
                  className="btn btn-edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => DeleteButton(item.id)}
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
