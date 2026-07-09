import React, { useState, useEffect } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { toast } from 'sonner';

export default function VoteButtons({ incident }) {
  const [user, setUser] = useState({ id: 'user-1', name: 'User', karma: 100 });
  const [ups, setUps] = useState(incident.confirmations_count || 0);
  const [downs, setDowns] = useState(incident.downvotes_count || 0);
  const [vote, setVote] = useState(null); // 'up' | 'down' | null
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (incident.confirmed_by_ids?.includes(user.id)) setVote('up');
    else if (incident.denied_by_ids?.includes(user.id)) setVote('down');
  }, [user, incident.confirmed_by_ids, incident.denied_by_ids]);

  const isReal = incident.id && !String(incident.id).startsWith('mock-');

  const handleVote = (choice, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    const prev = vote;
    let newVote = choice;
    let newUps = ups;
    let newDowns = downs;

    if (prev === choice) {
      newVote = null;
      if (choice === 'up') newUps = Math.max(0, ups - 1);
      else newDowns = Math.max(0, downs - 1);
    } else if (choice === 'up') {
      newUps = ups + 1;
      if (prev === 'down') newDowns = Math.max(0, downs - 1);
    } else {
      newDowns = downs + 1;
      if (prev === 'up') newUps = Math.max(0, ups - 1);
    }

    setVote(newVote);
    setUps(newUps);
    setDowns(newDowns);

    if (!user) return;

    setLoading(true);
    
    fetch(`http://localhost:8000/api/incidents/${incident.id}/vote?upvote=${newVote === 'up'}`, {
      method: 'PATCH'
    })
      .catch(() => {
        setVote(prev);
        setUps(incident.confirmations_count || 0);
        setDowns(incident.downvotes_count || 0);
        toast.error('Errore nel voto');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={(e) => handleVote('up', e)}
        disabled={loading}
        aria-pressed={vote === 'up'}
        aria-label="Conferma: sì, lo vedo anche io"
        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-all active:scale-95
          ${vote === 'up'
            ? 'bg-green-500/15 text-green-500 dark:text-green-400 border-green-500/40'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'}`}
      >
        <ArrowBigUp className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{ups}</span>
      </button>
      <button
        type="button"
        onClick={(e) => handleVote('down', e)}
        disabled={loading}
        aria-pressed={vote === 'down'}
        aria-label="Segnala falso allarme"
        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-all active:scale-95
          ${vote === 'down'
            ? 'bg-red-500/15 text-red-500 dark:text-red-400 border-red-500/40'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'}`}
      >
        <ArrowBigDown className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{downs}</span>
      </button>
    </div>
  );
}
