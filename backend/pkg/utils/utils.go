package utils

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

func RandomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	sb := strings.Builder{}
	sb.Grow(n)
	for i := 0; i < n; i++ {
		sb.WriteByte(letters[rng.Intn(len(letters))])
	}
	return sb.String()
}

func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func FormatBytes(bytes int64) string {
	if bytes == 0 {
		return "0 B"
	}
	units := []string{"B", "KB", "MB", "GB", "TB"}
	i := 0
	val := float64(bytes)
	for val >= 1024 && i < len(units)-1 {
		val /= 1024
		i++
	}
	return fmt.Sprintf("%.1f %s", val, units[i])
}
