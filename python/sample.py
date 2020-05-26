# print('test')
# DB_USER = root
# DB_PASSWORD = P@ssw0rd
# DB_HOST = db
# DB_NAME = nullsuck

# from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
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

import mysql.connector as mysql
user_name = "root"
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


# conn.ping(reconnect=True)

# # 接続できているかどうか確認
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
