
from io import StringIO
import urllib.request
from xml.dom import minidom
from datetime import date
import csv
import pprint
import json
import urllib
import pandas as pd

url_all = "https://www.mof.go.jp/jgbs/reference/interest_rate/data/jgbcm_all.csv"
url = "https://www.mof.go.jp/jgbs/reference/interest_rate/jgbcm.csv"


# url_open = urllib.request.urlopen(url)
# csvfile = csv.reader(io.StringIO(
#     url_open.read().decode('utf-8')), delimiter=',')
# with urllib.request.urlopen(url) as response:
# response = urllib.urlopen(url)
# cr = csv.reader(response)
# csv_data = response.read()
# cr = csv.reader(response)
# print(csv_data)
# f = StringIO(csv_data)
# next(f)
# next(f)
# reader = csv.reader(f, delimiter=',')
# for row in cr:
#     print(row)

data = []


def getFullYear(yearStr):
    year = int(yearStr[1:])
    if yearStr[0] == "R":
        return 2018 + year
    elif yearStr[0] == "H":
        return 1988 + year


def isValid(yearStr):
    if yearStr[0] == "H" or yearStr[0] == "R":
        return True
    else:
        return False


def read():
    for index, row in csv.iterrows():
        dateStr = row[0]
        year = dateStr.split(".")[0]
        month = dateStr.split(".")[1]
        day = dateStr.split(".")[2]
        # print(index)

        if isValid(year):
            if getFullYear(year) >= 1990:
                targetTime = date(getFullYear(year), int(month), int(day))

                data.append({
                    "date": targetTime.strftime("%Y-%m-%d"),
                    "y1": row[1],
                    "y2": row[2],
                    "y3": row[3],
                    "y4": row[4],
                    "y5": row[5],
                    "y7": row[7],
                    "y10": row[10],
                    "y20": row[12],
                    "y30": row[14],
                })


csv = pd.read_csv(url, encoding='shift_jis', header=1)
read()

csv = pd.read_csv(url_all, encoding='shift_jis', header=1)
read()

country = "japan"
writeFile = 'data/write/' + country + '.json'
with open(writeFile, "w") as outfile:
    output = {
        "country": country,
        "data": data
    }
    json.dump(output, outfile)
