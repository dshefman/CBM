CBM
===
Competition Ballroom Machine

Requirments: node 6.11.4 or later

//////////////////////////////////////////////////

To scrutineer: 
node apps/repl/repl.js

	Enter the name of the event (CougarClassic, Rice)
	Enter the number and name of the dance (15_Std_Beg_W)
	Enter the word callbacks or single or multi
	
	If callbacks: 
		Enter the list of callbacks per judge; separated by commas (order doesn't matter) (no spaces) >  101,102,103,104
		Enter return after each judge
		Enter a blank line to finish all callbacks
		Choose the number of callbacks to bring back. The available options should be presented to you

	if single dance event: 
		Enter the ranking of the dancers in order per judge; Separated by commas (order by 1st through last) (no spaces) > 105,101,103,102
		Enter return after each judge
		Enter a blank line to finish the ranking


use a exclaimation point (!) to void a event, in the case that a typo makes it in and you have hit return

Cntl-C twice to quit

//////////////////////////////////////////////////

To MC (announce callbacks and results): 
Terminal: 
	cd /server/
	npm run start

Browser
    http://localhost:3010 // will links all of the competitions
	http://localhost:3010/reports/results/{filename}  //List the results of all of the events. Think Awards
	http://localhost:3010/reports/dancers/{filename} //Link to all of the dancers
	http://localhost:3010/reports/dancer/{filename}/{dancerNumber} //Ranking and individual scores for a dancer in all of the events they were in
	http://localhost:3010/reports/callbacks/{filename} // callback results. Think MC 

	refresh to get new events

//////////////////////////////////////////////////

To push to cloud: 

if done a new install you need to authenticate with heroku
 ./node_modules/heroku/bin/run login

after that:
  ./prepForDeploy.sh
  cd ../deployResults
  git push -f heroku master
