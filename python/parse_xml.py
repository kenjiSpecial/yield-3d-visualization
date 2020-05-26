import mysql.connector as mysql
from sqlalchemy import create_engine
from xml.dom import minidom
from datetime import date

XML_URL = 'DailyTreasuryYieldCurveRateData.xml'
mydoc = minidom.parse(XML_URL)

id_tag = 'd:Id'
date_tag = 'd:NEW_DATE'
m1_tag = 'd:BC_1MONTH'
m2_tag = 'd:BC_2MONTH'
m3_tag = 'd:BC_3MONTH'
m6_tag = 'd:BC_6MONTH'
y1_tag = 'd:BC_1YEAR'
y2_tag = 'd:BC_2YEAR'
y3_tag = 'd:BC_3YEAR'
y5_tag = 'd:BC_5YEAR'
y7_tag = 'd:BC_7YEAR'
y10_tag = 'd:BC_10YEAR'
y20_tag = 'd:BC_20YEAR'
y30_tag = 'd:BC_30YEAR'

entrys = mydoc.getElementsByTagName('entry')

data = []

for entry in entrys:
    contents = entry.getElementsByTagName('content')
    for content in contents:
        item_id = content.getElementsByTagName(id_tag)[0].firstChild.data
        item_date = content.getElementsByTagName(date_tag)[0].firstChild.data
        item_1month_value = None if not content.getElementsByTagName(m1_tag)[
            0].firstChild else content.getElementsByTagName(m1_tag)[
            0].firstChild.data
        item_2month_value = None if not content.getElementsByTagName(m2_tag)[
            0].firstChild else content.getElementsByTagName(m2_tag)[
            0].firstChild.data
        item_3month_value = None if not content.getElementsByTagName(m3_tag)[
            0].firstChild else content.getElementsByTagName(m3_tag)[
            0].firstChild.data
        item_6month_value = None if not content.getElementsByTagName(m6_tag)[
            0].firstChild else content.getElementsByTagName(m6_tag)[
            0].firstChild.data
        item_1year_value = None if not content.getElementsByTagName(y1_tag)[
            0].firstChild else content.getElementsByTagName(y1_tag)[
            0].firstChild.data
        item_2year_value = None if not content.getElementsByTagName(y2_tag)[
            0].firstChild else content.getElementsByTagName(y2_tag)[
            0].firstChild.data
        item_3year_value = None if not content.getElementsByTagName(y3_tag)[
            0].firstChild else content.getElementsByTagName(y3_tag)[
            0].firstChild.data
        item_5year_value = None if not content.getElementsByTagName(y5_tag)[
            0].firstChild else content.getElementsByTagName(y5_tag)[
            0].firstChild.data
        item_7year_value = None if not content.getElementsByTagName(y7_tag)[
            0].firstChild else content.getElementsByTagName(y7_tag)[
            0].firstChild.data
        item_10year_value = None if not content.getElementsByTagName(y10_tag)[
            0].firstChild else content.getElementsByTagName(y10_tag)[
            0].firstChild.data
        item_20year_value = None if not content.getElementsByTagName(y20_tag)[
            0].firstChild else content.getElementsByTagName(y20_tag)[
            0].firstChild.data
        item_30year_value = None if not content.getElementsByTagName(y30_tag)[
            0].firstChild else content.getElementsByTagName(y30_tag)[
            0].firstChild.data

        item_data = {
            'id': item_id,
            'date': item_date.split('T')[0],
            '1month': item_1month_value,
            '2month': item_2month_value,
            '3month': item_3month_value,
            '6month': item_6month_value,
            '1year': item_1year_value,
            '3year': item_3year_value,
            '5year': item_5year_value,
            '7year': item_7year_value,
            '10year': item_10year_value,
            '20year': item_20year_value,
            '30year': item_30year_value,
        }
        data.append(item_data)


# print('test')
# DB_USER = root
# DB_PASSWORD = P@ssw0rd
# DB_HOST = db
# DB_NAME = nullsuck

# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker

# Base = declarative_base()


# DB_USER = "root"  # os.environ.get('DB_USER')
# DB_PASSWORD = "password"  # os.environ.get('DB_PASSWORD')
# DB_HOST = "db"  # os.environ.get('DB_HOST')
# DB_NAME = "kenji"  # os.environ.get('DB_NAME')

