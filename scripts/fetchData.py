import pandas as pd
import numpy as numpy
import os
import time
import requests

# Step 1 : Import csv
script_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(script_dir)
data_folder = os.path.join(root, "data")
links = os.path.join(data_folder, "links.csv")

# Read the links in "data/links.csv" -> store in a list
ldf = pd.read_csv(links)

for index, row in ldf.iterrows():
  file_name = row['what']
  url = row['link']

  download_path = os.path.join(data_folder, f"{file_name}.csv")

# Use the list to periodically check if there are modifications to the file, if yes download it
  try:
    response = requests.get(url, timeout=15)
    response.raise_for_status()

    with open(download_path, 'w', encoding='utf-8') as f:
      f.write(response.text)

    print(f"Saved to '{download_path}'")
  
  except requests.exceptions.RequestException as e:
    print(f"Error downloading {url}: {e}")


# Step 2 : Clean data
# Clean the null values, parse (if needed) and save file to directory "/data"