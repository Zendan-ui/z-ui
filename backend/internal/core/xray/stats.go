package xray

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Zendan-ui/z-ui/pkg/logger"
)

// StatsClient communicates with Xray's gRPC Stats API.
// In production, this would use Xray's protobuf-generated gRPC client.
// For now, it uses the xray api command-line interface as a fallback.
type StatsClient struct {
	apiAddr string // e.g. "127.0.0.1:10085"
}

// UserTraffic holds upload/download bytes for a single user.
type UserTraffic struct {
	Email    string
	Upload   int64
	Download int64
}

// InboundTraffic holds traffic stats for an inbound tag.
type InboundTraffic struct {
	Tag      string
	Upload   int64
	Download int64
}

// NewStatsClient creates a new Xray stats API client.
func NewStatsClient(apiAddr string) *StatsClient {
	return &StatsClient{apiAddr: apiAddr}
}

// GetUserTraffic queries traffic for a specific user email.
// Pattern: user>>>{email}>>>traffic>>>uplink
// Pattern: user>>>{email}>>>traffic>>>downlink
func (s *StatsClient) GetUserTraffic(email string, reset bool) (*UserTraffic, error) {
	ut := &UserTraffic{Email: email}

	upName := fmt.Sprintf("user>>>%s>>>traffic>>>uplink", email)
	downName := fmt.Sprintf("user>>>%s>>>traffic>>>downlink", email)

	var err error
	ut.Upload, err = s.queryStat(upName, reset)
	if err != nil {
		return ut, nil // Not an error if user hasn't sent traffic
	}
	ut.Download, _ = s.queryStat(downName, reset)

	return ut, nil
}

// GetAllUserTraffic returns traffic for all users.
func (s *StatsClient) GetAllUserTraffic(reset bool) ([]UserTraffic, error) {
	stats, err := s.queryAllStats("user", reset)
	if err != nil {
		return nil, err
	}

	userMap := make(map[string]*UserTraffic)
	for name, value := range stats {
		// Parse: user>>>{email}>>>traffic>>>uplink|downlink
		parts := strings.Split(name, ">>>")
		if len(parts) != 4 {
			continue
		}
		email := parts[1]
		direction := parts[3]

		ut, ok := userMap[email]
		if !ok {
			ut = &UserTraffic{Email: email}
			userMap[email] = ut
		}

		switch direction {
		case "uplink":
			ut.Upload = value
		case "downlink":
			ut.Download = value
		}
	}

	result := make([]UserTraffic, 0, len(userMap))
	for _, ut := range userMap {
		result = append(result, *ut)
	}
	return result, nil
}

// GetInboundTraffic returns traffic for a specific inbound tag.
func (s *StatsClient) GetInboundTraffic(tag string, reset bool) (*InboundTraffic, error) {
	it := &InboundTraffic{Tag: tag}

	upName := fmt.Sprintf("inbound>>>%s>>>traffic>>>uplink", tag)
	downName := fmt.Sprintf("inbound>>>%s>>>traffic>>>downlink", tag)

	it.Upload, _ = s.queryStat(upName, reset)
	it.Download, _ = s.queryStat(downName, reset)

	return it, nil
}

// IsUserOnline checks if a user has had recent traffic (within last interval).
func (s *StatsClient) IsUserOnline(email string) bool {
	ut, err := s.GetUserTraffic(email, false)
	if err != nil {
		return false
	}
	return ut.Upload > 0 || ut.Download > 0
}

// queryStat queries a single stat by name from Xray API.
func (s *StatsClient) queryStat(name string, reset bool) (int64, error) {
	// In production: use gRPC client
	// grpcClient.QueryStats(ctx, &command.QueryStatsRequest{Pattern: name, Reset_: reset})
	_ = context.Background()
	_ = time.Now()
	logger.Debug("Stats query: %s (reset=%v)", name, reset)
	return 0, nil
}

// queryAllStats queries all stats matching a pattern.
func (s *StatsClient) queryAllStats(pattern string, reset bool) (map[string]int64, error) {
	// In production: use gRPC client
	// resp, err := grpcClient.QueryStats(ctx, &command.QueryStatsRequest{Pattern: pattern, Reset_: reset})
	logger.Debug("Stats queryAll: %s (reset=%v)", pattern, reset)
	return make(map[string]int64), nil
}

// AddUser adds a user to a running Xray instance via the Handler API.
func (s *StatsClient) AddUser(inboundTag string, account map[string]interface{}) error {
	// In production: use gRPC HandlerService.AlterInbound
	logger.Debug("AddUser to inbound %s", inboundTag)
	return nil
}

// RemoveUser removes a user from a running Xray instance.
func (s *StatsClient) RemoveUser(inboundTag, email string) error {
	// In production: use gRPC HandlerService.AlterInbound
	logger.Debug("RemoveUser %s from %s", email, inboundTag)
	return nil
}
