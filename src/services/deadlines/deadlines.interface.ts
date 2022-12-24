export default interface IDeadline {
    _id: string;
    title: string;
    description: string;
    date: Date;
    studentId: {
        _id: string;
        email: string;
        detail?: {
            secondName: string;
            lastName: string;
            middleName: string;
        }
    }
    detail: Array<{
        studentId: {
            _id: string;
            email: string;
            detail?: {
                secondName: string;
                lastName: string;
                middleName: string;
            }
        },
        character: 'create' | 'checked' | 'unchecked';
        date: Date,
    }>;
}