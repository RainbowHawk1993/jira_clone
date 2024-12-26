from fastapi import FastAPI, Form, Body
from pydantic import BaseModel
from databases import Database
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

DATABASE_URL = "sqlite:///./test.db"
database = Database(DATABASE_URL)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Category(BaseModel):
    name: str

class Task(BaseModel):
    title: str
    category_id: int

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI with Angular!"}

@app.get("/api/categories")
async def get_categories():
    query = """
    SELECT categories.id, categories.name,
           json_group_array(json_object('id', tasks.id, 'title', tasks.title)) as tasks
    FROM categories
    LEFT JOIN tasks ON tasks.category_id = categories.id
    GROUP BY categories.id
    """
    categories = await database.fetch_all(query)
    return [{"id": cat["id"], "name": cat["name"], "tasks": json.loads(cat["tasks"])} for cat in categories]


@app.post("/api/categories")
async def create_category(category: dict = Body(...)):
    name = category.get("name")
    if not name:
        return {"error": "Name is required"}
    query = "INSERT INTO categories(name) VALUES (:name)"
    await database.execute(query, {"name": name})
    return {"message": "Category created", "name": name}

@app.get("/api/tasks")
async def get_tasks_by_category(category_id: int):
    query = """
    SELECT * FROM tasks WHERE category_id = :category_id
    """
    tasks = await database.fetch_all(query, {"category_id": category_id})
    return [{"id": task["id"], "title": task["title"], "category_id": task["category_id"]} for task in tasks]

@app.post("/api/tasks")
async def create_task(task: Task):
    category_query = "SELECT * FROM categories WHERE id = :category_id"
    category = await database.fetch_one(category_query, {"category_id": task.category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    query = "INSERT INTO tasks(title, category_id) VALUES (:title, :category_id)"
    await database.execute(query, {"title": task.title, "category_id": task.category_id})
    return {"message": "Task created", "title": task.title, "category_id": task.category_id}

@app.put("/api/tasks/{task_id}/change-category")
async def change_task_category(task_id: int, new_category_id: int = Body(...)):
    task_query = "SELECT * FROM tasks WHERE id = :task_id"
    task = await database.fetch_one(task_query, {"task_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    category_query = "SELECT * FROM categories WHERE id = :category_id"
    category = await database.fetch_one(category_query, {"category_id": new_category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_query = "UPDATE tasks SET category_id = :new_category_id WHERE id = :task_id"
    await database.execute(update_query, {"new_category_id": new_category_id, "task_id": task_id})
    return {"message": "Task category updated", "task_id": task_id, "new_category_id": new_category_id}
