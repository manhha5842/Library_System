export const getStatusDetails = (status: string) => {
    switch (status) {
        case 'PENDING': return { label: 'Chờ xác nhận', color: 'orange.500', type: 'warning' };
        case 'APPROVED': return { label: 'Đã xác nhận', color: 'cyan.500', type: 'info' };
        case 'BORROWED': return { label: 'Đang mượn', color: 'green.500', type: 'success' };
        case 'RETURN_PENDING': return { label: 'Chờ trả sách', color: 'yellow.500', type: 'warning' };
        case 'COMPLETED': return { label: 'Đã hoàn thành', color: 'gray.500', type: 'muted' };
        case 'CANCELLED': return { label: 'Đã huỷ', color: 'red.500', type: 'error' };
        case 'REJECTED': return { label: 'Bị từ chối', color: 'red.500', type: 'error' };
        default: return { label: 'Không xác định', color: 'gray.500', type: 'muted' };
    }
};

export const getFineStatus = (status: string) => {
    switch (status) {
        case 'PENDING': return { label: 'Chờ thanh toán', color: 'orange.300', type: 'warning' };
        case 'PAID': return { label: 'Đã thanh toán', color: 'green.300', type: 'success' };
        default: return { label: 'Không xác định', color: 'gray.300', type: 'muted' };
    }
};

export const getRenewalRecordStatus = (status: string) => {
    switch (status) {
        case 'PENDING': return { label: 'Chờ xác nhận', color: 'orange.500' };
        case 'APPROVED': return { label: 'Đã xác nhận', color: 'green.500' };
        case 'REJECTED': return { label: 'Bị từ chối', color: 'red.500' };
        default: return { label: 'Không xác định', color: 'gray.500' };
    }
}; 