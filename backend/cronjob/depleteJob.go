package cronjob

import (
	"github.com/Zendan-ui/z-ui/backend/database"
	"github.com/Zendan-ui/z-ui/backend/logger"
	"github.com/Zendan-ui/z-ui/backend/service"
)

type DepleteJob struct {
	service.ClientService
	service.InboundService
}

func NewDepleteJob() *DepleteJob {
	return new(DepleteJob)
}

func (s *DepleteJob) Run() {
	inboundIds, err := s.ClientService.DepleteClients()
	if err != nil {
		logger.Warning("Disable depleted users failed: ", err)
		return
	}
	if len(inboundIds) > 0 {
		err := s.InboundService.RestartInbounds(database.GetDB(), inboundIds)
		if err != nil {
			logger.Error("unable to restart inbounds: ", err)
		}
	}
}
