from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class CommercialOptionBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    label: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip().upper().replace(" ", "_")

    @field_validator("label")
    @classmethod
    def normalize_label(cls, value: str) -> str:
        return value.strip()


class CommercialOptionCreate(CommercialOptionBase):
    pass


class CommercialOptionUpdate(BaseModel):
    label: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)
    sort_order: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None


class CommercialOptionResponse(CommercialOptionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
