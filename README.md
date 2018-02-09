# Domain Watch Script

## Purpose
To notify you when a domain has a status change

## Use
1 `npm i`

2 Add your process vars by creating a `.env` file in the root of the project.
  ```
    TO=email@example.com
    FROM=youremail@yourprovider.com
    SMTP=sub.smtpdomain.com
    PW=youremailpassword123
  ```
----

##### DO NOT REMOTE `.env` FROM YOUR `.gitignore`
----

3 Run the script `npm start domainToWatch.com`

4 You can alter the `interval` variable to adjust the lapsed time before the next run

5 The first time it runs it will write a txt file. The following times will check the status again running bash `whois` and determine if the status change is at all different.  If it is different, the script will delete the txt file and notify you via email and desktop.