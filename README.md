E*Trade Quotes API
==================

This project exposes a "simple" API for real time quotes from E\*Trade. You must have an application created by E\*Trade, which is not so simple. You will get a client id and secret from them, which you should set as environment variables
called ETRADE_KEY and ETRADE_SECRET. Next, you must authenticate your account and approve the client application (which
is what E*Trade approved) to use your account. For the application I created, I do not have any rights to "modify"
accounts - no transfering money, making trades, etc. To authenticate and grant consent, you can use the start-auth
command line tool, or run the web server and follow via http://localhost:3000/auth . You will be sent to the E*Trade site,
login and consent, and then be given a code that you enter back on the auth page. Now you have the tokens you need to
make API calls. A sample of calling quotes and options chains is included.