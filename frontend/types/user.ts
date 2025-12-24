export interface Profile {
    id: number;
    student_id: string;
    other_names?: string;
    gender?: string;
    college?: string;
    program_of_study?: string;
    hall_of_residence?: string;
    year_group?: number;
    hometown?: string;
    profile_picture?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    is_student?: boolean;
    is_alumni?: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    is_active?: boolean;
    date_joined?: string;
    last_login?: string;
    profile?: Profile;
    student_id?: string;
    // Legacy fields for backward compatibility
    year_group?: string;
    programme?: string;
    hall?: string;
    hometown?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password_confirm?: string;  // Django backend requirement
}

export interface AuthResponse {
    access: string;
    refresh: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}
