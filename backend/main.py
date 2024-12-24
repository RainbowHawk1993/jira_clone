from fastapi import FastAPI, Form, Body
from pydantic import BaseModel
from databases import Database
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI with Angular!"}

@app.get("/api/categories")
async def get_categories():
    query = "SELECT * FROM categories"
    return await database.fetch_all(query)

@app.post("/api/categories")
async def create_category(category: dict = Body(...)):
    name = category.get("name")
    if not name:
        return {"error": "Name is required"}
    query = "INSERT INTO categories(name) VALUES (:name)"
    await database.execute(query, {"name": name})
    return {"message": "Category created", "name": name}
