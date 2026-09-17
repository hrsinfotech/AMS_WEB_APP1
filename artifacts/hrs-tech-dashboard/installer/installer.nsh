!macro customInstall
  DetailPrint "Checking Docker Desktop..."
  nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\resources\install-runtime.ps1"'
!macroend