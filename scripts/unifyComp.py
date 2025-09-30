import os
import pandas as pd

script_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(script_dir)
data_folder = os.path.join(root, "data")
sheet1 = os.path.join(data_folder, "competences-map-skill.csv")
sheet2 = os.path.join(data_folder, "competences-map-tech.csv")

# Read the CSV files into DataFrames
df1 = pd.read_csv(sheet1)
df2 = pd.read_csv(sheet2)

# Create an Excel writer object using xlsxwriter engine
download = os.path.join(data_folder, "download")
os.makedirs(download, exist_ok=True)
excel = os.path.join(download, "Competences-Map-Dataset.xlsx")
writer = pd.ExcelWriter(excel, engine='xlsxwriter')

# Write each DataFrame to a separate sheet
df1.to_excel(writer, sheet_name='SkillToProject', index=False)
df2.to_excel(writer, sheet_name='ProjectToTech', index=False)

# Save the Excel file
writer.close()