import { useEffect, useRef } from 'react';
import { websocketService } from '../services/websocket';

export function useWebSocket(event: string, callback: (data: any) => void, deps: any[] = []) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    websocketService.connect();

    const handler = (data: any) => {
      callbackRef.current(data);
    };

    websocketService.on(event, handler);

    return () => {
      websocketService.off(event, handler);
    };
  }, [event, ...deps]);
}

export function useMachineSubscription(machineId: string | undefined) {
  useEffect(() => {
    if (machineId) {
      websocketService.connect();
      websocketService.subscribeMachine(machineId);

      return () => {
        websocketService.unsubscribeMachine(machineId);
      };
    }
  }, [machineId]);
}

