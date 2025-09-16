export const formatDateToISO = (date: Date | null | undefined): string => {
    if (!date) return '';

    // Adjust to local timezone before formatting
    const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return adjustedDate.toISOString().split('T')[0];
};
