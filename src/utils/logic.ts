
export const RANK_HIERARCHY: Record<string, number> = {
    'Candidate': 1,
    'Assistant Intern': 2,
    'Intern': 3,
    'Senior Intern': 4,
    'Envoy': 5,
    'Special Envoy': 6,
    'Senior Envoy': 7,
    'Dean': 8,
    'Ambassador': 9,
    'Ambassador Extraordinary': 10,
    'Ambassador Plenipotentiary': 11
};

export const PASSCODES = {
    president: 'pres123',
    super_admin: 'admin123'
};

export const isEligible = (userRank: string, requiredRank: string): boolean => {
    const userLevel = RANK_HIERARCHY[userRank] || 0;
    const requiredLevel = RANK_HIERARCHY[requiredRank] || 0;
    return userLevel >= requiredLevel;
};

export const getNextRank = (currentRank: string): string | null => {
    const ranks = Object.keys(RANK_HIERARCHY);
    const currentIndex = ranks.indexOf(currentRank);
    if (currentIndex >= 0 && currentIndex < ranks.length - 1) {
        return ranks[currentIndex + 1];
    }
    return null;
};

export const isEligibleForExam = (userRank: string, targetRank: string): boolean => {
    return getNextRank(userRank) === targetRank;
};

export const generateUniqueId = (role: string): string => {
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number

    switch (role) {
        case 'super_admin':
            return `OGBC/RA/ADMIN/${random}`;
        case 'president':
            return `OGBC/RA/PRES/${random}`;
        case 'ambassador':
        default:
            return `ogbc//ra//${random}`;
    }
};
