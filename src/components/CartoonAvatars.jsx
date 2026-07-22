import React from 'react';

// Predefined list of 10 unique, distinct 3D cartoon agent animal avatars
export const CARTOON_AVATARS_LIST = [
  { id: 'fox-detective', label: 'Renard Détective' },
  { id: 'spy-cat', label: 'Chat Infiltré' },
  { id: 'koala-agent', label: 'Koala Écoute' },
  { id: 'panda-monocle', label: 'Panda Élite' },
  { id: 'hacker-owl', label: 'Chouette Hacker' },
  { id: 'ninja-frog', label: 'Grenouille Tactique' },
  { id: 'agent-dog', label: 'Chien Lunettes' },
  { id: 'detective-lion', label: 'Lion Central' },
  { id: 'tiger-covert', label: 'Tigre Agent' },
  { id: 'penguin-secret', label: 'Pingouin Costard' }
];

export const getAvatarLabel = (id) => {
  const found = CARTOON_AVATARS_LIST.find(a => a.id === id);
  return found ? found.label : 'Agent';
};

export const CartoonAvatar = ({ id, className = "w-10 h-10", style = {} }) => {
  // If it's a base64 or external URL image
  if (id && (id.startsWith('data:image/') || id.startsWith('http'))) {
    return (
      <div className={`rounded-full overflow-hidden border-2 border-white/20 bg-slate-950/60 flex items-center justify-center flex-shrink-0 shadow-md ${className}`} style={style}>
        <img src={id} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Predefined 3D Cartoon Avatar Image Mapping
  const avatarImageMap = {
    'fox-detective': '/avatars/fox-detective.png',
    'spy-cat': '/avatars/spy-cat.png',
    'koala-agent': '/avatars/koala-agent.png',
    'panda-monocle': '/avatars/panda-monocle.png',
    'hacker-owl': '/avatars/hacker-owl.png',
    'ninja-frog': '/avatars/ninja-frog.png',
    'agent-dog': '/avatars/agent-dog.png',
    'detective-lion': '/avatars/detective-lion.png',
    'tiger-covert': '/avatars/tiger-covert.png',
    'penguin-secret': '/avatars/penguin-secret.png'
  };

  const imageSrc = avatarImageMap[id] || (id && id.endsWith('.png') ? id : '/avatars/fox-detective.png');

  return (
    <div className={`rounded-full border-2 border-white/25 bg-gradient-to-b from-slate-800/70 via-slate-900/85 to-slate-950/95 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.5)] relative group ${className}`} style={style}>
      <div className="absolute inset-0 bg-spy-lime/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none" />
      <img 
        src={imageSrc} 
        alt={id || 'Agent'} 
        className="w-full h-full object-contain p-0.5 transform transition-transform duration-300 group-hover:scale-115 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]" 
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/avatars/fox-detective.png';
        }}
      />
    </div>
  );
};
