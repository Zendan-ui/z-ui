package crypto

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/curve25519"
)

// GenerateWireGuardKeyPair generates X25519 key pair for WireGuard.
func GenerateWireGuardKeyPair() (privateKey, publicKey string, err error) {
	var privKey [32]byte
	if _, err := rand.Read(privKey[:]); err != nil {
		return "", "", fmt.Errorf("keygen failed: %w", err)
	}
	privKey[0] &= 248
	privKey[31] &= 127
	privKey[31] |= 64

	pubKey, err2 := curve25519.X25519(privKey[:], curve25519.Basepoint)
	if err2 != nil {
		return "", "", fmt.Errorf("pubkey failed: %w", err2)
	}

	return base64.StdEncoding.EncodeToString(privKey[:]),
		base64.StdEncoding.EncodeToString(pubKey), nil
}

// GenerateX25519KeyPair generates key pair for Reality.
func GenerateX25519KeyPair() (privateKey, publicKey string, err error) {
	return GenerateWireGuardKeyPair()
}

// GenerateRealityShortID generates random short ID for Reality.
func GenerateRealityShortID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// GenerateEd25519KeyPair generates Ed25519 key pair.
func GenerateEd25519KeyPair() (privateKey, publicKey string, err error) {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return "", "", err
	}
	return base64.StdEncoding.EncodeToString(priv.Seed()),
		base64.StdEncoding.EncodeToString(pub), nil
}

// GenerateShadowsocks2022Key generates base64 key for SS 2022.
func GenerateShadowsocks2022Key(keySize int) (string, error) {
	key := make([]byte, keySize)
	if _, err := rand.Read(key); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(key), nil
}

// GenerateUUID generates UUID v4.
func GenerateUUID() string {
	b := make([]byte, 16)
	rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
