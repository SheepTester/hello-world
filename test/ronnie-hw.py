# pip install --upgrade google-api-python-client
import requests
from googleapiclient import discovery

credentials = 'SOMETHING HERE'

service = discovery.build('sheets', 'v4', credentials=credentials)

# fetch and parse Facebook results as JSON
search_results = requests.get('https://graph.facebook.com/pages/search?&q=Brisbane,California&access_token=EAACLZA7yUqzYBAFAxvuy2Q9cbnbzalpACiAhp4jdqg9OjcUOZAZCMkjhm3ZAlRPqR7HKRX7zt4BuQZB47GdXWpz2QSV8KOTf12UtU69QZAvTmJ5Yo1VapmBpW9vO8HMJo1XZCYbBnZC39hnm4ROhERJjjZCc1F1ievEcBYkKL7Ym7JYulEJTIyI2D&fields=id,about,name,location,description,phone,website,category_list,mission')

rows = []

# add each result in `data` of the JSON as a row in the spreadsheet
for result in search_results['data']:
    # get page data for more info
    page_data = requests.get('https://graph.facebook.com/' + result['id'] + '?access_token=EAACLZA7yUqzYBAFAxvuy2Q9cbnbzalpACiAhp4jdqg9OjcUOZAZCMkjhm3ZAlRPqR7HKRX7zt4BuQZB47GdXWpz2QSV8KOTf12UtU69QZAvTmJ5Yo1VapmBpW9vO8HMJo1XZCYbBnZC39hnm4ROhERJjjZCc1F1ievEcBYkKL7Ym7JYulEJTIyI2D&fields=name,username,id,category,category_list,website,phone,about,description').json()

    # add specific data from each search result to the spreadsheet row
    # using .get to avoid exception if one of the data isn't specified
    rows.append([
        page_data.get('name'),
        page_data.get('username'),
        page_data.get('id'),
        page_data.get('category'),
        ', '.join([category['name'] for category in page_data['category_list']]) if 'category_list' in page_data else '',
        result['location'].get('city') if 'location' in result else '',
        result['location'].get('street') if 'location' in result else '',
        page_data.get('website'),
        page_data.get('phone'),
        page_data.get('about'),
        page_data.get('description')
    ])
request = service.spreadsheets().values().append(
    spreadsheetId='SPREADSHEET ID HERE',
    range='A:A',
    valueInputOption='RAW',
    insertDataOption='INSERT_ROWS',
    body={'values': rows}
)
response = request.execute()
