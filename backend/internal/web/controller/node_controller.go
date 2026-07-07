package controller

import (
	"net/http"
	"strconv"

	"github.com/Zendan-ui/z-ui/v3/backend/internal/database/models"
	"github.com/Zendan-ui/z-ui/v3/backend/internal/modules/nodes"
	"github.com/Zendan-ui/z-ui/v3/backend/internal/web/global"

	"github.com/gin-gonic/gin"
)

type NodeController struct {
	service *nodes.NodeService
}

func NewNodeController(g *gin.RouterGroup) *NodeController {
	c := &NodeController{service: &nodes.NodeService{}}
	c.initRouter(g)
	return c
}

func (c *NodeController) initRouter(g *gin.RouterGroup) {
	g.GET("", c.GetNodes)
	g.POST("", c.CreateNode)
	g.DELETE("/:id", c.DeleteNode)
	g.POST("/:id/status", c.UpdateNodeStatus)
}

func (c *NodeController) GetNodes(ctx *gin.Context) {
	user := global.GetCurrentUser(ctx)
	var ownerID uint = 0
	if user != nil && user.Role == "admin" {
		ownerID = user.ID
	}

	nodesList, err := c.service.GetAllNodes(ownerID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"success": false, "msg": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "obj": nodesList})
}

func (c *NodeController) CreateNode(ctx *gin.Context) {
	var node models.Node
	if err := ctx.ShouldBindJSON(&node); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "msg": err.Error()})
		return
	}

	user := global.GetCurrentUser(ctx)
	if user != nil {
		node.OwnerID = user.ID
	}

	if err := c.service.CreateNode(&node); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"success": false, "msg": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "obj": node})
}

func (c *NodeController) DeleteNode(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	if err := c.service.DeleteNode(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true})
}

func (c *NodeController) UpdateNodeStatus(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	var payload struct {
		Status  string                 `json:"status"`
		Metrics map[string]interface{} `json:"metrics"`
	}
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	err := c.service.UpdateNodeStatus(uint(id), payload.Status, payload.Metrics)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true})
}
