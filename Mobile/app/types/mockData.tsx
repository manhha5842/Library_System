import { Book } from './Book';
import { Author } from './Author';
import { Category, CategoryGroup } from './';
import { User } from './User';
import { Notification } from './Notification';
import { Feedback } from './Feedback';
import { BorrowRecord } from './BorrowRecord';
import { FineRecord } from './FineRecord';
import { ReturnRecord } from './ReturnRecord';
import { RenewalRecord } from './RenewalRecord';
import { BookDetail } from './BookDetail';
import { BookView } from './BookView';
import { FineRecordView } from './FineRecordView';
import { BorrowRecordDetail } from './BorrowRecordDetail';
import { FeedbackStatus, FineRecordStatus, ReturnRecordStatus } from './enums';


export const mockAuthors: Author[] = [
  { id: '1', name: 'Nguyễn Nhật Ánh' },
  { id: '2', name: 'Dale Carnegie' },
  { id: '3', name: 'J.K. Rowling' },
  { id: '4', name: 'Yuval Noah Harari' },
  { id: '5', name: 'Napoleon Hill' },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Văn học Việt Nam' },
  { id: '2', name: 'Kỹ năng sống' },
  { id: '3', name: 'Tiểu thuyết' },
  { id: '4', name: 'Lịch sử' },
  { id: '5', name: 'Kinh tế' },
  { id: '6', name: 'Khoa học' },
  { id: '7', name: 'Công nghệ thông tin' },
];

export const mockCategoryGroups: CategoryGroup[] = [
  {
    title: 'Văn học',
    data: [
      { id: '1', name: 'Văn học Việt Nam' },
      { id: '3', name: 'Tiểu thuyết' },
    ],
  },
  {
    title: 'Khoa học & Đời sống',
    data: [
      { id: '2', name: 'Kỹ năng sống' },
      { id: '4', name: 'Lịch sử' },
      { id: '5', name: 'Kinh tế' },
      { id: '6', name: 'Khoa học' },
    ],
  },
  {
    title: 'Công nghệ',
    data: [
      { id: '7', name: 'Công nghệ thông tin' },
    ],
  },
];

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Cho tôi xin một vé đi tuổi thơ',
    author: [mockAuthors[0]],
    category: [mockCategories[0]],
    image: 'https://picsum.photos/seed/book1/200/300',
    status: 'ACTIVE',
  },
  {
    id: '2',
    title: 'Đắc nhân tâm',
    author: [mockAuthors[1]],
    category: [mockCategories[1]],
    image: 'https://picsum.photos/seed/book2/200/300',
    status: 'INACTIVE',
  },
  {
    id: '3',
    title: 'Harry Potter và Hòn đá Phù thủy',
    author: [mockAuthors[2]],
    category: [mockCategories[2]],
    image: 'https://picsum.photos/seed/book3/200/300',
    status: 'ACTIVE',
  },
  {
    id: '4',
    title: 'Sapiens: Lược sử loài người',
    author: [mockAuthors[3]],
    category: [mockCategories[3], mockCategories[5]],
    image: 'https://picsum.photos/seed/book4/200/300',
    status: 'INACTIVE',
  },
  {
    id: '5',
    title: 'Nghĩ giàu và làm giàu',
    author: [mockAuthors[4]],
    category: [mockCategories[1], mockCategories[4]],
    image: 'https://picsum.photos/seed/book5/200/300',
    status: 'ACTIVE',
  },
];

