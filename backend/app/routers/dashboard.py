from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardRead
from app.services.inventory import get_dashboard_summary

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/",
    response_model=DashboardRead,
)
def get_dashboard(
        db: Annotated[Session, Depends(get_db)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    return get_dashboard_summary(
        db=db,
        organization_id=current_user.organization_id,
    )
