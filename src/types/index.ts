export type Role = 'ambassador' | 'president' | 'superadmin';
export type Rank = 'Candidate' | 'Assistant Intern' | 'Intern' | 'Senior Intern' | 'Envoy' | 'Special Envoy' | 'Senior Envoy' | 'Dean' | 'Ambassador' | 'Ambassador Extraordinary' | 'Ambassador Plenipotentiary';
export type Status = 'active' | 'inactive' | 'suspended';

export interface IUser {
    id: number;
    full_name: string;
    name?: string; // Alias for full_name
    email: string;
    phone: string;
    church: string;
    association: string;
    role: Role;
    age: number;
    rank: Rank;
    user_code: string;
    ambassador_code?: string; // Alias for user_code
    status: Status;
    avatar?: string;
    created_at: string;
}

export interface IAssociation {
    id: number;
    name: string;
    president_name?: string;
    members_count: number;
}

export interface IExam {
    id: number;
    title: string;
    description: string;
    rank_required: Rank;
    duration_minutes: number;
    pass_score: number;
    questions_count: number;
}

export interface IQuestion {
    id: number;
    exam_id: number;
    question_text: string;
    options: {
        a: string;
        b: string;
        c: string;
        d: string;
    };
    correct_option: 'a' | 'b' | 'c' | 'd';
}

export interface IExamResult {
    id: number;
    exam_id: number;
    exam_title: string;
    user_id: number;
    score: number;
    passed: boolean;
    date_taken: string;
}

export interface IPayment {
    id: number;
    user_id: number;
    user_name: string;
    association: string;
    type: 'dues' | 'exam' | 'camp';
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    date: string;
    receipt_url?: string;
}

export interface ICampRegistration {
    id: number;
    user_id: number;
    ambassador_name?: string;
    ambassador_code?: string;
    camp_year: number;
    camp_type?: string;
    registration_date?: string;
    payment_status: 'pending' | 'paid' | 'partial';
    payment_amount: number;
    amount?: number; // Alias for payment_amount
    association?: string;
    registered_count?: number;
    uploaded_by?: string;
    date?: string;
    status?: 'confirmed' | 'pending';
    created_at: string;
}

export interface INotification {
    id: number;
    title: string;
    message: string;
    date: string;
    is_read: boolean;
}
