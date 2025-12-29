import type { IAssociation, ICampRegistration, IExam, IExamResult, INotification, IPayment, IUser } from "../types";
import campImg from '../assets/images/new_1.jpg';
import ceremonyImg from '../assets/images/new_2.jpg';
import gallery1 from '../assets/images/new_5.jpg';
import gallery2 from '../assets/images/new_6.jpg';

export const mockUsers: IUser[] = [
    {
        id: 1,
        full_name: "Adeboye Samuel",
        name: "Adeboye Samuel",
        email: "samuel@example.com",
        phone: "08012345678",
        church: "First Baptist Church, Ikeja",
        association: "Ikeja Association",
        role: "ambassador",
        age: 14,
        rank: "Special Envoy",
        user_code: "ogbc/ra/1001",
        ambassador_code: "ogbc/ra/1001",
        status: "active",
        created_at: "2023-01-15",
    },
    {
        id: 2,
        full_name: "Pastor Emmanuel Adebayo",
        name: "Pastor Emmanuel Adebayo",
        email: "emmanuel@example.com",
        phone: "08087654321",
        church: "Divine Baptist Church",
        association: "Ikeja Association",
        role: "president",
        age: 45,
        rank: "Ambassador Plenipotentiary",
        user_code: "ogbc/ra/2001",
        ambassador_code: "ogbc/ra/2001",
        status: "active",
        created_at: "2022-05-10",
    },
    {
        id: 3,
        full_name: "Rev. Dr. Akindele Oloye",
        name: "Rev. Dr. Akindele Oloye",
        email: "admin@royalambassadors.org",
        phone: "08000000000",
        church: "HQ",
        association: "Conference",
        role: "superadmin",
        age: 40,
        rank: "Ambassador Plenipotentiary",
        user_code: "ogbc/ra/0001",
        ambassador_code: "ogbc/ra/0001",
        status: "active",
        created_at: "2020-01-01",
    }
];

export const mockExams: IExam[] = [
    {
        id: 1,
        title: "Intern Promotion Exam",
        description: "Assessment for promotion from Assistant Intern to Intern.",
        rank_required: "Assistant Intern",
        duration_minutes: 45,
        pass_score: 60,
        questions_count: 50,
    },
    {
        id: 2,
        title: "Ambassador Extra-ordinary Qualification",
        description: "Advanced test for Ambassador Extra-ordinary candidates.",
        rank_required: "Ambassador",
        duration_minutes: 90,
        pass_score: 70,
        questions_count: 50,
    }
];

export const mockExamResults: IExamResult[] = [
    {
        id: 101,
        exam_id: 1,
        exam_title: "Junior Ambassador Promotion Exam",
        user_id: 1,
        score: 85,
        passed: true,
        date_taken: "2023-06-15",
    }
];

export const mockPayments: IPayment[] = [
    {
        id: 301,
        user_id: 1,
        user_name: "Adeboye Samuel",
        association: "Ikeja Association",
        type: "dues",
        amount: 5000,
        status: "approved",
        date: "2023-11-01",
    },
    {
        id: 302,
        user_id: 1,
        user_name: "Adeboye Samuel",
        association: "Ikeja Association",
        type: "camp",
        amount: 15000,
        status: "pending",
        date: "2023-12-01",
    }
];

export const mockAssociations: IAssociation[] = [
    { id: 1, name: "Ikeja Association", president_name: "Pastor Emmanuel Adebayo", members_count: 150 },
    { id: 2, name: "Yaba Association", president_name: "Deacon Olumide Smith", members_count: 120 },
    { id: 3, name: "Surulere Association", president_name: "Mr. Paul Okon", members_count: 200 },
];

