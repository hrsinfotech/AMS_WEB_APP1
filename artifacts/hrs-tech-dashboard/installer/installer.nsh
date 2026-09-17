!macro customInstall
  DetailPrint "Checking Docker Desktop..."
  nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\resources\app\install-runtime.ps1"'
!macroend