package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateToken(length int) string {
	b := make([]byte, length)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func GenerateShortLink(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	rand.Read(b)
	for i := range b {
		b[i] = charset[int(b[i])%len(charset)]
	}
	return string(b)
}

func SHA256(data string) string {
	h := sha256.Sum256([]byte(data))
	return hex.EncodeToString(h[:])
}

func EncryptAES(plaintext, key string) (string, error) {
	keyBytes := sha256.Sum256([]byte(key))
	block, err := aes.NewCipher(keyBytes[:])
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := aesGCM.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.URLEncoding.EncodeToString(ciphertext), nil
}

func DecryptAES(ciphertext, key string) (string, error) {
	keyBytes := sha256.Sum256([]byte(key))
	data, err := base64.URLEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(keyBytes[:])
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()
	if len(data) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	nonce, data := data[:nonceSize], data[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, data, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

func Base64Encode(data string) string {
	return base64.StdEncoding.EncodeToString([]byte(data))
}

func Base64Decode(data string) (string, error) {
	// Handle both standard and URL-safe base64
	data = strings.ReplaceAll(data, "-", "+")
	data = strings.ReplaceAll(data, "_", "/")
	// Add padding if needed
	switch len(data) % 4 {
	case 2:
		data += "=="
	case 3:
		data += "="
	}
	decoded, err := base64.StdEncoding.DecodeString(data)
	return string(decoded), err
}
