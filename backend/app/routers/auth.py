from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.database import get_db
from app.models.organization import Organization
from app.models.user import User
from app.models.setting import OrganizationSetting
from app.schemas.auth import AuthResponse, SignupRequest, UserRead

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
        payload: SignupRequest,
        db: Annotated[Session, Depends(get_db)],
):
    email = str(payload.email).strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    organization = Organization(
        name=payload.organization_name
    )

    try:
        db.add(organization)
        db.flush()

        user = User(
            organization_id=organization.id,
            email=email,
            hashed_password=get_password_hash(payload.password),
        )

        organization_settings = OrganizationSetting(
            organization_id=organization.id,
            default_low_stock_threshold=(
                settings.default_low_stock_threshold
            ),
        )

        db.add_all([user, organization_settings])
        db.commit()

        db.refresh(user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    except Exception:
        db.rollback()
        raise

    token = create_access_token(str(user.id))

    return AuthResponse(
        access_token=token,
        user=UserRead.model_validate(user),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
        form_data: Annotated[
            OAuth2PasswordRequestForm,
            Depends(),
        ],
        db: Annotated[Session, Depends(get_db)],
):
    email = form_data.username.strip().lower()

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if (
            user is None
            or not user.is_active
            or not verify_password(
        form_data.password,
        user.hashed_password,
    )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(str(user.id))

    return AuthResponse(
        access_token=token,
        user=UserRead.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserRead,
)
def get_me(
        current_user: Annotated[
            User,
            Depends(get_current_user),
        ],
):
    return current_user
