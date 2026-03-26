"""fix missing images.town_id column

Revision ID: a8c6f2e4d1b3
Revises: 99bd1c095b8d
Create Date: 2026-03-26 18:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a8c6f2e4d1b3'
down_revision = '99bd1c095b8d'
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
