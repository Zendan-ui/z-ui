package nodes

import (
	"time"

	"github.com/Zendan-ui/z-ui/v3/backend/internal/database"
	"github.com/Zendan-ui/z-ui/v3/backend/internal/database/models"
)

type NodeService struct{}

func (s *NodeService) GetAllNodes(ownerID uint) ([]models.Node, error) {
	var nodes []models.Node
	query := database.DB
	if ownerID != 0 {
		query = query.Where("owner_id = ?", ownerID)
	}
	err := query.Find(&nodes).Error
	return nodes, err
}

func (s *NodeService) CreateNode(node *models.Node) error {
	node.Status = "offline"
	node.LastSeen = time.Now()
	return database.DB.Create(node).Error
}

func (s *NodeService) DeleteNode(id uint) error {
	return database.DB.Delete(&models.Node{}, id).Error
}

func (s *NodeService) UpdateNodeStatus(id uint, status string, metrics map[string]interface{}) error {
	updates := map[string]interface{}{
		"status":      status,
		"last_seen":   time.Now(),
		"cpu":         metrics["cpu"],
		"ram":         metrics["ram"],
		"disk":        metrics["disk"],
		"network_in":  metrics["network_in"],
		"network_out": metrics["network_out"],
		"online_users": metrics["online_users"],
	}
	return database.DB.Model(&models.Node{}).Where("id = ?", id).Updates(updates).Error
}
