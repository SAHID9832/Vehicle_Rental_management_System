import pandas as pd
import json
import os

df = pd.read_csv('database/vehicle_image_manifest.csv')
public_dir = 'frontend/public'

manifest_by_vid = {}
for idx, r in df.iterrows():
    vid = str(r['Vehicle_ID'])
    make = str(r['Make'])
    model = str(r['Vehicle_Model'])
    view = str(r['Image_View'])
    rel_path = str(r['Image_File']) if pd.notna(r['Image_File']) else ''
    license_val = str(r['License']) if pd.notna(r['License']) else ''
    attribution = str(r['Attribution']) if pd.notna(r['Attribution']) else ''

    if vid not in manifest_by_vid:
        manifest_by_vid[vid] = {'vid': vid, 'make': make, 'model': model, 'views': {}}

    if rel_path:
        local_path = os.path.join(public_dir, rel_path)
        if os.path.exists(local_path):
            manifest_by_vid[vid]['views'][view] = {
                'view': view,
                'path': '/' + rel_path.replace('\\', '/'),
                'license': license_val.strip(),
                'attribution': attribution.strip(),
                'source_url': str(r['Source_Page_URL']) if pd.notna(r['Source_Page_URL']) else ''
            }

print('Vehicles with existing local images:')
for vid, data in manifest_by_vid.items():
    views = list(data['views'].keys())
    if views:
        print(f"{vid} ({data['make']} {data['model']}): {views}")

with open('database/vehicle_images_map.json', 'w', encoding='utf-8') as f:
    json.dump(manifest_by_vid, f, indent=2)

print('Successfully saved database/vehicle_images_map.json')
