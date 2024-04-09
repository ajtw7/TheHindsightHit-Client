import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage({ setMgrId }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setMgrId(Number(inputValue));
    setInputValue('');
    navigate('/manager-profile');
    // console.log('setMgrId:', setMgrId);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid black',
          padding: 50,
        }}
      >
        <h1>Welcome Manager!</h1>
        <h3>please enter your team ID first to enter your LAB!</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            placeholder="Enter team ID"
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
