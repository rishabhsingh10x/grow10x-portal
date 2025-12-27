export interface Holiday {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    type: 'Public' | 'Company' | 'Custom';
}
