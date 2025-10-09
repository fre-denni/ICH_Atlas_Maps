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

    with open(download_path, 'wb') as f:
      f.write(response.content)

    print(f"Saved to '{download_path}'")

    # Step 2 : Clean data
    # Clean the null values, parse (if needed) and save file to directory "/data"

    try:
      clean = pd.read_csv(download_path, na_values=['NA', '["NA"]'], encoding='utf-8')
      print(f"File '{file_name}.csv' loaded with {len(clean)} rows.")

      # Create a dictionary of replacement values
      # For numeric columns, use 0. For all other (object/text) columns, use ""
      fill_values = {}
      for column in clean.columns:
        if pd.api.types.is_numeric_dtype(clean[column]):
          fill_values[column] = 0
        else:
          fill_values[column] = ""

      # Apply the replacements using the fillna() method
      clean.fillna(value=fill_values, inplace=True)
      
      # Save the file and overwrite it
      clean.to_csv(download_path, index=False, encoding='utf-8')
      print(f"Cleaning complete. Replaced NaN values in '{download_path}'")

    except pd.errors.EmptyDataError:
      print(f"Warning: {download_path} is empty. Skipping cleaning.")
    except Exception as e:
      print(f"An error occurred while cleaning {file_name}.csv: {e}")
  
  except requests.exceptions.RequestException as e:
    print(f"Error downloading {url}: {e}")