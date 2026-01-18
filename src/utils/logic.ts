
export const RANK_HIERARCHY_LIST = [
    'Candidate',
    'Assistant Intern',
    'Intern',
    'Senior Intern',
    'Envoy',
    'Special Envoy',
    'Senior Envoy',
    'Dean',
    'Ambassador',
    'Ambassador Extraordinary',
    'Ambassador Plenipotentiary'
];

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
    superadmin: 'admin123'
};

/**
 * Checks if a user is eligible to take an exam for a target rank.
 * User is eligible if they are at the rank immediately preceding the target rank.
 */
export const isEligible = (userRank: string, targetRank: string): boolean => {
    const userLevel = RANK_HIERARCHY[userRank] || 0;
    const targetLevel = RANK_HIERARCHY[targetRank] || 0;

    // User can only take the exam for the rank immediately following their current rank
    return targetLevel === userLevel + 1;
};

export const generateUniqueId = (role: string, year: number = 2024): string => {
    const random = Math.floor(100 + Math.random() * 900); // 3 digit random number

    switch (role) {
        case 'superadmin':
            return `ogbc//ra//admin//${random}`;
        case 'president':
            return `ogbc//ra//pres//${random}`;
        case 'ambassador':
        default:
            return `ogbc//ra//${year}//${random}`;
    }
};
