import type { MessageInstance } from 'antd/es/message/interface';

let _messageInstance: MessageInstance | null = null;

export function setMessageInstance(instance: MessageInstance): void {
  _messageInstance = instance;
}

export function getMessageInstance(): MessageInstance | null {
  return _messageInstance;
}
