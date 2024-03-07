import { useContext } from 'react';
import { PlayerContext } from './services/context';

export default function Transfers() {
  const { myTransfers } = useContext(PlayerContext);
  // const [transfers, setTransfers] = useState(myTransfers);
  console.log('Transfers Log:', {
    myTransfers,
    // transfers
  });

  return (
    <div>
      <h1>Transfers</h1>
    </div>
  );
}
