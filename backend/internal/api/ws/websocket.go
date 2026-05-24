package ws

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/Zendan-ui/z-ui/pkg/logger"
)

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type Client struct {
	conn     *websocket.Conn
	send     chan []byte
	hub      *Hub
	adminID  uint
	channels map[string]bool
}

type WSMessage struct {
	Type    string      `json:"type"`
	Channel string      `json:"channel"`
	Data    interface{} `json:"data"`
}

var MainHub *Hub

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			logger.Debug("WebSocket client connected (admin: %d)", client.adminID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			logger.Debug("WebSocket client disconnected (admin: %d)", client.adminID)

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) BroadcastJSON(msgType, channel string, data interface{}) {
	msg := WSMessage{
		Type:    msgType,
		Channel: channel,
		Data:    data,
	}
	jsonBytes, err := json.Marshal(msg)
	if err != nil {
		logger.Error("Failed to marshal WS message: %v", err)
		return
	}
	h.broadcast <- jsonBytes
}

func (h *Hub) SendToAdmin(adminID uint, msgType, channel string, data interface{}) {
	msg := WSMessage{Type: msgType, Channel: channel, Data: data}
	jsonBytes, _ := json.Marshal(msg)

	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client.adminID == adminID {
			select {
			case client.send <- jsonBytes:
			default:
			}
		}
	}
}

func HandleWebSocket(hub *Hub) fiber.Handler {
	return websocket.New(func(c *websocket.Conn) {
		client := &Client{
			conn:     c,
			send:     make(chan []byte, 256),
			hub:      hub,
			channels: make(map[string]bool),
		}

		hub.register <- client

		// Writer goroutine
		go func() {
			ticker := time.NewTicker(30 * time.Second)
			defer ticker.Stop()
			defer c.Close()

			for {
				select {
				case message, ok := <-client.send:
					if !ok {
						c.WriteMessage(websocket.CloseMessage, []byte{})
						return
					}
					if err := c.WriteMessage(websocket.TextMessage, message); err != nil {
						return
					}
				case <-ticker.C:
					if err := c.WriteMessage(websocket.PingMessage, nil); err != nil {
						return
					}
				}
			}
		}()

		// Reader goroutine
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				hub.unregister <- client
				break
			}

			var wsMsg WSMessage
			if err := json.Unmarshal(message, &wsMsg); err != nil {
				continue
			}

			switch wsMsg.Type {
			case "subscribe":
				client.channels[wsMsg.Channel] = true
			case "unsubscribe":
				delete(client.channels, wsMsg.Channel)
			case "ping":
				response, _ := json.Marshal(WSMessage{Type: "pong", Data: time.Now().Unix()})
				client.send <- response
			}
		}
	})
}

// StartMonitoringBroadcast sends periodic system stats to all connected clients
func StartMonitoringBroadcast(hub *Hub) {
	ticker := time.NewTicker(5 * time.Second)
	go func() {
		for range ticker.C {
			hub.BroadcastJSON("system_stats", "monitoring", map[string]interface{}{
				"timestamp": time.Now().Unix(),
				"type":      "heartbeat",
			})
		}
	}()
}

func init() {
	MainHub = NewHub()
}
