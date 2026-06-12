import requests

BASE_URL = "http://localhost:5019/api"

def run_verification():
    print("--- STARTING CGPA ENDPOINT VERIFICATION ---")
    
    # 1. Login
    login_url = f"{BASE_URL}/auth/login"
    payload = {
        "email": "student01@mcc.edu.in",
        "password": "password123"
    }
    print(f"Logging in to {login_url}...")
    r = requests.post(login_url, json=payload)
    if r.status_code != 200:
        print(f"FAILED: Login returned status {r.status_code}: {r.text}")
        return
    
    data = r.json()
    token = data["token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    print("SUCCESS: Logged in successfully.")

    # 2. Get Initial Profile
    profile_url = f"{BASE_URL}/student/profile"
    print(f"Fetching profile from {profile_url}...")
    r = requests.get(profile_url, headers=headers)
    if r.status_code != 200:
        print(f"FAILED: Get profile returned status {r.status_code}: {r.text}")
        return
    
    profile_data = r.json()["profile"]
    initial_cgpa = profile_data.get("cgpa")
    print(f"SUCCESS: Initial profile retrieved. CGPA = {initial_cgpa}")
    
    # Save the original profile fields to send back in the PUT request
    original_profile = {
        "id": profile_data["id"],
        "rollNumber": profile_data["rollNumber"],
        "firstName": profile_data["firstName"],
        "lastName": profile_data["lastName"],
        "department": profile_data["department"],
        "batchYear": profile_data["batchYear"],
        "bio": profile_data["bio"],
        "avatarUrl": profile_data["avatarUrl"],
        "githubUsername": profile_data["githubUsername"],
        "behanceUsername": profile_data["behanceUsername"],
        "isAlumni": profile_data["isAlumni"],
        "currentCompany": profile_data["currentCompany"],
        "currentRole": profile_data["currentRole"]
    }

    # 3. Update CGPA to a valid value (9.15)
    print("Updating CGPA to 9.15...")
    update_payload = dict(original_profile)
    update_payload["cgpa"] = 9.15
    
    r = requests.put(profile_url, json=update_payload, headers=headers)
    if r.status_code != 200:
        print(f"FAILED: Update profile (9.15) returned status {r.status_code}: {r.text}")
        return
    print("SUCCESS: Update profile request succeeded.")

    # 4. Verify update persisted
    print("Refetching profile to verify CGPA update persisted...")
    r = requests.get(profile_url, headers=headers)
    refetched_cgpa = r.json()["profile"].get("cgpa")
    if refetched_cgpa == 9.15:
        print(f"SUCCESS: Persisted CGPA is correct ({refetched_cgpa}).")
    else:
        print(f"FAILED: Persisted CGPA is {refetched_cgpa}, expected 9.15.")
        return

    # 5. Verify out-of-bounds validation (11.5)
    print("Attempting to update CGPA to invalid value 11.5...")
    invalid_payload = dict(original_profile)
    invalid_payload["cgpa"] = 11.5
    
    r = requests.put(profile_url, json=invalid_payload, headers=headers)
    if r.status_code == 400:
        print(f"SUCCESS: Backend rejected invalid CGPA (11.5) with status 400. Message: {r.text}")
    else:
        print(f"FAILED: Backend did not return status 400 for out-of-bounds CGPA. Returned: {r.status_code}: {r.text}")
        return

    # 6. Verify negative out-of-bounds validation (-1.0)
    print("Attempting to update CGPA to invalid value -1.0...")
    invalid_payload2 = dict(original_profile)
    invalid_payload2["cgpa"] = -1.0
    
    r = requests.put(profile_url, json=invalid_payload2, headers=headers)
    if r.status_code == 400:
        print(f"SUCCESS: Backend rejected invalid CGPA (-1.0) with status 400. Message: {r.text}")
    else:
        print(f"FAILED: Backend did not return status 400 for negative CGPA. Returned: {r.status_code}: {r.text}")
        return

    # 7. Restore original CGPA value
    print(f"Restoring original CGPA value to {initial_cgpa}...")
    restore_payload = dict(original_profile)
    restore_payload["cgpa"] = initial_cgpa
    r = requests.put(profile_url, json=restore_payload, headers=headers)
    if r.status_code == 200:
        print("SUCCESS: Original CGPA value successfully restored.")
    else:
        print(f"FAILED: Could not restore original CGPA value: {r.status_code}: {r.text}")
        return

    print("--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    run_verification()
