### WAF
using [modsecurity with docker](https://github.com/coreruleset/modsecurity-crs-docker)
[core-rule-set or aka CRS](https://github.com/coreruleset/coreruleset)

[some nice article](https://dev.to/henri_sekeladi/install-nginx-with-modsecurity-3-owasp-crs-on-ubuntu-2204-5d6l)

easy command to check whether modsecurity is active by typing `https://<address>/as.php?s=/bin/bash`. if it is active, access should be rejected.

### setting files
in nginx, modsecurity's conf files are located at `/etc/nginx/modsecurity.d/`.
for [core rule set or aka CRS](https://coreruleset.org/) is at `/etc/modsecurity.d/*` and rules are in `/etc/modsecurity.d/owasp-crs/rules/*.conf`


