package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/net/websocket"
)

const schema = `
create table users (
	username text unique,
	password text
);
create table sessions (
	sessionKey text unique,
	username text
	--foreign key username references users(username)
);
create table apiTokens (
	apiToken text,
	username text
);
`

func NewSessionKey() (string, error) {
	sessionKey, err := RandStr(100)
	return sessionKey, err
}

type Command struct {
	Command   string   `json:"command"`
	Arguments []string `json:"arguments"`
}
type Response struct {
	TypeName string      `json:"typename"`
	Value    interface{} `json:"value"`
}
type Result struct {
	Result  bool   `json:"result"`
	Message string `json:"message"`
}

func Accept(ws *websocket.Conn) {
	db, err := sql.Open("sqlite3", "./database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	sess := Session{
		db,
		ws,
		nil,
		map[string](chan string){},
	}
	for {
		var received []byte
		err = websocket.Message.Receive(ws, &received)
		if err != nil {
			break
		}
		fmt.Println(string(received))
		var command Command
		err = json.Unmarshal(received, &command)
		if err != nil {
			fmt.Println(err)
			continue
		}

		fmt.Println(command)
		cmd, args := command.Command, command.Arguments

		switch cmd {
		case "Register":
			sessionKey, err := sess.Register(args[0], args[1])
			if err == nil {
				websocket.JSON.Send(ws, Response{"Register", sessionKey})
			} else {
				websocket.JSON.Send(ws, Response{"Result", Result{false, "Register"}})
			}
		case "Login":
			sessionKey, err := sess.Login(args[0], args[1])
			if err == nil {
				websocket.JSON.Send(ws, Response{"Login", sessionKey})
			} else {
				websocket.JSON.Send(ws, Response{"Result", Result{false, "Login"}})
			}
		case "Resume":
			newSessionKey, err := sess.Resume(args[0])
			if err == nil {
				websocket.JSON.Send(ws, Response{"Resume", newSessionKey})
			} else {
				websocket.JSON.Send(ws, Response{"Result", Result{false, "Resume"}})
			}
		case "NewToken":
			err = sess.NewToken(args[0])
			if err == nil {
				websocket.JSON.Send(ws, Response{"Result", Result{true, "NewToken"}})
			} else {
				fmt.Println(err)
				websocket.JSON.Send(ws, Response{"Result", Result{false, "NewToken"}})
			}
		}
	}
}

func IsFileExists(filename string) bool {
	_, err := os.Stat(filename)
	return err == nil
}

func main() {
	if !IsFileExists("./database.db") {
		db, err := sql.Open("sqlite3", "./database.db")
		if err != nil {
			log.Fatal(err)
		}
		defer db.Close()

		_, err = db.Exec(schema)
		if err != nil {
			log.Fatal(err)
		}
	}

	http.Handle("/", websocket.Handler(Accept))
	if err := http.ListenAndServe("0.0.0.0:8888", nil); err != nil {
		log.Fatal(err)
	}
}
