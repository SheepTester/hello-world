import json
import zipfile
import datetime
import os
import sys

# Try to import zlib to check for its availability
try:
    import zlib
    ZLIB_AVAILABLE = True
except ImportError:
    ZLIB_AVAILABLE = False
    print("Warning: The 'zlib' module is not available. Files will be stored without compression (ZIP_STORED).")
    print("To enable compression, please ensure 'zlib' is properly installed/linked with your Python environment.")

def create_split_timed_zip_archives():
    """
    Reads file information from 'theythems.json', calculates specific
    modification times for each file, and creates three 'billyX.zip' archives
    with these files and their assigned timestamps, split into thirds.

    The 'theythems.json' file is expected to be a JSON array of objects,
    where each object has a 'fileName' property. The order of files
    in the JSON dictates the reverse order of their modification times
    in the ZIP archive (first JSON entry gets the latest time, etc.).
    Each subsequent file's timestamp will be 2 seconds older than the
    previous one.

    The files are split into three ZIPs:
    - billy3.zip: Contains the first third of files from JSON (latest mtimes).
    - billy2.zip: Contains the middle third of files from JSON.
    - billy1.zip: Contains the last third of files from JSON (oldest mtimes).
    """
    json_file_name = "theythems.json"
    base_zip_name = "billy"
    # The minimum time interval between consecutive files in seconds
    time_interval_seconds = 2

    print(f"Starting ZIP archive creation process for '{base_zip_name}X.zip' files...")
    print(f"Reading file list from '{json_file_name}'...")

    # --- 1. Read the JSON file containing file names and URLs ---
    try:
        with open(json_file_name, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        print(f"Successfully loaded data from '{json_file_name}'.")
    except FileNotFoundError:
        print(f"Error: The file '{json_file_name}' was not found.")
        print("Please ensure 'theythems.json' is in the same directory as this script.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{json_file_name}'.")
        print("Please check if the JSON file is correctly formatted.")
        return
    except Exception as e:
        print(f"An unexpected error occurred while reading '{json_file_name}': {e}")
        return

    # Validate that the JSON data is a list
    if not isinstance(json_data, list):
        print(f"Error: The content of '{json_file_name}' must be a JSON array.")
        return

    if not json_data:
        print(f"Warning: '{json_file_name}' is empty. No files will be added to any zip archive.")
        return

    # --- 2. Calculate the target modification times for each file ---
    # Get the current local time. zipfile.ZipInfo expects local time.
    current_time = datetime.datetime.now()

    files_to_process = []
    for i, item in enumerate(json_data):
        # Ensure each item in the JSON array is a dictionary and has a 'fileName' key
        if not isinstance(item, dict) or "fileName" not in item:
            print(f"Warning: Item at index {i} in '{json_file_name}' is invalid (missing 'fileName' or not an object). Skipping.")
            continue

        file_name = item["fileName"]

        # Calculate the target timestamp for this file.
        # The first file in the JSON (index 0) gets the current_time.
        # Subsequent files get progressively older timestamps.
        target_time = current_time - datetime.timedelta(seconds=i * time_interval_seconds)

        files_to_process.append({"fileName": file_name, "target_time": target_time})

    if not files_to_process:
        print("No valid file entries found in the JSON to process. Exiting.")
        return

    num_files = len(files_to_process)
    print(f"Total files to process: {num_files}")

    # Determine compression type based on zlib availability
    compression_type = zipfile.ZIP_DEFLATED if ZLIB_AVAILABLE else zipfile.ZIP_STORED
    compression_method_name = "DEFLATED (compressed)" if ZLIB_AVAILABLE else "STORED (no compression)"
    print(f"Using compression method: {compression_method_name}")

    # --- 3. Split files and create multiple ZIP archives ---

    # Calculate chunk sizes for splitting
    files_per_zip = num_files // 3
    remainder = num_files % 3

    # Define the slices for each zip file
    # billy3.zip gets the newest files (first chunk from json_data)
    end_idx_3 = files_per_zip + (1 if remainder >= 1 else 0)

    # billy2.zip gets the middle files
    start_idx_2 = end_idx_3
    end_idx_2 = start_idx_2 + files_per_zip + (1 if remainder >= 2 else 0)

    # billy1.zip gets the oldest files (last chunk from json_data)
    start_idx_1 = end_idx_2
    end_idx_1 = num_files

    # Create a list of tuples: (zip_file_name, list_of_files_for_this_zip)
    # Note: The order of creation is billy3, billy2, billy1 to match the description.
    zip_chunks = [
        (f"{base_zip_name}3.zip", files_to_process[0:end_idx_3]),
        (f"{base_zip_name}2.zip", files_to_process[start_idx_2:end_idx_2]),
        (f"{base_zip_name}1.zip", files_to_process[start_idx_1:end_idx_1])
    ]

    for zip_output_name, chunk_files in zip_chunks:
        if not chunk_files:
            print(f"No files for '{zip_output_name}'. Skipping creation.")
            continue

        print(f"\nPreparing to add {len(chunk_files)} files to '{zip_output_name}'.")
        try:
            with zipfile.ZipFile(zip_output_name, 'w', compression=compression_type) as zf:
                for file_info in chunk_files:
                    file_name = file_info["fileName"]
                    target_time = file_info["target_time"]

                    if not os.path.exists(file_name):
                        print(f"Warning: Source file '{file_name}' not found for '{zip_output_name}'. Skipping this file.")
                        continue

                    try:
                        zip_info = zipfile.ZipInfo(file_name)
                        zip_info.date_time = target_time.timetuple()[:6]
                        zip_info.compress_type = compression_type

                        with open(file_name, 'rb') as source_file_content:
                            zf.writestr(zip_info, source_file_content.read())

                        print(f"  Added '{file_name}' with mtime: {target_time.strftime('%Y-%m-%d %H:%M:%S')}")

                    except Exception as e:
                        print(f"  Error adding file '{file_name}' to '{zip_output_name}': {e}")
                        continue

            print(f"Successfully created '{zip_output_name}'.")

        except Exception as e:
            print(f"An unrecoverable error occurred during creation of '{zip_output_name}': {e}")

# Run the function to execute the script
if __name__ == "__main__":
    create_split_timed_zip_archives()
