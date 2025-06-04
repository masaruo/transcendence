### WAF
using modsecurity (https://github.com/coreruleset/modsecurity-crs-docker)

https://dev.to/henri_sekeladi/install-nginx-with-modsecurity-3-owasp-crs-on-ubuntu-2204-5d6l

sudo tail -f /var/log/modsec_audit.log
sudo tail -f /var/log/nginx/error.log

https://<address>/as.php?s=/bin/bash

### using own conf
> 💬 What happens if I want to make changes in a different file, like /etc/nginx/conf.d/default.conf? You mount your local file, e.g. nginx/default.conf as the new template: /etc/nginx/templates/conf.d/default.conf.template. You can do this similarly with other files. Files in the templates directory will be copied and subdirectories will be preserved.
