# Alex's hackday project

Grabs a post index, parses it into something tiny, and then sends it to your browser.

Install:
	
	cd ~

    # Obtain lucene dumper and its requirements
    apt-get install openjdk-6-jdk maven	
    git clone https://bitbucket.org/czawadka-atlassian/lucene-dumper.git 
    mvn package

    # Obtain hackday
    git clone wherever_this_is
    cd hackday
	npm install
	bower install
    node app.js
	ln -s ~/lucene-dumper/src/main/bin/lud.sh ./
	
	# Obtain post indexes
	chmod +x ./update.sh
	./update.sh

