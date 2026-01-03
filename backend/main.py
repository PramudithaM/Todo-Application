import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"]
)

# Data model
class TodoBase(BaseModel):
    title: str
    completed: bool = False

class TodoCreate(TodoBase):
    pass

class TodoUpdate(TodoBase):
    pass

class ToDo(TodoBase):
    id: int

    class Config:
        from_attributes = True

# In-memory DB
todo_db: List[ToDo] = []
todo_id_counter = 1


@app.get("/")
def read_root():
    return {"message": "Welcome"}


@app.get("/todo", response_model=List[ToDo])
def get_todos():
    return todo_db


@app.get("/todo/{todo_id}", response_model=ToDo)
def get_todo(todo_id: int):
    todo = next((t for t in todo_db if t.id == todo_id), None)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@app.post("/todos", response_model=ToDo)
def create_todo(todo: TodoCreate):
    global todo_id_counter
    new_todo = ToDo(
        id=todo_id_counter,
        title=todo.title,
        completed=todo.completed
    )
    todo_db.append(new_todo)
    todo_id_counter += 1
    return new_todo


@app.put("/todos/{todo_id}", response_model=ToDo)
def update_todo(todo_id: int, todo_update: TodoUpdate):
    for idx, todo in enumerate(todo_db):
        if todo.id == todo_id:
            updated_todo = ToDo(
                id=todo_id,
                title=todo_update.title,
                completed=todo_update.completed
            )
            todo_db[idx] = updated_todo
            return updated_todo

    raise HTTPException(status_code=404, detail="Todo not found")


@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    global todo_db
    todo_db = [t for t in todo_db if t.id != todo_id]
    return {"message": "Todo deleted successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
