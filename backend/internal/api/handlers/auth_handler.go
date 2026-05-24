package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/Zendan-ui/z-ui/internal/auth"
)

type AuthHandler struct {
	authSvc *auth.AuthService
}

func NewAuthHandler(authSvc *auth.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req auth.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Username and password are required"})
	}

	resp, err := h.authSvc.Login(&req)
	if err != nil {
		if err.Error() == "2fa_required" {
			return c.Status(200).JSON(fiber.Map{
				"requires_2fa": true,
				"message":      "Please provide 2FA code",
			})
		}
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(resp)
}

func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	resp, err := h.authSvc.RefreshToken(body.RefreshToken)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(resp)
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	// In a production system, you'd blacklist the token in Redis
	return c.JSON(fiber.Map{"message": "Logged out successfully"})
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	adminID := c.Locals("admin_id").(uint)
	username := c.Locals("username").(string)
	role := c.Locals("role").(string)

	return c.JSON(fiber.Map{
		"admin_id": adminID,
		"username": username,
		"role":     role,
	})
}

func (h *AuthHandler) ChangePassword(c *fiber.Ctx) error {
	adminID := c.Locals("admin_id").(uint)

	var body struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if err := h.authSvc.ChangePassword(adminID, body.OldPassword, body.NewPassword); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Password changed successfully"})
}
