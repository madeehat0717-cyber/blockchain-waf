import { createContext, useContext, useState, useEffect } from 'react';

const WafContext = createContext();

export const WafProvider = ({ children }) => {
  const [liveEvents, setLiveEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/monitor');
    
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'WAF_EVENT') {
        setLiveEvents((prev) => [data, ...prev].slice(0, 50));
      }
    };
    
    return () => ws.close();
  }, []);

  return (
    <WafContext.Provider value={{ liveEvents, isConnected }}>
      {children}
    </WafContext.Provider>
  );
};

export const useWaf = () => useContext(WafContext);
