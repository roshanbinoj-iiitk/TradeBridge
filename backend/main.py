# Get full user profile by email


from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Get full user profile by email
@app.get("/get_user_profile")
def get_user_profile(email: str = Query(...)):
    response = supabase.table("users").select("id, name, contact, email, role").eq("email", email).execute()
    if hasattr(response, "error") and response.error:
        raise HTTPException(status_code=400, detail=response.error.message)
    if not response.data:
        return {"profile": None}
    return {"profile": response.data[0]}


@app.get("/get_user_by_email")
def get_user_id_by_email(email: str = Query(...)):
    response = supabase.table("users").select("id").eq("email", email).execute()
    if hasattr(response, "error") and response.error:
        raise HTTPException(status_code=400, detail=response.error.message)
    if not response.data:
        return {"id": None}
    return {"id": response.data[0]["id"]}

# Get user role by email
@app.get("/userrole")
def get_user_role(email: str = Query(...)):
    response = supabase.table("users").select("role").eq("email", email).execute()
    if hasattr(response, "error") and response.error:
        raise HTTPException(status_code=400, detail=response.error.message)
    if not response.data:
        return {"role": None}
    return {"role": response.data[0]["role"]}

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class UserRegister(BaseModel):
    name: str
    contact: str
    email: str
    role: str
    password_hash: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    images: List[str]
    start_date: str
    end_date: str
    lender_id: int
    # Optionally: category, value, condition
    category: Optional[str] = None
    value: Optional[float] = None
    condition: Optional[str] = None
@app.post("/items")
def create_product(product: ProductCreate):
    # Use lender_id from frontend
    prod_data = {
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "value": product.value,
        "condition": product.condition,
        "availability": True,
        "lender_id": product.lender_id,
        "start_date": product.start_date,
        "end_date": product.end_date
    }
    prod_resp = supabase.table("products").insert(prod_data).execute()
    if hasattr(prod_resp, "error") and prod_resp.error:
        raise HTTPException(status_code=400, detail=prod_resp.error.message)
    prod_id = prod_resp.data[0]["product_id"]
    # Insert images
    for img_url in product.images:
        supabase.table("product_images").insert({"product_id": prod_id, "image_url": img_url}).execute()
    return {"item": {**prod_resp.data[0], "images": product.images}}

@app.get("/")
def read_root():
    return {"message": "Welcome to the TradeBridge FastAPI backend!"}

@app.post("/register")
def register_user(user: UserRegister):
    # Insert into users table
    data = {
        "name": user.name,
        "contact": user.contact,
        "email": user.email,
        "role": user.role,
        "password_hash": user.password_hash
    }
    response = supabase.table("users").insert(data).execute()
    # response is an APIResponse object, not a dict
    if hasattr(response, "error") and response.error:
        # Handle duplicate email error
        if "duplicate key value violates unique constraint" in response.error.message:
            raise HTTPException(status_code=409, detail="Email already exists.")
        raise HTTPException(status_code=400, detail=response.error.message)
    return {"message": "User registered successfully!", "user": response.data}

@app.get("/api/items")
def get_all_items():
    # Fetch all products
    prod_resp = supabase.table("products").select("*").execute()
    if hasattr(prod_resp, "error") and prod_resp.error:
        raise HTTPException(status_code=400, detail=prod_resp.error.message)
    products = prod_resp.data
    # Fetch all images
    img_resp = supabase.table("product_images").select("*").execute()
    if hasattr(img_resp, "error") and img_resp.error:
        raise HTTPException(status_code=400, detail=img_resp.error.message)
    images = img_resp.data
    # Map images to products
    items = []
    for prod in products:
        prod_id = prod.get("product_id")
        prod_images = [img["image_url"] for img in images if img["product_id"] == prod_id]
        prod["images"] = prod_images if prod_images else []
        items.append(prod)
    return {"items": items}
