import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    organization_name: str = Field(min_length=2, max_length=255)

    @field_validator("organization_name")
    @classmethod
    def clean_organization_name(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 2:
            raise ValueError("Organization name must contain at least 2 characters")

        return value


class UserRead(BaseModel):
    id: uuid.UUID
    email: EmailStr
    organization_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
