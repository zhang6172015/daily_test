#-*- coding:utf-8 -*-
__author__='zwl'
import xlrd
import sys,os
import urllib.request
from urllib.request import urlopen
from bs4 import BeautifulSoup
from xlutils.copy import copy
import xlwt
import csv
import threadpool

class tiaomao_initPrice(object):


    THREAD_NUM = 10
    def __init__(self):
        self.pool = threadpool.ThreadPool(self.THREAD_NUM)
        csvPath = self.GetCurPath()
        csvPath = csvPath + '/data_tiaomao.csv'
        if os.path.exists(csvPath):
            pass
        else:
            self.csvFile = open(csvPath, 'wt', newline='')
            #self.writer = csv.writer(self.csvFile,delimiter=' ', quotechar='|', quoting=csv.QUOTE_MINIMAL)
            self.writer = csv.writer(self.csvFile, delimiter=',')
            self.writer.writerow(['Url', '原始价格', '有无', '产品已下架', '产品不存在','原始内容'])
            self.csvFile.flush()

    def GetCurPath(self):
        path = sys.path[0]
        if getattr(sys, 'froze', False):
            path = os.path.dirname(sys.executable)
        elif __file__:
            path = os.path.dirname(__file__)
        return path
    def GetProductsInfo(self):
       productinfo=[]
       urlsList= self.GetProductUrls()
       ParamList =[]
       for url in urlsList:
           #product = self.get_price(url)
           #productinfo.append(product)
           list_var = [url]
           tuple_var = (list_var, None)
           ParamList.append(tuple_var)
       reqs = threadpool.makeRequests(self.get_price, ParamList)
       [self.pool.putRequest(req) for req in reqs]
       self.pool.wait()
       ParamList = []
       return  productinfo

    def get_price(self,url):
        strmatch="初上市价格"
        strunit='元'
        pdInfo = {'url':url,'price': '无', 'pdRemove': '无', 'saleOut': '否', 'errPage': '否','content':''}
        print('开始抓取[%s]'%(pdInfo['url']))
        html = urlopen(url)
        bsObj = BeautifulSoup(html)

        if bsObj.find('div', {'class': 'errorDetail'}):
            pdInfo['pdRemove'] = '无'
            pdInfo['errPage'] = '不存在'
            self.WriteCSVText(pdInfo)
            return pdInfo

        try:
            saleOut = bsObj.find('div', {'class': 'sold-out-info'})
            if saleOut:
                pdInfo['saleOut'] = '已下架'
        except AttributeError as e:
            pass

        try:
            text = bsObj.find('div', {'class': 'tb-detail-hd'}).p.text.strip()
            pdInfo['content']=text
        except AttributeError as e:
            #print('url[%s]网页[不存在]原始价格，p标签不存在。' % (url))
            self.WriteCSVText(pdInfo)
            return pdInfo
        try:
            price = text.split(strmatch)[1].strip()


        except IndexError as e:
            #print('url[%s]网页[不存在]原始价格，初上市价格内容不存在。' % (url))
            self.WriteCSVText(pdInfo)
            return pdInfo

        try:
            price = float(price.replace(strunit, ''))
            pdInfo['price'] = price
            pdInfo['pdRemove'] = '有'
        except UnboundLocalError as e:
            #print('url[%s]网页[不存在]原始价格，价格转数字不存在。' % (url))
            self.WriteCSVText(pdInfo)
            return pdInfo
        self.WriteCSVText(pdInfo)
        return pdInfo
    def WriteCSVText(self,productinfo):
        row=list([productinfo['url'], productinfo['price'], productinfo['pdRemove'], productinfo['saleOut'],productinfo['errPage'],productinfo['content']])
        self.writer.writerow(row)
        #self.writer.writerow(productinfo)
        #self.writer.DictWriter(self.csvFile, fieldnames=productinfo.keys())
        self.csvFile.flush()
    def WriteCSVHeader(self):
        csvPath = self.GetCurPath()
        csvPath = csvPath +'/data_tiaomao.csv'
        if os.path.exists(csvPath):
            pass
        else:
           csvFile = open(csvPath,'w+')
           try:
               writer=csv.writer(csvFile)
               writer.writerow(['Url','原始价格','有无','产品不存在','产品已下架','原始内容'])
           finally:
               csvFile.close()


    def GetProductUrls(self):
        urlsList = []
        path = self.GetCurPath()
        path = path+'/工作簿14.xlsx'
        data = xlrd.open_workbook(path)
        table = data.sheet_by_index(0)
        nrows= table.nrows
        for row in range(nrows):
           if row > 0:
              urlsList.append(table.row_values(row,0,1)[0])
        return  urlsList
    def SaveExcelInfo(self):
        #self.WriteCSVHeader()
        productsinfo = self.GetProductsInfo()
        '''
        book = xlwt.Workbook()
        sheet1 = book.add_sheet('Sheet 1')
        row = 0
        #pdInfo = {'url': url, 'price': 'none', 'pdRemove': 'false', 'saleOut': 'false', 'errPage': 'false'}
        for product in productsinfo:
            sheet1.write(row,0,product['url'])
            sheet1.write(row, 1, product['price'])
            sheet1.write(row, 2, product['pdRemove'])
            sheet1.write(row, 3, product['saleOut'])
            sheet1.write(row, 4, product['errPage'])
            row = row +1
        book.save('工作簿15.xls')
        '''


    def AlertExcelInfo(self,url,price,nstate):
        path = self.GetCurPath()
        path = path + '/工作簿14.xlsx'
        data = xlrd.open_workbook(path)
        table = data.sheet_by_index(0)
        tmpData = copy(data)
        w_sheet=tmpData.get_sheet(0)
        nrows = table.nrows
        productInfo = self.GetProductsPrice()
       # for product in productInfo:
        for row in range(nrows):
            if row > 0:
               surl=table.row_values(row,0,1)[0]
               #if surl == product['url']:
               if surl == url:
                    w_sheet.write(row,1,url)
                    #w_sheet.write(row, 2, product['price'])
                    #w_sheet.write(row, 5, product['state'])
                    w_sheet.write(row, 2, price)
                    w_sheet.write(row, 5,nstate)
        w_sheet.save("工作簿15.xls")

if __name__ == '__main__':
    tiaomao_initPrice = tiaomao_initPrice();
    #tiaomao_initPrice.GetProductUrls()
    tiaomao_initPrice.GetProductsInfo()
    input('执行完毕，按任意键退出。')
