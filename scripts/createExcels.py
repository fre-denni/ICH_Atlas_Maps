import os
import panda as pd

script_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(script_dir)
data_folder = os.path.join(root, "data")
comp_tool = os.path.join(data_folder, "comparisons-tool.csv")
#dig_flux #probably need to make something similar to unifyComp.py
#creative_map

#add datasets to a list

#get to the subfolder
download = os.path.join(data_folder, "download")
os.makedirs(download, exist_ok=True)

#save a xlsx file
#change to a for loop for all datasets in a list
  #dataset to a df frame
  # excel = os.path.join(download, "Competences-Map-Dataset.xlsx")
writer = pd.ExcelWriter(excel, engine='xlsxwriter')

# Save the Excel files
writer.close()