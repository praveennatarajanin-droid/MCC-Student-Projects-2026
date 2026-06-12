$baseUrl = "http://localhost:5019/api"

Write-Host "--- STARTING CGPA ENDPOINT VERIFICATION (PowerShell) ---"

# 1. Login
$loginUrl = "$baseUrl/auth/login"
$loginBody = @{
    email = "student01@mcc.edu.in"
    password = "password123"
} | ConvertTo-Json

Write-Host "Logging in to $loginUrl..."
$loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{
    Authorization = "Bearer $token"
}
Write-Host "SUCCESS: Logged in successfully."

# 2. Get Initial Profile
$profileUrl = "$baseUrl/student/profile"
Write-Host "Fetching profile from $profileUrl..."
$profileResponse = Invoke-RestMethod -Uri $profileUrl -Method Get -Headers $headers
$profile = $profileResponse.profile
$initialCgpa = $profile.cgpa
Write-Host "SUCCESS: Initial profile retrieved. CGPA = $initialCgpa"

# 3. Update CGPA to a valid value (9.15)
Write-Host "Updating CGPA to 9.15..."
$updateBody = @{
    id = $profile.id
    rollNumber = $profile.rollNumber
    firstName = $profile.firstName
    lastName = $profile.lastName
    department = $profile.department
    batchYear = $profile.batchYear
    bio = $profile.bio
    avatarUrl = $profile.avatarUrl
    githubUsername = $profile.githubUsername
    behanceUsername = $profile.behanceUsername
    isAlumni = $profile.isAlumni
    currentCompany = $profile.currentCompany
    currentRole = $profile.currentRole
    cgpa = 9.15
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri $profileUrl -Method Put -Body $updateBody -ContentType "application/json" -Headers $headers
Write-Host "SUCCESS: Update profile request succeeded."

# 4. Verify update persisted
Write-Host "Refetching profile to verify CGPA update persisted..."
$profileResponse2 = Invoke-RestMethod -Uri $profileUrl -Method Get -Headers $headers
$refetchedCgpa = $profileResponse2.profile.cgpa
if ($refetchedCgpa -eq 9.15) {
    Write-Host "SUCCESS: Persisted CGPA is correct ($refetchedCgpa)."
} else {
    Write-Host "FAILED: Persisted CGPA is $refetchedCgpa, expected 9.15."
    exit 1
}

# 5. Verify out-of-bounds validation (11.5)
Write-Host "Attempting to update CGPA to invalid value 11.5..."
$invalidBody = @{
    id = $profile.id
    rollNumber = $profile.rollNumber
    firstName = $profile.firstName
    lastName = $profile.lastName
    department = $profile.department
    batchYear = $profile.batchYear
    bio = $profile.bio
    avatarUrl = $profile.avatarUrl
    githubUsername = $profile.githubUsername
    behanceUsername = $profile.behanceUsername
    isAlumni = $profile.isAlumni
    currentCompany = $profile.currentCompany
    currentRole = $profile.currentRole
    cgpa = 11.5
} | ConvertTo-Json

try {
    $r = Invoke-WebRequest -Uri $profileUrl -Method Put -Body $invalidBody -ContentType "application/json" -Headers $headers
    Write-Host "FAILED: Backend did not return status 400 for out-of-bounds CGPA. Returned: $($r.StatusCode)"
    exit 1
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $streamReader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $streamReader.ReadToEnd()
    if ($statusCode -eq 400) {
        Write-Host "SUCCESS: Backend rejected invalid CGPA (11.5) with status 400. Message: $responseBody"
    } else {
        Write-Host "FAILED: Expected status 400, got status $statusCode. Message: $responseBody"
        exit 1
    }
}

# 6. Restore original CGPA value
Write-Host "Restoring original CGPA value to $initialCgpa..."
$restoreBody = @{
    id = $profile.id
    rollNumber = $profile.rollNumber
    firstName = $profile.firstName
    lastName = $profile.lastName
    department = $profile.department
    batchYear = $profile.batchYear
    bio = $profile.bio
    avatarUrl = $profile.avatarUrl
    githubUsername = $profile.githubUsername
    behanceUsername = $profile.behanceUsername
    isAlumni = $profile.isAlumni
    currentCompany = $profile.currentCompany
    currentRole = $profile.currentRole
    cgpa = $initialCgpa
} | ConvertTo-Json

$restoreResponse = Invoke-RestMethod -Uri $profileUrl -Method Put -Body $restoreBody -ContentType "application/json" -Headers $headers
Write-Host "SUCCESS: Original CGPA value successfully restored."
Write-Host "--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---"
