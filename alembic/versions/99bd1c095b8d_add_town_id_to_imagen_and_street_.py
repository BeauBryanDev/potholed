"""add town_id to imagen and street realtionship over users 

Revision ID: 99bd1c095b8d
Revises: e38e744e4473
Create Date: 2026-03-26 17:41:06.238395

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '99bd1c095b8d'
down_revision = 'e38e744e4473'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('images', sa.Column('town_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_images_town_id_towns',
        'images',
        'towns',
        ['town_id'],
        ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint('fk_images_town_id_towns', 'images', type_='foreignkey')
    op.drop_column('images', 'town_id')
