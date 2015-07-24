Audit CLI
=============
This node program allows administrators to export security logs in CSV format.

## Installation

```sh
npm install audit-server-cli
```

##Usage
```sh
node index.js [host[:port]/]database [options]
```

The first parameter might be:

* The name of the mongodb database (ex: norman)
* The host name followed by a slash and the database name (ex: localhost/norman)
* The host name, a semi-colon, the port number, a slash and the database name (ex: localhost:27017/norman)

If not specified, the default value of the host will be **localhost** and the port will be **27017**.

###Options
####Connection

* -u: specify the user name
* -p: specify the user password

####Criteria

* --category : specify the category value
* --event : specify the event value
* --user : specify the user value
* --username : specify the username value
* --date : specify the date value (YYYY-MM-DD)
* --ip : specify the ip value
* --description : specify the description value
* --from : specify the oldest date value
* --to : specify the newest date value

####Output

* --output : set the name of the output file
* --delimiter : set the delimiter for the CSV file (default: ;)

####Result

* --sort : sort the result on the given value in ascending order (put "-" in front of the value to sort in descending order)
* --limit : limit the number of results

####Misc

* --config : load the given config file (allows to specify options directly in a json file)


###Examples
```sh
node index.js norman -u bob -p azerty
```

Connects to the norman database as bob with the password azerty and exports all the logs.

```sh
node index.js norman --category=authentication --date=2015-02-22 --output=file.csv
```

Connect to the norman database without using any credentials and only export the logs related to authentication
that happened on 22/02/2015. The CSV file will be generated in the current directory and named file.csv.

```sh
node index.js norman -u root --sort=username --from="2015-03-18 16:00:00" --limit=100
```

Connect to the norman database as root with no password and only export the logs of events that happened
since 18/03/2015 at 4PM. Only the 100 first results are exported, sorted by the username.