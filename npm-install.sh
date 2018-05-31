pwd = `pwd`
echo $pwd
cd ./game-server/ && npm install
echo '============   game-server npm installed ============'
cd ..
cd ./web-server/ && npm install
echo '============   web-server npm installed ============'
