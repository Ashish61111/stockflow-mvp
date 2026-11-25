from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.setting import OrganizationSetting
from app.models.user import User
from app.schemas.setting import SettingRead, SettingUpdate

router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"],
)


@router.get(
    "/",
    response_model=SettingRead,
)
def get_settings(
        db: Annotated[Session, Depends(get_db)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    organization_settings = db.scalar(
        select(OrganizationSetting).where(
            OrganizationSetting.organization_id
            == current_user.organization_id
        )
    )

    if organization_settings is None:
        return SettingRead(
            default_low_stock_threshold=(
                settings.default_low_stock_threshold
            )
        )

    return organization_settings


@router.put(
    "/",
    response_model=SettingRead,
)
def update_settings(
        payload: SettingUpdate,
        db: Annotated[Session, Depends(get_db)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    organization_settings = db.scalar(
        select(OrganizationSetting).where(
            OrganizationSetting.organization_id
            == current_user.organization_id
        )
    )

    if organization_settings is None:
        organization_settings = OrganizationSetting(
            organization_id=current_user.organization_id,
            default_low_stock_threshold=(
                payload.default_low_stock_threshold
            ),
        )
        db.add(organization_settings)
    else:
        organization_settings.default_low_stock_threshold = (
            payload.default_low_stock_threshold
        )

    try:
        db.commit()
        db.refresh(organization_settings)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to update organization settings",
        )

    return organization_settings
