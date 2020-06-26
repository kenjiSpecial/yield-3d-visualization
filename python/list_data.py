from db import Base
from db import ENGINE
from db import session
from model import Debt

debt_list = session.query(Debt).all()
# print(data)

for debt_item in debt_list:
    # print(debt_item.id)
