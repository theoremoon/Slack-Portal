# SLACK PORTAL

A "Slack Portal" notifies new post of your teams.

## build and run

### backend 

A slack portal backend program is written with go using third-party package nlopes/slack, so `go get github.com/nlopes/slack` is needed at first. Next, you build a binary `go build main.go` in backend directory.

A command starting a backend program is below.

```
$ ./main --host 0.0.0.0 --port 8888
```

Environmental variables `SLACK_PORTAL_{HOST,PORT,PATH}` is also available.

### frontend

A frontend program is written with Angular2. You can use the npm for building frontend program. Running `npm i` command in frontend directory and `npm run build` are all. A index.html file is the entry point of front end program.

*notice*
Setting an address of backend program is required, change url value at frontend/src/update-notify.service.ts manually your own value.

## assets directory

An audio file is in frontend/src/assets directory which is free voice provied at http://soundeffect-lab.info/sound/voice/line-girl1.html. Very thanks. 


## future

later...
