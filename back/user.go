package main

import (
	"database/sql"
	"errors"
)

type User struct {
	Username string
	Password string
}

func StoreUser(db *sql.DB, username string) (string, error) {
	sessionKey, err := NewSessionKey()
	if err != nil {
		return "", err
	}
	_, err = db.Exec("insert into sessions(sessionKey, username) values (?, ?)", sessionKey, username)
	if err != nil {
		return "", err
	}
	return sessionKey, nil
}

func UpdateSessionKey(db *sql.DB, sessionKey string) (string, error) {
	newSessionKey, err := NewSessionKey()
	if err != nil {
		return "", err
	}

	_, err = db.Exec("update sessions set sessionKey=? where sessionKey=?", newSessionKey, sessionKey)
	if err != nil {
		return "", err
	}

	return newSessionKey, nil
}

func GetUserByKey(db *sql.DB, sessionKey string) (*User, error) {
	var username string
	err := db.QueryRow("select username from sessions where sessionKey=?", sessionKey).Scan(&username)
	if err != nil {
		return nil, err
	}

	user, err := GetUser(db, username)
	if err != nil {
		return nil, err
	}

	return user, nil
}
func GetUser(db *sql.DB, username string) (*User, error) {
	var password string
	err := db.QueryRow("select password from users where username=?", username).Scan(&password)
	if err != nil {
		return nil, err
	}

	user := &User{
		username,
		password,
	}
	return user, nil
}

func CreateUser(db *sql.DB, username, password string) (*User, error) {
	var cnt int
	err := db.QueryRow("select count(*) from users where username=?", username).Scan(&cnt)
	if err != nil {
		return nil, err
	}
	if cnt != 0 {
		return nil, errors.New("User already exists")
	}

	user := &User{
		username,
		password,
	}

	_, err = db.Exec("insert into users(username, password) values (?, ?)", username, password)
	if err != nil {
		return nil, err
	}

	return user, nil
}
