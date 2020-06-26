# -*- coding: utf-8 -*-
# モデルの定義
from sqlalchemy import Column, Integer, String, DECIMAL, DATE
from pydantic import BaseModel
from db import Base
from db import ENGINE


# userテーブルのモデルUserTableを定義
class Debt(Base):
    __tablename__ = 'debt'
    id = Column(Integer, primary_key=True)
    date = Column(DATE)
    m1 = Column(DECIMAL(precision=6, scale=4))
    m2 = Column(DECIMAL(precision=6, scale=4))
    m3 = Column(DECIMAL(precision=6, scale=4))
    m6 = Column(DECIMAL(precision=6, scale=4))
    y1 = Column(DECIMAL(precision=6, scale=4))
    y3 = Column(DECIMAL(precision=6, scale=4))
    y5 = Column(DECIMAL(precision=6, scale=4))
    y7 = Column(DECIMAL(precision=6, scale=4))
    y10 = Column(DECIMAL(precision=6, scale=4))
    y20 = Column(DECIMAL(precision=6, scale=4))
    y30 = Column(DECIMAL(precision=6, scale=4))


def main():
    # テーブルが存在しなければ、テーブルを作成
    Base.metadata.create_all(bind=ENGINE)


if __name__ == "__main__":
    main()