export const mockCampRegistrations: ICampRegistration[] = [
    {
        id: 501,
        user_id: 1,
        ambassador_name: "Adeboye Samuel",
        ambassador_code: "ogbc/ra/1001",
        camp_year: 2024,
        camp_type: "Annual Camp",
        registration_date: "2023-11-20",
        payment_status: "paid",
        payment_amount: 15000,
        amount: 15000,
        association: "Ikeja Association",
        registered_count: 45,
        uploaded_by: "Pastor John Doe",
        date: "2023-11-20",
        status: "confirmed",
        created_at: "2023-11-20",
    },
    {
        id: 502,
        user_id: 2,
        ambassador_name: "Chidi Okonkwo",
        ambassador_code: "ogbc/ra/1002",
        camp_year: 2024,
        camp_type: "Annual Camp",
        registration_date: "2023-11-22",
        payment_status: "pending",
        payment_amount: 15000,
        amount: 15000,
        created_at: "2023-11-22",
    }
];

export const mockNotifications: INotification[] = [
    {
        id: 1,
        title: "Camp 2024 Registration Open",
        message: "Registration for the annual camp is now open. Early bird ends Dec 31st.",
        date: "2023-12-01",
        is_read: false,
    },
    {
        id: 2,
        title: "Exam Results Released",
        message: "The results for the November ranking exams have been published.",
        date: "2023-11-25",
        is_read: true,
    }
];

export interface IBlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    featured_image: string;
    created_at: string;
    category: string;
}

export const mockBlogPosts: IBlogPost[] = [
    {
        id: 1,
        title: "Annual Camp 2024: Registration Now Open",
        slug: "annual-camp-2024-registration",
        excerpt: "Join us for an unforgettable week of fellowship, learning, and spiritual growth at our annual Royal Ambassadors camp.",
        content: "The Royal Ambassadors Annual Camp 2024 is set to be our biggest and best yet! With exciting activities, powerful worship sessions, and life-changing teachings, this is an event you don't want to miss...",
        author: "Admin",
        featured_image: campImg,
        created_at: "2023-12-15",
        category: "Events"
    },
    {
        id: 2,
        title: "Congratulations to Our New Knights",
        slug: "new-knights-ceremony",
        excerpt: "We celebrate 15 ambassadors who successfully completed their Knight rank examinations and were inducted in a special ceremony.",
        content: "Last Saturday marked a momentous occasion as 15 dedicated ambassadors achieved the prestigious Knight rank. The ceremony was attended by association presidents and families...",
        author: "Pastor Emmanuel Adebayo",
        featured_image: ceremonyImg,
        created_at: "2023-12-10",
        category: "Achievements"
    }
];

export interface IGalleryItem {
    id: number;
    title: string;
    description: string;
    image_path: string;
    created_at: string;
    category: string;
}

export const mockGalleryItems: IGalleryItem[] = [
    {
        id: 1,
        title: "Annual Camp 2023 Opening Ceremony",
        description: "Ambassadors gather for the grand opening of our 2023 annual camp",
        image_path: gallery1,
        created_at: "2023-08-15",
        category: "Camp"
    },
    {
        id: 2,
        title: "Knight Rank Induction",
        description: "New Knights receive their badges in a special ceremony",
        image_path: gallery2,
        created_at: "2023-12-10",
        category: "Ceremonies"
    }
];

export interface IVoucher {
    id: number;
    code: string;
    type: 'exam' | 'camp' | 'dues';
    amount: number;
    status: 'active' | 'used' | 'expired';
    created_at: string;
    used_by?: string;
    used_at?: string;
}

export const mockVouchers: IVoucher[] = [
    {
        id: 1,
        code: "EXAM2024-ABC123",
        type: "exam",
        amount: 2000,
        status: "active",
        created_at: "2024-01-15"
    }
];

export interface IExamQuestion {
    id: number;
    exam_id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'a' | 'b' | 'c' | 'd';
    points: number;
}

