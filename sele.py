from selenium import webdriver
from selenium.webdriver.common.by import *
import time
import sys
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from PIL import Image
import ddddocr
import os
#改变标准输出的默认编码
#sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf8')

chrome_options = Options()
chrome_options.add_experimental_option("excludeSwitches", ['enable-automation', 'enable-logging'])

#chrome_options.add_argument('--headless')
driver = webdriver.Chrome(chrome_options=chrome_options)

url = 'https://www.yueyigou.com/wdk?action=ecw.page&method=display&page_id=page_login&site_id=zhaoqing'

print("get url")
driver.get(url)
driver.set_window_size(1366,768)
# driver.find_element(By.ID,"login_username").send_keys('441201111024')
# driver.find_element(By.ID,"login_userpwd").send_keys('s2837465')
driver.find_element(By.ID,"login_username").send_keys('441201110468')
driver.find_element(By.ID,"login_userpwd").send_keys('s2837465')
ver_code = driver.find_element(By.ID,"login_identifying_code")
c = driver.get_cookies()
driver.get_screenshot_as_file('screenshot.png')
element = driver.find_element_by_id('login_idCode')
left = int(element.location['x'])
top = int(element.location['y'])
right = int(element.location['x'] + element.size['width'])
bottom = int(element.location['y'] + element.size['height'])
#通过Image处理图像
im = Image.open('screenshot.png')
im = im.crop((left, top, right, bottom))
print((left, top, right, bottom))
im.save('code.png')


print("identify code")
# sys.stdout = open(os.devnull, 'w')
# ocr = ddddocr.DdddOcr()
# with open('code.png', 'rb') as f:
#     img_bytes = f.read()
# res = ocr.classification(img_bytes)
# ver_code.send_keys(res)
# driver.find_element(By.ID,"login_Toindexbtn").click()
# sys.stdout = sys.__stdout__



print("cart list")

WebDriverWait(driver=driver,timeout=50,poll_frequency=0.01).until(EC.element_to_be_clickable((By.ID,"frm_banner_cart")),message='')
driver.find_element(By.ID,"frm_banner_cart").click()


url = driver.current_url
btn = driver.find_element(By.ID,"btn_cart_list_buynow")
while url == driver.current_url:
        try:
                WebDriverWait(driver=driver,timeout=10,poll_frequency=0.01).until(EC.element_to_be_clickable(btn),message='')
                driver.execute_script("arguments[0].click();", btn)
                cuf = driver.find_element(By.CLASS_NAME,"layui-layer-btn0")
                WebDriverWait(driver=driver,timeout=10,poll_frequency=0.01).until(EC.element_to_be_clickable(cuf),message='')
                driver.execute_script("arguments[0].click();", cuf)
        except BaseException:
                #cuf = driver.find_element(By.CLASS_NAME,"layui-layer-btn0")
                #print('异常')
                pass
        time.sleep(0.05)

url = driver.current_url
print("buy")

flag = False
while(True):
        qrt=driver.find_elements(By.CSS_SELECTOR,".total_qty")
        #qrt=driver.find_elements(By.CSS_SELECTOR,".total_spec ")

        for i in qrt:

                if(i.text != '0' and i.text != ''):
                        flag = True
        if(flag):
                break
print("submit")
while url == driver.current_url:
        try:
                WebDriverWait(driver=driver,timeout=10,poll_frequency=0.01).until(EC.element_to_be_clickable((By.CLASS_NAME,"cq_buy_main_btn_next")),message='')
                next = driver.find_element(By.CLASS_NAME,"cq_buy_main_btn_next")
                next.click()

                WebDriverWait(driver=driver,timeout=10,poll_frequency=0.01).until(EC.element_to_be_clickable((By.CLASS_NAME,"cq_buy_main_btn_submit")),message='')
                submit  = driver.find_element(By.CLASS_NAME,"cq_buy_main_btn_submit")
                submit.click()
                time.sleep(0.01)

                # WebDriverWait(driver=driver,timeout=10,poll_frequency=0.01).until(EC.element_to_be_clickable((By.CLASS_NAME,"layui-layer-btn0")),message='')
                # submit  = driver.find_element(By.CLASS_NAME,"layui-layer-btn0")
                # submit.click()
        except:
                pass

print("last")




