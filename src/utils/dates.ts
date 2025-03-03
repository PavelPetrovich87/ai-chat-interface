export const formatDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const getDateNDaysAgo = (n: number): string => {
    const now = new Date();
    now.setDate(now.getDate() - n);
    return formatDate(now);
};

export const dates = {
    startDate: getDateNDaysAgo(3),
    endDate: getDateNDaysAgo(1)
}; 