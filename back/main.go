package main

import (
	"encoding/json"
	"fmt"
	"github.com/nlopes/slack"
	"golang.org/x/net/websocket"
	"net/http"
	"os"
)

func Notify(ws *websocket.Conn, api *slack.Client, ev *slack.MessageEvent) {
	type User struct {
		Name         string `json:"name"`
		FaceImageUrl string `json:"face_image_url"`
	}
	type Post struct {
		Author  User   `json:"author"`
		Content string `json:"content"`
	}
	type SendT struct {
		Domain  string `json:"domain"`
		Name    string `json:"name"`
		Channel string `json:"channel"`
		Posts   []Post `json:"posts"`
	}
	team, err := api.GetTeamInfo()
	if err != nil {
		return
	}
	user, err := api.GetUserInfo(ev.User)
	if err != nil {
		return
	}
	channel, err := api.GetChannelInfo(ev.Channel)
	if err != nil {
		return
	}
	item := SendT{
		team.Domain,
		team.Name,
		channel.Name,
		[]Post{Post{User{user.Name, user.Profile.Image24}, ev.Text}},
	}
	websocket.JSON.Send(ws, item)
}

func SlackListen(ws *websocket.Conn, token string) {
	api := slack.New(token)
	rtm := api.NewRTM()

	go rtm.ManageConnection()
	for msg := range rtm.IncomingEvents {
		switch ev := msg.Data.(type) {
		case *slack.MessageEvent:
			Notify(ws, api, ev)
		default:
		}
	}
}

func SlackNotifier(ws *websocket.Conn) {
	type RecvT struct {
		Command   string   `json:"command"`
		Arguments []string `json:"arguments"`
	}

	for {
		// var data RecvT
		// websocket.JSON.Receive(ws, &data)
		var message string
		err := websocket.Message.Receive(ws, &message)
		if err != nil {
			break
		}

		var data RecvT
		if err = json.Unmarshal([]byte(message), &data); err != nil {
			break
		}

		if data.Command == "new api token" {
			go SlackListen(ws, data.Arguments[0])
		}
	}
}

func EchoHandler(ws *websocket.Conn) {
	SlackNotifier(ws)
}

// get flag values from env and args
func GetFlags() (string, string, string) {
	const (
		port_option_env  = "SLACK_PORTAL_PORT"
		host_option_env  = "SLACK_PORTAL_HOST"
		path_option_env  = "SLCK_PORTAL_PATH"
		port_option_flag = "--port"
		host_option_flag = "--host"
		path_option_flag = "--path"
	)

	host := "0.0.0.0" // default value
	if len(os.Getenv(host_option_env)) > 0 {
		host = os.Getenv(host_option_env)
	}
	port := os.Getenv(port_option_env)
	path := "/" // default value
	if len(os.Getenv(path_option_env)) > 0 {
		path = os.Getenv(path_option_env)
	}

	for i := 1; i < len(os.Args); i++ {
		if os.Args[i] == host_option_flag && len(os.Args) > i+1 {
			i++
			host = os.Args[i]
		}
		if os.Args[i] == port_option_flag && len(os.Args) > i+1 {
			i++
			port = os.Args[i]
		}
		if os.Args[i] == path_option_flag && len(os.Args) > i+1 {
			i++
			path = os.Args[i]
		}
	}

	return host, port, path
}

func main() {
	host, port, path := GetFlags()

	http.Handle(path, websocket.Handler(EchoHandler))
	fmt.Printf("listen starting %s:%s%s", host, port, path)
	if err := http.ListenAndServe(host+":"+port, nil); err != nil {
		fmt.Println(err)
		return
	}
}
