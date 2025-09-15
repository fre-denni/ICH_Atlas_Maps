import pandas as pd
import numpy as np
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
    print(f"Downloading data from {url}...")
    response = requests.get(url, timeout=15)
    response.raise_for_status()

    with open(download_path, 'w', encoding='utf-8') as f:
      f.write(response.text)

    print(f"Saved to '{download_path}'")

    # Step 2 : Clean data
    # Clean the null values, parse (if needed) and save file to directory "/data"

    try:
      clean = pd.read_csv(download_path, na_values=['NA', '["NA"]'])
      #keep track of original row count
      og_rows = len(clean)

      #drop rows with NAN
      clean.dropna(inplace=True)

      #keep track of new row count
      cleaned_rows = len(clean)

      #Save the file and overwrite it (index=False won't create a new column)
      clean.to_csv(download_path, index=False, encoding='utf-8')
      print(f"Cleaning complete. Removed {og_rows - cleaned_rows} rows.")
    except pd.errors.EmptyDataError:
      print(f"Warning: {donwload_path} is empty. Skipping cleaning")
    except Exception as e:
      print(f"An error occured while cleaning {file_name}.csv: {e}")
  
  except requests.exceptions.RequestException as e:
    print(f"Error downloading {url}: {e}")