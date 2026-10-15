import { whatsappLink } from './whatsapp';
import './whatsapp-button.css';

// Floating "chat on WhatsApp" button shown on every public page (raised on the home page above the road controls).
export default function WhatsAppButton({ raised = false }: { raised?: boolean }) {
  return <a className={`whatsapp-float${raised ? ' is-raised' : ''}`} href={whatsappLink('Hi Toy-On, I would like to know more about your products.')} target="_blank" rel="noopener noreferrer" aria-label="Chat with Toy-On on WhatsApp (opens WhatsApp)">
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 3C9 3 3.3 8.66 3.3 15.64c0 2.23.59 4.4 1.7 6.32L3.2 28.6l6.83-1.77a12.8 12.8 0 0 0 6.01 1.52h.01c7.03 0 12.75-5.67 12.75-12.65C28.8 8.66 23.07 3 16.04 3Zm0 23.2h-.01a10.6 10.6 0 0 1-5.39-1.47l-.39-.23-4.05 1.05 1.08-3.93-.25-.4a10.4 10.4 0 0 1-1.61-5.58c0-5.8 4.75-10.52 10.6-10.52 2.83 0 5.49 1.1 7.49 3.09a10.4 10.4 0 0 1 3.1 7.44c0 5.8-4.75 10.55-10.57 10.55Zm5.8-7.88c-.32-.16-1.88-.92-2.17-1.03-.29-.1-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.57a9.5 9.5 0 0 1-1.77-2.18c-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.7-.98-2.33-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.63 0 1.55 1.14 3.05 1.3 3.26.16.21 2.24 3.4 5.42 4.77.76.33 1.35.52 1.81.66.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.5.27-.74.27-1.37.19-1.5-.08-.13-.29-.21-.61-.37Z"/></svg>
    <span className="whatsapp-float-label">Chat with us</span>
  </a>;
}
