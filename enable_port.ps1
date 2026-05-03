$env:output = echo y | & "D:\微信web开发者工具\cli.bat" open --project "D:\liuyao-app" 2>&1
Write-Output $env:output
