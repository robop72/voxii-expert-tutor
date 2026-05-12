import urllib.request

url = "https://vocabulary.curriculum.edu.au/MRAC/2024/04/LA/MAT/export/MRAC/2024/04/LA/MAT.jsonld"
file_name = "vcaa_curriculum.json"

print(f"Downloading curriculum data from {url}...")
urllib.request.urlretrieve(url, file_name)
print(f"Success! Saved as {file_name}")