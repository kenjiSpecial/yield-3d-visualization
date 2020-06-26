import csv
import pprint
from datetime import date
import json


data_list = ['treasury_yield_australia', 'treasury_yield_brazil',
             'treasury_yield_germany', 'treasury_yield_india']


def parse(row, item, targetTime):
    if item is data_list[0]:
        return parseAustraliaData(row, targetTime)
    elif item is data_list[1]:
        return parseBrazilData(row, targetTime)
    elif item is data_list[2]:
        return parseGermanyData(row, targetTime)
    elif item is data_list[3]:
        return parseIndiaData(row, targetTime)


def parseAustraliaData(row, targatTime):
    return {
        "date": targetTime.strftime("%Y-%m-%d"),
        "m1": None,
        "m2": None,
        "m3": None,
        "m6": None,
        "y1": None if row[1] is '' else row[1],
        "y2": None if row[2] is '' else row[2],
        "y3": None if row[3] is '' else row[3],
        "y5": None if row[4] is '' else row[4],
        "y7": None if row[5] is '' else row[5],
        "y10": None if row[6] is '' else row[6],
        "y20": None,
        "y30": None,
    }


def parseBrazilData(row, targetTime):
    return {
        "date": targetTime.strftime("%Y-%m-%d"),
        "m1": None,
        "m2": None,
        "m3": None if row[1] is '' else row[1],
        "m6": None if row[2] is '' else row[2],
        "y1": None if row[3] is '' else row[3],
        "y2": None if row[4] is '' else row[4],
        "y3": None if row[5] is '' else row[5],
        "y5": None if row[6] is '' else row[6],
        "y7": None,
        "y10": None if row[7] is '' else row[7],
        "y20": None,
        "y30": None,
    }


def parseGermanyData(row, targetTime):
    return {
        "date": targetTime.strftime("%Y-%m-%d"),
        "m1": None if row[1] is '' else row[1],
        "m2": None,
        "m3": None if row[2] is '' else row[2],
        "m6": None if row[3] is '' else row[3],
        "y1": None if row[4] is '' else row[4],
        "y2": None if row[5] is '' else row[5],
        "y3": None if row[6] is '' else row[6],
        "y5": None if row[7] is '' else row[7],
        "y7": None if row[8] is '' else row[8],
        "y10": None if row[9] is '' else row[9],
        "y20": None if row[10] is '' else row[10],
        "y30": None if row[11] is '' else row[11],
    }


def parseIndiaData(row, targetTime):

    return {
        "date": targetTime.strftime("%Y-%m-%d"),
        "m1": None,
        "m2": None,
        "m3": None if row[1] is '' else row[1],
        "m6": None if row[2] is '' else row[2],
        "y1": None if row[3] is '' else row[3],
        "y2": None if row[4] is '' else row[4],
        "y3": None if row[5] is '' else row[5],
        "y5": None if row[6] is '' else row[6],
        "y7": None if row[7] is '' else row[7],
        "y10": None if row[8] is '' else row[8],
        "y20": None,
        "y30": None if row[9] is '' else row[9],
    }


for item in data_list:
    readFile = 'data/' + item + '.csv'

    data = []
    with open(readFile) as f:
        # print(f.read())
        next(f)
        reader = csv.reader(f)
        for row in reader:
            # print(row)
            # now = date()
            time = row[0].split("/")
            month = int(time[0])
            day = int(time[1])
            year = int(time[2])
            if year < 30:
                year = year + 2000
            else:
                year = year + 1900

            targetTime = date(year, month, day)

            rowSize = len(row)
            data.append(parse(row, item, targetTime))

        country = item.split('_')[2]
        writeFile = 'data/write/' + country + '.json'

        with open(writeFile, "w") as outfile:
            output = {
                "country": country,
                "data": data
            }
            json.dump(output, outfile)
