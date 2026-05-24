package logger

import (
	"fmt"
	"log"
	"os"
	"time"
)

type Level int

const (
	DEBUG Level = iota
	INFO
	WARN
	ERROR
	FATAL
)

var (
	currentLevel = INFO
	logFile      *os.File
	fileLogger   *log.Logger
	colors       = map[Level]string{
		DEBUG: "\033[36m",
		INFO:  "\033[32m",
		WARN:  "\033[33m",
		ERROR: "\033[31m",
		FATAL: "\033[35m",
	}
	labels = map[Level]string{
		DEBUG: "DEBUG",
		INFO:  "INFO ",
		WARN:  "WARN ",
		ERROR: "ERROR",
		FATAL: "FATAL",
	}
	reset = "\033[0m"
)

func SetLevel(level Level) {
	currentLevel = level
}

func SetFile(path string) error {
	dir := path[:len(path)-len("/"+path[len(path)-1:])]
	os.MkdirAll(dir, 0755)
	f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	logFile = f
	fileLogger = log.New(f, "", 0)
	return nil
}

func logMsg(level Level, format string, args ...interface{}) {
	if level < currentLevel {
		return
	}
	msg := fmt.Sprintf(format, args...)
	ts := time.Now().Format("2006-01-02 15:04:05")
	
	// Console with colors
	fmt.Printf("%s[%s]%s %s %s\n", colors[level], labels[level], reset, ts, msg)
	
	// File without colors
	if fileLogger != nil {
		fileLogger.Printf("[%s] %s %s", labels[level], ts, msg)
	}
}

func Debug(format string, args ...interface{}) { logMsg(DEBUG, format, args...) }
func Info(format string, args ...interface{})  { logMsg(INFO, format, args...) }
func Warn(format string, args ...interface{})  { logMsg(WARN, format, args...) }
func Error(format string, args ...interface{}) { logMsg(ERROR, format, args...) }
func Fatal(format string, args ...interface{}) {
	logMsg(FATAL, format, args...)
	os.Exit(1)
}