# 接続したいDBの基本情報を設定
# user_name = "user"
# password = "password"
# host = "db"  # docker-composeで定義したMySQLのサービス名
# database_name = "sample_db"

# DB_URL = 'mysql://%s:%s@%s/%s?charset=utf8' % (
#     user_name,
#     password,
#     host,
#     database_name,
# )
# DB_URL = "mysql://{0}:{1}@{2}:3306".format(DB_USER, DB_PASSWORD, DB_HOST)


# # print(DB_URL)
# ECHO_LOG = True
# engine = create_engine(
#     DB_URL, echo=ECHO_LOG
# )
# print(DB_URL)

# Query for existing databases
# existing_databases = engine.execute("SHOW DATABASES;")


# print(existing_databases)

user_name = "user"
password = "password"
host = "mysql_db"  # docker-composeで定義したMySQLのサービス名
database_name = "debt"


# conn = mysql.connect(
#     host="mysql_db",
#     user="user",
#     passwd="password",
#     port=3306,
#     database="employees"
# )

conn = mysql.connect(user=user_name, password=password,
                     host=host, buffered=True)
cursor = conn.cursor()
databases = ("show databases")
cursor.execute(databases)
is_debt_db = False
for (databases) in cursor:
    if databases[0] == database_name:
        is_debt_db = True

if not is_debt_db:
    databaseStr = "CREATE DATABASE " + database_name
    cursor.execute(databaseStr)

conn = mysql.connect(
    host="mysql_db",
    user=user_name,
    passwd="password",
    port=3306,
    database=database_name
)
conn.ping(reconnect=True)

cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS debt")
# cursor.execute("")
# Creating table as per requirement
sql = "CREATE TABLE debt(date DATE, 1month  DECIMAL(12, 10), " \
    "2month DECIMAL(12, 10), 3month  DECIMAL(12, 10), " \
    "6month DECIMAL(12, 10), 1year DECIMAL(12, 10),"\
    "3year DECIMAL(12, 10), 5year DECIMAL(12, 10),"\
    "7year DECIMAL(12, 10), 10year DECIMAL(12, 10),"\
    "20year DECIMAL(12, 10), 30year DECIMAL(12, 10)"\
    ")"

cursor.execute(sql)

for data_item in data:
    # item_str = "INSERT INTO debt() VALUES ({})".format(
    #     data_item['id'])a
    # print(item_str)
    date_str = data_item['date'].split("-")
    now = date(int(date_str[0]), int(date_str[1]), int(date_str[2]))
    sqp = ""
    val = ()

    sql = "INSERT INTO debt(date, 1month, 2month, 3month, 6month, 1year, 3year, 5year, 7year," \
        " 10year, 20year, 30year) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    val = (now, data_item['1month'], data_item['2month'],
           data_item['3month'], data_item['6month'],
           data_item['1year'], data_item['3year'], data_item['5year'],
           data_item['7year'], data_item['10year'], data_item['20year'], data_item['30year'])

    cursor.execute(sql, val)
    conn.commit()


# 接続できているかどうか確認
# print(conn.is_connected())


# # 接続したいDBの基本情報を設定

# DB_URL = 'mysql://%s:%s@%s:3306/%s?charset=utf8' % (
#     user_name,
#     password,
#     host,
#     database_name,
# )

# print(DB_URL)
# ECHO_LOG = True
# engine = create_engine(
#     DB_URL, echo=ECHO_LOG
# )
# existing_databases = engine.execute("SHOW DATABASES;")
# print(existing_databases)

# ,
# date DATE
#    PRIMARY KEY (id)
#
#    2month  DECIMAL(12, 10),
#    3month  DECIMAL(12, 10),
#    6month  DECIMAL(12, 10),
#    2year  DECIMAL(12, 10),
#    1year  DECIMAL(12, 10),
#    3year  DECIMAL(12, 10),
#    5year  DECIMAL(12, 10),
#    7year  DECIMAL(12, 10),
#    10year  DECIMAL(12, 10),
#    20year  DECIMAL(12, 10),
#    30year  DECIMAL(12, 10),
