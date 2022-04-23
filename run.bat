@ECHO OFF
start cmd.exe /C "python -m http.server 2629"
start chrome http://127.0.0.1:2629/docs/tarot.html