package main

import (
	"database/sql"
)

func IsTokenExists(db *sql.DB, username, token string) (bool, error) {
	var cnt int
	err := db.QueryRow("select count(*) from apiTokens where apiToken=? and username=?", token, username).Scan(&cnt)
	if err != nil {
		return false, nil
	}

	return cnt > 0, nil
}

func InsertNewToken(db *sql.DB, username, token string) error {
	_, err := db.Exec("insert into apiTokens(apiToken, username) values (?, ?)", token, username)
	if err != nil {
		return err
	}
	return nil
}

func GetAllTokens(db *sql.DB, username string) ([]string, error) {
	rows, err := db.Query("select apiToken from apiTokens where username=?", username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tokens := make([]string, 0, 10)
	for rows.Next() {
		var token string
		if err = rows.Scan(&token); err != nil {
			return nil, err
		}
		tokens = append(tokens, token)
	}

	return tokens, nil
}
