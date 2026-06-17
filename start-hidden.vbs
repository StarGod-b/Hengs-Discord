' ─── start-hidden.vbs ───────────────────────────────────────────────────────
' Jalankan Hengs DC Bot TERSEMBUNYI (tanpa window). Log ke logs\bot.log.
' Stop: double-click stop-bot.bat.
Dim fso, sh, d
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh  = CreateObject("WScript.Shell")
d = fso.GetParentFolderName(WScript.ScriptFullName)
If Not fso.FolderExists(d & "\logs") Then fso.CreateFolder(d & "\logs")

' Rotasi log kalau > 5 MB
Dim logf : logf = d & "\logs\bot.log"
If fso.FileExists(logf) Then
  If fso.GetFile(logf).Size > 5242880 Then
    If fso.FileExists(d & "\logs\bot-old.log") Then fso.DeleteFile d & "\logs\bot-old.log", True
    fso.MoveFile logf, d & "\logs\bot-old.log"
  End If
End If

sh.CurrentDirectory = d
sh.Run "cmd /c run-bot-forever.bat >> logs\bot.log 2>&1", 0, False
