### WAF
using [modsecurity with docker](https://github.com/coreruleset/modsecurity-crs-docker)
[core-rule-set or aka CRS](https://github.com/coreruleset/coreruleset)

[some nice article](https://dev.to/henri_sekeladi/install-nginx-with-modsecurity-3-owasp-crs-on-ubuntu-2204-5d6l)

easy command to check whether modsecurity is active by typing `https://<address>/as.php?s=/bin/bash`. if it is active, access should be rejected.
change nickname to `a" onclick="alert('hacked')" alt="a` to return `403 Forbidden`


### setting files
in nginx, modsecurity's conf files are located at `/etc/nginx/modsecurity.d/`.
for [core rule set or aka CRS](https://coreruleset.org/) is at `/etc/modsecurity.d/*` and rules are in `/etc/modsecurity.d/owasp-crs/rules/*.conf`

### XSS
https://security.stackexchange.com/questions/200427/what-are-the-common-features-to-identify-xss-attack-from-apache-log-file
https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/01-Testing_for_Reflected_Cross_Site_Scripting
