# Commit all changes and push to origin main
param(
  [string]$message = "Prepare for Vercel deploy: PWA/runtimeCaching and IndexedDB changes"
)

Write-Host "Running git add ."
git add .

Write-Host "Committing with message: $message"
git commit -m $message

Write-Host "Pushing to origin main"
git push origin main

Write-Host "Done."