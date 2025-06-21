export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        // Handle cases where dateString might be just the date part
        const datePart = dateString.split("T")[0];
        const date = new Date(datePart);
        
        // Check if the created date is valid
        if (isNaN(date.getTime())) {
            // If parsing fails, return the original date part, which is better than 'N/A'
            return datePart; 
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        // In case of any error, return the original string
        return dateString; 
    }
}; 