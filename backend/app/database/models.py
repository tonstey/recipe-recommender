from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.dialects.postgresql import UUID
from .initialize import Base
import uuid

class User(Base):
  __tablename__= "users"
  id = Column(Integer(), primary_key=True, index=True)
  uuid = Column(UUID(as_uuid=True), index=True, default=uuid.uuid4, unique=True, nullable=False)

  isVerified = Column(Boolean(), nullable=False, default=False)
  verificationToken = Column(String(255), unique= True)
  verificationExpire = Column(DateTime(timezone=True))

  username = Column(String(100), nullable=False, unique=True)
  email = Column(String(100), nullable=False, unique=True)
  password = Column(String(), nullable=False)

  pantry = relationship('Pantry', back_populates="owner", cascade="all, delete")
  ratings = relationship('Rating', back_populates="user", cascade="all, delete")
  recipelist = relationship('RecipeList', back_populates="owner", cascade="all, delete")


class Pantry(Base):
  __tablename__= "pantries"
  id = Column(Integer(), primary_key=True, index=True)
  uuid = Column(UUID(as_uuid=True), index=True, default=uuid.uuid4, unique=True, nullable=False)
  
  stored_ingredients = Column(JSON, default=lambda:[])
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.uuid"), nullable=False)
  owner = relationship('User', back_populates='pantry')

class RecipeList(Base):
  __tablename__="recipelists"
  id = Column(Integer(), primary_key=True, index=True)
  uuid = Column(UUID(as_uuid=True), index=True, default=uuid.uuid4, unique=True, nullable=False)

  liked_recipes = Column(JSON, default=lambda :[])
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.uuid"), nullable=False)
  owner = relationship('User', back_populates='recipelist')

class Recipe(Base):
  __tablename__= "recipes"
  id = Column(Integer(), primary_key=True, index=True)
  uuid = Column(UUID(as_uuid=True), index=True, default=uuid.uuid4, unique=True, nullable=False)
  name = Column(String(100), nullable=False, unique=True)

  rating_sum = Column(Integer(), default=0)
  rating_count=Column(Integer(), default=0)

  ratings = relationship('Rating', back_populates='recipe', cascade="all, delete")

class Rating(Base):
  __tablename__= "ratings"
  id = Column(Integer(), primary_key=True, index=True)
  uuid = Column(UUID(as_uuid=True), index=True, default=uuid.uuid4, unique=True, nullable=False)

  rating = Column(Integer(), default=1, nullable=False)
  
  user_uuid = Column(UUID(as_uuid=True), ForeignKey("users.uuid"), nullable=False)
  recipe_uuid = Column(UUID(as_uuid=True), ForeignKey("recipes.uuid"), nullable=False)

  user = relationship('User', back_populates='ratings')
  recipe = relationship('Recipe', back_populates='ratings')