import uuid
from typing import Any, Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import Base


T = TypeVar("T", bound=Base)


#################################################
#            BaseRepository                     #
#################################################


class BaseRepository(Generic[T]):
    """Repository generique fournissant les operations CRUD de base."""

    def __init__(self, model: type[T], session: AsyncSession):
        self.model = model
        self.session = session

    # Recupere une entite par son id, renvoie None si absente
    async def get_by_id(self, entity_id: uuid.UUID) -> T | None:
        result = await self.session.execute(
            select(self.model).where(self.model.id == entity_id)
        )
        return result.scalar_one_or_none()

    # Liste toutes les entites avec pagination
    async def get_all(
        self,
        page: int = 1,
        page_size: int = 20,
        order_by: Any | None = None,
    ) -> tuple[list[T], int]:
        count_query = select(func.count()).select_from(self.model)
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        query = select(self.model)
        if order_by is not None:
            query = query.order_by(order_by)
        else:
            query = query.order_by(self.model.id)

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    # Cree une nouvelle entite en base
    async def create(self, entity: T) -> T:
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity

    # Met a jour les champs d'une entite existante
    async def update(self, entity: T, data: dict[str, Any]) -> T:
        for key, value in data.items():
            if value is not None and hasattr(entity, key):
                setattr(entity, key, value)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity

    # Supprime une entite de la base
    async def delete(self, entity: T) -> None:
        await self.session.delete(entity)
        await self.session.flush()
