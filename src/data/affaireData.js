// ─────────────────────────────────────────────────────────────
//  Affaire Classée — Données des énigmes
//  difficulty: 1 = Facile | 2 = Intermédiaire | 3 = Difficile
// ─────────────────────────────────────────────────────────────

export const affaires = [
    {
        id: 1,
        title: "Le Parachutiste",
        mystery:
            "Un homme est retrouvé mort dans un champ ouvert. Il porte un sac à dos fermé. Il n'y a aucune trace de violence, ni témoin, ni bâtiment à proximité.",
        solution:
            "L'homme était parachutiste. Son parachute ne s'est pas ouvert. Le sac à dos, c'est le parachute défaillant.",
        difficulty: 1,
        category: "Classique",
    },
    {
        id: 2,
        title: "L'Homme dans le Bar",
        mystery:
            "Un homme rentre dans un bar et demande un verre d'eau. Le barman sort un pistolet, le pointe vers lui et tire en l'air. L'homme dit « merci » et repart.",
        solution:
            "L'homme avait le hoquet. Le barman a tiré pour lui faire peur, et la frayeur lui a fait passer le hoquet. L'eau n'était plus nécessaire.",
        difficulty: 1,
        category: "Classique",
    },
    {
        id: 3,
        title: "La Cabane dans la Forêt",
        mystery:
            "On retrouve un homme mort dans une cabane au milieu d'une forêt. La cabane est verrouillée de l'intérieur. Il n'y a ni fenêtre brisée ni autre issue. L'homme tient une allumette consumée.",
        solution:
            "La cabane était en réalité une cabane d'avion. L'avion s'est écrasé. L'homme a survécu à l'impact mais a allumé une allumette pour voir dans le noir — et il restait du carburant.",
        difficulty: 2,
        category: "Mystère",
    },
    {
        id: 4,
        title: "La Femme du 8e Étage",
        mystery:
            "Chaque matin, une femme prend l'ascenseur du 16e étage jusqu'au rez-de-chaussée pour aller travailler. Le soir, elle monte en ascenseur jusqu'au 8e étage et monte le reste à pied — sauf quand il pleut.",
        solution:
            "La femme est de petite taille. Elle ne peut atteindre que le bouton du 8e étage. Quand il pleut, elle a son parapluie et peut pousser le bouton du 16e.",
        difficulty: 2,
        category: "Logique",
    },
    {
        id: 5,
        title: "Le Chirurgien",
        mystery:
            "Un homme et son fils ont un accident de voiture. Le père meurt sur le coup. Le fils est amené en urgence à l'hôpital. Le chirurgien entre dans la salle, regarde l'enfant et dit : « Je ne peux pas opérer cet enfant, c'est mon fils. »",
        solution:
            "Le chirurgien est la mère de l'enfant.",
        difficulty: 1,
        category: "Réflexion",
    },
    {
        id: 6,
        title: "L'Appartement Silencieux",
        mystery:
            "Un détective arrive sur une scène de crime. La victime est morte dans son appartement, toutes fenêtres fermées. Il n'y a ni serure forcée, ni intrus signalé. Sur la table, une tasse de café encore chaude. Sur le sol, un couteau. La victime était seule.",
        solution:
            "La victime s'est suicidée. Mais le détective n'arrive pas encore. Le narrateur, c'est l'assassin qui guette depuis la pièce adjacente — le mur révèle une porte secrète.",
        difficulty: 3,
        category: "Noir",
    },
];

export default affaires;
