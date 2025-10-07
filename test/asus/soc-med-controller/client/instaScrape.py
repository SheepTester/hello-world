from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time
import urllib.request
import requests

# PATH = r"/usr/lib/chromium-browser/chromedriver"
driver = webdriver.Chrome()

driver.get("https://www.instagram.com/")

for i in range(20):
    # login
    time.sleep(5)
    username = driver.find_element(By.CSS_SELECTOR, "input[name='username']")
    password = driver.find_element(By.CSS_SELECTOR, "input[name='password']")
    username.clear()
    password.clear()
    username.send_keys("8327205591")
    password.send_keys("zuVC=rm0rf")
    login = driver.find_element(
        By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(3)

# save your login info?
time.sleep(10)
notnow = driver.find_element(By.XPATH,
                             "//button[contains(text(), 'Not Now')]").click()
# turn on notif
time.sleep(10)
notnow2 = driver.find_element(By.XPATH,
                              "//button[contains(text(), 'Not Now')]").click()

# searchbox
time.sleep(5)
searchButton = driver.find_element(
    By.CSS_SELECTOR, "[aria-label='Search']").click()
searchbox = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Search']")
searchbox.clear()
searchbox.send_keys("Kim Kardashian")
time.sleep(5)
searchbox.send_keys(Keys.ENTER)
time.sleep(5)
searchbox.send_keys(Keys.ENTER)


# scroll
scrolldown = driver.execute_script(
    "window.scrollTo(0, document.body.scrollHeight);var scrolldown=document.body.scrollHeight;return scrolldown;")
match = False
numScrolls = 0
posts = []
while(match == False):
    last_count = scrolldown
    time.sleep(3)
    scrolldown = driver.execute_script(
        "window.scrollTo(0, document.body.scrollHeight);var scrolldown=document.body.scrollHeight;return scrolldown;")
    links = driver.find_elements(By.TAG_NAME, 'a')
    for link in links:
        post = link.get_attribute('href')
        if '/p/' in post:
            posts.append(post)
    if last_count == scrolldown or numScrolls == 5:
        match = True
    numScrolls += 1

print(posts)


# get videos and images
download_url = ''
for post in posts:
    driver.get(post)
    shortcode = driver.current_url.split("/")[-2]
    time.sleep(7)
    if driver.find_element(By.CSS_SELECTOR, "img[style='object-fit: cover;']") is not None:
        download_url = driver.find_element(By.CSS_SELECTOR,
                                           "img[style='object-fit: cover;']").get_attribute('src')
        urllib.request.urlretrieve(download_url, '{}.jpg'.format(shortcode))
    else:
        download_url = driver.find_element(By.CSS_SELECTOR,
                                           "video[type='video/mp4']").get_attribute('src')
        urllib.request.urlretrieve(download_url, '{}.mp4'.format(shortcode))
    time.sleep(5)
