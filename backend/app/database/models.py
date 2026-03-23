from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, ForeignKey, func, text

from sqlalchemy.orm import relationship
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.dialects.postgresql import UUID

import uuid

from .initialize import Base

class User(Base):
  __tablename__= "users"
  is_active = Column(Boolean(), nullable=False, default=True)

  # USER ID
  id = Column(Integer(), primary_key=True, index=True)
  uuid = Column(UUID(as_uuid=True), index=True, default=uuid.uuid4, unique=True, nullable=False)

  # USER VERIFICATION FIELDS
  isVerified = Column(Boolean(), nullable=False, default=False)
  verificationToken = Column(String(255), unique= True)
  verificationExpire = Column(DateTime(timezone=True))

  # USER FIELDS
  username = Column(String(100), nullable=False, unique=True, index=True)
  email = Column(String(100), nullable=False, unique=True, index=True)
  password = Column(String(), nullable=False)

  #USER RELATIONSHIPS
  pantry = relationship('Pantry', back_populates="owner", uselist=False, cascade="all, delete-orphan")
  ratings = relationship('Rating', back_populates="user", cascade="all, delete-orphan")
  recipelist = relationship('RecipeList', back_populates="owner", uselist=False, cascade="all, delete-orphan")

  # USER TIMESTAMPs
  created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
  updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Pantry(Base):
  __tablename__= "pantries"

  # PANTRY ID
  id = Column(Integer(), primary_key=True, index=True)
  uuid = Column(UUID(as_uuid=True), index=True, default=uuid.uuid4, unique=True, nullable=False)
  
  # PANTRY FIELDS
  stored_ingredients = Column(MutableList.as_mutable(JSON), nullable=False, default=list)

  # PANTRY RELATIONSHIPS
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.uuid"), index=True, nullable=False, unique=True)
  owner = relationship('User', back_populates='pantry')

  # PANTRY TIMESTAMPS
  created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
  updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class RecipeList(Base):
  __tablename__="recipelists"

  # RECIPELIST ID
  id = Column(Integer(), primary_key=True, index=True)
  uuid = Column(UUID(as_uuid=True), index=True, default=uuid.uuid4, unique=True, nullable=False)

  # RECIPELIST FIELDS
  liked_recipes = Column(MutableList.as_mutable(JSON), nullable=False, default=list)

  # RECIPELIST RELATIONSHIPS
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.uuid"), index=True, nullable=False, unique=True)
  owner = relationship('User', back_populates='recipelist')

  # RECIPELIST TIMESTAMPS
  created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
  updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class Rating(Base):
  __tablename__= "ratings"

  # RATING ID
  id = Column(Integer(), primary_key=True, index=True)
  uuid = Column(UUID(as_uuid=True), index=True, default=uuid.uuid4, unique=True, nullable=False)

  # RATING FIELDs
  score = Column(Integer(), default=1, nullable=False)
  
  # RATING RELATIONSHIPS
  user_uuid = Column(UUID(as_uuid=True), ForeignKey("users.uuid"), nullable=False)
  user = relationship('User', back_populates='ratings')
  recipe_id = Column(Integer(), nullable=False)

  # RATING TIMESTAMPS
  created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
  updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
