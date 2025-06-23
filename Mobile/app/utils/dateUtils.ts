export const formatDate = (dateString: string | null): string => {
    if (dateString == null) return 'N/A';
    try {
        const datePart = dateString.split("T")[0];
        const date = new Date(datePart);

        if (isNaN(date.getTime())) {
            return datePart;
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
}; 