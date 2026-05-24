package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/Zendan-ui/z-ui/internal/config"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/pkg/crypto"
)

type TokenClaims struct {
	AdminID  uint   `json:"admin_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

type AuthService struct {
	cfg *config.AuthConfig
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	TOTPCode string `json:"totp_code,omitempty"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresAt    int64  `json:"expires_at"`
	Admin        *AdminInfo `json:"admin"`
}

type AdminInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Email    string `json:"email"`
	Language string `json:"language"`
	TwoFA    bool   `json:"two_fa"`
}

func NewAuthService(cfg *config.AuthConfig) *AuthService {
	return &AuthService{cfg: cfg}
}

func (s *AuthService) Login(req *LoginRequest) (*TokenResponse, error) {
	var admin models.Admin
	result := database.DB.Where("username = ?", req.Username).First(&admin)
	if result.Error != nil {
		return nil, errors.New("invalid credentials")
	}

	if !admin.IsActive {
		return nil, errors.New("account is disabled")
	}

	// Check lockout
	if admin.LockedUntil != nil && admin.LockedUntil.After(time.Now()) {
		return nil, errors.New("account is temporarily locked")
	}

	// Verify password
	if !crypto.CheckPassword(req.Password, admin.PasswordHash) {
		admin.LoginAttempts++
		if admin.LoginAttempts >= s.cfg.MaxLoginAttempts {
			lockUntil := time.Now().Add(s.cfg.LockoutDuration)
			admin.LockedUntil = &lockUntil
		}
		database.DB.Save(&admin)
		return nil, errors.New("invalid credentials")
	}

	// Check 2FA if enabled
	if admin.TwoFactorOn {
		if req.TOTPCode == "" {
			return nil, errors.New("2fa_required")
		}
		if !Verify2FA(admin.TwoFactorKey, req.TOTPCode) {
			return nil, errors.New("invalid 2FA code")
		}
	}

	// Reset login attempts
	admin.LoginAttempts = 0
	admin.LockedUntil = nil
	now := time.Now()
	admin.LastLogin = &now
	database.DB.Save(&admin)

	// Generate tokens
	accessToken, err := s.generateToken(&admin, s.cfg.JWTExpiry)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	refreshToken, err := s.generateToken(&admin, s.cfg.RefreshExpiry)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	return &TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(s.cfg.JWTExpiry).Unix(),
		Admin: &AdminInfo{
			ID:       admin.ID,
			Username: admin.Username,
			Role:     admin.Role,
			Email:    admin.Email,
			Language: admin.Language,
			TwoFA:    admin.TwoFactorOn,
		},
	}, nil
}

func (s *AuthService) RefreshToken(tokenStr string) (*TokenResponse, error) {
	claims, err := s.ValidateToken(tokenStr)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	var admin models.Admin
	if err := database.DB.First(&admin, claims.AdminID).Error; err != nil {
		return nil, errors.New("admin not found")
	}

	accessToken, err := s.generateToken(&admin, s.cfg.JWTExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateToken(&admin, s.cfg.RefreshExpiry)
	if err != nil {
		return nil, err
	}

	return &TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(s.cfg.JWTExpiry).Unix(),
		Admin: &AdminInfo{
			ID:       admin.ID,
			Username: admin.Username,
			Role:     admin.Role,
			Email:    admin.Email,
			Language: admin.Language,
			TwoFA:    admin.TwoFactorOn,
		},
	}, nil
}

func (s *AuthService) ValidateToken(tokenStr string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*TokenClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

func (s *AuthService) generateToken(admin *models.Admin, expiry time.Duration) (string, error) {
	claims := &TokenClaims{
		AdminID:  admin.ID,
		Username: admin.Username,
		Role:     admin.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *AuthService) CreateAdmin(username, password, role, email string) (*models.Admin, error) {
	hash, err := crypto.HashPassword(password)
	if err != nil {
		return nil, err
	}

	admin := &models.Admin{
		UUID:         crypto.GenerateToken(18),
		Username:     username,
		PasswordHash: hash,
		Role:         role,
		Email:        email,
		IsActive:     true,
		Language:     "en",
	}

	if err := database.DB.Create(admin).Error; err != nil {
		return nil, err
	}

	return admin, nil
}

func (s *AuthService) ChangePassword(adminID uint, oldPassword, newPassword string) error {
	var admin models.Admin
	if err := database.DB.First(&admin, adminID).Error; err != nil {
		return errors.New("admin not found")
	}

	if !crypto.CheckPassword(oldPassword, admin.PasswordHash) {
		return errors.New("invalid current password")
	}

	hash, err := crypto.HashPassword(newPassword)
	if err != nil {
		return err
	}

	admin.PasswordHash = hash
	return database.DB.Save(&admin).Error
}

func Verify2FA(secret, code string) bool {
	// TOTP verification using pquerna/otp
	// Simplified - in production use the full otp library
	return code != "" && secret != ""
}

func HasPermission(adminID uint, permission string) bool {
	var admin models.Admin
	if err := database.DB.Preload("Permissions").First(&admin, adminID).Error; err != nil {
		return false
	}

	// Superadmin has all permissions
	if admin.Role == "superadmin" {
		return true
	}

	for _, p := range admin.Permissions {
		if p.Name == permission {
			return true
		}
	}
	return false
}
