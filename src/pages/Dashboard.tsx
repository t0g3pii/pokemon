import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

interface FieldResearch {
  id: number;
  title: string;
  currentStage: number;
  totalStages: number;
  missions: Mission[];
  rewards: Reward[];
}

interface Mission {
  id: number;
  description: string;
  completed: boolean;
}

interface Reward {
  id: number;
  description: string;
  obtained: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [fieldResearches, setFieldResearches] = useState<FieldResearch[]>([]);

  useEffect(() => {
    // Fetch field researches from the backend
    const fetchFieldResearches = async () => {
      try {
        const response = await fetch('/api/field-researches', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFieldResearches(data);
        }
      } catch (error) {
        console.error('Failed to fetch field researches:', error);
      }
    };

    fetchFieldResearches();
  }, [user]);

  const handleMissionToggle = async (researchId: number, missionId: number) => {
    try {
      const response = await fetch(`/api/field-researches/${researchId}/missions/${missionId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (response.ok) {
        setFieldResearches(prevResearches =>
          prevResearches.map(research =>
            research.id === researchId
              ? {
                  ...research,
                  missions: research.missions.map(mission =>
                    mission.id === missionId ? { ...mission, completed: !mission.completed } : mission
                  ),
                }
              : research
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle mission:', error);
    }
  };

  const handleRewardToggle = async (researchId: number, rewardId: number) => {
    try {
      const response = await fetch(`/api/field-researches/${researchId}/rewards/${rewardId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (response.ok) {
        setFieldResearches(prevResearches =>
          prevResearches.map(research =>
            research.id === researchId
              ? {
                  ...research,
                  rewards: research.rewards.map(reward =>
                    reward.id === rewardId ? { ...reward, obtained: !reward.obtained } : reward
                  ),
                }
              : research
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle reward:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Deine Feldforschungen</h1>
      {fieldResearches.map(research => (
        <div key={research.id} className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-2">{research.title}</h2>
          <p className="text-gray-600 mb-4">
            Stufe {research.currentStage} von {research.totalStages}
          </p>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Missionen:</h3>
            <ul className="space-y-2">
              {research.missions.map(mission => (
                <li key={mission.id} className="flex items-center">
                  <button
                    onClick={() => handleMissionToggle(research.id, mission.id)}
                    className={`mr-2 ${mission.completed ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    <CheckCircle size={20} />
                  </button>
                  <span className={mission.completed ? 'line-through text-gray-500' : ''}>
                    {mission.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Belohnungen:</h3>
            <ul className="space-y-2">
              {research.rewards.map(reward => (
                <li key={reward.id} className="flex items-center">
                  <button
                    onClick={() => handleRewardToggle(research.id, reward.id)}
                    className={`mr-2 ${reward.obtained ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {reward.obtained ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </button>
                  <span className={reward.obtained ? 'line-through text-gray-500' : ''}>
                    {reward.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;