export const mockExamQuestions: IExamQuestion[] = [
    {
        id: 1,
        exam_id: 1,
        question_text: "What is the primary mission of Royal Ambassadors?",
        option_a: "To play sports",
        option_b: "To develop young Christian leaders",
        option_c: "To raise funds",
        option_d: "To organize camps",
        correct_answer: 'b',
        points: 2
    },
    {
        id: 2,
        exam_id: 1,
        question_text: "Which rank comes after Page?",
        option_a: "Knight",
        option_b: "Ambassador",
        option_c: "Squire",
        option_d: "Plenipotentiary",
        correct_answer: 'c',
        points: 2
    },
    {
        id: 3,
        exam_id: 1,
        question_text: "What are the core values of Royal Ambassadors?",
        option_a: "Money and Power",
        option_b: "Faith, Excellence, Service, Leadership",
        option_c: "Competition and Winning",
        option_d: "Individual Success",
        correct_answer: 'b',
        points: 2
    },
    // Adding more questions to reach 30+ range for simulation
    ...Array.from({ length: 32 }).map((_, i) => ({
        id: i + 4,
        exam_id: 1,
        question_text: `RA Doctrine Question ${i + 4}: What is the significance of the RA emblem?`,
        option_a: "Service",
        option_b: "Loyalty",
        option_c: "Growth",
        option_d: "All of the above",
        correct_answer: 'd' as const,
        points: 2
    })),
    ...Array.from({ length: 35 }).map((_, i) => ({
        id: i + 40,
        exam_id: 2,
        question_text: `Advanced Leadership Question ${i + 1}: How should an Ambassador handle conflict?`,
        option_a: "Avoid it",
        option_b: "Biblical resolution",
        option_c: "Report to authorities",
        option_d: "Ignore it",
        correct_answer: 'b' as const,
        points: 3
    }))
];

export interface IFinancialSummary {
    total_revenue: number;
    total_expenses: number;
    pending_payments: number;
    this_month_revenue: number;
    last_month_revenue: number;
}

export const mockFinancialSummary: IFinancialSummary = {
    total_revenue: 4200000,
    total_expenses: 2800000,
    pending_payments: 350000,
    this_month_revenue: 580000,
    last_month_revenue: 520000
};

export interface ITransaction {
    id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    reference?: string;
}

export const mockTransactions: ITransaction[] = [
    {
        id: 1,
        type: 'income',
        category: 'Exam Fees',
        amount: 50000,
        description: 'Exam registration payments - Batch 12',
        date: '2024-01-20',
        status: 'completed',
        reference: 'TXN-2024-001'
    },
    {
        id: 2,
        type: 'income',
        category: 'Camp Registration',
        amount: 225000,
        description: 'Annual camp registrations - Ikeja Association',
        date: '2024-01-18',
        status: 'completed',
        reference: 'TXN-2024-002'
    },
    {
        id: 3,
        type: 'expense',
        category: 'Supplies',
        amount: 75000,
        description: 'Uniforms and badges procurement',
        date: '2024-01-15',
        status: 'completed',
        reference: 'TXN-2024-003'
    },
    {
        id: 4,
        type: 'income',
        category: 'Membership Dues',
        amount: 120000,
        description: 'Monthly dues collection - Multiple associations',
        date: '2024-01-12',
        status: 'pending',
        reference: 'TXN-2024-004'
    },
    {
        id: 5,
        type: 'expense',
        category: 'Venue Rental',
        amount: 150000,
        description: 'Conference hall rental for annual meeting',
        date: '2024-01-10',
        status: 'completed',
        reference: 'TXN-2024-005'
    }
];

export interface ICampFile {
    id: number;
    association: string;
    file_name: string;
    uploaded_by: string;
    upload_date: string;
    file_size: string;
    status: 'approved' | 'pending' | 'rejected';
    registered_count: number;
}

export const mockCampFiles: ICampFile[] = [
    {
        id: 1,
        association: 'Ikeja Association',
        file_name: 'ikeja_camp_2024.xlsx',
        uploaded_by: 'Pastor John Doe',
        upload_date: '2024-01-15',
        file_size: '245 KB',
        status: 'approved',
        registered_count: 45
    },
    {
        id: 2,
        association: 'Yaba Association',
        file_name: 'yaba_registrations.xlsx',
        uploaded_by: 'Deacon Smith',
        upload_date: '2024-01-18',
        file_size: '198 KB',
        status: 'pending',
        registered_count: 38
    },
    {
        id: 3,
        association: 'Surulere Association',
        file_name: 'surulere_camp_list.xlsx',
        uploaded_by: 'Mr. Paul',
        upload_date: '2024-01-20',
        file_size: '312 KB',
        status: 'approved',
        registered_count: 52
    }
];


