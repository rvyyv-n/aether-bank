Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\Code\Repos\sandbox\project-bank"
WshShell.Run """C:\Program Files\nodejs\node.exe"" ""D:\Code\Repos\sandbox\project-bank\server.cjs""", 0, False
