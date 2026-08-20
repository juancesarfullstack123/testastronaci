import { createRoot } from 'react-dom/client';
import VoucherForm from './components/VoucherForm';

const container = document.getElementById('app');

createRoot(container).render(<VoucherForm />);
