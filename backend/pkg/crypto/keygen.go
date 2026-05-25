package crypto

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/curve25519"
)

// GenerateWireGuardKeyPair generates a WireGuard private/public key pair.
// Uses X25519 (Curve25519) as per WireGuard spec.
func GenerateWireGuardKeyPair() (privateKey, publicKey string, err error) {
	var privKey [32]byte
	if _, err := rand.Read(privKey[:]); err != nil {
		return "", "", fmt.Errorf("failed to generate private key: %w", err)
	}
	// Clamp private key per WireGuard/X25519 spec
	privKey[0] &= 248
	privKey[31] &= 127
	privKey[31] |= 64

	var pubKey [32]byte
	curve25519.ScalarBaseMult(&pubKey, &privKey)

	return base64.StdEncoding.EncodeToString(privKey[:]),
		base64.StdEncoding.EncodeToString(pubKey[:]), nil
}

// GenerateX25519KeyPair generates a key pair for Reality (X25519).
// Same algorithm as WireGuard.
func GenerateX25519KeyPair() (privateKey, publicKey string, err error) {
	return GenerateWireGuardKeyPair()
}

// GenerateRealityShortID generates a random short ID for Reality.
func GenerateRealityShortID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// GenerateEd25519KeyPair generates an Ed25519 key pair (used by some protocols).
func GenerateEd25519KeyPair() (privateKey, publicKey string, err error) {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate ed25519 key: %w", err)
	}
	return base64.StdEncoding.EncodeToString(priv.Seed()),
		base64.StdEncoding.EncodeToString(pub), nil
}

// GenerateShadowsocks2022Key generates a base64-encoded key for Shadowsocks 2022.
// keySize: 16 for aes-128-gcm, 32 for aes-256-gcm, chacha20-poly1305
func GenerateShadowsocks2022Key(keySize int) (string, error) {
	key := make([]byte, keySize)
	if _, err := rand.Read(key); err != nil {
		return "", fmt.Errorf("failed to generate ss2022 key: %w", err)
	}
	return base64.StdEncoding.EncodeToString(key), nil
}

// GenerateUUID generates a random UUID v4 string.
func GenerateUUID() string {
	b := make([]byte, 16)
	rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
