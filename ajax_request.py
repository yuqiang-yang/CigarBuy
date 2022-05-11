# -*- coding:UTF-8 -*- 
import json
import urllib
import urllib.request
import sys
import io
from timeit import default_timer as timer
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from PIL import Image
import ddddocr
from selenium import webdriver
from selenium.webdriver.common.by import *
import time
import os
import subprocess



def request_ajax_url(url,body,referer,cookie):
    req = urllib.request.Request(url)

    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    req.add_header('X-Requested-With','XMLHttpRequest')
    if cookie !=None:
        req.add_header('Cookie',cookie)
    req.add_header('Referer',referer)
    req.add_header('user_agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36')
    req.add_header('X-Forwarded-For','120.218.239.12')
    req.add_header('sec-ch-ua-platform','Windows')
    req.add_header('Sec-Fetch-Dest','empty')
    req.add_header('Sec-Fetch-Mode','cors')
    req.add_header('Sec-Fetch-Site','same-origin')
    req.add_header('Origin','https://www.yueyigou.com')
    req.add_header('Host','www.yueyigou.com')
    
    response = urllib.request.urlopen(req, data=urllib.parse.urlencode(body).encode('utf-8'))

    return response




def login(driver):
    print("get url")
    url = 'https://www.yueyigou.com/wdk?action=ecw.page&method=display&page_id=page_login&site_id=zhaoqing'

    driver.get(url)
    driver.set_window_size(1366,768)
    driver.find_element(By.ID,"login_username").send_keys('441201110243')
    driver.find_element(By.ID,"login_userpwd").send_keys('223100aa')
    ver_code = driver.find_element(By.ID,"login_identifying_code")
    driver.get_screenshot_as_file('screenshot.png')
    element = driver.find_element_by_id('login_idCode')
    left = int(element.location['x'])
    top = int(element.location['y'])
    right = int(element.location['x'] + element.size['width'])
    bottom = int(element.location['y'] + element.size['height'])
    im = Image.open('screenshot.png')
    im = im.crop((left, top, right, bottom))
    im.save('code.png')    
    print("identify code")
    ocr = ddddocr.DdddOcr()
    with open('code.png', 'rb') as f:
        img_bytes = f.read()
    res = ocr.classification(img_bytes)
    ver_code.send_keys(res)
    driver.find_element(By.ID,"login_Toindexbtn").click()

    time.sleep(1)



chrome_options = Options()
chrome_options.add_argument('--headless')
driver = webdriver.Chrome(chrome_options=chrome_options)

login(driver)

cookies = driver.get_cookies()
strcookie = ''
for c in cookies:
    strcookie+= c['name']
    strcookie+='='
    strcookie+=c['value']
    strcookie+=';'
strcookie = strcookie[:-1]
ss = driver.execute_script('return window.sessionStorage.getItem("wdk_user");')
ss = eval(ss)
print(ss)

###


###
p = subprocess.Popen('node pyjs.js 3', stdout=subprocess.PIPE)
referer_url = 'https://www.yueyigou.com/wdk?action=ecw.page&method=display&site_id=zhaoqing&inclient=&page_id=page_buy&iscartin=1&cartnoselect='
out = p.stdout.read()
list_out = out.decode('utf-8').split('\n',2)
login_url = list_out[0]
login_body = dict(wppm=list_out[1][5:])
print(login_url)
print(login_body)
response = request_ajax_url(login_url,login_body,referer_url,strcookie)
result = response.read()
print(result)


p = subprocess.Popen('node pyjs.js 1 {0} {1} {2}'.format(ss['account_uuid'],ss['cust_uuid'],ss['manage_unit_uuid']), stdout=subprocess.PIPE)
out = p.stdout.read()
list_out = out.decode('utf-8').split('\n',2)

login_referer = 'https://www.yueyigou.com/wdk?action=ecw.page&method=display&site_id=zhaoqing&inclient=&page_id=page_cartlist'

login_url = list_out[0]
login_body = dict(wppm=list_out[1][5:])
print(login_url)
print(login_body)
tic = timer()

response = request_ajax_url(login_url,login_body,login_referer,strcookie)
driver.quit()

toc = timer()

result = response.read()


str = result.decode('utf-8')
f = open('str.txt','w',encoding='utf-8')
f.write(str)
f.close()
p = subprocess.Popen('node pyjs.js 0', stdout=subprocess.PIPE)
out = p.stdout.read()
list_out = out.decode('utf-8').split('\n',2)
print('second process',toc - tic)

referer_url = 'https://www.yueyigou.com/wdk?action=ecw.page&method=display&site_id=zhaoqing&inclient=&page_id=page_buy&iscartin=1&cartnoselect='
url = list_out[0]
body  = dict(wppm=list_out[1][5:])
print('url',url)
print('body',body)
tic = timer()
response = request_ajax_url(url,body,referer_url,strcookie)
toc = timer()
print('buy request',toc-tic)
result = response.read()
print(result)


str = result.decode('utf-8')
res = eval(str)
p = subprocess.Popen('node pyjs.js 2 {0} {1}'.format(ss['cust_uuid'],res['request']['requestid']) , stdout=subprocess.PIPE)
out = p.stdout.read()
list_out = out.decode('utf-8').split('\n',2)
url2 = list_out[0]
body2  = dict(wppm=list_out[1][5:])
print('url2',url2)
print('body2',body2)



# p = subprocess.Popen('node pyjs.js 4', stdout=subprocess.PIPE)
# referer_url = 'https://www.yueyigou.com/wdk?action=ecw.page&method=display&site_id=zhaoqing&inclient=&page_id=page_buy&iscartin=1&cartnoselect='
# out = p.stdout.read()
# list_out = out.decode('utf-8').split('\n',2)
# login_url = list_out[0]
# login_body = dict(wppm=list_out[1][5:])
# print(login_url)
# print(login_body)
# response = request_ajax_url(login_url,login_body,referer_url,strcookie)
# result = response.read()
# print(result)


while True:
    tic = timer()

    response = request_ajax_url(url2,body2,referer_url,strcookie)
    toc = timer()
    print('status request',toc-tic)
    result = response.read()
    res2 = eval(result)

    print('reqstatus',res2['request']['request_status'])
    print(result)
    
    if(res2['request']['request_status'] != '01' and res2['request']['request_status'] != '02'):
        print(result)
        sys.stdout.flush()
        break
    time.sleep(2)


print('last !!!') 





