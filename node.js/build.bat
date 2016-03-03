:: select current folder
cd %~dp0
cd ..
::pause
::node --debug-brk=9222 server.js
::node --debug=9222 server.js
node server.js
