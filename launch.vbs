Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strDir = "d:\OneDrive\Рабочий стол\Irada"

' Check if port 5173 is responding, if not run npm run dev in background
On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.open "GET", "http://127.0.0.1:5173", False
http.send

If Err.Number <> 0 Or http.status <> 200 Then
    ' Start Vite server silently without black CMD window
    WshShell.CurrentDirectory = strDir
    WshShell.Run "cmd /c npm run dev -- --host", 0, False
    WScript.Sleep 2000
End If

' Open app in browser
WshShell.Run "http://localhost:5173"

