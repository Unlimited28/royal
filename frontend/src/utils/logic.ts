
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
