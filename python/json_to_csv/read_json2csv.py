# coding: utf-8

import json
import csv
def parse_json(jsonFile,csvFile):
    if not jsonFile or not csvFile:
        print('文件不存在，请检查。。。')
        return None
    
    with open(jsonFile, 'r', encoding='utf-8') as f:
        data = json.load(f)
        #listHeaders = []
        listHeaders = ["created_at","repostsnum","proPic","column1","text","original_url","description","comments_count","column","praises_count","source_host","screen_name","floor"]
        i=0
        
        while data:
            i = i + 1
            
            listDicData = []
            dicData = data.pop()

            if i < 1:
                for key in dicData:
                    listHeaders.append(key)
            listDicData.append(dicData)

            write_csv(csvFile,listHeaders,listDicData,i)

def write_csv(csvfile,listHeaders,dicRows,page=0):
    with open(csvfile,'a+',encoding='utf-8') as f:
        f_csv = csv.DictWriter(f, listHeaders)
        if page == 1:
            f_csv.writeheader()
        f_csv.writerows(dicRows)
    

def get_jsonValue():
    jsonFile = 'twitter_20170316.txt'
    csvFile = 'twitter_20170316.csv'
    parse_json(jsonFile,csvFile)
    
if __name__ == "__main__":
    get_jsonValue()
