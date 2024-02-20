import {useState, useEffect} from 'react';

export default function useMgrData() {
    const [mgrData, setMgrData] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/mgr-profile');
            const data = await res.json();
            setMgrData((prevMgrData) => {
            return data;
            });
        } catch (error) {
            console.error('Error fetching manager data', error);
        }
        };
        fetchData();
    }, []);
    
    return mgrData;
    }