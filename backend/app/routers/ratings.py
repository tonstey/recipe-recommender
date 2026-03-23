from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from database.initialize import get_db, recipe_db
from database.models import User, Rating
from middlewares.authentication import decode_access_token
from schemas.ratings import ScoreRatingRequest, RatingResponse
from pymongo import errors
import jwt

router = APIRouter(prefix="/api/ratings", tags=["Ratings"])

@router.get("/{recipe_id}")
def get_user_rating(recipe_id:int, username:str = Depends(decode_access_token), db:Session = Depends(get_db)):
    try:
        user = db.scalars(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")
        
        rating = db.scalars(select(Rating).where(Rating.user_uuid == user.uuid).where(Rating.recipe_id == recipe_id) ).first()
        if not rating:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Rating not found.")

        return rating.score
    
    except HTTPException as e:
        print(str(e))
        raise HTTPException(e.status_code, detail=e.detail)
    except SQLAlchemyError as e:
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
    except jwt.PyJWTError as e:
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, please try again later.")
    except Exception as e:
        db.rollback()
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

@router.get("/recipe/{recipe_id}", response_model=RatingResponse)
def get_recipe_rating(recipe_id: int):
    try:
        rating_fields = recipe_db.find_one({"id": recipe_id}, {"rating_sum":1, "rating_count":1})
        return RatingResponse(rating_count=rating_fields["rating_count"], rating_sum=rating_fields["rating_sum"])
    except errors.PyMongoError as e:
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
    except Exception as e:
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


@router.post("/")
def rate(req:ScoreRatingRequest, username:str = Depends(decode_access_token), db:Session = Depends(get_db)):
    try:
        if (req.score > 5 or req.score < 1):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid rating")
        
        user = db.scalars(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found")
        

        rating_isDuplicated = db.scalars(select(Rating).where(Rating.user_uuid == user.uuid).where(Rating.recipe_id==req.recipe_id)).first()
        
        if rating_isDuplicated:
            score_delta = req.score - rating_isDuplicated.score
            rating_isDuplicated.score = req.score
            
            recipe_db.update_one({"id": rating_isDuplicated.recipe_id},{"$inc": {"rating_sum": score_delta}})

            db.commit()
            db.refresh(rating_isDuplicated)

            return rating_isDuplicated.score

        else:
            new_rating = Rating(score=req.score, user=user, user_uuid=user.uuid, recipe_id=req.recipe_id)
            db.add(new_rating)
            
            recipe_db.update_one({"id": req.recipe_id},{"$inc": {"rating_sum": req.score, "rating_count": 1}})
            
            db.commit()
            db.refresh(new_rating)

            return new_rating.score
    except HTTPException as e:
        print(str(e))
        raise HTTPException(e.status_code, detail=e.detail)
    except SQLAlchemyError as e:
        db.rollback()
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
    except errors.PyMongoError as e:
        db.rollback()
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
    except jwt.PyJWTError as e:
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, please try again later.")
    except Exception as e:
        db.rollback()
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")

@router.delete("/{ratingID}")
def delete_rating(ratingID:int, username:str = Depends(decode_access_token), db:Session = Depends(get_db)):
    try:
        user = db.scalars(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")
        
        rating = db.scalars(select(Rating).where(Rating.id == ratingID)).first()
        if not rating:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Rating not found")
        
        if rating.user_uuid != user.uuid:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Forbidden to view.")

        recipe_db.update_one({"id": rating.recipe_id},{"$inc": {"rating_sum": -1 * rating.score, "rating_count": -1}})

        db.delete(rating)
        db.commit()

        return True
    except HTTPException as e:
        print(str(e))
        raise HTTPException(e.status_code, detail=e.detail)
    except SQLAlchemyError as e:
        db.rollback()
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
    except errors.PyMongoError as e:
        db.rollback()
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error, please try again later")
    except jwt.PyJWTError as e:
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token error, please try again later.")
    except Exception as e:
        db.rollback()
        print(str(e))
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error, please try again later.")


