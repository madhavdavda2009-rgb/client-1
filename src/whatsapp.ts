import { company } from './site-content';

// WhatsApp number in international format without "+" (set company.whatsapp if it differs from the phone number).
export const whatsappNumber = (company.whatsapp || company.phone).replace(/\D/g, '');
// Opens a chat with Toy-On; `text` pre-fills the message (the visitor still taps send).
export const whatsappLink = (text?: string) => `https://wa.me/${whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
