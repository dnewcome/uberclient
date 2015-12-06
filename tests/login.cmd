:: simulate a login with curl

:: note that we take post and user agent string from session capture from fiddler
curl -L -c cookie.txt -d @postfile.txt -A "User-Agent: Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30; InfoPath.2; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 1.1.4322)" "http://localhost/ubernote/pages/login.aspx?UserName=dan&Login=dan"

:: extract the sid to a file
type cookie.txt | findstr ubernoteSID | sed -n "s/\(^.*\(\t\(.*$\)\).*$\)/\3/p" > sid.txt
:: create a file to use for http post
type sid.txt | sed "s/^/sessionID=/" > sid2.txt

:: now we can make a call using the sid from the file.
curl -d @sid2.txt "http://localhost/ubernote/services/Webservice/Service.asmx/NotesCountGet"