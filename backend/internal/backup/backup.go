package backup

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/pkg/logger"
)

type BackupService struct {
	backupDir string
}

func NewBackupService(backupDir string) *BackupService {
	os.MkdirAll(backupDir, 0755)
	return &BackupService{backupDir: backupDir}
}

type BackupData struct {
	Version   string            `json:"version"`
	CreatedAt time.Time         `json:"created_at"`
	Users     []models.User     `json:"users"`
	Proxies   []models.Proxy    `json:"proxies"`
	Inbounds  []models.Inbound  `json:"inbounds"`
	Servers   []models.Server   `json:"servers"`
	Admins    []models.Admin    `json:"admins"`
	Settings  []models.Setting  `json:"settings"`
	Subs      []models.Subscription `json:"subscriptions"`
}

func (s *BackupService) CreateBackup(adminID uint, backupType string) (*models.Backup, error) {
	timestamp := time.Now().Format("20060102_150405")
	filename := fmt.Sprintf("zui_backup_%s_%s.tar.gz", backupType, timestamp)
	filePath := filepath.Join(s.backupDir, filename)

	// Collect data
	data := BackupData{
		Version:   "1.0.0",
		CreatedAt: time.Now(),
	}

	switch backupType {
	case "full":
		database.DB.Find(&data.Users)
		database.DB.Find(&data.Proxies)
		database.DB.Find(&data.Inbounds)
		database.DB.Find(&data.Servers)
		database.DB.Find(&data.Admins)
		database.DB.Find(&data.Settings)
		database.DB.Find(&data.Subs)
	case "database":
		database.DB.Find(&data.Users)
		database.DB.Find(&data.Proxies)
		database.DB.Find(&data.Inbounds)
		database.DB.Find(&data.Servers)
		database.DB.Find(&data.Subs)
	case "configs":
		database.DB.Find(&data.Inbounds)
		database.DB.Find(&data.Servers)
		database.DB.Find(&data.Settings)
	}

	// Write JSON
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal backup data: %w", err)
	}

	// Create tar.gz
	file, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create backup file: %w", err)
	}
	defer file.Close()

	gzWriter := gzip.NewWriter(file)
	defer gzWriter.Close()

	tarWriter := tar.NewWriter(gzWriter)
	defer tarWriter.Close()

	header := &tar.Header{
		Name:    "backup.json",
		Size:    int64(len(jsonData)),
		Mode:    0644,
		ModTime: time.Now(),
	}

	if err := tarWriter.WriteHeader(header); err != nil {
		return nil, err
	}

	if _, err := tarWriter.Write(jsonData); err != nil {
		return nil, err
	}

	// Get file size
	stat, _ := os.Stat(filePath)

	// Save backup record
	backup := &models.Backup{
		Name:      filename,
		FilePath:  filePath,
		Size:      stat.Size(),
		Type:      backupType,
		AdminID:   adminID,
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(backup).Error; err != nil {
		return nil, err
	}

	logger.Info("Backup created: %s (%d bytes)", filename, stat.Size())
	return backup, nil
}

func (s *BackupService) RestoreBackup(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open backup: %w", err)
	}
	defer file.Close()

	gzReader, err := gzip.NewReader(file)
	if err != nil {
		return fmt.Errorf("failed to create gzip reader: %w", err)
	}
	defer gzReader.Close()

	tarReader := tar.NewReader(gzReader)

	for {
		header, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		if header.Name == "backup.json" {
			jsonData, err := io.ReadAll(tarReader)
			if err != nil {
				return err
			}

			var data BackupData
			if err := json.Unmarshal(jsonData, &data); err != nil {
				return fmt.Errorf("failed to parse backup data: %w", err)
			}

			return s.restoreData(&data)
		}
	}

	return fmt.Errorf("backup.json not found in archive")
}

func (s *BackupService) restoreData(data *BackupData) error {
	tx := database.DB.Begin()

	// Restore in order
	for _, item := range data.Servers {
		tx.FirstOrCreate(&item, models.Server{UUID: item.UUID})
	}
	for _, item := range data.Inbounds {
		tx.FirstOrCreate(&item, models.Inbound{UUID: item.UUID})
	}
	for _, item := range data.Users {
		tx.FirstOrCreate(&item, models.User{UUID: item.UUID})
	}
	for _, item := range data.Proxies {
		tx.FirstOrCreate(&item, models.Proxy{UUID: item.UUID})
	}
	for _, item := range data.Subs {
		tx.FirstOrCreate(&item, models.Subscription{UUID: item.UUID})
	}
	for _, item := range data.Settings {
		tx.Where("key = ?", item.Key).Assign(item).FirstOrCreate(&models.Setting{})
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to restore backup: %w", err)
	}

	logger.Info("Backup restored successfully (version: %s, created: %s)", data.Version, data.CreatedAt)
	return nil
}

func (s *BackupService) ListBackups() ([]models.Backup, error) {
	var backups []models.Backup
	err := database.DB.Order("created_at DESC").Find(&backups).Error
	return backups, err
}

func (s *BackupService) DeleteBackup(id uint) error {
	var backup models.Backup
	if err := database.DB.First(&backup, id).Error; err != nil {
		return err
	}

	os.Remove(backup.FilePath)
	return database.DB.Delete(&backup).Error
}
