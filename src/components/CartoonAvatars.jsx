import React from 'react';

// Predefined list of custom cartoon agent SVGs
export const CARTOON_AVATARS_LIST = [
  { id: 'fox-detective', label: 'Renard Détective 🦊' },
  { id: 'spy-cat', label: 'Chat Infiltré 🐱' },
  { id: 'koala-agent', label: 'Koala Écoute 🐨' },
  { id: 'panda-monocle', label: 'Panda Élite 🐼' },
  { id: 'hacker-owl', label: 'Chouette Hacker 🦉' },
  { id: 'ninja-frog', label: 'Grenouille Tactique 🐸' },
  { id: 'agent-dog', label: 'Chien Lunettes 🐶' },
  { id: 'detective-lion', label: 'Lion Central 🦁' },
  { id: 'tiger-covert', label: 'Tigre Agent 🐯' },
  { id: 'penguin-secret', label: 'Pingouin Costard 🐧' }
];

export const getAvatarLabel = (id) => {
  const found = CARTOON_AVATARS_LIST.find(a => a.id === id);
  return found ? found.label.split(' ')[0] : 'Agent';
};

export const CartoonAvatar = ({ id, className = "w-10 h-10", style = {} }) => {
  // If it's a base64 or URL image
  if (id && (id.startsWith('data:image/') || id.startsWith('http'))) {
    return (
      <div className={`rounded-full overflow-hidden border-2 border-black bg-white flex items-center justify-center flex-shrink-0 ${className}`} style={style}>
        <img src={id} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Common wrapper styles
  const baseWrapper = `rounded-full border-3 border-black flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${className}`;

  // Predefined SVG Renderers
  switch (id) {
    case 'fox-detective':
      return (
        <div className={`${baseWrapper} bg-[#ff7700]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Ears */}
            <path d="M20,40 L10,10 L35,25 Z" fill="#b84500" stroke="#000" strokeWidth="3" />
            <path d="M80,40 L90,10 L65,25 Z" fill="#b84500" stroke="#000" strokeWidth="3" />
            <path d="M22,35 L15,15 L30,25 Z" fill="#ffbca3" />
            <path d="M78,35 L85,15 L70,25 Z" fill="#ffbca3" />
            {/* Face */}
            <polygon points="20,40 80,40 50,85" fill="#ff7700" stroke="#000" strokeWidth="3" />
            <polygon points="35,45 65,45 50,85" fill="#fff" stroke="#000" strokeWidth="2" />
            {/* Nose */}
            <circle cx="50" cy="83" r="6" fill="#000" />
            {/* Detective Sunglasses */}
            <path d="M22,46 L48,46 L45,58 L25,58 Z" fill="#111" stroke="#000" strokeWidth="2" />
            <path d="M52,46 L78,46 L75,58 L55,58 Z" fill="#111" stroke="#000" strokeWidth="2" />
            <line x1="45" y1="48" x2="55" y2="48" stroke="#000" strokeWidth="4" />
            {/* Hat */}
            <ellipse cx="50" cy="30" rx="35" ry="6" fill="#5c4033" stroke="#000" strokeWidth="3" />
            <path d="M25,30 L30,8 L70,8 L75,30 Z" fill="#5c4033" stroke="#000" strokeWidth="3" />
            <rect x="29" y="22" width="42" height="6" fill="#ff7700" />
          </svg>
        </div>
      );

    case 'spy-cat':
      return (
        <div className={`${baseWrapper} bg-[#2b2b2b]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Ears */}
            <polygon points="15,40 5,10 32,25" fill="#1a1a1a" stroke="#000" strokeWidth="3" />
            <polygon points="85,40 95,10 68,25" fill="#1a1a1a" stroke="#000" strokeWidth="3" />
            <polygon points="17,35 10,18 28,25" fill="#ff9999" />
            <polygon points="83,35 90,18 72,25" fill="#ff9999" />
            {/* Head */}
            <circle cx="50" cy="55" r="35" fill="#2b2b2b" stroke="#000" strokeWidth="3" />
            {/* Agent Mask */}
            <path d="M15,50 C25,40 75,40 85,50 C85,60 75,65 50,65 C25,65 15,60 15,50 Z" fill="#111" stroke="#000" strokeWidth="2.5" />
            {/* Glowing Eyes */}
            <ellipse cx="33" cy="50" rx="7" ry="4" fill="#ccff00" />
            <ellipse cx="67" cy="50" rx="7" ry="4" fill="#ccff00" />
            <circle cx="33" cy="50" r="2" fill="#000" />
            <circle cx="67" cy="50" r="2" fill="#000" />
            {/* Nose & Whiskers */}
            <polygon points="47,60 53,60 50,64" fill="#ff9999" />
            <line x1="20" y1="62" x2="38" y2="60" stroke="#000" strokeWidth="2" />
            <line x1="20" y1="68" x2="38" y2="64" stroke="#000" strokeWidth="2" />
            <line x1="80" y1="62" x2="62" y2="60" stroke="#000" strokeWidth="2" />
            <line x1="80" y1="68" x2="62" y2="64" stroke="#000" strokeWidth="2" />
          </svg>
        </div>
      );

    case 'koala-agent':
      return (
        <div className={`${baseWrapper} bg-[#a0aab2]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Big Ears */}
            <circle cx="18" cy="40" r="18" fill="#7d8891" stroke="#000" strokeWidth="3" />
            <circle cx="82" cy="40" r="18" fill="#7d8891" stroke="#000" strokeWidth="3" />
            <circle cx="18" cy="40" r="11" fill="#fff" />
            <circle cx="82" cy="40" r="11" fill="#fff" />
            {/* Head */}
            <circle cx="50" cy="55" r="32" fill="#a0aab2" stroke="#000" strokeWidth="3" />
            {/* Large Black Nose */}
            <rect x="42" y="46" width="16" height="24" rx="8" fill="#2b2b2b" stroke="#000" strokeWidth="2" />
            {/* Eyes */}
            <circle cx="32" cy="48" r="4.5" fill="#000" />
            <circle cx="68" cy="48" r="4.5" fill="#000" />
            <circle cx="34" cy="46" r="1.5" fill="#fff" />
            <circle cx="70" cy="46" r="1.5" fill="#fff" />
            {/* Secret Agent Earpiece */}
            <path d="M82,45 C82,65 72,75 66,72" fill="none" stroke="#00ffff" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="80" cy="45" r="3" fill="#00ffff" />
          </svg>
        </div>
      );

    case 'panda-monocle':
      return (
        <div className={`${baseWrapper} bg-[#f0f0f0]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Ears */}
            <circle cx="22" cy="28" r="14" fill="#111" stroke="#000" strokeWidth="3" />
            <circle cx="78" cy="28" r="14" fill="#111" stroke="#000" strokeWidth="3" />
            {/* Head */}
            <circle cx="50" cy="56" r="33" fill="#fff" stroke="#000" strokeWidth="3" />
            {/* Eyes patches */}
            <ellipse cx="33" cy="52" rx="10" ry="13" transform="rotate(-15, 33, 52)" fill="#111" />
            <ellipse cx="67" cy="52" rx="10" ry="13" transform="rotate(15, 67, 52)" fill="#111" />
            {/* Eyes */}
            <circle cx="33" cy="52" r="4" fill="#fff" />
            <circle cx="67" cy="52" r="4" fill="#fff" />
            <circle cx="33" cy="52" r="1.5" fill="#000" />
            <circle cx="67" cy="52" r="1.5" fill="#000" />
            {/* Monocle (Right eye) */}
            <circle cx="67" cy="52" r="13" fill="none" stroke="#ffd700" strokeWidth="3" />
            <line x1="78" y1="58" x2="90" y2="75" stroke="#ffd700" strokeWidth="2.5" />
            {/* Nose */}
            <ellipse cx="50" cy="67" rx="6" ry="4" fill="#111" />
          </svg>
        </div>
      );

    case 'hacker-owl':
      return (
        <div className={`${baseWrapper} bg-[#4a2e80]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Horns */}
            <polygon points="20,35 15,10 38,28" fill="#301c5c" stroke="#000" strokeWidth="3" />
            <polygon points="80,35 85,10 62,28" fill="#301c5c" stroke="#000" strokeWidth="3" />
            {/* Head/Body */}
            <circle cx="50" cy="55" r="33" fill="#4a2e80" stroke="#000" strokeWidth="3" />
            {/* Huge Eyes circles */}
            <circle cx="33" cy="50" r="15" fill="#fff" stroke="#000" strokeWidth="2" />
            <circle cx="67" cy="50" r="15" fill="#fff" stroke="#000" strokeWidth="2" />
            {/* Hacker Glasses/HUD visor */}
            <rect x="15" y="42" width="70" height="16" rx="4" fill="rgba(0, 255, 0, 0.25)" stroke="#00ff00" strokeWidth="2.5" />
            {/* Pupils */}
            <circle cx="33" cy="50" r="5" fill="#00ff00" />
            <circle cx="67" cy="50" r="5" fill="#00ff00" />
            {/* Beak */}
            <polygon points="46,58 54,58 50,68" fill="#ffaa00" stroke="#000" strokeWidth="2" />
          </svg>
        </div>
      );

    case 'ninja-frog':
      return (
        <div className={`${baseWrapper} bg-[#4ca64c]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Big Eyes circles */}
            <circle cx="28" cy="35" r="15" fill="#4ca64c" stroke="#000" strokeWidth="3" />
            <circle cx="72" cy="35" r="15" fill="#4ca64c" stroke="#000" strokeWidth="3" />
            <circle cx="28" cy="35" r="10" fill="#fff" />
            <circle cx="72" cy="35" r="10" fill="#fff" />
            <circle cx="28" cy="35" r="4.5" fill="#000" />
            <circle cx="72" cy="35" r="4.5" fill="#000" />
            {/* Head */}
            <ellipse cx="50" cy="60" rx="35" ry="25" fill="#4ca64c" stroke="#000" strokeWidth="3" />
            {/* Red Bandana */}
            <path d="M15,50 C30,44 70,44 85,50 L83,59 C70,54 30,54 17,59 Z" fill="#e60000" stroke="#000" strokeWidth="2" />
            {/* Bandana Tails */}
            <path d="M84,52 L96,40 L91,60 Z" fill="#b30000" stroke="#000" strokeWidth="2" />
            {/* Blush */}
            <circle cx="25" cy="68" r="4" fill="#ff6666" opacity="0.6" />
            <circle cx="75" cy="68" r="4" fill="#ff6666" opacity="0.6" />
            {/* Mouth */}
            <path d="M42,68 Q50,73 58,68" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'agent-dog':
      return (
        <div className={`${baseWrapper} bg-[#c29870]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Flappy Ears */}
            <path d="M12,32 C5,45 8,72 18,72 C25,72 23,45 23,32 Z" fill="#805b38" stroke="#000" strokeWidth="3" />
            <path d="M88,32 C95,45 92,72 82,72 C75,72 77,45 77,32 Z" fill="#805b38" stroke="#000" strokeWidth="3" />
            {/* Head */}
            <circle cx="50" cy="50" r="30" fill="#c29870" stroke="#000" strokeWidth="3" />
            {/* Snout */}
            <ellipse cx="50" cy="62" rx="16" ry="12" fill="#fff" stroke="#000" strokeWidth="2" />
            <ellipse cx="50" cy="56" rx="7" ry="5" fill="#000" />
            {/* Agent Sunglasses */}
            <rect x="22" y="38" width="24" height="15" rx="6" fill="#111" stroke="#000" strokeWidth="2.5" />
            <rect x="54" y="38" width="24" height="15" rx="6" fill="#111" stroke="#000" strokeWidth="2.5" />
            <line x1="42" y1="43" x2="58" y2="43" stroke="#000" strokeWidth="4.5" />
          </svg>
        </div>
      );

    case 'detective-lion':
      return (
        <div className={`${baseWrapper} bg-[#e0ac53]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Mane */}
            <circle cx="50" cy="50" r="40" fill="#b06418" stroke="#000" strokeWidth="3" />
            {/* Ears */}
            <circle cx="28" cy="22" r="10" fill="#e0ac53" stroke="#000" strokeWidth="2.5" />
            <circle cx="72" cy="22" r="10" fill="#e0ac53" stroke="#000" strokeWidth="2.5" />
            {/* Head */}
            <circle cx="50" cy="53" r="28" fill="#e0ac53" stroke="#000" strokeWidth="3" />
            {/* Eyes */}
            <circle cx="39" cy="46" r="4" fill="#000" />
            <circle cx="61" cy="46" r="4" fill="#000" />
            <circle cx="41" cy="44" r="1.5" fill="#fff" />
            <circle cx="63" cy="44" r="1.5" fill="#fff" />
            {/* Snout */}
            <polygon points="45,56 55,56 50,62" fill="#000" />
            <path d="M50,62 L50,68 Q46,71 42,68 M50,68 Q54,71 58,68" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            {/* Badge on Mane */}
            <polygon points="72,62 82,54 92,62 87,74 77,74" fill="#ffd700" stroke="#b08d00" strokeWidth="2" />
            <circle cx="82" cy="65" r="3" fill="#ff4400" />
          </svg>
        </div>
      );

    case 'tiger-covert':
      return (
        <div className={`${baseWrapper} bg-[#f58220]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Ears */}
            <polygon points="20,28 10,8 35,18" fill="#d46100" stroke="#000" strokeWidth="3" />
            <polygon points="80,28 90,8 65,18" fill="#d46100" stroke="#000" strokeWidth="3" />
            {/* Head */}
            <circle cx="50" cy="50" r="31" fill="#f58220" stroke="#000" strokeWidth="3" />
            {/* Stripes */}
            <polygon points="19,45 32,47 20,53" fill="#000" />
            <polygon points="81,45 68,47 80,53" fill="#000" />
            <polygon points="42,20 50,30 58,20 50,24" fill="#000" />
            {/* Eyes */}
            <circle cx="36" cy="45" r="4.5" fill="#000" />
            <circle cx="64" cy="45" r="4.5" fill="#000" />
            <circle cx="38" cy="43" r="1.5" fill="#fff" />
            <circle cx="66" cy="43" r="1.5" fill="#fff" />
            {/* Tactical Headset */}
            <path d="M50,19 C68,19 78,25 78,40" fill="none" stroke="#333" strokeWidth="3" />
            <circle cx="78" cy="44" r="5" fill="#111" stroke="#000" strokeWidth="2" />
            <path d="M78,44 L66,54" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
            {/* Nose */}
            <polygon points="46,55 54,55 50,60" fill="#000" />
          </svg>
        </div>
      );

    case 'penguin-secret':
      return (
        <div className={`${baseWrapper} bg-[#0b132b]`} style={style}>
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Head/Body */}
            <ellipse cx="50" cy="52" rx="33" ry="36" fill="#0b132b" stroke="#000" strokeWidth="3" />
            {/* White belly/face */}
            <ellipse cx="50" cy="58" rx="23" ry="26" fill="#fff" />
            <circle cx="38" cy="42" r="12" fill="#fff" />
            <circle cx="62" cy="42" r="12" fill="#fff" />
            {/* Eyes */}
            <circle cx="38" cy="42" r="4" fill="#000" />
            <circle cx="62" cy="42" r="4" fill="#000" />
            <circle cx="40" cy="40" r="1.5" fill="#fff" />
            <circle cx="64" cy="40" r="1.5" fill="#fff" />
            {/* Beak */}
            <ellipse cx="50" cy="48" rx="7" ry="5" fill="#f58220" stroke="#000" strokeWidth="1.5" />
            {/* Secret Tuxedo bow tie */}
            <polygon points="50,66 40,60 40,72" fill="#000" />
            <polygon points="50,66 60,60 60,72" fill="#000" />
            <circle cx="50" cy="66" r="3" fill="#ff3300" />
          </svg>
        </div>
      );

    default:
      // Fallback for simple emojis
      return (
        <div className={`${baseWrapper} bg-gradient-to-br from-white/10 to-white/20`} style={style}>
          <span className="text-xl leading-none select-none">{id || '👤'}</span>
        </div>
      );
  }
};
