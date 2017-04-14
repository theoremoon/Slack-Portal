package main

import (
	"github.com/nlopes/slack"
	"golang.org/x/net/websocket"
)

type Author struct {
	Name         string `json:"name"`
	FaceImageUrl string `json:"face_image_url"`
}
type Post struct {
	Author  Author `json:"author"`
	Content string `json:"content"`
}
type Team struct {
	Domain       string `json:"domain"`
	Name         string `json:"name"`
	Channel      string `json:"channel"`
	Posts        []Post `json:"posts"`
	LastModified string `json:"last_modified"`
}

func Notify(ws *websocket.Conn, api *slack.Client, ev *slack.MessageEvent) error {
	team, err := api.GetTeamInfo()
	if err != nil {
		return err
	}
	user, err := api.GetUserInfo(ev.User)
	if err != nil {
		return err
	}
	channel, err := api.GetChannelInfo(ev.Channel)
	if err != nil {
		return err
	}
	item := Team{
		team.Domain,
		team.Name,
		channel.Name,
		[]Post{Post{Author{user.Name, user.Profile.Image24}, ev.Text}},
		ev.Timestamp,
	}
	websocket.JSON.Send(ws, Response{
		"Team",
		item,
	})
	return nil
}

func ListenSlack(ws *websocket.Conn, api *slack.Client, command chan string) {
	rtm := api.NewRTM()
	go rtm.ManageConnection()
	for {
		select {
		case msg := <-rtm.IncomingEvents:
			switch ev := msg.Data.(type) {
			case *slack.MessageEvent:
				err := Notify(ws, api, ev)
				if err != nil {
					break
				}
			}
		case <-command:
		}
	}
}
