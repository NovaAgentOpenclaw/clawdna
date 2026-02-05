import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

// Program ID do ClawDNA (será atualizado após deploy)
const _PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

export function useSolana() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programId, setProgramId] = useState<PublicKey | null>(null);

  useEffect(() => {
    // Conectar à devnet
    // const conn = new Connection(clusterApiUrl('devnet'), 'confirmed');
    setProgramId(_PROGRAM_ID);
  }, []);

  const initializeProgram = async (_wallet: any) => {
    console.log('Program initialized (devnet)', _PROGRAM_ID.toString());
    return true;
  };

  const mintGenesisAgent = async (
    _wallet: any,
    _name: string,
    _genome: number[],
    _uri: string
  ) => {
    setIsLoading(true);
    
    try {
      // Simulação de mint para a demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTx = 'mock_tx_' + Date.now();
      
      return {
        signature: mockTx,
        mint: new PublicKey('11111111111111111111111111111'),
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    programId,
    isLoading,
    error,
    initializeProgram,
    mintGenesisAgent,
  };
}
