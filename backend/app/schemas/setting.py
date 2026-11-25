from pydantic import BaseModel, ConfigDict, Field


class SettingUpdate(BaseModel):
    default_low_stock_threshold: int = Field(
        ge=0,
        le=1000000,
    )


class SettingRead(BaseModel):
    default_low_stock_threshold: int

    model_config = ConfigDict(from_attributes=True)