export const mockUser: User = {
  id: 'SV001',
  name: 'Nguyễn Văn Test',
  email: 'test@example.com',
  token: 'mock-jwt-token-12345',
};

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nhắc nhở trả sách',
    message: 'Sách "Đắc nhân tâm" của bạn sắp hết hạn trả vào ngày mai.',
    type: 'reminder',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Phản hồi đã được ghi nhận',
    message: 'Cảm ơn bạn đã góp ý về việc "Bổ sung sách mới". Chúng tôi đã ghi nhận.',
    type: 'feedback',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Sách mới đã về!',
    message: 'Thư viện vừa nhập về nhiều đầu sách mới thuộc thể loại Khoa học, mời bạn ghé xem.',
    type: 'news',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockFeedbacks: Feedback[] = [
  {
    id: '1',
    studentId: 'SV001',
    purpose: 'REQUEST_NEW_BOOKS',
    content: 'Yêu cầu nhập thêm sách về AI và Machine Learning.',
    image: '',
    reason: 'Phục vụ cho việc học tập và nghiên cứu.',
    proposedSolution: 'Nhập các đầu sách mới nhất của các tác giả uy tín.',
    status: FeedbackStatus.SEEN,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reply: 'Cảm ơn bạn đã góp ý. Chúng tôi sẽ xem xét trong đợt nhập sách tiếp theo.',
  },
  {
    id: '2',
    studentId: 'SV001',
    purpose: 'REPORT_FACILITY_ISSUES',
    content: 'Máy tính ở khu vực A bị hỏng.',
    image: 'https://picsum.photos/seed/pc/300/200',
    reason: '',
    proposedSolution: '',
    status: FeedbackStatus.SEEN,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reply: '',
  },
];

export const mockBookViews: BookView[] = mockBooks.map(book => ({
  id: book.id,
  title: book.title,
  author: book.author.map(a => a.name),
  image: book.image,
}));


export const mockFineRecords: FineRecord[] = [
  {
    id: '1',
    borrowRecordId: '1',
    reason: 'Trả sách trễ 2 ngày',
    amount: 10000,
    fineDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    paymentDate: null,
    status: FineRecordStatus.PAID,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];


export const mockReturnRecords: ReturnRecord[] = [
  {
    id: 1,
    librarian: 'Lê Thị Thư Viện',
    book: mockBookViews[0],
    returnTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: ReturnRecordStatus.RETURNED,
  },
];

export const mockRenewalRecords: RenewalRecord[] = [
  {
    id: 1,
    originalBorrowDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    originalDueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    requestBorrowDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    requestDueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Cần thêm thời gian để hoàn thành bài tập lớn.',
    status: 'RENEWED',
    createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
  },
];


export const mockBorrowRecords: BorrowRecord[] = [
  {
    id: '1',
    borrowDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RETURNED',
    books: [mockBookViews[0]],
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    borrowDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RETURNED',
    books: [mockBookViews[1], mockBookViews[2]],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RETURNED',
    books: [mockBookViews[4]],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    borrowDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RETURNED',
    books: [mockBookViews[3]],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    borrowDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RETURNED',
    books: [mockBookViews[0]],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockBookDetails: BookDetail[] = mockBooks.map(book => ({
  ...book,
  description: `Đây là mô tả chi tiết cho sách "${book.title}". Sách thuộc thể loại ${book.category.map(c => c.name).join(', ')} và được viết bởi tác giả ${book.author.map(a => a.name).join(', ')}.`,
  publicationYear: (2024 - parseInt(book.id)).toString(),
  publisher: 'Nhà xuất bản Mẫu',
  language: 'Tiếng Việt',
  isbn: `978-604-0-${Math.floor(Math.random() * 90000) + 10000}`,
  format: 'Bìa mềm',
  price: `${Math.floor(Math.random() * 100 + 50)}000`,
}));


export const mockFineRecordViews: FineRecordView[] = [
  {
    id: '4',
    borrowDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RETURNED',
    books: [mockBookViews[3]],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    unpaidAmount: 10000,
    fineRecords: [mockFineRecords[0]],
  },
];


export const mockBorrowRecordDetails: BorrowRecordDetail[] = mockBorrowRecords.map(br => ({
  ...br,
  note: 'Ghi chú mẫu cho đơn mượn sách.',
  cancelReason: br.status === 'RETURNED' ? 'Sinh viên không đến nhận sách.' : null,
  returnRecords: br.status === 'RETURNED' ? mockReturnRecords : [],
  renewalRecords: br.id === '2' ? mockRenewalRecords : [],
  fineRecords: br.status === 'RETURNED' ? mockFineRecords : [],
})); 