import { Fragment } from 'react';
import './foil-text.css';

// Highlights "foil balloon(s)" inside a sentence with a yellow marker stroke, so first-time visitors see straight
// away what Toyon makes. Use for plain-text copy: <Foil>{text}</Foil>.
const PHRASE = /(foil[ -]balloons?)/gi;
export default function Foil({ children }: { children: string }) {
  return <>{children.split(PHRASE).map((part, index) => index % 2 ? <mark key={index} className="foil-mark">{part}</mark> : <Fragment key={index}>{part}</Fragment>)}</>;
}
